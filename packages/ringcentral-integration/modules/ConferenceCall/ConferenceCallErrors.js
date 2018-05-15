import Enum from '../../lib/Enum';

export default new Enum([
  'internalServerError',
  'conferenceForbidden',
  'conferenceBadRequest',
  'conferenceNotFound',
  'conferenceConflict'
], 'ConferenceCall');
