import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import throttle from 'ringcentral-integration/lib/throttle';

import CallInfo from './CallInfo';
import ConferenceInfo from './ConferenceInfo';
import BackHeader from '../BackHeader';
import Panel from '../Panel';
import DurationCounter from '../DurationCounter';
import ActiveCallPad from '../ActiveCallPad';
import dynamicsFont from '../../assets/DynamicsFont/DynamicsFont.scss';
import styles from './styles.scss';

class ActiveCallPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayedProfiles: [],
      remains: 0,
      isPartiesModalOpen: false,
      resizeFunc: throttle(() => this.handleResize(this.props)),
    };
  }

  handleResize(props) {
    const { isOnConference, conferenceData } = props;
    const MAXIMUM_AVATARS = 4;
    // todo: handle width calculation
    if (isOnConference) {
      let profiles;
      // conference is just created and waiting for parties data to return
      if (conferenceData.conference.parties.length === 0) {
        profiles = conferenceData.profiles;
      } else {
        profiles = this.props.getOnlineProfiles(conferenceData.conference.id);
      }
      const displayedProfiles = (profiles.length >= MAXIMUM_AVATARS
        ? profiles.slice(0, MAXIMUM_AVATARS)
        : profiles)
        .map(({ avatarUrl, toUserName, id }) => ({ avatarUrl, toUserName, id }));
      const remains = profiles.length <= MAXIMUM_AVATARS ? 0 : profiles.length - MAXIMUM_AVATARS;
      this.setState(prev => ({
        ...prev,
        displayedProfiles,
        remains
      }));
    }
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
      isOnConference,
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
      onShowFlipPanel,
      onToggleTransferPanel,
      children,
      showContactDisplayPlaceholder,
      brand,
      flipNumbers,
      calls,
      sourceIcons,
      simple,
      mergeDisabled,
      direction,
      gotoConferenceCallDialer,
      mergeToConference,
      addDisabled,
    } = this.props;

    const timeCounter = startTime ?
      (
        <span className={styles.timeCounter}>
          <DurationCounter startTime={startTime} offset={startTimeOffset} />
        </span>
      ) : null;
    const backHeader = (calls.length > 1 || isOnConference) ? (
      <BackHeader
        onBackClick={onBackButtonClick}
        backButton={(
          <span className={styles.backButton}>
            <i className={classnames(dynamicsFont.arrow, styles.backIcon)} />
            <span className={styles.backLabel}>{backButtonLabel}</span>
          </span>
      )}
    />
    ) : <BackHeader className={styles.hidden} />;

    return (
      <div className={styles.root}>
        {backHeader}
        <Panel className={styles.panel}>
          {timeCounter}
          {
          isOnConference
          ? (
            <ConferenceInfo
              displayedProfiles={this.state.displayedProfiles}
              remains={this.state.remains}
              onClick={() => this.openPartiesModal()}
            />
          )
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
          />)
        }
          <ActiveCallPad
            direction={direction}
            simple={simple}
            className={styles.callPad}
            currentLocale={currentLocale}
            isOnMute={isOnMute}
            isOnHold={isOnHold}
            isOnConference={isOnConference}
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
            onShowFlipPanel={onShowFlipPanel}
            onToggleTransferPanel={onToggleTransferPanel}
            flipNumbers={flipNumbers}
            onPark={onPark}
            mergeDisabled={mergeDisabled}
            addDisabled={addDisabled}
            gotoConferenceCallDialer={gotoConferenceCallDialer}
            mergeToConference={mergeToConference}
        />
          {children}
        </Panel>
      </div>
    );
  }
}

ActiveCallPanel.propTypes = {
  getOnlineProfiles: PropTypes.func.isRequired,
  phoneNumber: PropTypes.string,
  nameMatches: PropTypes.array.isRequired,
  fallBackName: PropTypes.string.isRequired,
  currentLocale: PropTypes.string.isRequired,
  startTime: PropTypes.number,
  startTimeOffset: PropTypes.number,
  isOnMute: PropTypes.bool,
  isOnHold: PropTypes.bool,
  isOnConference: PropTypes.bool,
  conferenceData: PropTypes.object,
  recordStatus: PropTypes.string.isRequired,
  onMute: PropTypes.func.isRequired,
  onUnmute: PropTypes.func.isRequired,
  onHold: PropTypes.func.isRequired,
  onUnhold: PropTypes.func.isRequired,
  onRecord: PropTypes.func.isRequired,
  onStopRecord: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
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
  gotoConferenceCallDialer: PropTypes.func,
  direction: PropTypes.string,
  mergeDisabled: PropTypes.bool,
  simple: PropTypes.bool,
  mergeToConference: PropTypes.func,
  addDisabled: PropTypes.bool,
};

ActiveCallPanel.defaultProps = {
  startTime: null,
  startTimeOffset: 0,
  isOnMute: false,
  isOnHold: false,
  isOnConference: false,
  conferenceData: null,
  phoneNumber: null,
  children: undefined,
  avatarUrl: null,
  backButtonLabel: 'Active Calls',
  brand: 'RingCentral',
  showContactDisplayPlaceholder: true,
  flipNumbers: [],
  onShowFlipPanel: () => null,
  onToggleTransferPanel: () => null,
  sourceIcons: undefined,
  gotoConferenceCallDialer: i => i,
  direction: null,
  mergeDisabled: false,
  simple: null,
  mergeToConference: i => i,
  addDisabled: false,
};

export default ActiveCallPanel;
