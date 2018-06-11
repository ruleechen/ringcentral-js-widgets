import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import recordStatus from 'ringcentral-integration/modules/Webphone/recordStatus';
import callDirections from 'ringcentral-integration/enums/callDirections';
import CircleButton from '../CircleButton';
import ActiveCallButton from '../ActiveCallButton';
import MuteIcon from '../../assets/images/Mute.svg';
import UnmuteIcon from '../../assets/images/Unmute.svg';
import KeypadIcon from '../../assets/images/Dialpad.svg';
import HoldIcon from '../../assets/images/Hold.svg';
// import ParkIcon from '../../assets/images/Park.svg';
import RecordIcon from '../../assets/images/Record.svg';
// import AddIcon from '../../assets/images/AddCall.svg';
import TransferIcon from '../../assets/images/Transfer.svg';
import FlipIcon from '../../assets/images/Flip.svg';
import EndIcon from '../../assets/images/End.svg';
import CombineIcon from '../../assets/images/Combine.svg';
import MergeIcon from '../../assets/images/MergeIntoConferenceIcon.svg';
import callCtrlLayout from '../../lib/callCtrlLayout';
import styles from './styles.scss';
import i18n from './i18n';

export default function ActiveCallPad(props) {
  const onHoldClicked = props.isOnHold ?
    props.onUnhold :
    props.onHold;
  const onRecordClicked = props.recordStatus === recordStatus.recording ?
    props.onStopRecord :
    props.onRecord;
  const disabledFlip = props.flipNumbers.length === 0;
  const recordTitle = props.recordStatus === recordStatus.recording ?
    i18n.getString('stopRecord', props.currentLocale) :
    i18n.getString('record', props.currentLocale);
  const isRecordButtonActive = props.recordStatus === recordStatus.recording;
  const isRecordDisabled = props.recordStatus === recordStatus.pending;
  const {
    layout, mergeDisabled, addDisabled
  } = props;
  const btnClassName = layout === callCtrlLayout.conferenceCtrl
    ? styles.conferenceCallButton : styles.callButton;
  const muteButton = props.isOnMute ?
    (
      <ActiveCallButton
        onClick={props.onUnmute}
        className={btnClassName}
        icon={MuteIcon}
        title={i18n.getString('unmute', props.currentLocale)}
      />
    ) :
    (
      <ActiveCallButton
        onClick={props.onMute}
        className={btnClassName}
        title={i18n.getString('mute', props.currentLocale)}
        icon={UnmuteIcon}
      />
    );
  let buttons;
  if (layout === callCtrlLayout.conferenceCtrl) {
    buttons = [
      muteButton,
      <ActiveCallButton
        onClick={props.onShowKeyPad}
        className={btnClassName}
        icon={KeypadIcon}
        title={i18n.getString('keypad', props.currentLocale)}
      />,
      <ActiveCallButton
        onClick={onRecordClicked}
        title={recordTitle}
        active={isRecordButtonActive}
        className={btnClassName}
        icon={RecordIcon}
        disabled={props.isOnHold || isRecordDisabled}
      />,
      <ActiveCallButton
        onClick={onHoldClicked}
        className={btnClassName}
        title={
          props.isOnHold ?
            i18n.getString('onHold', props.currentLocale) :
            i18n.getString('hold', props.currentLocale)
        }
        active={props.isOnHold}
        icon={HoldIcon}
        iconWidth={120}
        iconHeight={160}
        iconX={190}
        iconY={165}
      />,
    ];
  } else if (layout === callCtrlLayout.mergeCtrl) {
    buttons = [
      muteButton,
      <ActiveCallButton
        onClick={props.onShowKeyPad}
        className={btnClassName}
        icon={KeypadIcon}
        title={i18n.getString('keypad', props.currentLocale)}
      />,
      <ActiveCallButton
        onClick={onHoldClicked}
        className={btnClassName}
        title={
          props.isOnHold ?
            i18n.getString('onHold', props.currentLocale) :
            i18n.getString('hold', props.currentLocale)
        }
        active={props.isOnHold}
        icon={HoldIcon}
        iconWidth={120}
        iconHeight={160}
        iconX={190}
        iconY={165}
      />,
    ];
  } else {
    buttons = [
      muteButton,
      <ActiveCallButton
        onClick={props.onShowKeyPad}
        className={btnClassName}
        icon={KeypadIcon}
        title={i18n.getString('keypad', props.currentLocale)}
      />,
      <ActiveCallButton
        onClick={onHoldClicked}
        className={btnClassName}
        title={
          props.isOnHold ?
            i18n.getString('onHold', props.currentLocale) :
            i18n.getString('hold', props.currentLocale)
        }
        active={props.isOnHold}
        icon={HoldIcon}
        iconWidth={120}
        iconHeight={160}
        iconX={190}
        iconY={165}
      />,
      <ActiveCallButton
        onClick={props.onToggleTransferPanel}
        title={i18n.getString('transfer', props.currentLocale)}
        icon={TransferIcon}
        className={btnClassName}
        iconWidth={220}
        iconX={140}
      />,
      <ActiveCallButton
        onClick={onRecordClicked}
        title={recordTitle}
        active={isRecordButtonActive}
        className={btnClassName}
        icon={RecordIcon}
        disabled={props.isOnHold || isRecordDisabled}
      />,
      <ActiveCallButton
        onClick={props.onShowFlipPanel}
        title={i18n.getString('flip', props.currentLocale)}
        icon={FlipIcon}
        className={btnClassName}
        disabled={disabledFlip || props.isOnHold}
        iconWidth={220}
        iconHeight={215}
        iconX={140}
        iconY={142}
      />,
    ];
  }

  let conferenceCallButton;
  if (props.direction === callDirections.inbound) {
    conferenceCallButton = null;
  } else {
    conferenceCallButton = layout === callCtrlLayout.mergeCtrl ?
      (
        <div className={styles.button}>
          <CircleButton
            className={mergeDisabled ? styles.disabled : styles.mergeButton}
            onClick={mergeDisabled ? i => i : () => {
              props.onMerge();
            }}
            icon={MergeIcon}
            showBorder={false}
            iconWidth={250}
            iconX={125}
            disabled={mergeDisabled}
          />
        </div>
      )
      : (
        <div className={styles.button}>
          <CircleButton
            className={addDisabled ? styles.disabled : styles.combineButton}
            onClick={addDisabled ? i => i : () => {
              props.onAdd();
            }}
            icon={CombineIcon}
            showBorder={false}
            iconWidth={250}
            disabled={addDisabled}
            iconX={125}
          />
        </div>
      );
  }

  return (
    <div className={classnames(styles.root, props.className)}>
      <div className={styles.callCtrlButtonGroup}>
        <div className={styles.buttonRow}>
          {buttons.map((c, idx) => React.cloneElement(c, { key: `${idx}_${c.props.title}` }))}
        </div>
      </div>
      <div className={classnames(styles.buttonRow, styles.stopButtonGroup)}>
        {conferenceCallButton}
        <div className={styles.button}>
          <CircleButton
            className={styles.stopButton}
            onClick={props.onHangup}
            icon={EndIcon}
            showBorder={false}
            iconWidth={250}
            iconX={125}
          />
        </div>
      </div>
    </div>
  );
}

ActiveCallPad.propTypes = {
  currentLocale: PropTypes.string.isRequired,
  className: PropTypes.string,
  isOnMute: PropTypes.bool,
  isOnHold: PropTypes.bool,
  recordStatus: PropTypes.string.isRequired,
  onMute: PropTypes.func.isRequired,
  onUnmute: PropTypes.func.isRequired,
  onHold: PropTypes.func.isRequired,
  onUnhold: PropTypes.func.isRequired,
  onRecord: PropTypes.func.isRequired,
  onStopRecord: PropTypes.func.isRequired,
  onHangup: PropTypes.func.isRequired,
  // onPark: PropTypes.func.isRequired,
  onShowKeyPad: PropTypes.func.isRequired,
  onAdd: PropTypes.func,
  onMerge: PropTypes.func,
  onShowFlipPanel: PropTypes.func.isRequired,
  onToggleTransferPanel: PropTypes.func.isRequired,
  flipNumbers: PropTypes.array.isRequired,
  direction: PropTypes.string,
  mergeDisabled: PropTypes.bool,
  addDisabled: PropTypes.bool,
  layout: PropTypes.string.isRequired,
};

ActiveCallPad.defaultProps = {
  direction: null,
  mergeDisabled: null,
  className: null,
  isOnMute: false,
  isOnHold: false,
  addDisabled: false,
  onAdd: i => i,
  onMerge: i => i,
};
