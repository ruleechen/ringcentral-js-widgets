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
import { isConferenceSession } from '../Webphone/webphoneHelper';
import sessionStatus from '../Webphone/sessionStatus';
// import webphoneErrors from '../Webphone/webphoneErrors';
import ensureExist from '../../lib/ensureExist';
// import sleep from '../../lib/sleep';
import callingModes from '../CallingSettings/callingModes';
import calleeTypes from '../../enums/calleeTypes';

const DEFAULT_TIMEOUT = 30000;// time out for conferencing session being accepted.
const DEFAULT_TTL = 5000;// timer to update the conference information
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
    'CallMonitor',
    'RolesAndPermissions',
    {
      dep: 'ContactMatcher',
      optional: true
    },
    {
      dep: 'Webphone',
      optional: true
    },
    { dep: 'ConnectivityMonitor', optional: true },
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
    contactMatcher,
    webphone,
    callMonitor,
    connectivityMonitor,
    pulling = true,
    capacity = MAXIMUM_CAPACITY,
    timeout = DEFAULT_TIMEOUT,
    ...options
  }) {
    super({
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
    this._connectivityMonitor = connectivityMonitor;
    this._contactMatcher = contactMatcher;
    this._rolesAndPermissions = this::ensureExist(rolesAndPermissions, 'rolesAndPermissions');
    this._callMonitor = this::ensureExist(callMonitor, 'callMonitor');
    // we need the constructed actions
    this._reducer = getConferenceCallReducer(this.actionTypes);
    this._ttl = DEFAULT_TTL;
    this._timout = timeout;
    this._timers = {};
    this._pulling = pulling;
    this.capacity = capacity;

    this.addSelector('partyProfiles',
      () => (
        Object.values(this.conferences)[0] &&
        Object.values(this.conferences)[0].conference.parties
      ),
      () => {
        const conferenceData = Object.values(this.conferences)[0];
        if (!conferenceData) {
          return [];
        }
        return this.getOnlinePartyProfiles(conferenceData.conference.id);
      },
    );

    let _lastCallInfo = {};
    this.addSelector('lastCallInfo',
      () => this._callMonitor.calls,
      () => this.mergingPair.fromSessionId,
      this._selectors.partyProfiles,
      (calls, fromSessionId, partyProfiles) => {
        const lastCall = calls.find(
          call => call.webphoneSession && call.webphoneSession.id === fromSessionId
        );

        let lastCalleeType = null;
        if (lastCall) {
          if (lastCall.toMatches.length) {
            lastCalleeType = calleeTypes.contacts;
          } else if (isConferenceSession(lastCall.webphoneSession)) {
            lastCalleeType = calleeTypes.conference;
          } else {
            lastCalleeType = calleeTypes.unknow;
          }
        } else if (_lastCallInfo.calleeType) {
          _lastCallInfo = {
            ..._lastCallInfo,
            status: sessionStatus.finished,
          };
          return _lastCallInfo;
        }

        if (lastCalleeType === calleeTypes.conference) {
          const partiesAvatarUrls = partyProfiles.map(profile => profile.avatarUrl);
          _lastCallInfo = {
            calleeType: calleeTypes.conference,
            avatarUrl: partiesAvatarUrls[0],
            extraNum: partiesAvatarUrls.length - 1,
          };
        } else if (lastCalleeType === calleeTypes.contacts) {
          _lastCallInfo = {
            calleeType: calleeTypes.contacts,
            avatarUrl: lastCall.toMatches[0].profileImageUrl,
            name: lastCall.toName,
            status: lastCall.webphoneSession.callStatus,
          };
        } else if (lastCalleeType === calleeTypes.unknow) {
          _lastCallInfo = {
            calleeType: calleeTypes.unknow,
            avatarUrl: null,
            name: lastCall.to.phoneNumber,
            status: lastCall.webphoneSession ? lastCall.webphoneSession.callStatus : null,
          };
        }

        return _lastCallInfo;
      },
    );
  }

  isConferenceSession(sessionId) {
    // only can be used after webphone._onCallStartFunc
    let res = !!this.findConferenceWithSession(sessionId);

    if (this.isMerging && !res) {
      const session = this._webphone.sessions.find(session => session.id === sessionId);
      res = isConferenceSession(session);
    }

    return res;
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
          // Help server to do the GC, and we don't care the whether it's successful or not
          this._client.service.platform()
            .delete(`/account/~/telephony/sessions/${id}`);
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
      || !this.ready
      || !webphoneSession
      || webphoneSession.direction !== callDirections.outbound
      || this.isOverload(id)
      || !this._connectivityMonitor.connectivity
    ) {
      this._alert.danger({
        message: conferenceErrors.modeError,
        ttl: 0,
      });
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
    if (!this.ready || !this._connectivityMonitor.connectivity) {
      this._alert.danger({
        message: conferenceErrors.modeError,
        ttl: 0,
      });
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
    webphoneSessions = webphoneSessions.filter(session => !this.isConferenceSession(session.id))
      .filter(session => Object.prototype.toString.call(session).toLowerCase() === '[object object]');

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

      /**
       * HACK: we need to preserve the merging session in prevent the glitch of
       * the call control page.
       */
      const sessionIds = webphoneSessions.map(x => x.id);
      this._webphone.setSessionCaching(sessionIds);

      const pSips = sipInstances.map((instance) => {
        const p = new Promise((resolve) => {
          instance.on('terminated', () => {
            resolve();
          });
        });
        return p;
      });

      await Promise.all([this._mergeToConference(webphoneSessions), ...pSips])
        .then(() => {
          this.store.dispatch({
            type: this.actionTypes.mergeSucceeded,
          });
        }, () => {
          const conferenceState = Object.values(this.conferences)[0];
          /**
           * if create conference successfully but failed to bring-in,
           *  then terminate the conference.
           */
          if (conferenceState && conferenceState.profiles.length < 1) {
            this.terminateConference(conferenceState.conference.id);
          }
          this._alert.warning({
            message: conferenceErrors.bringInFailed,
          });
          this.store.dispatch({
            type: this.actionTypes.mergeFailed,
          });
        });
      this._webphone.clearSessionCaching();
    } else {
      try {
        conferenceId = await this._mergeToConference(webphoneSessions);

        this.store.dispatch({
          type: this.actionTypes.mergeSucceeded,
        });
      } catch (e) {
        const conferenceState = Object.values(this.conferences)[0];
        /**
         * if create conference successfully but failed to bring-in,
         *  then terminate the conference.
         */
        if (conferenceState && conferenceState.conference.parties.length < 1) {
          this.terminateConference(conferenceState.conference.id);
        }
        this._alert.warning({
          message: conferenceErrors.bringInFailed,
        });
      }
      if (!sipInstances || conferenceId === null) {
        this.store.dispatch({
          type: this.actionTypes.mergeFailed,
        });
      }
    }
  }

  /**
   * we need to record the merge destination when merge from the call control pages
   * @param {webphone.session} from
   */
  setMergeParty({ fromSessionId, toSessionId }) {
    if (fromSessionId) {
      return this.store.dispatch({
        type: this.actionTypes.updateFromSession,
        fromSessionId,
      });
    }
    return this.store.dispatch({
      type: this.actionTypes.updateToSession,
      toSessionId,
    });
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
    if (typeof capacity !== 'number') {
      throw new Error('The capcity must be a number');
    }
    this.capacity = capacity;
    return capacity;
  }

  setTimeout(timeout = DEFAULT_TIMEOUT) {
    if (typeof timeout !== 'number') {
      throw new Error('The timeout must be a number');
    }
    this._timout = timeout;
    return timeout;
  }

  _init() {
    this.store.dispatch({
      type: this.actionTypes.initSuccess
    });
  }

  async _onStateChange() {
    if (this._shouldInit()) {
      this._init();
    } else if (this._shouldReset()) {
      this._reset();
    }
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
      this._connectivityMonitor.ready &&
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
        || !this._connectivityMonitor.ready
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
      // for the sake of participants ordering, we can't concurrently bring in the participants
      for (const webphoneSession of webphoneSessions) {
        await this.bringInToConference(conferenceId, webphoneSession, true);
      }
      if (!this.conferences[conferenceId].profiles.length) {
        throw new Error('bring-in operations failed, not all intended parties were brought in');
      }
      this.startPollingConferenceStatus(conferenceId);
      return conferenceId;
    }
    const { id } = await this.makeConference(true);
    let confereceAccepted = false;
    await Promise.race([
      new Promise((resolve, reject) => {
        const session = this.conferences[id].session;
        session.on('accepted', () => {
          confereceAccepted = true;
          resolve();
        });
        session.on('cancel', () => reject(new Error('conferecing cancel')));
        session.on('failed', () => reject(new Error('conferecing failed')));
        session.on('rejected', () => reject(new Error('conferecing rejected')));
        session.on('terminated', () => reject(new Error('conferecing terminated')));
      }),
      new Promise((resolve, reject) => {
        setTimeout(() => (confereceAccepted ? resolve() : reject(new Error('conferecing timeout')))
          , this._timout);
      })
    ]);

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
        phoneNumber,
        isConference: true,
      });

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

  async _getProfile(sessionInstance) {
    const session = this._webphone.sessions.find(session => session.id === sessionInstance.id);
    const {
      to, contactMatch, from, fromNumber, direction
    } = session;

    let { toUserName } = session;
    let avatarUrl;
    let rcId;
    let partyNumber;

    if (direction === callDirections.outbound) {
      partyNumber = to;
    } else {
      partyNumber = fromNumber;
    }

    // HACK: refresh the cache
    await this._contactMatcher.match({
      queries: [partyNumber],
      ignoreCache: true
    });

    if (this._contactMatcher && this._contactMatcher.dataMapping) {
      const contactMapping = this._contactMatcher.dataMapping;
      let contact = contactMatch;
      let nameMatches;

      if (direction === callDirections.outbound) {
        nameMatches = (contactMapping && contactMapping[to]) || [];
      } else {
        nameMatches = (contactMapping && contactMapping[from]) || [];
      }

      if (!contact) {
        contact = nameMatches && nameMatches[0];
      }
      if (contact) {
        avatarUrl = contact.profileImageUrl;
        toUserName = contact.name;
        rcId = contact.id;
      }
    }

    return {
      avatarUrl,
      toUserName,
      partyNumber,
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

  get mergingPair() {
    return this.state.mergingPair;
  }

  get partyProfiles() {
    return this._selectors.partyProfiles();
  }

  get lastCallInfo() {
    return this._selectors.lastCallInfo();
  }
}
