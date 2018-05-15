import Enum from '../../lib/Enum';
import moduleActionTypes from '../../enums/moduleActionTypes';

export default new Enum([
  ...Object.keys(moduleActionTypes),
  // make conference call
  'makeConference',
  'makeConferenceSucceeded',
  'makeConferenceFailed',
  // terminate
  'terminateConference',
  'terminateConferenceSucceeded',
  'terminateConferenceFailed',
  // update
  'updateConference',
  'updateConferenceSucceeded',
  'updateConferenceFailed',
  // bring-in
  'bringInConference',
  'bringInConferenceSucceeded',
  'bringInConferenceFailed',
  // remove
  'removeFromConference',
  'removeFromConferenceSucceeded',
  'removeFromConferenceFailed',
], 'ConferenceCall');
