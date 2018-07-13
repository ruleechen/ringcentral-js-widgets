import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import recordStatus from 'ringcentral-integration/modules/Webphone/recordStatus';
import { isObject } from 'ringcentral-integration/lib/di/utils/is_type';

import CircleButton from '../CircleButton';
import DropDown from '../DropDown';
import ActiveCallButton from '../ActiveCallButton';
import MuteIcon from '../../assets/images/Mute.svg';
import UnmuteIcon from '../../assets/images/Unmute.svg';
import KeypadIcon from '../../assets/images/Dialpad.svg';
import HoldIcon from '../../assets/images/Hold.svg';
// import ParkIcon from '../../assets/images/Park.svg';
import RecordIcon from '../../assets/images/Record.svg';
// import AddIcon from '../../assets/images/AddCall.svg';
import MoreIcon from '../../assets/images/MoreIcon.svg';
import TransferIcon from '../../assets/images/Transfer.svg';
import FlipIcon from '../../assets/images/Flip.svg';
import EndIcon from '../../assets/images/End.svg';
import CombineIcon from '../../assets/images/Combine.svg';
import MergeIcon from '../../assets/images/MergeIntoConferenceIcon.svg';
import callCtrlLayout from '../../lib/callCtrlLayout';
import styles from './styles.scss';
import i18n from './i18n';

function MoreActionItem({
  name,
  icon,
  disabled,
  onClick,
}) {
  const iconClassName = classnames(
    styles.buttonIcon,
    disabled ? styles.buttonDisabled : styles.buttonActive
  );
  return (
    <div
      className={styles.buttonItem}
      onClick={disabled ? i => i : onClick}>
      <div className={iconClassName}>
        {icon}
      </div>
      <div className={styles.buttonName}>
        {name}
      </div>
    </div>
  );
}

MoreActionItem.propTypes = {
  name: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired,
  disabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

class ActiveCallPad extends Component {
  constructor(props) {
    super(props);
    this.moreButton = createRef();
    this.dropdown = createRef();
    this.state = {
      expandMore: props.expandMore,
      moreButton: this.moreButton && this.moreButton.current,
      onClick: (e) => {
        if (isObject(this.dropdown) && isObject(this.dropdown.current)) {
          const { dom: { current } } = this.dropdown.current;

          if (
            !current.contains(e.target)
            && !this.moreButton.current.contains(e.target)
            && this.state.expandMore
          ) {
            this.setState(() => ({
              expandMore: false,
            }));
          }
        }
      },
    };
  }

  toggleMore() {
    this.setState(prevState => ({
      expandMore: !prevState.expandMore
    }));
  }

  componentDidMount() {
    document.body.addEventListener('click', this.state.onClick);
    this.setState(() => ({
      moreButton: this.moreButton && this.moreButton.current
    }));
  }

  componentWillReceiveProps() {
    this.setState(() => ({
      moreButton: this.moreButton && this.moreButton.current
    }));
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.state.onClick);
  }

  render() {
    const onHoldClicked = this.props.isOnHold ?
      this.props.onUnhold :
      this.props.onHold;
    const onRecordClicked = this.props.recordStatus === recordStatus.recording ?
      this.props.onStopRecord :
      this.props.onRecord;
    const disabledFlip = this.props.flipNumbers.length === 0
      || this.props.isOnHold
      || this.props.layout === callCtrlLayout.mergeCtrl;
    const disabledTransfer = this.props.layout === callCtrlLayout.mergeCtrl;
    const recordTitle = this.props.recordStatus === recordStatus.recording ?
      i18n.getString('stopRecord', this.props.currentLocale) :
      i18n.getString('record', this.props.currentLocale);
    const isRecordButtonActive = this.props.recordStatus === recordStatus.recording;
    const isRecordDisabled = this.props.recordStatus === recordStatus.pending
      || this.props.layout === callCtrlLayout.mergeCtrl;
    const btnClassName = styles.callButton;
    const muteButton = this.props.isOnMute ?
      (
        <ActiveCallButton
          onClick={this.props.onUnmute}
          className={btnClassName}
          icon={MuteIcon}
          title={i18n.getString('unmute', this.props.currentLocale)}
          disabled={this.props.isOnHold}
        />
      ) :
      (
        <ActiveCallButton
          onClick={this.props.onMute}
          className={btnClassName}
          title={i18n.getString('mute', this.props.currentLocale)}
          icon={UnmuteIcon}
          disabled={this.props.isOnHold}
        />
      );

    const buttons = [
      muteButton,
      <ActiveCallButton
        onClick={this.props.onShowKeyPad}
        className={btnClassName}
        icon={KeypadIcon}
        title={i18n.getString('keypad', this.props.currentLocale)}
      />,
      <ActiveCallButton
        onClick={onHoldClicked}
        className={btnClassName}
        title={
          this.props.isOnHold ?
            i18n.getString('onHold', this.props.currentLocale) :
            i18n.getString('hold', this.props.currentLocale)
        }
        active={this.props.isOnHold}
        icon={HoldIcon}
        iconWidth={120}
        iconHeight={160}
        iconX={190}
        iconY={165}
      />,
      (
        this.props.layout === callCtrlLayout.mergeCtrl ||
        (this.props.layout === callCtrlLayout.normalCtrl && this.props.hasConference)
      )
        ? <ActiveCallButton
          onClick={this.props.mergeDisabled ? i => i : () => {
            this.props.onMerge();
          }}
          title={i18n.getString('mergeToConference', this.props.currentLocale)}
          className={btnClassName}
          icon={MergeIcon}
          disabled={this.props.mergeDisabled}
        />
        : <ActiveCallButton
          onClick={this.props.addDisabled ? i => i : () => {
            this.props.onAdd();
          }}
          title={i18n.getString('add', this.props.currentLocale)}
          className={btnClassName}
          icon={CombineIcon}
          disabled={this.props.addDisabled}
        />,
      <ActiveCallButton
        onClick={onRecordClicked}
        title={recordTitle}
        active={isRecordButtonActive}
        className={btnClassName}
        icon={RecordIcon}
        disabled={this.props.isOnHold || isRecordDisabled}
      />,
      <span
        className={styles.moreButtonContainer}
        ref={this.moreButton}
      >
        <ActiveCallButton
          onClick={() => this.toggleMore()}
          title={i18n.getString('more', this.props.currentLocale)}
          active={this.state.expandMore}
          className={classnames(styles.moreButton, btnClassName)}
          disabled={disabledFlip && disabledTransfer}
          icon={MoreIcon} />
        <DropDown
          fixed={false}
          open={this.state.expandMore}
          direction="top"
          ref={this.dropdown}
          triggerElm={this.state.moreButton}>
          <div className={styles.buttonPopup}>
            {
              [{
                icon: <TransferIcon />,
                name: i18n.getString('transfer', this.props.currentLocale),
                onClick: this.props.onToggleTransferPanel,
                disabled: disabledTransfer,
              },
              {
                icon: <FlipIcon />,
                name: i18n.getString('flip', this.props.currentLocale),
                onClick: this.props.onShowFlipPanel,
                disabled: disabledFlip,
              }].map(({
                name,
                ...opts
              }) => (<MoreActionItem
                key={name}
                name={name}
                {...opts}
              />))
            }
          </div>
        </DropDown>
      </span>
    ];

    return (
      <div className={classnames(styles.root, this.props.className)}>
        <div className={styles.callCtrlButtonGroup}>
          <div className={styles.buttonRow}>
            {buttons.map((c, idx) => React.cloneElement(c, { key: `${idx}_${c.props.title}` }))}
          </div>
        </div>
        <div className={classnames(styles.buttonRow, styles.stopButtonGroup)}>
          <div className={styles.button}>
            <CircleButton
              className={styles.stopButton}
              onClick={this.props.onHangup}
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
}

ActiveCallPad.propTypes = {
  expandMore: PropTypes.bool,
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
  layout: PropTypes.string.isRequired,
  addDisabled: PropTypes.bool,
  mergeDisabled: PropTypes.bool,
  hasConference: PropTypes.bool,
};

ActiveCallPad.defaultProps = {
  expandMore: false,
  className: null,
  isOnMute: false,
  isOnHold: false,
  addDisabled: false,
  mergeDisabled: null,
  hasConference: false,
  onAdd: i => i,
  onMerge: i => i,
};

export default ActiveCallPad;
