import {
  RcList,
  RcListItem,
  RcListItemText,
  RcTextField,
} from '@ringcentral-integration/rcui';
import React, { Component } from 'react';

import { bindDebonce } from '../../lib/bindDebonce';
import { bindNextPropsUpdate } from '../../lib/bindNextPropsUpdate';
import { CustomArrowButton } from '../Rcui/CustomArrowButton';
import styles from './styles.scss';

type InputSelectProps = {
  required?: boolean;
  subjectPicklist?: any[];
  subject?: string;
  onChange?: (...args: any[]) => any;
  onSave?: (...args: any[]) => any;
  timeout?: number;
  onSelectOption?: (...args: any[]) => any;
};
type InputSelectState = {
  subject: any;
  expand: boolean;
};
export default class InputSelect extends Component<
  InputSelectProps,
  InputSelectState
> {
  static defaultProps: Partial<InputSelectProps> = {
    required: false,
    subjectPicklist: [],
    subject: null,
    onChange: undefined,
    onSave: undefined,
    timeout: 500,
    onSelectOption: undefined,
  };

  checkPropsUpdate = bindNextPropsUpdate(this);
  debonce = bindDebonce(this, this.props.timeout);

  wrapper: HTMLDivElement;
  constructor(props) {
    super(props);
    this.state = {
      subject: this.props.subject,
      expand: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.checkPropsUpdate(nextProps, 'subject');
  }

  componentWillUnmount() {
    window.removeEventListener('click', this._handleDocumentClick, false);
  }

  _renderPickList = () => {
    const { subjectPicklist } = this.props;
    const { expand } = this.state;
    if (!expand) {
      return null;
    }
    return (
      <div className={styles.select}>
        <RcList>
          {subjectPicklist.map((option, i) => (
            <RcListItem
              key={i}
              button
              singleLine
              onClick={() => this.onSelectChange(option)}
              data-sign={`match${i}`}
            >
              <RcListItemText
                primary={option}
                classes={{
                  primary: styles.listText,
                }}
              />
            </RcListItem>
          ))}
        </RcList>
      </div>
    );
  };

  render() {
    const { subjectPicklist, required } = this.props;
    const { subject = '' } = this.state;
    const hasError = required && subject.trim() === '';
    return (
      <div
        className={styles.root}
        ref={(ref) => {
          this.wrapper = ref;
        }}
      >
        <RcTextField
          label="Subject"
          data-sign="subject"
          fullWidth
          required={required}
          value={subject}
          error={hasError}
          inputProps={{
            maxLength: 255,
          }}
          onChange={(e) => this.updateValue(e.target.value, 500)}
          endAdornment={(disabled) =>
            subjectPicklist.length > 0 && (
              <CustomArrowButton
                icon="arrow_down"
                disabled={disabled}
                onClick={this.toggleDropDownList}
              />
            )
          }
        />
        {this._renderPickList()}
      </div>
    );
  }

  updateValue(subject, time) {
    this.setState({ subject }, () => {
      this.debonce(() => {
        this.props.onChange(this.state.subject).then(() => {
          this.debonce(() => this.props.onSave(), this.props.timeout - time);
        });
      }, time);
    });
  }

  onSelectChange = (subject) => {
    this.setState({ subject }, () => {
      this.debonce(() => {
        if (this.props.onSelectOption) {
          this.props.onSelectOption();
        }
        this.props.onChange(this.state.subject).then(() => this.props.onSave());
      }, 0);
    });
    this.toggleDropDownList();
  };

  toggleDropDownList = () => {
    const { expand } = this.state;
    if (!expand) {
      window.addEventListener('click', this._handleDocumentClick, false);
    } else {
      window.removeEventListener('click', this._handleDocumentClick, false);
    }
    this.setState({ expand: !expand });
  };

  _handleDocumentClick = (e) => {
    if (this.wrapper && this.wrapper.contains(e.target)) {
      return;
    }
    this.toggleDropDownList();
  };
}
