import { connect } from 'react-redux';
import formatNumber from 'ringcentral-integration/lib/formatNumber';
import sleep from 'ringcentral-integration/lib/sleep';
import callingModes from 'ringcentral-integration/modules/CallingSettings/callingModes';
import withPhone from '../../lib/withPhone';
import ActiveCallsPanel from '../../components/ActiveCallsPanel';

function mapToProps(_, {
  phone: {
    brand,
    callLogger,
    callMonitor,
    locale,
    regionSettings,
    rolesAndPermissions,
    conferenceCall,
    callingSettings,
    webphone
  },
  showContactDisplayPlaceholder = false,
}) {
  const conferenceList = Object.values(conferenceCall.conferences);
  const conference = conferenceList.length ? conferenceList[0] : null;
  let disableMerge;
  const isWebRTC = callingSettings.callingMode === callingModes.webphone;
  const conferenceData = Object.values(conferenceCall.conferences)[0];
  if (conference) {
    disableMerge = conferenceCall.isOverload(conference.conference.id);
  } else {
    disableMerge = !isWebRTC;
  }
  return {
    currentLocale: locale.currentLocale,
    activeRingCalls: callMonitor.activeRingCalls,
    activeOnHoldCalls: callMonitor.activeOnHoldCalls,
    activeCurrentCalls: callMonitor.activeCurrentCalls,
    otherDeviceCalls: callMonitor.otherDeviceCalls,
    areaCode: regionSettings.areaCode,
    countryCode: regionSettings.countryCode,
    outboundSmsPermission: !!(
      rolesAndPermissions.permissions &&
      rolesAndPermissions.permissions.OutboundSMS
    ),
    internalSmsPermission: !!(
      rolesAndPermissions.permissions &&
      rolesAndPermissions.permissions.InternalSMS
    ),
    showSpinner: conferenceCall.isMerging,
    brand: brand.fullName,
    showContactDisplayPlaceholder,
    autoLog: !!(callLogger && callLogger.autoLog),
    isWebRTC,
    hasConferenceCall: !!conference,
    disableMerge,
    conferencePartiesAvatarUrls: (conferenceData
      && conferenceData.profiles.map(profile => profile.avatarUrl))
      || []
  };
}

function mapToFunctions(_, {
  phone: {
    callLogger,
    composeText,
    contactMatcher,
    contactSearch,
    regionSettings,
    routerInteraction,
    webphone,
    conferenceCall,
  },
  composeTextRoute = '/composeText',
  callCtrlRoute = '/calls/active',
  onCreateContact,
  onLogCall,
  isLoggedContact,
  onCallsEmpty,
  onViewContact,
  showViewContact = true,
}) {
  return {
    formatPhone(phoneNumber) {
      return formatNumber({
        phoneNumber,
        areaCode: regionSettings.areaCode,
        countryCode: regionSettings.countryCode,
      });
    },
    async webphoneAnswer(...args) {
      return (webphone && webphone.answer(...args));
    },
    async webphoneToVoicemail(...args) {
      return (webphone && webphone.toVoiceMail(...args));
    },
    async webphoneReject(...args) {
      return (webphone && webphone.reject(...args));
    },
    async webphoneHangup(...args) {
      return (webphone && webphone.hangup(...args));
    },
    async webphoneResume(...args) {
      if (!webphone) {
        return;
      }
      await webphone.resume(...args);
      if (routerInteraction.currentPath !== callCtrlRoute) {
        routerInteraction.push(callCtrlRoute);
      }
    },
    onViewContact: showViewContact ?
      (onViewContact || (({ contact }) => {
        const { id, type } = contact;
        routerInteraction.push(`/contacts/${type}/${id}?direct=true`);
      })) : null,
    onClickToSms: composeText ?
      async (contact, isDummyContact = false) => {
        if (routerInteraction) {
          routerInteraction.push(composeTextRoute);
        }
        composeText.clean();
        if (contact.name && contact.phoneNumber && isDummyContact) {
          composeText.updateTypingToNumber(contact.name);
          contactSearch.search({ searchString: contact.name });
        } else {
          composeText.addToRecipients(contact);
        }
      } :
      undefined,
    onCreateContact: onCreateContact ?
      async ({ phoneNumber, name, entityType }) => {
        const hasMatchNumber = await contactMatcher.hasMatchNumber({
          phoneNumber,
          ignoreCache: true
        });
        if (!hasMatchNumber) {
          await onCreateContact({ phoneNumber, name, entityType });
          await contactMatcher.forceMatchNumber({ phoneNumber });
        }
      } :
      undefined,
    isLoggedContact,
    onLogCall: onLogCall ||
      (callLogger && (async ({ call, contact, redirect = true }) => {
        await callLogger.logCall({
          call,
          contact,
          redirect,
        });
      })),
    onCallsEmpty() {
      if (!webphone.sessions.length) {
        routerInteraction.push('/dialer');
      }
    },
    /**
     * if there is a existing conference, merge into it
     * else make one and merge into it;
     * @param {[string]} sessionIds
     */
    async mergeToConference(...args) {
      await conferenceCall.mergeToConference(...args);
      const conferenceData = Object.values(conferenceCall.conferences)[0];
      if (conferenceData && conferenceData.session.id === webphone.activeSessionId) {
        await sleep(200);
        webphone.resume(conferenceData.session.id);
      }
    },
    isSessionAConferenceCall: sessionId => conferenceCall.isConferenceSession(sessionId),
  };
}

const ActiveCallsPage = withPhone(connect(mapToProps, mapToFunctions)(ActiveCallsPanel));

export {
  mapToProps,
  mapToFunctions,
  ActiveCallsPage as default,
};

