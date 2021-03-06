import Enum from '../../lib/Enum';

export default new Enum(
  [
    'connectFailed',
    'connected',
    'browserNotSupported',
    'webphoneCountOverLimit',
    'webphoneForbidden',
    'noOutboundCallWithoutDL',
    'toVoiceMailError',
    'checkDLError',
    'forwardError',
    'muteError',
    'holdError',
    'flipError',
    'recordError',
    'recordDisabled',
    'transferError',
    'requestTimeout',
    'serverTimeout',
    'internalServerError',
    'sipProvisionError',
    'unknownError',
    'provisionUpdate',
    'serverConnecting',
  ],
  'webphone',
);
