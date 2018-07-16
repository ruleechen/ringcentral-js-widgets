import React, { Component } from 'react';
import PropTypes from 'prop-types';

import callCtrlLayouts from '../../enums/callCtrlLayouts';
import ActiveCallDialPad from '../ActiveCallDialPad';
import ActiveCallPanel from '../ActiveCallPanel';
import FlipPanel from '../FlipPanel';
import TransferPanel from '../TransferPanel';
import ConfirmMergeModal from '../ConfirmMergeModal';
import SpinnerOverlay from '../SpinnerOverlay';

class CallCtrlPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowKeyPad: false,
      isShowFlipPanel: false,
      isShowMergeConfirm: false,
    };

    this.hiddenKeyPad = () => {
      this.setState({
        isShowKeyPad: false,
      });
    };

    this.showKeyPad = () => {
      this.setState({
        isShowKeyPad: true,
      });
    };

    this.showFlipPanel = () => {
      this.setState({
        isShowFlipPanel: true,
      });
    };

    this.hideFlipPanel = () => {
      this.setState({
        isShowFlipPanel: false,
      });
    };

    this.toggleTransferPanel = () => {
      this.setState(prevState => ({
        isShowTransferPanel: !prevState.isShowTransferPanel
      }));
    };

    this.onMerge = () => {
      if (
        this.props.hasConference &&
        this.props.layout === callCtrlLayouts.normalCtrl
      ) {
        this.showMergeConfirm();
      } else if (this.props.onMerge) {
        this.props.onMerge();
      }
    };

    this.showMergeConfirm = () => {
      this.setState({
        isShowMergeConfirm: true,
      });
    };

    this.hideMergeConfirm = () => {
      this.setState({
        isShowMergeConfirm: false,
      });
    };

    this.confirmMerge = () => {
      this.hideMergeConfirm();
      if (this.props.onMerge) {
        this.props.onMerge();
      }
    };

    this.onOpenPartiesModal = () => {
      // TODO:
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.hasConference && this.state.isShowMergeConfirm) {
      this.hideMergeConfirm();
    }
  }

  render() {
    if (this.state.isShowKeyPad) {
      return (
        <ActiveCallDialPad
          onChange={this.props.onKeyPadChange}
          hiddenDialPad={this.hiddenKeyPad}
          onHangup={this.props.onHangup}
          currentLocale={this.props.currentLocale}
        />
      );
    }
    if (this.state.isShowFlipPanel) {
      return (
        <FlipPanel
          isOnFlip={this.props.isOnFlip}
          flipNumbers={this.props.flipNumbers}
          currentLocale={this.props.currentLocale}
          formatPhone={this.props.formatPhone}
          hideFlipPanel={this.hideFlipPanel}
          onFlip={this.props.onFlip}
          complete={this.props.onHangup}
        />
      );
    }
    if (this.state.isShowTransferPanel) {
      return (
        <TransferPanel
          onTransfer={this.props.onTransfer}
          currentLocale={this.props.currentLocale}
          toggleTransferPanel={this.toggleTransferPanel}
          isOnTransfer={this.props.isOnTransfer}
          searchContactList={this.props.searchContactList}
          searchContact={this.props.searchContact}
          formatPhone={this.props.formatPhone}
          phoneTypeRenderer={this.props.phoneTypeRenderer}
          recipientsContactInfoRenderer={this.props.recipientsContactInfoRenderer}
          recipientsContactPhoneRenderer={this.props.recipientsContactPhoneRenderer}
        />
      );
    }
    return (
      <ActiveCallPanel
        getAvatarUrl={this.props.getAvatarUrl}
        backButtonLabel={this.props.backButtonLabel}
        currentLocale={this.props.currentLocale}
        formatPhone={this.props.formatPhone}
        phoneNumber={this.props.phoneNumber}
        sessionId={this.props.sessionId}
        callStatus={this.props.callStatus}
        startTime={this.props.startTime}
        isOnMute={this.props.isOnMute}
        isOnHold={this.props.isOnHold}
        recordStatus={this.props.recordStatus}
        onBackButtonClick={this.props.onBackButtonClick}
        onMute={this.props.onMute}
        onUnmute={this.props.onUnmute}
        onHold={this.props.onHold}
        onUnhold={this.props.onUnhold}
        onRecord={this.props.onRecord}
        onStopRecord={this.props.onStopRecord}
        onShowKeyPad={this.showKeyPad}
        onHangup={this.props.onHangup}
        onPark={this.props.onPark}
        onAdd={this.props.onAdd}
        onMerge={this.onMerge}
        nameMatches={this.props.nameMatches}
        fallBackName={this.props.fallBackName}
        areaCode={this.props.areaCode}
        countryCode={this.props.countryCode}
        selectedMatcherIndex={this.props.selectedMatcherIndex}
        onSelectMatcherName={this.props.onSelectMatcherName}
        avatarUrl={this.props.avatarUrl}
        brand={this.props.brand}
        showContactDisplayPlaceholder={this.props.showContactDisplayPlaceholder}
        onShowFlipPanel={this.showFlipPanel}
        onToggleTransferPanel={this.toggleTransferPanel}
        onOpenPartiesModal={this.onOpenPartiesModal}
        flipNumbers={this.props.flipNumbers}
        calls={this.props.calls}
        sourceIcons={this.props.sourceIcons}
        layout={this.props.layout}
        direction={this.props.direction}
        addDisabled={this.props.addDisabled}
        mergeDisabled={this.props.mergeDisabled}
        hasConference={this.props.hasConference}
        getPartyProfiles={this.props.getPartyProfiles}
        lastTo={this.props.lastTo}
      >
        {this.props.children}
        {this.props.showSpinner ? <SpinnerOverlay /> : null}
        {this.props.layout === callCtrlLayouts.normalCtrl
          ? <ConfirmMergeModal
            currentLocale={this.props.currentLocale}
            show={this.state.isShowMergeConfirm}
            onMerge={this.confirmMerge}
            onCancel={this.hideMergeConfirm}
            avatarUrls={this.props.conferencePartiesAvatarUrls}
          />
          : null
        }
      </ActiveCallPanel>
    );
  }
}

CallCtrlPanel.propTypes = {
  callStatus: PropTypes.string,
  sessionId: PropTypes.string,
  phoneNumber: PropTypes.string,
  nameMatches: PropTypes.array.isRequired,
  fallBackName: PropTypes.string.isRequired,
  currentLocale: PropTypes.string.isRequired,
  startTime: PropTypes.number,
  isOnMute: PropTypes.bool,
  isOnHold: PropTypes.bool,
  isOnFlip: PropTypes.bool,
  isOnTransfer: PropTypes.bool,
  flipNumbers: PropTypes.array,
  calls: PropTypes.array.isRequired,
  recordStatus: PropTypes.string.isRequired,
  onMute: PropTypes.func.isRequired,
  onUnmute: PropTypes.func.isRequired,
  onHold: PropTypes.func.isRequired,
  onUnhold: PropTypes.func.isRequired,
  onRecord: PropTypes.func.isRequired,
  onStopRecord: PropTypes.func.isRequired,
  onAdd: PropTypes.func,
  onMerge: PropTypes.func,
  onPark: PropTypes.func.isRequired,
  onHangup: PropTypes.func.isRequired,
  onFlip: PropTypes.func.isRequired,
  onTransfer: PropTypes.func.isRequired,
  onBackButtonClick: PropTypes.func.isRequired,
  onKeyPadChange: PropTypes.func.isRequired,
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
  sourceIcons: PropTypes.object,
  searchContactList: PropTypes.array.isRequired,
  searchContact: PropTypes.func.isRequired,
  phoneTypeRenderer: PropTypes.func,
  recipientsContactInfoRenderer: PropTypes.func,
  recipientsContactPhoneRenderer: PropTypes.func,
  getAvatarUrl: PropTypes.func,
  layout: PropTypes.string.isRequired,
  showSpinner: PropTypes.bool,
  direction: PropTypes.string,
  addDisabled: PropTypes.bool,
  mergeDisabled: PropTypes.bool,
  hasConference: PropTypes.bool,
  lastTo: PropTypes.object,
  getPartyProfiles: PropTypes.func,
  conferencePartiesAvatarUrls: PropTypes.arrayOf(PropTypes.string),
};

CallCtrlPanel.defaultProps = {
  getAvatarUrl: null,
  startTime: null,
  isOnMute: false,
  isOnHold: false,
  isOnTransfer: false,
  isOnFlip: false,
  flipNumbers: [],
  phoneNumber: null,
  children: undefined,
  avatarUrl: null,
  backButtonLabel: 'Active Calls',
  sessionId: undefined,
  callStatus: null,
  brand: 'RingCentral',
  showContactDisplayPlaceholder: true,
  sourceIcons: undefined,
  phoneTypeRenderer: undefined,
  recipientsContactInfoRenderer: undefined,
  recipientsContactPhoneRenderer: undefined,
  onAdd: undefined,
  onMerge: undefined,
  showSpinner: false,
  direction: null,
  addDisabled: false,
  mergeDisabled: false,
  hasConference: false,
  lastTo: null,
  getPartyProfiles: i => i,
  conferencePartiesAvatarUrls: []
};

export default CallCtrlPanel;
