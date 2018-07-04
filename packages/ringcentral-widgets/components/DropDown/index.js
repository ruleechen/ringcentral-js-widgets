import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { isFunction } from 'ringcentral-integration/lib/di/utils/is_type';
import Enum from 'ringcentral-integration/lib/Enum';

import styles from './styles.scss';

const POSITION = new Enum([
  'top',
  'left',
]);

const transitionEnd = () => {
  const el = document.createElement('bootstrap');

  const transEndEventNames = {
    WebkitTransition: 'webkitTransitionEnd',
    MozTransition: 'transitionend',
    OTransition: 'oTransitionEnd otransitionend',
    transition: 'transitionend'
  };

  for (const name in transEndEventNames) {
    if (el.style[name] !== undefined) {
      return { end: transEndEventNames[name] };
    }
  }
};

const getOffset = (el) => {
  if (!el) {
    return null;
  }
  const rect = el.getBoundingClientRect();
  const scollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  return {
    top: rect.top + scrollTop,
    left: rect.left + scollLeft,
  };
};

class DropDown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      size: {
        height: 0,
        width: 0,
      },
      visibility: null,
      position: null,
      parent: null,
      transitionEndEvtName: transitionEnd(),
      onResize: () => this.checkPosition(),
      onTransitionEnd: () => (!this.props.open ? this.setNotVisible() : null),
    };

    this.dom = React.createRef();
  }

  setVisibility(props = this.props) {
    this.setState(preState => ({
      ...preState,
      visibility: props.open ? 'initial' : 'hidden',
    }));
  }


  setVisible() {
    this.setState(preState => ({
      ...preState,
      visibility: 'initial',
    }));
  }

  setNotVisible() {
    this.setState(preState => ({
      ...preState,
      visibility: 'hidden',
    }));
  }

  checkPosition(props = this.props) {
    const { dom: { current } } = this;
    const documentElement = document.documentElement;
    const parentElement = current.parentElement;
    const parentComputedStyle = window.getComputedStyle(parentElement);

    let originalCSSPosition;
    let position;

    if (props.fixed) {
      originalCSSPosition = window.getComputedStyle(documentElement).position;
      position = getOffset(current);
    } else {
      originalCSSPosition = parentElement && parentElement.nodeType === 1
        ? parentComputedStyle.position
        : '';
      position = current ? current.getBoundingClientRect() : null;
    }

    const top = props.direction === POSITION.top
      ? position && position.top
      : position && (position.top + parentElement.offsetHeight + current.offsetHeight);
    const left = position && (position.left + parentComputedStyle.width / 2);

    this.setState(preState => ({
      ...preState,
      position: {
        left,
        top,
      },
      parent: {
        element: parentElement,
        originalCSSPosition,
      },
    }));
  }

  componentDidMount() {
    this.checkPosition();
    this.setVisibility();
    window.addEventListener('resize', this.state.onResize);
    if (this.state.transitionEndEvtName) {
      this.dom.current.addEventListener(this.state.transitionEndEvtName,
        this.state.onTransitionEnd);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.children !== this.props.children) {
      this.checkPosition(nextProps);
    }
    if (nextProps.open !== this.props.open) {
      if (nextProps.open) {
        this.setVisible(nextProps);
      }
      if (nextProps.open) {
        // eslint-disable-next-line no-unused-expressions
        isFunction(this.props.beforeOpen) && this.props.beforeOpen();
      } else {
        // eslint-disable-next-line no-unused-expressions
        isFunction(this.props.beforeClose) && this.props.beforeClose();
      }
    }
  }

  componentDidUpdate() {
    if (this.props.open) {
      // eslint-disable-next-line no-unused-expressions
      isFunction(this.props.onOpen) && this.props.onOpen();
    } else {
      // eslint-disable-next-line no-unused-expressions
      isFunction(this.props.onClose) && this.props.onClose();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.state.onResize);
    if (this.state.transitionEndEvtName) {
      this.dom.current.removeEventListener(this.state.transitionEndEvtName,
        this.state.onTransitionEnd);
    }
  }

  render() {
    const {
      open, direction, fixed, children
    } = this.props;
    return (
      <div
        ref={this.dom}
        className={classnames(
          styles.dropdownContainer,
          open
          ? styles.opened
          : null,
          styles[direction]
        )}
        style={{
          position: fixed ? 'fixed' : 'absolute',
          ...this.state.position,
        }}
      >
        <div className="dropdown" id="dropdown">
          {children}
          <div className={styles.tail} />
        </div>
      </div>
    );
  }
}

DropDown.propTypes = {
  fixed: PropTypes.bool,
  direction: PropTypes.string,
  open: PropTypes.bool,
  onOpen: PropTypes.func,
  beforeOpen: PropTypes.func,
  beforeClose: PropTypes.func,
  onClose: PropTypes.func,
  children: PropTypes.node,
};

DropDown.defaultProps = {
  fixed: false,
  direction: 'bottom',
  open: false,
  children: null,
  beforeOpen: i => i,
  onOpen: i => i,
  beforeClose: i => i,
  onClose: i => i,
};

export default DropDown;
