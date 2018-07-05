import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ActiveCallItem from '../ActiveCallItem';
import CircleButton from '../CircleButton';
import BackHeader from '../BackHeader';
import styles from './styles.scss';
import i18n from './i18n';
import CombineIcon from '../../assets/images/Combine.svg';
import dynamicsFont from '../../assets/DynamicsFont/DynamicsFont.scss';

export default function CallsOnholdContainer({
  calls,
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
  webphoneToVoicemail,
  enableContactFallback,
  sourceIcons,
  disableMerge,
  onBackButtonClick,
  backButtonLabel,
  onMergeCall,
  onAdd,
}) {
  const backHeader = (<BackHeader
    className={styles.header}
    onBackClick={onBackButtonClick}
    backButton={(
      <span className={styles.backButton}>
        <i className={classnames(dynamicsFont.arrow, styles.backIcon)} />
        <span className={styles.backLabel}>{backButtonLabel}</span>
      </span>
      )}
    />);

  return (
    <div className={styles.root}>
      {backHeader}
      <div className={styles.callList}>
        {
        calls.length
        ? calls.map(call => (
          <ActiveCallItem
            call={call}
            key={call.id}
            showMergeCall
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
            hasActionMenu={false}
            showAnswer={false}
          />
        ))
        : <div className={styles.noCalls}>{i18n.getString('noCallsOnhold', currentLocale)}</div>
      }
      </div>
      <div className={styles.addBtnContainer}>
        <div className={styles.addBtn}>
          <CircleButton
            title={i18n.getString('add', currentLocale)}
            className={styles.addBtnIcon}
            icon={CombineIcon}
            showBorder={false}
            onClick={onAdd}
            />
        </div>
      </div>
    </div>
  );
}


CallsOnholdContainer.propTypes = {
  currentLocale: PropTypes.string.isRequired,
  onMergeCall: PropTypes.func,
  calls: PropTypes.array.isRequired,
  areaCode: PropTypes.string.isRequired,
  countryCode: PropTypes.string.isRequired,
  brand: PropTypes.string,
  showContactDisplayPlaceholder: PropTypes.bool,
  formatPhone: PropTypes.func.isRequired,
  onViewContact: PropTypes.func,
  outboundSmsPermission: PropTypes.bool,
  internalSmsPermission: PropTypes.bool,
  isLoggedContact: PropTypes.func,
  onLogCall: PropTypes.func,
  loggingMap: PropTypes.object,
  webphoneAnswer: PropTypes.func,
  webphoneReject: PropTypes.func,
  webphoneHangup: PropTypes.func,
  webphoneResume: PropTypes.func,
  webphoneToVoicemail: PropTypes.func,
  enableContactFallback: PropTypes.bool,
  autoLog: PropTypes.bool,
  sourceIcons: PropTypes.object,
  onBackButtonClick: PropTypes.func,
  backButtonLabel: PropTypes.string,
  onClickToSms: PropTypes.func,
  onCreateContact: PropTypes.func,
  disableMerge: PropTypes.bool,
  onAdd: PropTypes.func,
};

CallsOnholdContainer.defaultProps = {
  brand: 'RingCentral',
  showContactDisplayPlaceholder: true,
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
  backButtonLabel: 'Active Call',
  onBackButtonClick: undefined,
  onMergeCall: undefined,
  onClickToSms: undefined,
  onCreateContact: undefined,
  disableMerge: false,
  onAdd: i => i,
};
