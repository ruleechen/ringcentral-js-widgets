import React from 'react';

import InboundCall from '../../../assets/images/InboundCall.svg';
import OutboundCall from '../../../assets/images/OutboundCall.svg';
import styles from './styles.scss';

interface CallIconProps {
  title?: string;
  isInbound: boolean;
}

const CallIcon: React.FunctionComponent<CallIconProps> = ({
  title,
  isInbound,
}) => {
  return (
    <div className={styles.callIcon} title={title}>
      {isInbound ? <InboundCall /> : <OutboundCall />}
    </div>
  );
};

export default CallIcon;
