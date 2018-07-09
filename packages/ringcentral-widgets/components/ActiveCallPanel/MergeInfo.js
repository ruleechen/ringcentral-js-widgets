import React from 'react';
import PropTypes from 'prop-types';
import calleeTypes from 'ringcentral-integration/enums/calleeTypes';
import styles from './styles.scss';
import DefaultAvatar from '../../assets/images/DefaultAvatar.svg';
import i18n from './i18n';

function MergeInfo({
  calls, timeCounter, currentCall, avatar, currentLocale, lastTo
}) {
  const isConference = lastTo && lastTo.calleeType === calleeTypes.conference ? i18n.getString('conference', currentLocale) : i18n.getString('unknow', currentLocale);
  return lastTo ? (
    <div className={styles.mergeInfo}>
      <div className={styles.merge_item}>
        <div className={styles.callee_avatar} style={lastTo.calleeType === calleeTypes.contacts ? { backgroundImage: `url(${lastTo.avatarUrl})` } : { background: '#fff' }}>
          { lastTo.calleeType !== calleeTypes.contacts || !lastTo.avatarUrl
            ? <DefaultAvatar className={styles.defaut_avatar} />
            : null
          }
        </div>
        <div className={styles.callee_name}>
          { lastTo.calleeType === calleeTypes.contacts ? lastTo.name : isConference }
        </div>
        <div className={styles.callee_status}>
          {i18n.getString('onHold', currentLocale)}
        </div>
      </div>
      <div className={styles.merge_item_active}>
        <div className={styles.callee_avatar_active} style={currentCall.fallBackName !== 'Unknow' ? { backgroundImage: `url(${avatar})` } : { background: '#fff' }}>
          { currentCall.fallBackName === 'Unknow' || !avatar ? <DefaultAvatar className={styles.defaut_avatar} /> : null}
        </div>
        <div className={styles.callee_name_active}>
          { currentCall.nameMatches.length
              ? currentCall.nameMatches[0].name
              : currentCall.fallBackName
          }
        </div>
        <div className={styles.callee_status_active}>
          {timeCounter}
        </div>
      </div>
    </div>
  ) : (<span />);
}
MergeInfo.propTypes = {
  calls: PropTypes.array,
  timeCounter: PropTypes.element,
  currentCall: PropTypes.object,
  avatar: PropTypes.string,
  currentLocale: PropTypes.string,
  lastTo: PropTypes.object
};
MergeInfo.defaultProps = {
  calls: []
};
export default MergeInfo;
