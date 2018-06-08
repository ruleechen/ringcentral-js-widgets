import React, { Component } from 'react';
import callingModes from 'ringcentral-integration/modules/CallingSettings/callingModes';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import SpinnerOverlay from '../SpinnerOverlay';
import ActiveCallList from '../ActiveCallList';
import ConfirmMergeModal from './ConfirmMergeModal';
import styles from './styles.scss';
import i18n from './i18n';

export default class ActiveCallsPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false,
      callOfModal: null,
    };

    this.mergeToConference = async (...args) => {
      await this.props.mergeToConference(...args);
    };

    this.showConfirmMergeModal = (call) => {
      this.setState({
        isModalOpen: true,
        callOfModal: call,
      });
    };

    this.hideConfirmMergeModal = () => {
      this.setState({
        isModalOpen: false,
        callOfModal: null,
      });
    };

    this.confirmMergeCall = () => {
      this.mergeToConference([this.state.callOfModal.webphoneSession]);
      this.hideConfirmMergeModal();
    };
  }

  componentDidMount() {
    if (
      !this.hasCalls(this.props) &&
      typeof this.props.onCallsEmpty === 'function'
    ) {
      this.props.onCallsEmpty();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.hasCalls(this.props) &&
      !this.hasCalls(nextProps) &&
      typeof this.props.onCallsEmpty === 'function'
    ) {
      this.props.onCallsEmpty();
    }
  }

  hasCalls(props = this.props) {
    return (
      props.activeRingCalls.length > 0 ||
      props.activeOnHoldCalls.length > 0 ||
      props.activeCurrentCalls.length > 0 ||
      props.otherDeviceCalls.length > 0
    );
  }

  getCallList(calls, title) {
    const {
      currentLocale,
      areaCode,
      countryCode,
      brand,
      showContactDisplayPlaceholder,
      formatPhone,
      onClickToSms,
      onCreateContact,
      onViewContact,
      outboundSmsPermission,
      internalSmsPermission,
      isLoggedContact,
      onLogCall,
      autoLog,
      loggingMap,
      webphoneAnswer,
      webphoneReject,
      webphoneHangup,
      webphoneResume,
      enableContactFallback,
      webphoneToVoicemail,
      sourceIcons,
      conference,
      isConferenceCall,
      callingMode,
      activeCurrentCalls,
      disableMerge,
    } = this.props;

    return (
      <ActiveCallList
        isOnWebRTC={callingMode === callingModes.webphone}
        isConferenceCall={isConferenceCall}
        conference={conference}
        title={title}
        calls={calls}
        currentLocale={currentLocale}
        areaCode={areaCode}
        countryCode={countryCode}
        brand={brand}
        showContactDisplayPlaceholder={showContactDisplayPlaceholder}
        formatPhone={formatPhone}
        onClickToSms={onClickToSms}
        onCreateContact={onCreateContact}
        onViewContact={onViewContact}
        mergeToConference={this.mergeToConference}
        outboundSmsPermission={outboundSmsPermission}
        internalSmsPermission={internalSmsPermission}
        isLoggedContact={isLoggedContact}
        onLogCall={onLogCall}
        autoLog={autoLog}
        loggingMap={loggingMap}
        webphoneAnswer={webphoneAnswer}
        webphoneReject={webphoneReject}
        webphoneHangup={webphoneHangup}
        webphoneResume={webphoneResume}
        webphoneToVoicemail={webphoneToVoicemail}
        enableContactFallback={enableContactFallback}
        sourceIcons={sourceIcons}
        activeCurrentCalls={activeCurrentCalls}
        onConfirmMergeCall={this.showConfirmMergeModal}
        disableMerge={disableMerge}
      />
    );
  }

  render() {
    const {
      activeRingCalls,
      activeOnHoldCalls,
      activeCurrentCalls,
      otherDeviceCalls,
      className,
      currentLocale,
      isMerging,
    } = this.props;
    if (!this.hasCalls()) {
      return (
        <div
          className={classnames(styles.root, className)}
        >
          <p className={styles.noCalls}>{i18n.getString('noActiveCalls', currentLocale)}</p>
          {isMerging && <SpinnerOverlay className={styles.spinner} />}
        </div>
      );
    }
    return (
      <div className={styles.root}>
        <div
          className={classnames(styles.root, className)}
          ref={(target) => { this.container = target; }}
        >
          {this.getCallList(activeRingCalls, i18n.getString('ringCall', currentLocale))}
          {this.getCallList(activeCurrentCalls, i18n.getString('currentCall', currentLocale))}
          {this.getCallList(activeOnHoldCalls, i18n.getString('onHoldCall', currentLocale))}
          {this.getCallList(otherDeviceCalls, i18n.getString('otherDeviceCall', currentLocale))}
          <ConfirmMergeModal
            currentLocale={currentLocale}
            show={this.state.isModalOpen}
            onMerge={this.confirmMergeCall}
            onCancel={this.hideConfirmMergeModal}
          />
        </div>
        {isMerging && <SpinnerOverlay className={styles.spinner} />}
      </div>
    );
  }
}

ActiveCallsPanel.propTypes = {
  isMerging: PropTypes.bool,
  disableMerge: PropTypes.bool,
  callingMode: PropTypes.string.isRequired,
  currentLocale: PropTypes.string.isRequired,
  className: PropTypes.string,
  activeRingCalls: PropTypes.array.isRequired,
  activeOnHoldCalls: PropTypes.array.isRequired,
  activeCurrentCalls: PropTypes.array.isRequired,
  otherDeviceCalls: PropTypes.array.isRequired,
  areaCode: PropTypes.string.isRequired,
  countryCode: PropTypes.string.isRequired,
  brand: PropTypes.string,
  showContactDisplayPlaceholder: PropTypes.bool,
  formatPhone: PropTypes.func.isRequired,
  onClickToSms: PropTypes.func,
  onCreateContact: PropTypes.func,
  outboundSmsPermission: PropTypes.bool,
  internalSmsPermission: PropTypes.bool,
  isLoggedContact: PropTypes.func,
  isConferenceCall: PropTypes.func.isRequired,
  mergeToConference: PropTypes.func.isRequired,
  onLogCall: PropTypes.func,
  webphoneAnswer: PropTypes.func,
  webphoneReject: PropTypes.func,
  webphoneHangup: PropTypes.func,
  webphoneResume: PropTypes.func,
  webphoneToVoicemail: PropTypes.func,
  autoLog: PropTypes.bool,
  onViewContact: PropTypes.func,
  enableContactFallback: PropTypes.bool,
  loggingMap: PropTypes.object,
  onCallsEmpty: PropTypes.func,
  sourceIcons: PropTypes.object,
  conference: PropTypes.object,
};

ActiveCallsPanel.defaultProps = {
  isMerging: false,
  disableMerge: false,
  className: undefined,
  brand: 'RingCentral',
  showContactDisplayPlaceholder: true,
  onCreateContact: undefined,
  onClickToSms: undefined,
  outboundSmsPermission: true,
  internalSmsPermission: true,
  isLoggedContact: undefined,
  onLogCall: undefined,
  onViewContact: undefined,
  webphoneAnswer: undefined,
  webphoneReject: undefined,
  webphoneHangup: undefined,
  webphoneResume: undefined,
  webphoneToVoicemail: undefined,
  enableContactFallback: undefined,
  loggingMap: {},
  autoLog: false,
  onCallsEmpty: undefined,
  sourceIcons: undefined,
  conference: null,
};
