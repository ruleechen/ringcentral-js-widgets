import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';
import classnames from 'classnames';
import dynamicsFont from '../../assets/DynamicsFont/DynamicsFont.scss';
import DefaultAvatar from '../../assets/images/DefaultAvatar.svg'
function MergeInfo ({ calls, timeCounter, currentCall, avatar }) {
  console.log(currentCall)
  let lastTo = JSON.parse(localStorage.getItem('lastTo'))
  let callee_avatar
  if (lastTo.avatarUrl) {
    callee_avatar = (<img src={lastTo.avatarUrl} alt="avatar" />)
  } else {
    callee_avatar = (<img src={DefaultAvatar} className={styles.callee_avatar} alt="avatar" />)
  }
  return (
    <div className={styles.mergeInfo}>
      <div className={styles.merge_item}>
        <div className={styles.callee_avatar} style={{backgroundImage: `url(${lastTo.avatarUrl})`}}>

        </div>
        <div className={styles.callee_name}>
          {lastTo.nameMatches.length ? lastTo.nameMatches[0].name : lastTo.fallBackName}
        </div>
        <div className={styles.callee_status}>
          OnHold
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
  )
}
MergeInfo.defaultProps = {
  calls: [],
  timeCounter: null
}
MergeInfo.propTypes = {
  calls: PropTypes.array,
  timeCounter: PropTypes.element
}
export default MergeInfo;
