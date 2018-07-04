import { connect } from 'react-redux';

import withPhone from '../../lib/withPhone';
import allCallsLayout from '../../lib/allCallsLayout';

import CallsOnholdPanel from '../../components/CallsOnholdPanel';

import {
  mapToProps as mapToBaseProps,
  mapToFunctions as mapToBaseFunctions,
} from '../ActiveCallsPage';


function mapToProps(_, {
  phone,
  phone: {
    callMonitor,
  },
  ...props
}) {
  const baseProps = mapToBaseProps(_, {
    phone,
    ...props,
  });

  return {
    ...baseProps,
    calls: callMonitor.activeOnHoldCalls,
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
        await webphone.resume(session.id);
        routerInteraction.push('/conferenceCall/mergeCtrl');
      }
    },
    onBackButtonClick() {
      routerInteraction.goBack();
    }
  };
}

const CallsOnholdPage = withPhone(connect(
  mapToProps,
  mapToFunctions,
)(CallsOnholdPanel));

export default CallsOnholdPage;
