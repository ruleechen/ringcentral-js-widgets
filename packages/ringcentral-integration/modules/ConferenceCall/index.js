import { Module } from '../../lib/di';
import callDirections from '../../enums/callDirections';
import RcModule from '../../lib/RcModule';
import actionTypes from './actionTypes';
import partyStatusCode from './partyStatusCode';
import conferenceRole from './conferenceRole';
import getConferenceCallReducer from './getConferenceCallReducer';
import proxify from '../../lib/proxy/proxify';
import permissionsMessages from '../RolesAndPermissions/permissionsMessages';
import conferenceErrors from './conferenceCallErrors';
// import webphoneErrors from '../Webphone/webphoneErrors';
import ensureExist from '../../lib/ensureExist';
import callingModes from '../CallingSettings/callingModes';

const DEFAULT_TTL = 5000;// timer to update the conference information
const DEFAULT_WAIT = 800;// timer to bring-in after conference creation
const DEFAULT_TERMINATION_SPAN = 100;// timer to initiatively terminate the session after bring-in
const MAXIMUM_CAPACITY = 10;


function ascendSortParties(parties) {
  return parties
    .filter(party => party.conferenceRole.toLowerCase() !== conferenceRole.host)
    .sort((last, next) => +last.id.split('-')[1] - (+next.id.split('-')[1]));
}

/**
 * @class
 * @description ConferenceCall managing module
 */
@Module({
  deps: [
    'Auth',
    'Alert',
    {
      dep: 'Call',
      optional: true
    },
    'CallingSettings',
    'Client',
    'RolesAndPermissions',
    {
      dep: 'Contacts',
      optional: true
    },
    {
      dep: 'ContactMatcher',
      optional: true
    },
    {
      dep: 'Webphone',
      optional: true
    },
    {
      dep: 'ConferenceCallOptions',
      optional: true
    },
  ]
})
export default class ConferenceCall extends RcModule {
  /**
   * @constructor
   * @param {Object} params - params object
   * @param {RegionSettings} params.regionSettings - regionSettings module instance
   * @param {Client} params.client - client module instance
   */
  constructor({
    auth,
    alert,
    call,
    callingSettings,
    client,
    rolesAndPermissions,
    contacts,
    contactMatcher,
    webphone,
    pulling = true,
    capacity = MAXIMUM_CAPACITY,
    spanForBringIn = DEFAULT_WAIT,
    ...options
  }) {
    super({
      auth,
      alert,
      call,
      callingSettings,
      client,
      rolesAndPermissions,
      pulling,
      contacts,
      contactMatcher,
      webphone,
      ...options,
      actionTypes,
    });
    this._auth = this::ensureExist(auth, 'auth');
    this._alert = this::ensureExist(alert, 'alert');
    this._call = this::ensureExist(call, 'call');
    this._callingSettings = this::ensureExist(callingSettings, 'callingSettings');
    this._client = this::ensureExist(client, 'client');
    // in order to run the integeration test, we need it to be optional
    this._webphone = webphone;
    this._contacts = contacts;
    this._contactMatcher = contactMatcher;
    this._rolesAndPermissions = this::ensureExist(rolesAndPermissions, 'rolesAndPermissions');
    // we need the constructed actions
    this._reducer = getConferenceCallReducer(this.actionTypes);
    this._ttl = DEFAULT_TTL;
    this._timers = {};
    this._pulling = pulling;
    this._spanForBringIn = spanForBringIn;
    this.capacity = capacity;
  }

  // only can be used after webphone._onCallStartFunc
  isConferenceSession(sessionId) {
    return !!this.findConferenceWithSession(sessionId);
  }

  findConferenceWithSession(sessionId) {
    return Object.values(this.conferences).find(c => c.session.id === sessionId);
  }

  /**
   *
   * @param {string} id: conference id
   */
  @proxify
  async updateConferenceStatus(id) {
    this.store.dispatch({
      type: this.actionTypes.updateConference,
      conference: this.state.conferences[id],
    });
    try {
      const rawResponse = await this._client.service.platform()
        .get(`/account/~/telephony/sessions/${id}`);
      const response = rawResponse.json();
      const storedconference = this.state.conferences[response.id];
      const conference = Object.assign({}, storedconference.conference);
      conference.parties = response.parties;
      const {
        session
      } = storedconference;
      this.store.dispatch({
        type: this.actionTypes.updateConferenceSucceeded,
        conference,
        session
      });
    } catch (e) {
      // TODO: alert
      this.store.dispatch({
        type: this.actionTypes.updateConferenceFailed,
        conference: this.state.conferences[id],
        message: e.toString()
      });
      // need to propagate to out side try...catch block
      throw e;
    } finally {
      // eslint-disable-next-line no-unsafe-finally
      return this.state.conferences[id];
    }
  }

  /**
   * terminate a conference.
   * @param {string} id: conference id
   */
  @proxify
  async terminateConference(id) {
    this.store.dispatch({
      type: this.actionTypes.terminateConference,
      conference: this.state.conferences[id],
    });
    const conferenceData = this.conferences[id];

    try {
      if (this._webphone) {
        if (conferenceData) {
          this._webphone.hangup(conferenceData.session.id);
          this.store.dispatch({
            type: this.actionTypes.terminateConferenceSucceeded,
            conference: conferenceData.conference,
          });
        } else {
          this.store.dispatch({
            type: this.actionTypes.terminateConferenceFailed,
          });
        }
      } else {
        await this._client.service.platform()
          .delete(`/account/~/telephony/sessions/${id}`);
        this.store.dispatch({
          type: this.actionTypes.terminateConferenceSucceeded,
          conference: conferenceData.conference,
        });
      }
    } catch (e) {
      // TODO:this._alert.warning
      this.store.dispatch({
        type: this.actionTypes.terminateConferenceFailed,
        message: e.toString()
      });
    } finally {
      // eslint-disable-next-line no-unsafe-finally
      return conferenceData;
    }
  }

  /**
   * Bring-in an outbound call into conference.
   * @param {string} id: conference id
   * @param {webphone.session} webphoneSession: get it from callMonitor.\w+Calls[\d+]
   * interface SessionData{
   *  "party-id": String,
   *  "session-id": String
   * }
   */
  @proxify
  async bringInToConference(id, webphoneSession, propagete = false) {
    const conferenceState = this.state.conferences[id];
    if (
      !conferenceState
        || !webphoneSession
        || webphoneSession.direction !== callDirections.outbound
        || this.isOverload(id)
    ) {
      if (!propagete) {
        this._alert.warning({
          message: conferenceErrors.bringInFailed,
        });
      }

      return null;
    }
    const { conference, session } = conferenceState;
    this.store.dispatch({
      type: this.actionTypes.bringInConference,
      conference,
      session,
    });
    const sessionData = webphoneSession.data;
    try {
      const partyProfile = await this._getProfile(webphoneSession);
      await this._client.service.platform()
        .post(`/account/~/telephony/sessions/${id}/parties/bring-in`, sessionData);
      await this.updateConferenceStatus(id);
      const conferenceState = this.state.conferences[id];
      const newParties = ascendSortParties(conferenceState.conference.parties);
      partyProfile.id = newParties[newParties.length - 1].id;
      // let the contact match to do the matching of the parties.
      this.store.dispatch({
        type: this.actionTypes.bringInConferenceSucceeded,
        conference,
        session,
        partyProfile,
      });
      return id;
    } catch (e) {
      this.store.dispatch({
        type: this.actionTypes.bringInConferenceFailed,
        message: e.toString()
      });
      if (!propagete) {
        this._alert.warning({
          message: conferenceErrors.bringInFailed,
        });
        return null;
      }
      throw e;
    }
  }

  /**
   * remove a participant from conference.
   * @param {string} id: conference id
   * @param {SessionData} partyId: one participant's id of an conference's `parties` list
   */
  @proxify
  async removeFromConference(id, partyId) {
    this.store.dispatch({
      type: this.actionTypes.removeFromConference,
      conference: this.state.conferences[id],
    });

    try {
      await this._client.service.platform()
        .delete(`/account/~/telephony/sessions/${id}/parties/${partyId}`);
      await this.updateConferenceStatus(id);
      this.store.dispatch({
        type: this.actionTypes.removeFromConferenceSucceeded,
        conference: this.state.conferences[id],
      });
    } catch (e) {
      // TODO:this._alert.warning
      this.store.dispatch({
        type: this.actionTypes.removeFromConferenceFailed,
        message: e.toString()
      });
    } finally {
      // eslint-disable-next-line no-unsafe-finally
      return this.state.conferences[id];
    }
  }

  /**
   * start a conference call, return the session
   */
  @proxify
  async makeConference(propagate = false) {
    if (!this.ready) {
      return null;
    }
    if (!this._checkPermission()) {
      if (!propagate) {
        this._alert.danger({
          message: permissionsMessages.insufficientPrivilege,
          ttl: 0,
        });
      }

      return null;
    }
    if (!this._callingSettings.callingMode === callingModes.webphone) {
      if (!propagate) {
        this._alert.danger({
          message: conferenceErrors.modeError,
          ttl: 0,
        });
      }

      return null;
    }
    const session = await this._makeConference(propagate);
    return session;
  }

  initialize() {
    this.store.subscribe(() => this._onStateChange());
  }

  /**
   * Merge calls to (or create) a conference.
   * @param {webphone.sessions} webphoneSessions
   * FIXME: dynamically construct this function during the construction
   * to avoid `this._webphone` criterias to improve performance ahead of time
   */
  async mergeToConference(webphoneSessions = []) {
    webphoneSessions = webphoneSessions.filter(session => Object.prototype.toString.call(session).toLowerCase() === '[object object]');

    if (!webphoneSessions.length) {
      this._alert.warning({
        message: conferenceErrors.bringInFailed,
      });
      return;
    }

    this.store.dispatch({
      type: this.actionTypes.mergeStart,
    });

    let sipInstances;
    let conferenceId = null;

    if (this._webphone) {
      /**
       * Because the concurrency behaviour of the server,
       * we cannot sure the merging process is over when
       * the function's procedure has finshed.
       */
      sipInstances = webphoneSessions
        .map(webphoneSession => this._webphone._sessions.get(webphoneSession.id));
      const pSips = sipInstances.map((instance) => {
        const p = new Promise((resolve) => {
          instance.on('terminated', () => {
            resolve();
          });
        });
        return p;
      });

      Promise.all([this._mergeToConference(webphoneSessions), ...pSips])
        .then(() => {
          this.store.dispatch({
            type: this.actionTypes.mergeEnd,
          });
        }, () => {
          const conferenceState = Object.values(this.conferences)[0];
          /**
           * if create conference successfully but failed to bring-in,
           *  then terminate the conference.
           */
          if (conferenceState && conferenceState.conference.parties.length < 2) {
            this.terminateConference(conferenceState.conference.id);
          }
          this._alert.warning({
            message: conferenceErrors.bringInFailed,
          });
          this.store.dispatch({
            type: this.actionTypes.mergeEnd,
          });
        });
    } else {
      try {
        conferenceId = await this._mergeToConference(webphoneSessions);

        this.store.dispatch({
          type: this.actionTypes.mergeEnd,
        });
      } catch (e) {
        const conferenceState = Object.values(this.conferences)[0];
        /**
         * if create conference successfully but failed to bring-in,
         *  then terminate the conference.
         */
        if (conferenceState && conferenceState.conference.parties.length < 2) {
          this.terminateConference(conferenceState.conference.id);
        }
        this._alert.warning({
          message: conferenceErrors.bringInFailed,
        });
      }
      if (!sipInstances || conferenceId === null) {
        this.store.dispatch({
          type: this.actionTypes.mergeEnd,
        });
      }
    }
  }

  async _onStateChange() {
    if (this._shouldInit()) {
      this._init();
    } else if (this._shouldReset()) {
      this._reset();
    }
  }

  getOnlinePartyProfiles(id) {
    const conferenceData = this.conferences[id];

    if (conferenceData) {
      return ascendSortParties(conferenceData.conference.parties)
        .reduce((accum, party, idx) => {
          if (party.status.code.toLowerCase() !== partyStatusCode.disconnected) {
            // 0 position is the host
            accum.push({ idx, party });
          }
          return accum;
        }, [])
        .map(({ idx, party }) => ({ ...party, ...conferenceData.profiles[idx] }))
        .filter(i => !!i);
    }
    return null;
  }

  getOnlineParties(id) {
    const conferenceData = this.conferences[id];
    if (conferenceData) {
      return conferenceData.conference.parties.filter(
        p => p.status.code.toLowerCase() !== partyStatusCode.disconnected
      );
    }
    return null;
  }

  countOnlineParties(id) {
    const res = this.getOnlineParties(id);
    return Array.isArray(res) ? res.length : null;
  }

  isOverload(id) {
    return this.countOnlineParties(id) >= this.capacity;
  }

  async startPollingConferenceStatus(id) {
    if (this._timers[id] || !this._pulling) {
      return;
    }
    await this.updateConferenceStatus(id);
    this._timers[id] = setTimeout(
      async () => {
        await this.updateConferenceStatus(id);
        this.stopPollingConferenceStatus(id);
        if (this.conferences[id]) {
          this.startPollingConferenceStatus(id);
        }
      },
      this._ttl);
  }

  stopPollingConferenceStatus(id) {
    clearTimeout(this._timers[id]);
    delete this._timers[id];
  }

  openPulling() {
    this._pulling = true;
  }

  closePulling() {
    this._pulling = false;
  }

  togglePulling() {
    this._pulling = !this.pulling;
  }

  setCapatity(capacity = MAXIMUM_CAPACITY) {
    this.capacity = capacity;
  }

  setSpanForBringIn(span = DEFAULT_WAIT) {
    this._spanForBringIn = span;
  }

  _init() {
    this.store.dispatch({
      type: this.actionTypes.initSuccess
    });
  }

  _reset() {
    this.store.dispatch({
      type: this.actionTypes.resetSuccess
    });
  }

  _shouldInit() {
    return (
      (this._auth.loggedIn && this._auth.ready) &&
      this._alert.ready &&
      this._callingSettings.ready &&
      this._call.ready &&
      this._rolesAndPermissions.ready &&
      this.pending
    );
  }

  _shouldReset() {
    return (
      (
        (!this._auth.loggedIn || !this._auth.ready)
        || !this._alert.ready
        || !this._callingSettings.ready
        || !this._call.ready
        || !this._rolesAndPermissions.ready
      ) &&
      this.ready
    );
  }

  _checkPermission() {
    if (!this._rolesAndPermissions.callingEnabled || !this._rolesAndPermissions.webphoneEnabled) {
      this._alert.danger({
        message: permissionsMessages.insufficientPrivilege,
        ttl: 0,
      });
      return false;
    }
    return true;
  }

  _hookConference(conference, session) {
    ['accepted'].forEach(
      evt => session.on(
        evt,
        () => this.startPollingConferenceStatus(conference.id)
      )
    );
    ['terminated', 'failed', 'rejected'].forEach(
      evt => session.on(evt, () => {
        this.store.dispatch({
          type: this.actionTypes.terminateConferenceSucceeded,
          conference,
        });
        this.stopPollingConferenceStatus(conference.id);
      })
    );
  }

  async _mergeToConference(webphoneSessions = []) {
    const conferenceState = Object.values(this.conferences)[0];

    if (conferenceState) {
      const conferenceId = conferenceState.conference.id;
      this.stopPollingConferenceStatus(conferenceId);
      await Promise.all(
        webphoneSessions.map(
          webphoneSession => this.bringInToConference(conferenceId, webphoneSession, true)
        )
      );

      /**
       * HACK: terminate the session initiatively to avoid:
       * 1. remaining session when duplicated session exsisting in a conference.
       */
      setTimeout(() => {
        webphoneSessions.forEach((webphoneSession) => {
          if (webphoneSession && webphoneSession.id) {
            this._webphone.hangup(webphoneSession.id);
          }
        });
      }, DEFAULT_TERMINATION_SPAN);

      this.startPollingConferenceStatus(conferenceId);
      return conferenceId;
    }
    const { id } = await this.makeConference(true);
    /**
     * HACK: 800ms came from exprience, if we try to bring other calls into the conference
     * immediately, the api will throw 403 error which says: can't find the host of the
     * conference.
     */
    await new Promise(resolve => setTimeout(resolve, this._spanForBringIn));
    await this._mergeToConference(webphoneSessions);

    return id;
  }

  async _makeConference(propagate = false) {
    try {
      this.store.dispatch({
        type: this.actionTypes.makeConference,
      });

      // TODO: replace with SDK function chaining calls
      const rawResponse = await this._client.service.platform()
        .post('/account/~/telephony/conference', {});
      const response = rawResponse.json();
      const conference = response.session;
      const phoneNumber = conference.voiceCallToken;
      // whether to mutate the session to mark the conference?
      const session = await this._call.call({
        phoneNumber
      }, true);

      if (typeof session === 'object' &&
        Object.prototype.toString.call(session.on).toLowerCase() === '[object function]') {
        this._hookConference(conference, session);

        this.store.dispatch({
          type: this.actionTypes.makeConferenceSucceeded,
          conference,
          session,
          parties: [],
        });
      } else {
        this.store.dispatch({
          type: this.actionTypes.makeConferenceFailed,
        });
      }

      return conference;
    } catch (e) {
      this.store.dispatch({
        type: this.actionTypes.makeConferenceFailed,
        message: e.toString()
      });

      if (!propagate) {
        this._alert.warning({
          message: conferenceErrors.makeConferenceFailed,
        });
        return null;
      }
      // need to propagate to out side try...catch block
      throw e;
    }
  }

  async _getProfile(session) {
    const { to } = session;
    let toUserName = session.toUserName;
    let avatarUrl;
    let rcId;

    if (this._contacts && this._contactMatcher && this._contactMatcher.dataMapping) {
      const contactMapping = this._contactMatcher.dataMapping;
      let contact = session.contactMatch;
      const nameMatches = (contactMapping && contactMapping[session.to]) || [];

      if (!contact) {
        contact = nameMatches && nameMatches[0];
      }
      if (contact) {
        avatarUrl = await this._contacts.getProfileImage(contact);
        toUserName = contact.name;
        rcId = contact.id;
      }
    }
    return {
      avatarUrl,
      toUserName,
      to,
      rcId,
    };
  }

  get status() {
    return this.state.status;
  }

  get conferences() {
    return this.state.conferences;
  }

  get conferenceCallStatus() {
    return this.state.conferenceCallStatus;
  }

  get isMerging() {
    return this.state.isMerging;
  }
}
