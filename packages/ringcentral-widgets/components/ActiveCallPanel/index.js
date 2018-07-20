import React from 'react';
import PropTypes from 'prop-types';
import throttle from 'ringcentral-integration/lib/throttle';

import CallInfo from './CallInfo';
import ConferenceInfo from './ConferenceInfo';
import BackButton from '../BackButton';
import BackHeader from '../BackHeader';
import Panel from '../Panel';
import DurationCounter from '../DurationCounter';
import ActiveCallPad from '../ActiveCallPad';
import callCtrlLayouts from '../../enums/callCtrlLayouts';
import styles from './styles.scss';
import MergeInfo from './MergeInfo';

class ActiveCallPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayedProfiles: [],
      remains: 0,
    };

    this.throttleResize = throttle(() => this.handleResize(this.props));
  }

  handleResize(props) {
    const MAXIMUM_AVATARS = 4;
    // todo: handle width calculation
    if (props.layout === callCtrlLayouts.conferenceCtrl) {
      // conference is just created and waiting for parties data to return
      const profiles = this.props.getPartyProfiles();
      if (profiles) {
        const displayedProfiles = (profiles.length >= MAXIMUM_AVATARS
          ? profiles.slice(0, MAXIMUM_AVATARS)
          : profiles)
          .map(({ avatarUrl, toUserName, id }) => ({ avatarUrl, toUserName, id }));
        const remains = profiles.length <= MAXIMUM_AVATARS ? 0 : profiles.length - MAXIMUM_AVATARS;
        this.setState({
          displayedProfiles,
          remains,
        });
      }
    }
  }

  componentDidMount() {
    this.handleResize(this.props);
    window.addEventListener('resize', this.throttleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.throttleResize);
  }

  componentWillReceiveProps(nextProps) {
    this.handleResize(nextProps);
  }

  render() {
    const {
      showBackButton,
      backButtonLabel,
      onBackButtonClick,
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
      onMerge,
      onShowFlipPanel,
      onToggleTransferPanel,
      onOpenPartiesModal,
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
      lastTo,
    } = this.props;

    const currentCall = {
      avatarUrl,
      nameMatches,
      fallBackName,
      phoneNumber
    };

    const backHeader = showBackButton ? (
      <BackHeader
        onBackClick={onBackButtonClick}
        backButton={<BackButton label={backButtonLabel} />}
      />
    ) : null;

    const timeCounter = (
      <div className={styles.timeCounter}>
        {
          startTime
            ? <DurationCounter startTime={startTime} offset={startTimeOffset} />
            : <span aria-hidden="true">&nbsp;</span>
        }
      </div>
    );

    let callInfo;

    switch (layout) {
      case callCtrlLayouts.mergeCtrl:
        callInfo = (<MergeInfo
          timeCounter={timeCounter}
          lastTo={lastTo}
          currentCall={currentCall}
          currentLocale={currentLocale}
        />);
        break;

      case callCtrlLayouts.conferenceCtrl:
        callInfo = (<ConferenceInfo
          currentLocale={currentLocale}
          displayedProfiles={this.state.displayedProfiles}
          remains={this.state.remains}
          onClick={onOpenPartiesModal}
        />);
        break;

      default:
        callInfo = (<CallInfo
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
        break;
    }
    return (
      <div className={styles.root}>
        {backHeader}
        <Panel className={styles.panel}>
          {layout !== callCtrlLayouts.mergeCtrl ? timeCounter : null}
          {callInfo}
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
            onMerge={onMerge}
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
  showBackButton: PropTypes.bool,
  backButtonLabel: PropTypes.string,
  onBackButtonClick: PropTypes.func,
  onShowKeyPad: PropTypes.func.isRequired,
  formatPhone: PropTypes.func.isRequired,
  children: PropTypes.node,
  areaCode: PropTypes.string.isRequired,
  countryCode: PropTypes.string.isRequired,
  selectedMatcherIndex: PropTypes.number.isRequired,
  onSelectMatcherName: PropTypes.func.isRequired,
  avatarUrl: PropTypes.string,
  brand: PropTypes.string,
  showContactDisplayPlaceholder: PropTypes.bool,
  onShowFlipPanel: PropTypes.func,
  flipNumbers: PropTypes.array,
  onToggleTransferPanel: PropTypes.func,
  onOpenPartiesModal: PropTypes.func,
  sourceIcons: PropTypes.object,
  layout: PropTypes.string.isRequired,
  direction: PropTypes.string,
  addDisabled: PropTypes.bool,
  mergeDisabled: PropTypes.bool,
  getPartyProfiles: PropTypes.func,
  hasConference: PropTypes.bool,
  lastTo: PropTypes.object,
};

ActiveCallPanel.defaultProps = {
  startTime: null,
  startTimeOffset: 0,
  isOnMute: false,
  isOnHold: false,
  phoneNumber: null,
  children: undefined,
  avatarUrl: null,
  showBackButton: false,
  backButtonLabel: 'Active Calls',
  onBackButtonClick: null,
  brand: 'RingCentral',
  showContactDisplayPlaceholder: true,
  flipNumbers: [],
  onAdd: undefined,
  onMerge: undefined,
  onShowFlipPanel: () => null,
  onToggleTransferPanel: () => null,
  onOpenPartiesModal: () => null,
  sourceIcons: undefined,
  direction: null,
  addDisabled: false,
  mergeDisabled: false,
  getPartyProfiles: i => i,
  hasConference: false,
  lastTo: null,
};

export default ActiveCallPanel;
