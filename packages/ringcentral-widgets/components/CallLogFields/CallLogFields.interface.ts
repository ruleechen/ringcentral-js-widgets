import { RcDatePickerSize } from '@ringcentral-integration/rcui';
import { ReactElementLike } from 'prop-types';
import { ReactNode } from 'react';

import { CallLog, Task } from '../CallLogPanel';

export type CallLogFieldsProps = {
  fieldSize?: RcDatePickerSize;
  currentLocale: string;
  currentLog?: CallLog;
  onUpdateCallLog?: (...args: any[]) => any;
  onSaveCallLog?: (...args: any[]) => any;
  customInputDataStruct?: (...args: any[]) => any;
  subjectDropdownsTracker?: (...args: any[]) => any;
  startAdornmentRender?: (...args: any[]) => any;
  referenceFieldOptions: { [key: string]: FieldOption };
};

export interface FieldOption {
  getLabel: (item: any, length: number) => string;
  onChange: (item: any) => any;
  metadata?: FieldMetadata;
  currentOptionFinder: (task: Task) => (item: any) => boolean;
  matchedEntitiesGetter: (currentLog: CallLog) => any;

  otherEntitiesGetter?: (currentLog: CallLog) => any;
  searchOptionFinder?: (option: any, text: string) => boolean;
  rightIconRender?: (item: any) => ReactElementLike;
  shouldDisable?: (task?: Task) => boolean;
  disableReason?: ReactNode | string;
  getValue?: (item: any) => any;
}

export interface FieldMetadata {
  title: string;
  placeholder: string;
  valueField: string;
}
