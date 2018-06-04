import { combineReducers } from 'redux';
import getModuleStatusReducer from '../../lib/getModuleStatusReducer';
import conferenceCallStatus from './conferenceCallStatus';

export function getConferenceCallStatusReducer(types) {
  return (state = conferenceCallStatus.idle, {
    type
  }) => {
    switch (type) {
      case types.makeConference:
      case types.terminateConference:
      case types.updateConference:
      case types.bringInConference:
      case types.removeFromConference:
        return conferenceCallStatus.requesting;

      case types.makeConferenceSucceeded:
      case types.makeConferenceFailed:
      case types.terminateConferenceSucceeded:
      case types.terminateConferenceFailed:
      case types.updateConferenceSucceeded:
      case types.updateConferenceFailed:
      case types.bringInConferenceSucceeded:
      case types.bringInConferenceFailed:
      case types.removeFromConferenceSucceeded:
      case types.removeFromConferenceFailed:
        return conferenceCallStatus.idle;

      default:
        return state;
    }
  };
}


export function getMakeConferenceCallReducer(types) {
  return (state = {}, {
    type,
    conference, // platform conference session data
    session, // SIP.inviteClientContext instance
  }) => {
    const res = {
      ...state
    };
    switch (type) {
      case types.resetSuccess:
        return {};
      case types.makeConferenceSucceeded:
      case types.updateConferenceSucceeded:
        res[conference.id] = { conference, session };
        return res;
      case types.terminateConferenceSucceeded:
        delete res[conference.id];
        return res;
      default:
        return state;
    }
  };
}

export function getMergingStatusReducer(types) {
  return (state = false, { type }) => {
    switch (type) {
      case types.mergeStart:
        return true;
      case types.mergeEnd:
        return false;
      default:
        return state;
    }
  };
}

export default function getConferenceCallReducer(types) {
  return combineReducers({
    status: getModuleStatusReducer(types),
    conferences: getMakeConferenceCallReducer(types),
    conferenceCallStatus: getConferenceCallStatusReducer(types),
    isMerging: getMergingStatusReducer(types),
  });
}
