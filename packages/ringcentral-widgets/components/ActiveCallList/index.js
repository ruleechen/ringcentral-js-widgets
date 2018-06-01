import React from 'react';
import callDirections from 'ringcentral-integration/enums/callDirections';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ActiveCallItem from '../ActiveCallItem';
import styles from './styles.scss';

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
  onConfirmMergeCall,
  disableMerge,
}) {
  if (!calls.length) {
    return null;
  }

  return (
    <div className={classnames(styles.list, className)}>
      <div className={styles.listTitle}>
        {title}
      </div>
      {
        calls.map((call) => {
          let showMergeCall = false;
          let onMergeCall;
          const currentCall = activeCurrentCalls[0];
          const hasConference = !!conference;
          const isOnConferenceCall = call.webphoneSession
            ? isConferenceCall(call.webphoneSession.id)
            : false;
          const isCurrentCallAConf = currentCall
            ? isConferenceCall(currentCall.webphoneSession.id)
            : false;

          if (!isOnWebRTC) {
            showMergeCall = false;
          } else if (currentCall) {
            if (call === currentCall) {
              showMergeCall = false;
            } else if (call.direction === callDirections.inbound) {
              showMergeCall = false;
            } else if (currentCall.direction === callDirections.outbound) {
              if (hasConference) {
                showMergeCall = true;
                if (isOnConferenceCall) {
                  onMergeCall = () => mergeToConference([currentCall]);
                } else if (isCurrentCallAConf) {
                  onMergeCall = () => mergeToConference([call]);
                } else {
                  onMergeCall = () => onConfirmMergeCall(call);
                }
              } else {
                showMergeCall = true;
                const partyCalls = [call, activeCurrentCalls[0]];
                onMergeCall = () => mergeToConference(partyCalls);
              }
            } else if (hasConference) {
              if (isOnConferenceCall) {
                showMergeCall = false;
              } else {
                showMergeCall = true;
                onMergeCall = () => {
                  onConfirmMergeCall(call);
                };
              }
            } else {
              showMergeCall = false;
            }
          } else {
            showMergeCall = false;
          }

          return (
            <ActiveCallItem
              call={call}
              key={call.id}
              showMergeCall={showMergeCall}
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
              onMergeCall={onMergeCall}
              loggingMap={loggingMap}
              webphoneAnswer={webphoneAnswer}
              webphoneReject={webphoneReject}
              webphoneHangup={webphoneHangup}
              webphoneResume={webphoneResume}
              webphoneToVoicemail={webphoneToVoicemail}
              enableContactFallback={enableContactFallback}
              autoLog={autoLog}
              sourceIcons={sourceIcons}
              disableMerge={disableMerge}
            />
          );
        })
      }
    </div>
  );
}

ActiveCallList.propTypes = {
  disableMerge: PropTypes.bool,
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
  onConfirmMergeCall: PropTypes.func.isRequired,
};

ActiveCallList.defaultProps = {
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
