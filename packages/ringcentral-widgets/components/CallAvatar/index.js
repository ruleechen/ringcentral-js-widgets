import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';

class CallIcon extends Component {
  constructor(props) {
    super(props);
    this.setState({
      avatarUrl: null,
    });
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
        <svg width={initialSize} height={initialSize} xmlns="http://www.w3.org/2000/svg">
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
            // HACK: &#xf904; is the font code for the portrait icon
            avatarUrl ?
              <image clipPath="url(#circleClip)" height="100%" width="100%" xlinkHref={avatarUrl} /> :
              <g>
                <text
                  x="0"
                  y="0"
                  style={{
                    fontSize: `${avatarCircleRadius}px`,
                    fill: $blue,
                    opacity: '.5'
                  }}
                  className={styles.portrait}>
                  &#xf904;
                </text>
              </g>
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
        <svg width={initialSize} height={initialSize} xmlns="http://www.w3.org/2000/svg">
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
              <g>
                <text
                  x="0"
                  y="0"
                  className={styles.portrait}
                  style={{
                    fontSize: `${initialSize - 2}px`,
                    fill: $blue,
                    opacity: '.5'
                  }}>
                &#xf904;
                </text>
              </g>
          }
        </svg>
      );
    }
    return res;
  }
}


CallIcon.propTypes = {
  isOnConferenceCall: PropTypes.bool,
  avatarUrl: PropTypes.string,
  extraNum: PropTypes.number,
};

CallIcon.defaultProps = {
  isOnConferenceCall: false,
  avatarUrl: null,
  extraNum: 0,
};
