export interface ReportProps {
  showReport?: boolean;
  onReportLinkClick?(): any;
}

export interface CallingProps {
  showCalling?: boolean;
  onCallingSettingsLinkClick?(): any;
}

export interface AudioProps {
  showAudio?: boolean;
  onAudioSettingsLinkClick?(): any;
}

export interface RegionProps {
  showRegion?: boolean;
  onRegionSettingsLinkClick?(): any;
}

export interface AutoLogCallProps {
  showAutoLog?: boolean;
  autoLogTitle?: string;
  disableAutoLogEnabled?: boolean;
  autoLogEnabled?: boolean;
  onAutoLogChange?(checked: boolean): any;
}

export interface AutoLogNotesProps {
  showAutoLogNotes?: boolean;
  disableAutoLogNotesEnabled?: boolean;
  autoLogNotesEnabled?: boolean;
  onAutoLogNotesChange?(checked: boolean): any;
}

export interface LogSMSContentProps {
  logSMSContentTitle?: string;
  showLogSMSContent?: boolean;
  logSMSContentEnabled?: boolean;
  onLogSMSContentChange?(checked: boolean): any;
}

export interface AutoLogSMSProps {
  autoLogSMSTitle?: string;
  showAutoLogSMS?: boolean;
  autoLogSMSEnabled?: boolean;
  onAutoLogSMSChange?(checked: boolean): any;
}

export interface FeedbackProps {
  showFeedback?: boolean;
  onFeedbackSettingsLinkClick?(): any;
}

export interface QuickAccessLinkProps {
  showQuickAccess?: boolean;
  onQuickAccessLinkClick?(): any;
}

export interface UserGuideProps {
  showUserGuide?: boolean;
  onUserGuideClick?(): any;
}

export interface PresenceStatusSetter {
  setAvailable?: (...args: any[]) => any;
  setBusy?: (...args: any[]) => any;
  setDoNotDisturb?: (...args: any[]) => any;
  setInvisible?: (...args: any[]) => any;
  toggleAcceptCallQueueCalls?: (...args: any[]) => any;
}

export interface EulaRenderer {
  EulaRenderer?: (...args: any[]) => any;
}

export interface onLinkLineItemClick {
  onClick?(): any;
}

export interface onSwitchLineItemChange {
  onChange?(checked: boolean): any;
}
