import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import throttle from 'ringcentral-integration/lib/throttle';

import CallInfo from './CallInfo';
import ConferenceInfo from './ConferenceInfo';
import BackHeader from '../BackHeader';
import ConfirmMergeModal from '../ConfirmMergeModal';
import Panel from '../Panel';
import DurationCounter from '../DurationCounter';
import ActiveCallPad from '../ActiveCallPad';
import callCtrlLayout from '../../lib/callCtrlLayout';
import dynamicsFont from '../../assets/DynamicsFont/DynamicsFont.scss';
import styles from './styles.scss';
import MergeInfo from './MergeInfo';

class ActiveCallPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayedProfiles: [],
      remains: 0,
      isPartiesModalOpen: false, // todo: for rendering the parties modal when conferecing
      resizeFunc: throttle(() => this.handleResize(this.props)),
      currentCall: {
        nameMatches: this.props.nameMatches,
        fallBackName: this.props.fallBackName
      }
    };
  }


  handleResize(props) {
    const MAXIMUM_AVATARS = 4;
    // todo: handle width calculation
    if (props.layout === callCtrlLayout.conferenceCtrl) {
      // conference is just created and waiting for parties data to return
      const profiles = this.props.getPartyProfiles();
      if (profiles) {
        const displayedProfiles = (profiles.length >= MAXIMUM_AVATARS
          ? profiles.slice(0, MAXIMUM_AVATARS)
          : profiles)
          .map(({ avatarUrl, toUserName, id }) => ({ avatarUrl, toUserName, id }));
        const remains = profiles.length <= MAXIMUM_AVATARS ? 0 : profiles.length - MAXIMUM_AVATARS;
        this.setState(prev => ({
          ...prev,
          displayedProfiles,
          remains,
        }));
      }
    }
  }

  onMerge() {
    if (
      this.props.hasConference &&
      this.props.layout === callCtrlLayout.normalCtrl
    ) {
      this.setState(prevState => ({
        ...prevState,
        isModalOpen: true,
      }));
    } else {
      this.props.onMerge();
    }
  }

  confirmMergeCall() {
    this.props.onMerge();
    this.hideConfirmMergeModal();
  }

  hideConfirmMergeModal() {
    this.setState(prevState => ({
      ...prevState,
      isModalOpen: false,
    }));
  }

  componentDidMount() {
    this.handleResize(this.props);
    window.addEventListener('resize', this.state.resizeFunc);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.state.resizeFunc);
  }

  componentWillReceiveProps(nextProps) {
    this.handleResize(nextProps);
    if (!nextProps.hasConference && this.state.isModalOpen) {
      this.hideConfirmMergeModal();
    }
  }

  openPartiesModal() {
    // todo;
  }

  render() {
    const {
      onBackButtonClick,
      backButtonLabel,
      currentLocale,
      nameMatches,
      fallBackName,
      phoneNumber,
      formatPhone,
      startTime,
      startTimeOffset,
      areaCode,
      countryCode,
      selectedMatcherIndex,
      onSelectMatcherName,
      avatarUrl,
      isOnMute,
      isOnHold,
      recordStatus,
      onMute,
      onUnmute,
      onHold,
      onUnhold,
      onRecord,
      onStopRecord,
      onShowKeyPad,
      onHangup,
      onPark,
      onAdd,
      // onMerge,
      onShowFlipPanel,
      onToggleTransferPanel,
      children,
      showContactDisplayPlaceholder,
      brand,
      flipNumbers,
      sourceIcons,
      layout,
      direction,
      addDisabled,
      mergeDisabled,
      hasConference,
      calls,
      lastTo,
      conferencePartiesAvatarUrls,
    } = this.props;
    const timeCounter =
      (
        <div className={styles.timeCounter}>
          {
            startTime
              ? <DurationCounter startTime={startTime} offset={startTimeOffset} />
              : <span aria-hidden="true">&nbsp;</span>
          }
        </div>
      );
    const backHeader = (<BackHeader
      onBackClick={onBackButtonClick}
      backButton={(
        <span className={styles.backButton}>
          <i className={classnames(dynamicsFont.arrow, styles.backIcon)} />
          <span className={styles.backLabel}>{backButtonLabel}</span>
        </span>
      )}
    />);
    const mergeCtrlCom = layout === callCtrlLayout.mergeCtrl
      ? (<MergeInfo
        calls={calls}
        timeCounter={timeCounter}
        lastTo={lastTo}
        currentCall={this.state.currentCall}
        avatar={avatarUrl}
      />)
      : (<CallInfo
        currentLocale={currentLocale}
        nameMatches={nameMatches}
        fallBackName={fallBackName}
        phoneNumber={phoneNumber}
        formatPhone={formatPhone}
        startTime={startTime}
        areaCode={areaCode}
        countryCode={countryCode}
        selectedMatcherIndex={selectedMatcherIndex}
        onSelectMatcherName={onSelectMatcherName}
        avatarUrl={avatarUrl}
        brand={brand}
        showContactDisplayPlaceholder={showContactDisplayPlaceholder}
        sourceIcons={sourceIcons}
      />);
    return (
      <div className={styles.root}>
        {backHeader}
        <Panel className={styles.panel}>
          {layout !== callCtrlLayout.mergeCtrl ? timeCounter : null}
          {
            layout === callCtrlLayout.conferenceCtrl
              ? (
                <ConferenceInfo
                  displayedProfiles={this.state.displayedProfiles}
                  remains={this.state.remains}
                  onClick={() => this.openPartiesModal()}
                />
              )
              : mergeCtrlCom
          }
          <ActiveCallPad
            className={styles.callPad}
            currentLocale={currentLocale}
            isOnMute={isOnMute}
            isOnHold={isOnHold}
            recordStatus={recordStatus}
            onMute={onMute}
            onUnmute={onUnmute}
            onHold={onHold}
            onUnhold={onUnhold}
            onRecord={onRecord}
            onStopRecord={onStopRecord}
            onShowKeyPad={onShowKeyPad}
            onHangup={onHangup}
            onAdd={onAdd}
            onMerge={() => this.onMerge()}
            onShowFlipPanel={onShowFlipPanel}
            onToggleTransferPanel={onToggleTransferPanel}
            flipNumbers={flipNumbers}
            onPark={onPark}
            layout={layout}
            direction={direction}
            addDisabled={addDisabled}
            mergeDisabled={mergeDisabled}
            hasConference={hasConference}
          />
          {children}
          {
            layout === callCtrlLayout.normalCtrl ?
              <ConfirmMergeModal
                currentLocale={currentLocale}
                show={!!this.state.isModalOpen}
                onMerge={() => this.confirmMergeCall()}
                onCancel={() => this.hideConfirmMergeModal()}
                avatarUrls={conferencePartiesAvatarUrls}
              /> :
              null
          }
        </Panel>
      </div>
    );
  }
}

ActiveCallPanel.propTypes = {
  phoneNumber: PropTypes.string,
  nameMatches: PropTypes.array.isRequired,
  fallBackName: PropTypes.string.isRequired,
  currentLocale: PropTypes.string.isRequired,
  startTime: PropTypes.number,
  startTimeOffset: PropTypes.number,
  isOnMute: PropTypes.bool,
  isOnHold: PropTypes.bool,
  recordStatus: PropTypes.string.isRequired,
  onMute: PropTypes.func.isRequired,
  onUnmute: PropTypes.func.isRequired,
  onHold: PropTypes.func.isRequired,
  onUnhold: PropTypes.func.isRequired,
  onRecord: PropTypes.func.isRequired,
  onStopRecord: PropTypes.func.isRequired,
  onAdd: PropTypes.func,
  onMerge: PropTypes.func,
  onHangup: PropTypes.func.isRequired,
  onPark: PropTypes.func.isRequired,
  onBackButtonClick: PropTypes.func.isRequired,
  onShowKeyPad: PropTypes.func.isRequired,
  formatPhone: PropTypes.func.isRequired,
  children: PropTypes.node,
  areaCode: PropTypes.string.isRequired,
  countryCode: PropTypes.string.isRequired,
  selectedMatcherIndex: PropTypes.number.isRequired,
  onSelectMatcherName: PropTypes.func.isRequired,
  avatarUrl: PropTypes.string,
  backButtonLabel: PropTypes.string,
  brand: PropTypes.string,
  showContactDisplayPlaceholder: PropTypes.bool,
  onShowFlipPanel: PropTypes.func,
  flipNumbers: PropTypes.array,
  calls: PropTypes.array.isRequired,
  onToggleTransferPanel: PropTypes.func,
  sourceIcons: PropTypes.object,
  layout: PropTypes.string.isRequired,
  direction: PropTypes.string,
  addDisabled: PropTypes.bool,
  mergeDisabled: PropTypes.bool,
  getPartyProfiles: PropTypes.func,
  hasConference: PropTypes.bool,
  lastTo: PropTypes.object,
  conferencePartiesAvatarUrls: PropTypes.arrayOf(PropTypes.string),
};

ActiveCallPanel.defaultProps = {
  startTime: null,
  startTimeOffset: 0,
  isOnMute: false,
  isOnHold: false,
  phoneNumber: null,
  children: undefined,
  avatarUrl: null,
  backButtonLabel: 'Active Calls',
  brand: 'RingCentral',
  showContactDisplayPlaceholder: true,
  flipNumbers: [],
  onAdd: i => i,
  onMerge: i => i,
  onShowFlipPanel: () => null,
  onToggleTransferPanel: () => null,
  sourceIcons: undefined,
  direction: null,
  addDisabled: false,
  mergeDisabled: false,
  getPartyProfiles: i => i,
  hasConference: false,
  lastTo: null,
  conferencePartiesAvatarUrls: []
};

export default ActiveCallPanel;
