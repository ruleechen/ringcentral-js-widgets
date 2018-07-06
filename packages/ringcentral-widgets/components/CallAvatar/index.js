import React from 'react';
import PropTypes from 'prop-types';
import callDirections from 'ringcentral-integration/enums/callDirections';
import styles from './styles.scss';

export default function CallIcon({
  isOnConferenceCall,
  avatarUrl,
  extraNum
}) {
  let symbol;
  const initialSize = 38;
  const margin = 4;
  const avatarCircleRadius = 15;
  const extraNumCircleRadius = 8.5;
  const extraNumCircleBorder = 1;
  const $snow = '#fff';
  const $gray = '#cee7f2';
  const $blue = '#0684bd';

  if (isOnConferenceCall && extraNum > 0) {
    symbol = (
      <svg width={initialSize} height={initialSize} xmlns="http://www.w3.org/2000/svg">
        <circle
          cx={avatarCircleRadius}
          cy={margin + avatarCircleRadius}
          r={avatarCircleRadius}
          fill={$snow} />
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
    symbol = (
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
  return symbol;
}

CallIcon.propTypes = {
  direction: PropTypes.string,
  ringing: PropTypes.bool,
  isOnConferenceCall: PropTypes.bool,
  inboundTitle: PropTypes.string,
  outboundTitle: PropTypes.string,
  showAvatar: PropTypes.bool,
  avatarUrl: PropTypes.string,
  extraNum: PropTypes.number,
};

CallIcon.defaultProps = {
  direction: callDirections.outbound,
  ringing: false,
  isOnConferenceCall: false,
  inboundTitle: undefined,
  outboundTitle: undefined,
  showAvatar: false,
  avatarUrl: null,
  extraNum: 0,
};
