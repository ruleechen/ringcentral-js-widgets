import { connect } from 'react-redux';
import withPhone from '../../lib/withPhone';

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
  };
}

function mapToFunctions(_, {
  ...props
}) {
  const baseProps = mapToBaseFunctions(_, {
    ...props,
  });
  return {
    ...baseProps,
    onAdd() { },
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
