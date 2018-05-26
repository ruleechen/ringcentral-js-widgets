import React, { Component } from 'react';
import callDirections from 'ringcentral-integration/enums/callDirections';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ActiveCallItem from '../ActiveCallItem';
import ConfirmMergeModal from './ConfirmMergeModal';
import styles from './styles.scss';

class ActiveCallList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false,
      callOfModal: null,
      onMerge() {
        if (this.state.callOfModal) {
          this.props.mergeToConference([this.state.callOfModal]);
          // close then
          this.setState(Object.assign({}, this.state, {
            isModalOpen: false,
            callOfModal: null
          }));
        }
      }
    };
  }

  onCancel() {
    this.setState({
      isModalOpen: false,
      callOfModal: null,
      onMerge() {
        // merge the selected call to the on hold conference call when active call is an inbound call
        if (this.state.callOfModal) {
          this.props.mergeToConference([this.state.callOfModal]);
        }
      }
    });
  }

  render() {
    const {
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
    } = this.props;

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
                  showMergeButton = true;

                  onConfirmMerge = () => {
                    const { onMerge } = this.state;
                    this.setState({
                      callOfModal: call,
                      isModalOpen: true,
                      onMerge
                    });
                  };
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
        <ConfirmMergeModal
          currentLocale={currentLocale}
          show={this.state.isModalOpen}
          onMerge={() => this.state.onMerge()}
          onCancel={() => this.onCancel()}
        />
      </div>
    );
  }
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


export default ActiveCallList;
