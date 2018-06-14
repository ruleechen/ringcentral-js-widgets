import { connect } from 'react-redux';
import sleep from 'ringcentral-integration/lib/sleep';

import withPhone from '../../lib/withPhone';
import callCtrlLayout from '../../lib/callCtrlLayout';

import {
  CallCtrlPage,
  mapToProps as mapToBaseProps,
  mapToFunctions as mapToBaseFunctions,
} from '../CallCtrlPage';

function mapToProps(_, {
  phone,
  phone: {
    webphone,
    conferenceCall,
  },
  ...props
}) {
  const baseProps = mapToBaseProps(_, {
    phone,
    ...props,
  });

  const currentSession = webphone.activeSession || {};
  const isOnConference = conferenceCall.isConferenceSession(currentSession.id)
    || (conferenceCall.state.isMerging && (currentSession.to
      && currentSession.to.indexOf('conf_') === 0));
  const layout = isOnConference ? callCtrlLayout.conferenceCtrl : callCtrlLayout.mergeCtrl;

  return {
    ...baseProps,
    layout,
  };
}

function mapToFunctions(_, {
  phone,
  phone: {
    webphone,
    conferenceCall,
    routerInteraction,
  },
  ...props
}) {
  const baseProps = mapToBaseFunctions(_, {
    phone,
    ...props,
  });
  return {
    ...baseProps,
    async onMerge(sessionId) {
      const session = webphone._sessions.get(sessionId);
      conferenceCall.setMergeParty({ to: session });
      const sessionToMergeWith = conferenceCall.state.mergingPair.from;
      const webphoneSessions = sessionToMergeWith
        ? [sessionToMergeWith, session]
        : [session];
      await conferenceCall.mergeToConference(webphoneSessions);
      const conferenceData = Object.values(conferenceCall.conferences)[0];
      if (conferenceData && conferenceData.session.isOnHold().local) {
        /**
         * because session termination operation in conferenceCall._mergeToConference,
         * need to wait for webphone.getActiveSessionIdReducer to update
         */
        webphone.resume(conferenceData.session.id);
        return;
      }
      if (!conferenceData) {
        await sleep(200);
        await webphone.resume(session.id);
        routerInteraction.push('/conferenceCall/mergeCtrl');
      }
    },
  };
}

const ConferenceCallMergeCtrlPage = withPhone(connect(
  mapToProps,
  mapToFunctions,
)(CallCtrlPage));

export {
  mapToProps,
  mapToFunctions,
  ConferenceCallMergeCtrlPage as default,
};
