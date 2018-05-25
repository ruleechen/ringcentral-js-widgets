import { connect } from 'react-redux';
import formatNumber from 'ringcentral-integration/lib/formatNumber';
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
    callingSettings: { callingMode }
  },
  showContactDisplayPlaceholder = false,
}) {
  const conferenceList = Object.values(conferenceCall.conferences);
  return {
    // only one conference can exist for now
    conference: conferenceList.length ? conferenceList[0] : null,
    currentLocale: locale.currentLocale,
    callingMode,
    callMonitor,
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
    brand: brand.fullName,
    showContactDisplayPlaceholder,
    autoLog: !!(callLogger && callLogger.autoLog),
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
  const mergeToConference = async (calls = []) => {
    const conferenceState = Object.values(conferenceCall.conferences)[0];
    try {
      if (conferenceState) {
        const conferenceId = conferenceState.conference.id;
        conferenceCall.stopPollingConferenceStatus(conferenceId);
        await Promise.all(
          calls.map(
            call => conferenceCall.bringInToConference(conferenceId, call)
          )
        );
        conferenceCall.startPollingConferenceStatus(conferenceId);
        return;
      }
      await conferenceCall.makeConference();
      /**
       * HACK: 700ms came from exprience, if we try to bring other calls into the conference
       * immediately, the api will throw 403 error which says: can't find the host of the
       * conference.
       */
      await new Promise(resolve => setTimeout(resolve, 700));
      await mergeToConference(calls);
    } catch (e) {
      console.log('error when merge to conference:', e);
    }
  };

  return {
    formatPhone: phoneNumber => formatNumber({
      phoneNumber,
      areaCode: regionSettings.areaCode,
      countryCode: regionSettings.countryCode,
    }),
    isConferenceCall: sessionId => conferenceCall.isConferenceSession(sessionId),
    webphoneAnswer: (...args) => (webphone && webphone.answer(...args)),
    webphoneToVoicemail: (...args) => (webphone && webphone.toVoiceMail(...args)),
    webphoneReject: (...args) => (webphone && webphone.reject(...args)),
    webphoneHangup: (...args) => (webphone && webphone.hangup(...args)),
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
    onCallsEmpty,
    /**
     * if there is a existing conference, merge into it
     * else make one and merge into it;
     * @param {[string]} sessionIds
     */
    mergeToConference,
  };
}

const ActiveCallsPage = withPhone(connect(mapToProps, mapToFunctions)(ActiveCallsPanel));

export default ActiveCallsPage;
