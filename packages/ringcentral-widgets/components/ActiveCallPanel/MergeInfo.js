import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import sessionStatus from 'ringcentral-integration/modules/Webphone/sessionStatus';
import calleeTypes from 'ringcentral-integration/enums/calleeTypes';
import styles from './styles.scss';
import i18n from './i18n';
import CallAvatar from '../CallAvatar';

function MergeInfo({
  currentLocale,
  timeCounter,
  lastCallInfo,
  onLastCallEnded,
  currentCallTitle,
  currentCallAvatarUrl,
}) {
  const isLastCallEnded = !!(
    lastCallInfo && lastCallInfo.status === sessionStatus.finished
  );
  const isOnConferenCall = !!(
    lastCallInfo && lastCallInfo.calleeType === calleeTypes.conference
  );
  if (isLastCallEnded && onLastCallEnded) {
    onLastCallEnded();
  }
  const statusClasses = classnames({
    [styles.callee_status]: true,
    [styles.callee_status_disconnected]: isLastCallEnded,
  });
  return lastCallInfo ? (
    <div className={styles.mergeInfo}>
      <div className={styles.merge_item}>
        <div className={styles.callee_avatar}>
          <CallAvatar
            avatarUrl={lastCallInfo.avatarUrl}
            extraNum={isOnConferenCall ? lastCallInfo.extraNum : 0}
            isOnConferenceCall={isOnConferenCall}
          />
        </div>
        <div className={styles.callee_name}>
          {
            (lastCallInfo.calleeType === calleeTypes.conference)
              ? i18n.getString('conferenceCall', currentLocale)
              : lastCallInfo.name
          }
        </div>
        <div className={statusClasses}>
          {lastCallInfo.status === sessionStatus.finished
            ? i18n.getString('disconnected', currentLocale)
            : i18n.getString('onHold', currentLocale)}
        </div>
      </div>
      <div className={styles.merge_item_active}>
        <div className={styles.callee_avatar_active} >
          {
            currentCallAvatarUrl
              ? <CallAvatar avatarUrl={currentCallAvatarUrl} />
              : <CallAvatar avatarUrl={null} />
          }
        </div>
        <div className={styles.callee_name_active}>
          {currentCallTitle}
        </div>
        <div className={styles.callee_status_active}>
          {timeCounter}
        </div>
      </div>
    </div>
  ) : (<span />);
}

MergeInfo.propTypes = {
  currentLocale: PropTypes.string.isRequired,
  timeCounter: PropTypes.element.isRequired,
  lastCallInfo: PropTypes.object,
  onLastCallEnded: PropTypes.func,
  currentCallTitle: PropTypes.string,
  currentCallAvatarUrl: PropTypes.string,
};

MergeInfo.defaultProps = {
  lastCallInfo: { calleeType: calleeTypes.unknow },
  onLastCallEnded: undefined,
  currentCallTitle: undefined,
  currentCallAvatarUrl: undefined,
};

export default MergeInfo;
