import { combineReducers } from 'redux';
import getModuleStatusReducer from '../../lib/getModuleStatusReducer';
import confreenceCallStatus from './conferenceCallStatus';

export function getConferenceCallStatusReducer(types) {
  return (state = confreenceCallStatus.idle, {
    type
  }) => {
    switch (type) {
      case types.makeConference:
      case types.terminateConference:
      case types.updateConference:
      case types.bringInConference:
      case types.removeFromConference:
        return confreenceCallStatus.requesting;

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
        return confreenceCallStatus.idle;

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

export default function getConferenceCallReducer(types) {
  return combineReducers({
    status: getModuleStatusReducer(types),
    conferences: getMakeConferenceCallReducer(types),
    confreenceCallStatus: getConferenceCallStatusReducer(types),
  });
}
