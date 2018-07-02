import { find } from 'ramda';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import formatNumber from 'ringcentral-integration/lib/formatNumber';
import callDirections from 'ringcentral-integration/enums/callDirections';
import callingModes from 'ringcentral-integration/modules/CallingSettings/callingModes';
import withPhone from '../../lib/withPhone';
import callCtrlLayout from '../../lib/callCtrlLayout';
import CallCtrlPanel from '../../components/CallCtrlPanel';

import i18n from './i18n';

class CallCtrlPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedMatcherIndex: 0,
      avatarUrl: null,
    };

    this.onSelectMatcherName = (option) => {
      const nameMatches = this.props.nameMatches || [];
      let selectedMatcherIndex = nameMatches.findIndex(
        match => match.id === option.id
      );
      if (selectedMatcherIndex < 0) {
        selectedMatcherIndex = 0;
      }
      this.setState({
        selectedMatcherIndex,
        avatarUrl: null,
      });
      const contact = nameMatches[selectedMatcherIndex];
      if (contact) {
        this.props.updateSessionMatchedContact(this.props.session.id, contact);
        this.props.getAvatarUrl(contact).then((avatarUrl) => {
          this.setState({ avatarUrl });
        });
      }
    };

    this.onMute = () =>
      this.props.onMute(this.props.session.id);
    this.onUnmute = () =>
      this.props.onUnmute(this.props.session.id);
    this.onHold = () =>
      this.props.onHold(this.props.session.id);
    this.onUnhold = () =>
      this.props.onUnhold(this.props.session.id);
    this.onRecord = () =>
      this.props.onRecord(this.props.session.id);
    this.onStopRecord = () =>
      this.props.onStopRecord(this.props.session.id);
    this.onHangup = () =>
      this.props.onHangup(this.props.session.id);
    this.onKeyPadChange = value =>
      this.props.sendDTMF(value, this.props.session.id);
    this.onFlip = value =>
      this.props.onFlip(value, this.props.session.id);
    this.onTransfer = value =>
      this.props.onTransfer(value, this.props.session.id);
    this.onPark = () =>
      this.props.onPark(this.props.session.id);
    this.onAdd = () =>
      this.props.onAdd(this.props.session.id);
    this.onMerge = () =>
      this.props.onMerge(this.props.session.id);
  }

  componentDidMount() {
    this._mounted = true;
    this._updateAvatarAndMatchIndex(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.layout === callCtrlLayout.mergeCtrl &&
      nextProps.session.direction === callDirections.inbound
    ) {
      nextProps.gotoNormalCallCtrl();
    }
    if (this.props.session.id !== nextProps.session.id) {
      this._updateAvatarAndMatchIndex(nextProps);
    }
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  _updateAvatarAndMatchIndex(props) {
    let contact = props.session.contactMatch;
    let selectedMatcherIndex = 0;
    if (!contact) {
      contact = props.nameMatches && props.nameMatches[0];
    } else {
      selectedMatcherIndex = props.nameMatches.findIndex(match =>
        match.id === contact.id
      );
    }
    this.setState({
      selectedMatcherIndex,
      avatarUrl: null,
    });
    if (contact) {
      props.getAvatarUrl(contact).then((avatarUrl) => {
        if (!this._mounted) {
          return;
        }
        this.setState({ avatarUrl });
      });
    }
  }

  render() {
    const {
      session,
      layout,
      showSpinner,
      addDisabled,
      mergeDisabled,
      getPartyProfiles,
    } = this.props;
    if (!session.id) {
      return null;
    }
    const phoneNumber = session.direction === callDirections.outbound ?
      session.to : session.from;
    let fallbackUserName;
    if (session.direction === callDirections.inbound && session.from === 'anonymous') {
      fallbackUserName = i18n.getString('anonymous', this.props.currentLocale);
    }
    if (!fallbackUserName) {
      fallbackUserName = i18n.getString('unknown', this.props.currentLocale);
    }

    const backButtonLabel = this.props.backButtonLabel
      ? this.props.backButtonLabel
      : i18n.getString('activeCalls', this.props.currentLocale);

    return (
      <CallCtrlPanel
        backButtonLabel={backButtonLabel}
        currentLocale={this.props.currentLocale}
        formatPhone={this.props.formatPhone}
        phoneNumber={phoneNumber}
        sessionId={session.id}
        callStatus={session.callStatus}
        startTime={session.startTime}
        isOnMute={session.isOnMute}
        isOnHold={session.isOnHold}
        isOnFlip={session.isOnFlip}
        isOnTransfer={session.isOnTransfer}
        recordStatus={session.recordStatus}
        onBackButtonClick={this.props.onBackButtonClick}
        onMute={this.onMute}
        onUnmute={this.onUnmute}
        onHold={this.onHold}
        onUnhold={this.onUnhold}
        onRecord={this.onRecord}
        onStopRecord={this.onStopRecord}
        onKeyPadChange={this.onKeyPadChange}
        onHangup={this.onHangup}
        onAdd={this.onAdd}
        onMerge={this.onMerge}
        onFlip={this.onFlip}
        onTransfer={this.onTransfer}
        onPark={this.onPark}
        nameMatches={this.props.nameMatches}
        fallBackName={fallbackUserName}
        areaCode={this.props.areaCode}
        countryCode={this.props.countryCode}
        selectedMatcherIndex={this.state.selectedMatcherIndex}
        onSelectMatcherName={this.onSelectMatcherName}
        avatarUrl={this.state.avatarUrl}
        brand={this.props.brand}
        showContactDisplayPlaceholder={this.props.showContactDisplayPlaceholder}
        flipNumbers={this.props.flipNumbers}
        calls={this.props.calls}
        sourceIcons={this.props.sourceIcons}
        searchContactList={this.props.searchContactList}
        searchContact={this.props.searchContact}
        phoneTypeRenderer={this.props.phoneTypeRenderer}
        recipientsContactInfoRenderer={this.props.recipientsContactInfoRenderer}
        recipientsContactPhoneRenderer={this.props.recipientsContactPhoneRenderer}
        layout={layout}
        showSpinner={showSpinner}
        direction={session.direction}
        addDisabled={addDisabled}
        mergeDisabled={mergeDisabled}
        getPartyProfiles={getPartyProfiles}
      >
        {this.props.children}
      </CallCtrlPanel>
    );
  }
}

CallCtrlPage.propTypes = {
  session: PropTypes.shape({
    id: PropTypes.string,
    direction: PropTypes.string,
    startTime: PropTypes.number,
    isOnMute: PropTypes.bool,
    isOnHold: PropTypes.bool,
    isOnFlip: PropTypes.bool,
    isOnTransfer: PropTypes.bool,
    recordStatus: PropTypes.string,
    to: PropTypes.string,
    from: PropTypes.string,
    contactMatch: PropTypes.object,
  }).isRequired,
  currentLocale: PropTypes.string.isRequired,
  onMute: PropTypes.func.isRequired,
  onUnmute: PropTypes.func.isRequired,
  onHold: PropTypes.func.isRequired,
  onUnhold: PropTypes.func.isRequired,
  onRecord: PropTypes.func.isRequired,
  onStopRecord: PropTypes.func.isRequired,
  onHangup: PropTypes.func.isRequired,
  sendDTMF: PropTypes.func.isRequired,
  formatPhone: PropTypes.func.isRequired,
  onAdd: PropTypes.func,
  onMerge: PropTypes.func,
  onFlip: PropTypes.func.isRequired,
  onPark: PropTypes.func.isRequired,
  onTransfer: PropTypes.func.isRequired,
  children: PropTypes.node,
  nameMatches: PropTypes.array.isRequired,
  areaCode: PropTypes.string.isRequired,
  countryCode: PropTypes.string.isRequired,
  getAvatarUrl: PropTypes.func.isRequired,
  onBackButtonClick: PropTypes.func.isRequired,
  updateSessionMatchedContact: PropTypes.func.isRequired,
  backButtonLabel: PropTypes.string,
  brand: PropTypes.string.isRequired,
  showContactDisplayPlaceholder: PropTypes.bool.isRequired,
  flipNumbers: PropTypes.array.isRequired,
  calls: PropTypes.array.isRequired,
  sourceIcons: PropTypes.object,
  searchContactList: PropTypes.array.isRequired,
  searchContact: PropTypes.func.isRequired,
  phoneTypeRenderer: PropTypes.func,
  recipientsContactInfoRenderer: PropTypes.func,
  recipientsContactPhoneRenderer: PropTypes.func,
  layout: PropTypes.string.isRequired,
  showSpinner: PropTypes.bool,
  addDisabled: PropTypes.bool,
  mergeDisabled: PropTypes.bool,
  getPartyProfiles: PropTypes.func,
  gotoNormalCallCtrl: PropTypes.func,
};

CallCtrlPage.defaultProps = {
  children: undefined,
  backButtonLabel: null,
  sourceIcons: undefined,
  phoneTypeRenderer: undefined,
  recipientsContactInfoRenderer: undefined,
  recipientsContactPhoneRenderer: undefined,
  onAdd: i => i,
  onMerge: i => i,
  showSpinner: false,
  addDisabled: false,
  mergeDisabled: false,
  getPartyProfiles: i => i,
  gotoNormalCallCtrl: i => i,
};

function mapToProps(_, {
  phone: {
    webphone,
    locale,
    contactMatcher,
    regionSettings,
    brand,
    forwardingNumber,
    callMonitor,
    contactSearch,
    conferenceCall,
    callingSettings,
  },
  layout = callCtrlLayout.normalCtrl,
}) {
  const currentSession = webphone.activeSession || {};
  const contactMapping = contactMatcher && contactMatcher.dataMapping;
  const fromMatches = (contactMapping && contactMapping[currentSession.from]) || [];
  const toMatches = (contactMapping && contactMapping[currentSession.to]) || [];
  const nameMatches =
    currentSession.direction === callDirections.outbound ? toMatches : fromMatches;
  const isOnConference = conferenceCall.isConferenceSession(currentSession.id);

  const conferenceData = Object.values(conferenceCall.conferences)[0];

  /**
   * button disabled criteria
   */
  const isWebRTC = callingSettings.callingMode === callingModes.webphone;
  let mergeDisabled = !(currentSession.data && Object.keys(currentSession.data).length)
  || !isWebRTC;
  let addDisabled = !isWebRTC;

  if (conferenceData && isWebRTC) {
    const newVal = conferenceCall.isOverload(conferenceData.conference.id)
    // in case webphone.activeSession has not been updated yet
    || !(currentSession.data && Object.keys(currentSession.data).length);
    // update
    mergeDisabled = newVal || !(currentSession.data && Object.keys(currentSession.data).length);
    addDisabled = newVal;
  }

  const isMerging = (
    Object
      .values(conferenceCall.state.mergingPair)
      .map(session => session.id)
      .find(id => id === currentSession.id)
    || (isOnConference)
  )
    && conferenceCall.isMerging;
  if (isOnConference) {
    layout = callCtrlLayout.conferenceCtrl;
  } else if (
    (
      layout === callCtrlLayout.mergeCtrl
      && !conferenceCall.state.mergingPair.from
    ) // means is about to merge to a conference
    && !Object.keys(conferenceCall.conferences).length // and the conference has been closed
  ) {
    layout = callCtrlLayout.normalCtrl;// then change to normal call control
  }

  return {
    brand: brand.fullName,
    nameMatches,
    currentLocale: locale.currentLocale,
    session: currentSession,
    areaCode: regionSettings.areaCode,
    countryCode: regionSettings.countryCode,
    flipNumbers: forwardingNumber.flipNumbers,
    calls: callMonitor.calls,
    searchContactList: contactSearch.sortedResult,
    layout,
    showSpinner: isMerging,
    addDisabled,
    mergeDisabled,
  };
}

function mapToFunctions(_, {
  phone: {
    webphone,
    regionSettings,
    contactSearch,
    conferenceCall,
    routerInteraction,
  },
  getAvatarUrl,
  onBackButtonClick,
  phoneTypeRenderer,
  recipientsContactInfoRenderer,
  recipientsContactPhoneRenderer,
}) {
  return {
    formatPhone: phoneNumber => formatNumber({
      phoneNumber,
      areaCode: regionSettings.areaCode,
      countryCode: regionSettings.countryCode,
    }),
    onHangup: sessionId => webphone.hangup(sessionId),
    onMute: sessionId => webphone.mute(sessionId),
    onUnmute: sessionId => webphone.unmute(sessionId),
    onHold: sessionId => webphone.hold(sessionId),
    onUnhold: sessionId => webphone.unhold(sessionId),
    onRecord: sessionId => webphone.startRecord(sessionId),
    onStopRecord: sessionId => webphone.stopRecord(sessionId),
    sendDTMF: (value, sessionId) => webphone.sendDTMF(value, sessionId),
    updateSessionMatchedContact: (sessionId, contact) =>
      webphone.updateSessionMatchedContact(sessionId, contact),
    getAvatarUrl,
    onBackButtonClick,
    onFlip: (flipNumber, sessionId) => webphone.flip(flipNumber, sessionId),
    onTransfer: (transferNumber, sessionId) => webphone.transfer(transferNumber, sessionId),
    onPark: sessionId => webphone.park(sessionId),
    searchContact: searchString => (
      contactSearch.debouncedSearch({ searchString })
    ),
    phoneTypeRenderer,
    recipientsContactInfoRenderer,
    recipientsContactPhoneRenderer,
    onAdd(sessionId) {
      const isConferenceCallSession = conferenceCall.isConferenceSession(sessionId);
      if (!isConferenceCallSession) {
        const session = webphone._sessions.get(sessionId);
        conferenceCall.setMergeParty({ from: session });
      }
      const sessionData = find(x => x.id === sessionId, webphone.sessions);
      if (sessionData) {
        routerInteraction.push(`/conferenceCall/dialer/${sessionData.from}`);
      }
    },
    gotoNormalCallCtrl: () => routerInteraction.push('/calls/active'),
    getPartyProfiles() {
      const conferenceData = Object.values(conferenceCall.conferences)[0];
      if (conferenceData) {
        if (conferenceData.conference.parties.length === 0) {
          return conferenceData.profiles;
        }
        return conferenceCall.getOnlinePartyProfiles(conferenceData.conference.id);
      }
      return null;
    },
  };
}

const CallCtrlContainer = withPhone(connect(
  mapToProps,
  mapToFunctions,
)(CallCtrlPage));

CallCtrlContainer.propTypes = {
  getAvatarUrl: PropTypes.func,
  onBackButtonClick: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  backButtonLabel: PropTypes.string,
  children: PropTypes.node,
  showContactDisplayPlaceholder: PropTypes.bool,
  sourceIcons: PropTypes.object,
};

CallCtrlContainer.defaultProps = {
  getAvatarUrl: () => null,
  showContactDisplayPlaceholder: false,
  children: undefined,
  sourceIcons: undefined,
};

export {
  mapToProps,
  mapToFunctions,
  CallCtrlPage,
  CallCtrlContainer as default,
};
