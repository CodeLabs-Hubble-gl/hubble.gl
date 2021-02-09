import {WithKeplerUI} from '../inject-kepler';
import React from 'react';

/**
 * @typedef {Object} RenderingSpinnerProps
 * @property {boolean} rendering whether a video is currently rendering or not
 * @property {number} exportVideoWidth width of video that user selected in modal
 * @property {function} _getContainerHeight inherited fn that dynamically fetches height of container
 * @property {Object} adapter Hubble Deck adapter
 * @property {number} durationMs duration of animation set by user
 */

/**
 * @param {RenderingSpinnerProps} props
 * @returns {Object} React Component that gives user feedback after they click the "Render" button
 */
export function RenderingSpinner({
  rendering,
  exportVideoWidth,
  _getContainerHeight,
  adapter,
  durationMs
}) {
  const startTimer = Date.now();
  const percentRendered = Math.floor((adapter.videoCapture.timeMs / durationMs) * 100).toFixed(0);
  const showRenderingPercent = adapter.videoCapture._getNextTimeMs() < durationMs;
  const showSaving = adapter.videoCapture._getNextTimeMs() > durationMs;

  const loaderStyle = {
    display: rendering === false ? 'none' : 'flex',
    position: 'absolute',
    background: 'rgba(0, 0, 0, 0.5)',
    width: `${exportVideoWidth}px`,
    height: `${_getContainerHeight}px`,
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <WithKeplerUI>
      {({LoadingSpinner}) => (
        <div className="loader" style={loaderStyle}>
          <LoadingSpinner />
          {/* TODO change text styling to match Kepler's */}
          <div
            className="rendering-feedback-container"
            style={{color: 'white', position: 'absolute', top: '175px'}}
          >
            {showRenderingPercent && <div className="rendering-percent">{percentRendered} %</div>}
            {showSaving && <div className="saving-message">Saving...</div>}
            <div
              className="saving-message-delayed"
              style={{
                display:
                  Date.now() - startTimer > 10000 + adapter.videoCapture.timeMs ? 'flex' : 'none'
              }}
            >
              {' '}
              {/* TODO Doesn't show up. Look at usememo for value of startTimer. setTimeout? useEffect hook to run once. Ultimately want a boolean */}
              {/* Appears after "Saving..." message has been showing for at least 10s */}
              Saving...Hang Tight.
            </div>
          </div>
        </div>
      )}
    </WithKeplerUI>
  );
}
