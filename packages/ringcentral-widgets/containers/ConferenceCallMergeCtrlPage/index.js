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
  const isOnConference = conferenceCall.isConferenceSession(currentSession.id);
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
