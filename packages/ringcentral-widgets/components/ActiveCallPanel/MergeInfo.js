import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';
import classnames from 'classnames';
import dynamicsFont from '../../assets/DynamicsFont/DynamicsFont.scss';
import DefaultAvatar from '../../assets/images/DefaultAvatar.svg'
import i18n from './i18n';
function MergeInfo ({ calls, timeCounter, currentCall, avatar, currentLocale, lastTo }) {
 let default_avatar = (<img src={DefaultAvatar} className={styles.callee_avatar} alt="avatar" />)
  return lastTo ? (
    <div className={styles.mergeInfo}>
      <div className={styles.merge_item}>
        <div className={styles.callee_avatar} style={!lastTo.isOnConference ? {backgroundImage: `url(${lastTo.avatarUrl})`} : {background: '#fff'}}>
          { lastTo.isOnConference || !lastTo.avatarUrl ? <DefaultAvatar className={styles.defaut_avatar}/> : null}
        </div>
        <div className={styles.callee_name}>
          {lastTo.isOnConference ? i18n.getString('conference',currentLocale) : lastTo.name }
        </div>
        <div className={styles.callee_status}>
          {i18n.getString('onHold', currentLocale)}
        </div>
      </div>
      <div className={styles.merge_item_active}>
          <div className={styles.callee_avatar_active} style={{backgroundImage: `url(${avatar})`}}>

          </div>
          <div className={styles.callee_name_active}>
            {currentCall.nameMatches.length ? currentCall.nameMatches[0].name : currentCall.fallBackName}
          </div>
          <div className={styles.callee_status_active}>
            {timeCounter}
          </div>
      </div>
    </div>
  ) : (<span></span>);
}
MergeInfo.defaultProps = {
  calls: []
}
MergeInfo.propTypes = {
  calls: PropTypes.array,
  timeCounter: PropTypes.element,
  currentCall: PropTypes.object,
  avatar: PropTypes.string,
  currentLocale: PropTypes.string,
  lastTo: PropTypes.object
}
export default MergeInfo;
