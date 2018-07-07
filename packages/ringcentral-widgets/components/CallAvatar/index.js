import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';

class CallAvatar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      avatarUrl: null,
    };
  }

  loadImg(props = this.props) {
    if (props.avatarUrl) {
      const $img = document.createElement('img');
      $img.src = props.avatarUrl;
      $img.onload = () => this.setState(prevState => ({
        ...prevState,
        avatarUrl: props.avatarUrl,
      }));
    }
  }

  componentDidMount() {
    this.loadImg();
  }

  componentWillReceiveProps(nextProp) {
    if (nextProp.avatarUrl !== this.props.avatarUrl) {
      this.loadImg(nextProp);
    }
  }

  render() {
    const { extraNum, isOnConferenceCall } = this.props;
    const { avatarUrl } = this.state;
    const initialSize = 38;
    const margin = 4;
    const avatarCircleRadius = 15;
    const extraNumCircleRadius = 8.5;
    const extraNumCircleBorder = 1;
    const $snow = '#fff';
    const $gray = '#cee7f2';
    const $blue = '#0684bd';

    let res;

    if (isOnConferenceCall && extraNum > 0) {
      res = (
        <svg
          className={styles.callAvatar}
          viewBox={`0 0 ${initialSize} ${initialSize}`}
          preserveAspectRatio="xMidYmid meet"
          xmlns="http://www.w3.org/2000/svg">
          <defs>
            <g id="text">
              <text
                x="0"
                y="0"
                dy="29px"
                style={{
                      fontSize: `${avatarCircleRadius * 2}px`,
                      fill: $blue,
                      opacity: '.5'
                    }}
                className={styles.portrait}
                // HACK: &#xe904; is the font code for the portrait icon
                >
                {'\ue904'}
              </text>
            </g>
          </defs>
          <circle
            cx={avatarCircleRadius}
            cy={margin + avatarCircleRadius}
            r={avatarCircleRadius}
            fill={$snow} />
          <g>
            <clipPath id="circleClip">
              <circle
                cx={avatarCircleRadius}
                cy={margin + avatarCircleRadius}
                r={avatarCircleRadius}
                fill={$snow} />
            </clipPath>
          </g>
          {
            avatarUrl ?
              <image clipPath="url(#circleClip)" height="100%" width="100%" xlinkHref={avatarUrl} /> :
              <use xlinkHref="#text" clipPath="url(#circleClip)" />
          }
          <circle
            cx={initialSize - extraNumCircleRadius}
            cy={extraNumCircleRadius}
            r={extraNumCircleRadius}
            fill={$snow} />
          <circle
            cx={initialSize - extraNumCircleRadius}
            cy={extraNumCircleRadius}
            r={extraNumCircleRadius - extraNumCircleBorder}
            fill={$gray} />

          <text
            x={initialSize - extraNumCircleRadius}
            y={extraNumCircleRadius}
            dx={extraNumCircleBorder}
            dy="3px"
            textAnchor="middle"
            style={{
              fontSize: '9px',
              stroke: 'none',
              fill: $blue,
              fontWeight: 'bold',
              opacity: '.5'
            }}>
            {`+${extraNum}`}
          </text>
        </svg>
      );
    } else {
      res = (
        <svg
          className={styles.callAvatar}
          viewBox={`0 0 ${initialSize} ${initialSize}`}
          xmlns="http://www.w3.org/2000/svg">
          <defs>
            <g id="text">
              <text
                x="0"
                y="0"
                dy="29px"
                dx="2"
                style={{
                      fontSize: `${(initialSize / 2 - 2) * 2}px`,
                      fill: $blue,
                      opacity: '.5'
                    }}
                className={styles.portrait}>
                {'\ue904'}
              </text>
            </g>
          </defs>
          <circle
            cx={initialSize / 2}
            cy={initialSize / 2}
            r={initialSize / 2}
            fill={$snow} />
          <g>
            <clipPath id="circleClip">
              <circle
                cx={initialSize / 2}
                cy={initialSize / 2}
                r={initialSize / 2 - 1}
              />
            </clipPath>
          </g>
          {
            avatarUrl ?
              <image clipPath="url(#circleClip)" height="100%" width="100%" xlinkHref={avatarUrl} /> :
              <use xlinkHref="#text" clipPath="url(#circleClip)" />
          }
        </svg>
      );
    }
    return res;
  }
}


CallAvatar.propTypes = {
  isOnConferenceCall: PropTypes.bool,
  avatarUrl: PropTypes.string,
  extraNum: PropTypes.number,
};

CallAvatar.defaultProps = {
  isOnConferenceCall: false,
  avatarUrl: null,
  extraNum: 0,
};


export default CallAvatar;