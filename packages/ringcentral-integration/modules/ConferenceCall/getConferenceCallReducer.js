import { combineReducers } from 'redux';
import getModuleStatusReducer from '../../lib/getModuleStatusReducer';

export function getMakeConferenceCallReducer(types) {
  return (state = {}, {
    type,
    conference
  }) => {
    const res = {
      ...state
    };
    switch (type) {
      case types.makeConferenceSucceeded:
      case types.updateConferenceSucceeded:
        res[conference.id] = conference;
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
    conferences: getMakeConferenceCallReducer(types)
  });
}
