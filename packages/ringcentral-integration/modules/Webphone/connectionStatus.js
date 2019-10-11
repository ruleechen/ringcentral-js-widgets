import Enum from '../../lib/Enum';

export default new Enum(
  [
    'connecting', // status by first 3 connect
    'connected', // registered
    'reconnecting', //  status after last connect failed
    'disconnecting', // status by user disconnect
    'disconnected', // status by user disconnect
    'connectFailed', // status when connect failed (retry time <=2)
    'connectError', // status when connect failed (retry time > 2)
    'inactiveDisconnecting', // status when disconnect for inactive
    'inactive', // status when disconnected for inactive
  ],
  'connectionStatus',
);
