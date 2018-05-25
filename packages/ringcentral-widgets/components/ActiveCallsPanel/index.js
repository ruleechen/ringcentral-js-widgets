import React, { Component } from 'react';
import callingModes from 'ringcentral-integration/modules/CallingSettings/callingModes';
import callDirections from 'ringcentral-integration/enums/callDirections';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import SpinnerOverlay from '../SpinnerOverlay';
import ActiveCallItem from '../ActiveCallItem';
import styles from './styles.scss';
import i18n from './i18n';

function ActiveCallList({
  calls,
  conference,
  className,
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
  isConferenceCall,
  mergeToConference,
  onLogCall,
  autoLog,
  loggingMap,
  webphoneAnswer,
  webphoneReject,
  webphoneHangup,
  webphoneResume,
  webphoneToVoicemail,
  enableContactFallback,
  title,
  sourceIcons,
  isOnWebRTC,
  activeCurrentCalls,
}) {
  if (calls.length === 0) {
    return null;
  }
  return (
    <div className={classnames(styles.list, className)}>
      <div className={styles.listTitle}>
        {title}
      </div>
      {
        calls.map((call) => {
          let showMergeButton = false;
          let onConfirmMerge;
          const currentCall = activeCurrentCalls[0];
          const hasConference = !!conference;
          const isOnConferenceCall = call.webphoneSession
            ? isConferenceCall(call.webphoneSession.id)
            : false;
          if (!isOnWebRTC) {
            showMergeButton = false;
          } else if (currentCall) {
            if (call === currentCall) {
              showMergeButton = false;
            } else if (call.direction === callDirections.inbound) {
              showMergeButton = false;
            } else if (currentCall.direction === callDirections.outbound) {
              if (hasConference) {
                showMergeButton = true;

                if (isOnConferenceCall) {
                  onConfirmMerge = () => mergeToConference([
                    currentCall
                  ]);
                } else {
                  onConfirmMerge = () => mergeToConference([call]);
                }
              } else {
                showMergeButton = true;
                onConfirmMerge = () => mergeToConference([
                  call,
                  activeCurrentCalls[0]
                ]);
              }
            } else if (hasConference) {
              if (isOnConferenceCall) {
                showMergeButton = false;
              } else {
                onConfirmMerge = () => mergeToConference([call]);
              }
            } else {
              showMergeButton = false;
            }
          } else {
            showMergeButton = false;
          }

          return (
            <ActiveCallItem
              call={call}
              key={call.id}
              showMergeButton={showMergeButton}
              conference={conference}
              isOnConferenceCall={isOnConferenceCall}
              currentLocale={currentLocale}
              areaCode={areaCode}
              countryCode={countryCode}
              brand={brand}
              showContactDisplayPlaceholder={showContactDisplayPlaceholder}
              formatPhone={formatPhone}
              onClickToSms={onClickToSms}
              internalSmsPermission={internalSmsPermission}
              outboundSmsPermission={outboundSmsPermission}
              isLoggedContact={isLoggedContact}
              onLogCall={onLogCall}
              onViewContact={onViewContact}
              onCreateContact={onCreateContact}
              onConfirmMerge={onConfirmMerge}
              loggingMap={loggingMap}
              webphoneAnswer={webphoneAnswer}
              webphoneReject={webphoneReject}
              webphoneHangup={webphoneHangup}
              webphoneResume={webphoneResume}
              webphoneToVoicemail={webphoneToVoicemail}
              enableContactFallback={enableContactFallback}
              autoLog={autoLog}
              sourceIcons={sourceIcons}
            />
          );
        })
      }
    </div>
  );
}

ActiveCallList.propTypes = {
  isOnWebRTC: PropTypes.bool.isRequired,
  currentLocale: PropTypes.string.isRequired,
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
  calls: PropTypes.array.isRequired,
  areaCode: PropTypes.string.isRequired,
  countryCode: PropTypes.string.isRequired,
  brand: PropTypes.string,
  showContactDisplayPlaceholder: PropTypes.bool,
  formatPhone: PropTypes.func.isRequired,
  onClickToSms: PropTypes.func,
  onCreateContact: PropTypes.func,
  onViewContact: PropTypes.func,
  outboundSmsPermission: PropTypes.bool,
  internalSmsPermission: PropTypes.bool,
  isLoggedContact: PropTypes.func,
  isConferenceCall: PropTypes.func.isRequired,
  onLogCall: PropTypes.func,
  loggingMap: PropTypes.object,
  webphoneAnswer: PropTypes.func,
  webphoneReject: PropTypes.func,
  webphoneHangup: PropTypes.func,
  webphoneResume: PropTypes.func,
  webphoneToVoicemail: PropTypes.func,
  mergeToConference: PropTypes.func.isRequired,
  enableContactFallback: PropTypes.bool,
  autoLog: PropTypes.bool,
  sourceIcons: PropTypes.object,
  conference: PropTypes.shape({
    conference: PropTypes.shape({
      id: PropTypes.string.isRequired,
      creationTime: PropTypes.string.isRequired,
      parties: PropTypes.array.isRequired,
    }),
    session: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }),
  activeCurrentCalls: PropTypes.array.isRequired,
};

ActiveCallList.defaultProps = {
  className: undefined,
  brand: 'RingCentral',
  showContactDisplayPlaceholder: true,
  onCreateContact: undefined,
  onClickToSms: undefined,
  outboundSmsPermission: true,
  internalSmsPermission: true,
  isLoggedContact: undefined,
  onLogCall: undefined,
  loggingMap: {},
  webphoneAnswer: undefined,
  webphoneReject: undefined,
  webphoneHangup: undefined,
  webphoneResume: undefined,
  enableContactFallback: undefined,
  autoLog: false,
  onViewContact: undefined,
  webphoneToVoicemail: undefined,
  sourceIcons: undefined,
  conference: null,
};

export default class ActiveCallsPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSpinner: false
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
      mergeToConference,
      callingMode,
      activeCurrentCalls,
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
        mergeToConference={async (...args) => {
          this.setState({ showSpinner: true });
          await mergeToConference.call(this, ...args);
          this.setState({ showSpinner: false });
        }}
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
    } = this.props;

    if (this.state.showSpinner) {
      return (<SpinnerOverlay />);
    }
    if (!this.hasCalls()) {
      return (
        <div className={classnames(styles.root, className)}>
          <p className={styles.noCalls}>
            {i18n.getString('noActiveCalls', currentLocale)}
          </p>
        </div>
      );
    }
    return (
      <div className={classnames(styles.root, className)}>
        {this.getCallList(activeRingCalls, i18n.getString('ringCall', currentLocale))}
        {this.getCallList(activeCurrentCalls, i18n.getString('currentCall', currentLocale))}
        {this.getCallList(activeOnHoldCalls, i18n.getString('onHoldCall', currentLocale))}
        {this.getCallList(otherDeviceCalls, i18n.getString('otherDeviceCall', currentLocale))}
      </div>
    );
  }
}

ActiveCallsPanel.propTypes = {
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
