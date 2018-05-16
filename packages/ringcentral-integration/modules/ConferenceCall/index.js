import {Module} from '../../lib/di';
import callDirections from '../../enums/callDirections';
import RcModule from '../../lib/RcModule';
import createSimpleReducer from '../../lib/createSimpleReducer';
import actionTypes from './actionTypes';
import getConferenceCallReducer from './getCallReducer';
import proxify from '../../lib/proxy/proxify';
import permissionsMessages from '../RolesAndPermissions/permissionsMessages';
import conferenceErrors from './conferenceCallErrors';
import webphoneErrors from '../Webphone/webphoneErrors';

/**
 * @class
 * @description Conference managing module
 */
@Module({
  deps: [
    'Auth',
    'Alert',
    'Call',
    'CallingSettings',
    'Client',
    'Webphone',
    'RolesAndPermissions',
    'Storage',
  ]
})
export default class Conference extends RcModule {
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
    webphone,
    rolesAndPermissions,
    storage,
    ...options
  }) {
    super({
      auth,
      alert,
      call,
      callingSettings,
      client,
      webphone,
      rolesAndPermissions,
      storage,
      ...options,
      actionTypes,
    });
    this._storage = this::ensureExist(storage, 'storage');
    this._auth = this::ensureExist(auth, 'auth');
    this._alert = this::ensureExist(alert, 'alert');
    this._call = this::ensureExist(call, 'call');
    this._callingSettings = this::ensureExist(callingSettings, 'callingSettings');
    this._client = this::ensureExist(client, 'client');
    this._webphone = this::ensureExist(webphone, 'webphone');
    this._rolesAndPermissions = this::ensureExist(rolesAndPermissions, 'rolesAndPermissions');
    this._reducer = getConferenceCallReducer(actionTypes);
    this.actionTypes = actionTypes;
  }

  initialize() {
    this.store.subscribe(() => this._onStateChange());
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
      const response = await this._client.service.platform()
        .get(`/account/~/telephony/sessions/${id}`);
      const statusCode = response ? response.status_code : null;
      let errorCode;

      switch (statusCode) {
        case 200:
        {
          const conference = Object.assign({}, this.state.conferences[response.id]);
          conference.parties = response.parties;

          this.store.dispatch({
            type: this.actionTypes.updateConferenceSucceeded,
            conference,
          });
          return this.state.conferences[id];
        }
        case 403:
        {
          errorCode = conferenceErrors.conferenceForbidden;
          break;
        }
        case 404:
        {
          errorCode = conferenceErrors.conferenceNotFound;
          break;
        }
        case 500:
        default:
        {
          errorCode = conferenceErrors.internalServerError;
          break;
        }
      }
      // TODO: alert
      this.store.dispatch({
        type: this.actionTypes.terminateConferenceFailed,
        statusCode,
        errorCode,
      });
    } catch (e) {
      // TODO: alert
      this.store.dispatch({
        type: this.actionTypes.updateConferenceFailed,
        conference: this.state.conferences[id],
      });
    }
    return this.state.conferences[id];
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

    try {
      const response = await this._client.service.platform()
        .delete(`/account/~/telephony/sessions/${conferenceId}`, {});
      const statusCode = response ? response.status_code : null;
      let errorCode;

      switch (statusCode) {
        case 204:
        {
          this.store.dispatch({
            type: this.actionTypes.terminateConferenceSucceeded,
            conference: this.state.conferences[id],
          });
          return this.state.conferences[id];
        }
        case 403:
        {
          errorCode = conferenceErrors.conferenceForbidden;
          break;
        }
        case 404:
        {
          errorCode = conferenceErrors.conferenceNotFound;
          break;
        }
        case 500:
        default:
        {
          errorCode = conferenceErrors.internalServerError;
          break;
        }
      }
      this.store.dispatch({
        type: this.actionTypes.terminateConferenceFailed,
        statusCode,
        errorCode,
      });
    } catch (e) {
      // TODO:this._alert.warning
      this.store.dispatch({
        type: this.actionTypes.terminateConferenceFailed,
      });
    }
    return this.state.conferences[id];
  }

  /**
   * Bring-in an outbound call into conference.
   * @param {string} id: conference id
   * @param {call} partyCall: get it from callMonitor.\w+Calls[\d+]
   * interface SessionData{
   *  "party-id": String,
   *  "session-id": String
   * }
   */
  @proxify
  async bringInToConference(id, partyCall) {
    if (partyCall.direction !== callDirections.outbound) {
      // TODO: alert error that only can merge outbound call
      return null;
    }
    this.store.dispatch({
      type: this.actionTypes.bringInConference,
      conference: this.state.conferences[id],
    });
    const sessionData = partyCall.webphoneSession.data;
    try {
      const response = await this._client.service.platform()
        .post(`/account/~/telephony/sessions/${id}/parties/bring-in`, sessionData);
      const statusCode = response ? response.status_code : null;
      let errorCode;

      switch (statusCode) {
        case 201:
        {
          await this.updateConferenceStatus(id);
          // let the contact match to do the matching of the parties.
          this.store.dispatch({
            type: this.actionTypes.bringInConferenceSucceeded,
            conference: this.state.conferences[id],
          });
          return this.state.conferences[id];
        }
        case 400:
        {
          errorCode = conferenceErrors.conferenceBadRequest;
          break;
        }
        case 403:
        {
          errorCode = conferenceErrors.conferenceForbidden;
          break;
        }
        case 404:
        {
          errorCode = conferenceErrors.conferenceNotFound;
          break;
        }
        case 409:
        {
          errorCode = conferenceErrors.conferenceConflict;
          break;
        }
        case 500:
        default:
        {
          errorCode = conferenceErrors.internalServerError;
          break;
        }
      }
      this.store.dispatch({
        type: this.actionTypes.terminateConferenceFailed,
        statusCode,
        errorCode,
      });
    } catch (e) {
      // TODO:this._alert.warning
      this.store.dispatch({
        type: this.actionTypes.terminateConferenceFailed,
      });
    }
    return this.state.conferences[id];
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
      const response = await this._client.service.platform()
        .delete(`/account/~/telephony/sessions/${id}/parties/${partyId}`);
      const statusCode = response ? response.status_code : null;
      let errorCode;

      switch (statusCode) {
        case 204:
        {
          await this.updateConferenceStatus(id);
          this.store.dispatch({
            type: this.actionTypes.removeFromConferenceSucceeded,
            conference: this.state.conferences[id],
          });
          return this.state.conferences[id];
        }
        case 403:
        {
          errorCode = conferenceErrors.conferenceForbidden;
          break;
        }
        case 404:
        {
          errorCode = conferenceErrors.conferenceNotFound;
          break;
        }
        case 500:
        default:
        {
          errorCode = conferenceErrors.internalServerError;
          break;
        }
      }
      this.store.dispatch({
        type: this.actionTypes.removeFromConferenceFailed,
        statusCode,
        errorCode,
      });
    } catch (e) {
      // TODO:this._alert.warning
      this.store.dispatch({
        type: this.actionTypes.removeFromConferenceFailed,
      });
    }
  }

  /**
   * start a conference call, return the session
   */
  @proxify
  async makeConference() {
    if (!this.ready) {
      return null;
    }
    if (!this._checkPermission()) {
      this._alert.danger({
        message: permissionsMessages.insufficientPrivilege,
        ttl: 0,
      });
      return null;
    }
    try {
      this.store.dispatch({
        type: this.actionTypes.makeConference,
      });

      // TODO: replace with SDK function chaining calls
      const response = await this._client.service.platform()
        .post('/account/~/telephony/conference', {});
      const statusCode = response ? response.status_code : null;
      let errorCode = null;

      switch (statusCode) {
        case 201:
        {
          const conference = response.json().session;
          const phoneNumber = conference.voiceCallToken;
          const session = await this._call.call({
            phoneNumber
          });

          if (typeof session === 'object' &&
              Object.prototype.toString.call(session.on).toLowerCase() === '[object function]') {
            conference.session = session;
            this._hookConference(conference);

            this.store.dispatch({
              type: this.actionTypes.makeConferenceSucceeded,
              conference,
            });
          } else {
            this.store.dispatch({
              type: this.actionTypes.makeConferenceFailed,
            });
          }
          return conference;
        }
        case 403:
        {
          errorCode = conferenceErrors.conferenceForbidden;
          break;
        }
        case 404:
        {
          errorCode = conferenceErrors.conferenceNotFound;
          break;
        }
        case 409:
        {
          errorCode = conferenceErrors.conferenceNotFound;
          break;
        }
        case 500:
        {
          errorCode = webphoneErrors.internalServerError;
          break;
        }
        default:
        {
          errorCode = webphoneErrors.unknownError;
          break;
        }
      }
      this._alert.danger({
        message: errorCode,
        allowDuplicates: false,
        payload: {
          statusCode
        }
      });
      this.store.dispatch({
        type: this.actionTypes.makeConferenceFailed,
        errorCode,
        statusCode,
      });
    } catch (e) {
      this.store.dispatch({
        type: this.actionTypes.makeConferenceFailed,
      });
      // TODO:this._alert.warning
    }
    return null;
  }

  _resetConferenceCallModule() {
    this._conference = null;
  }

  _onStateChange() {
    if (this._shouldInit()) {
      // this.store.dispatch({
      //   type: this.actionTypes.init,
      // });
      this.store.dispatch({
        type: this.actionTypes.initSuccess,
      });
    } else if (this._shouldReset()) {
      this._resetConferenceCallModule();
      this.store.dispatch({
        type: this.actionTypes.resetSuccess,
        cleanOnReset: this._cleanOnReset,
      });
    }
  }

  _shouldInit() {
    return (
      this._callingSettings.ready &&
      this._storage.ready &&
      (!this._webphone || this._webphone.ready) &&
      this._rolesAndPermissions.ready &&
      this.pending
    );
  }

  _shouldReset() {
    return (
      (!this._callingSettings.ready ||
        (!!this._webphone && !this._webphone.ready) ||
        !this._rolesAndPermissions.ready ||
        !this._storage.ready
      ) &&
      this.ready
    );
  }

  _checkPermission() {
    if (!this._rolesAndPermissions.hasTelephonySessionsPermission ||
      !this._rolesAndPermissions.webphoneEnabled) {
      this._alert.danger({
        message: permissionsMessages.insufficientPrivilege,
        ttl: 0,
      });
      return false;
    }
    return true;
  }

  _hookConference(conference) {
    conference.session.on('terminated', () => this.store.dispatch({
      type: this.actionTypes.terminateConferenceSucceeded,
      conference,
    }));
  }
}
