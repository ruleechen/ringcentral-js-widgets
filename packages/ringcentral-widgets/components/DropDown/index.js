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


const getDimensions = (element) => {
  const PROPERTIES = {
    position: 'fixed',
    visibility: 'hidden',
  };

  if (element.nodeType) {
    let clonedEl = element.cloneNode(true);

    Object.keys(PROPERTIES).forEach((key) => {
      clonedEl.style[key] = PROPERTIES[key];
    });

    document.body.appendChild(clonedEl);

    const result = {
      width: element.offsetWidth,
      height: element.offsetHeight
    };

    document.body.removeChild(clonedEl);
    clonedEl = null;

    return result;
  }
  return null;
};

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
      return transEndEventNames[name];
    }
  }
};

const getPageOffset = (el) => {
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

const getRelativeOffset = (el) => {
  const res = { top: 0, left: 0 };
  if (!el) {
    return null;
  }
  let tmp = el.parentElement;
  while (window.getComputedStyle(tmp).position === 'static') {
    res.top += el.offsetTop;
    res.left += el.offsetLeft;
    tmp = tmp.parentElement;
  }
  return {
    top: el.offsetTop,
    left: el.offsetLeft,
  };
};

class DropDown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visibility: null,
      position: null,
      transitionEndEvtName: transitionEnd(),
      onResize: () => this.checkPosition(),
      onTransitionEnd: () => (!this.props.open ? this.setInVisible() : null),
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

  setInVisible() {
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
    const parentDemension = getDimensions(parentElement);
    const currentDemension = getDimensions(current);

    let position;
    let originalCSSPosition;
    let top;

    if (props.fixed) {
      originalCSSPosition = window.getComputedStyle(documentElement).position;
      position = getPageOffset(parentElement);
      top = props.direction === POSITION.top
        ? position && position.top - currentDemension.height
        : position && (position.top + parentDemension.height);
    } else {
      originalCSSPosition = parentElement && parentElement.nodeType === 1
        ? parentComputedStyle.position
        : '';
      position = getRelativeOffset(current);
      top = props.direction === POSITION.top
        ? position && -currentDemension.height
        : position && position.top;
    }
    const left = position
    && (position.left + parentDemension.width / 2 - currentDemension.width / 2);


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
    if (
      nextProps.children !== this.props.children
      || nextProps.fixed !== this.props.fixed
    ) {
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
          styles[direction],
        )}
        style={{
          visibility: this.state.visibility,
          position: fixed ? 'fixed' : 'absolute',
          ...this.state.position,
        }}
      >
        <div className={styles.dropdown}>
          {children}
        </div>
        <div className={styles.tail} />
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
