import { createEnum } from '../lib/Enum';

export default createEnum(
  ['pending', 'initializing', 'ready', 'resetting'],
  'module',
);
