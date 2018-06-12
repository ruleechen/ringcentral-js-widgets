import { connect } from 'react-redux';

import withPhone from '../../lib/withPhone';
import callCtrlLayout from '../../lib/callCtrlLayout';

import {
  CallCtrlPage,
  mapToProps as mapToBaseProps,
  mapToFunctions as mapToBaseFunctions,
} from '../CallCtrlPage';

function mapToProps(_, {
  ...props
}) {
  const baseProps = mapToBaseProps(_, {
    ...props,
  });
  return {
    ...baseProps,
    layout: callCtrlLayout.mergeCtrl,
  };
}

function mapToFunctions(_, {
  phone,
  phone: {
    webphone,
    conferenceCall,
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
        conferenceData.session.unhold();
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
