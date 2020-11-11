// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React from 'react';
import {Input, ItemSelector} from './kepler/components';
import styled, {withTheme} from 'styled-components';

import {DEFAULT_PADDING, DEFAULT_ROW_GAP} from './constants';

const StyledSection = styled.div`
  align-self: center;
  color: ${props => props.theme.labelColor};
  font-weight: 500;
  font-size: 13px;
  margin-top: ${DEFAULT_PADDING};
  margin-bottom: ${DEFAULT_ROW_GAP};
`;

const StyledLabelCell = styled.div`
  align-self: center;
  color: ${props => props.theme.labelColor};
  font-weight: 400;
  font-size: 11px;
`;

const StyledValueCell = styled.div`
  align-self: center;
  color: ${props => props.theme.textColor};
  font-weight: 500;
  font-size: 11px;
  padding: 0 12px;
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: 88px auto;
  grid-template-rows: repeat(
    ${props => props.rows},
    ${props => (props.rowHeight ? props.rowHeight : '34px')}
  );
  grid-row-gap: ${DEFAULT_ROW_GAP};
`;

/**
 * Used to convert durationMs (inherited from ExportVideoPanelContainer) to hh:mm:ss
 * @param {number} durationMs duration of animation in milliseconds
 * @returns {string} time in format hh:mm:ss
 */
function msConversion(durationMs) {
  let seconds = parseInt((durationMs / 1000) % 60, 10);
  let minutes = parseInt((durationMs / (1000 * 60)) % 60, 10);
  let hours = parseInt((durationMs / (1000 * 60 * 60)) % 24, 10);

  hours = hours < 10 ? `0${hours}` : hours;
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  seconds = seconds < 10 ? `0${seconds}` : seconds;

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Estimates file size of resulting animation
 * @param {number} frameRate frame rate of animation (set by developer)
 * @param {array} resolution [width, height] of animation
 * @param {number} durationMs duration of animation (set by developer)
 * @param {string} mediaType 'GIF', 'WEBM', etc.
 * @returns {string} size in MB
 */
function estimateFileSize(frameRate, resolution, durationMs, mediaType) {
  // Based off of https://www.youtube.com/watch?v=DDcYvesZsnw for uncompressed video
  // Formula: ((horizontal * vertical * bit depth) / (8 * 1024 * 1024 [convert to megabyte MB])) * (frame rate * time in seconds) * compression ratio
  // Additional resource https://stackoverflow.com/questions/27559103/video-size-calculation
  // NOTE: Bit depth is a guess because I couldn't find it. Same w/ compression ratio
  // TODO Read resource from Imgur dev https://stackoverflow.com/questions/23920098/how-to-estimate-gif-file-size
  if (mediaType === 'GIF') {
    // ParseInt to turn it from float to int
    const seconds = parseInt(durationMs / 1000, 10);
    return `${parseInt(
      ((resolution[0] * resolution[1] * 6) / (8 * 1024 * 1024)) * (frameRate * seconds) * 0.8,
      10
    )} MB`;
  }
  return 'Size estimation not currently available';
}

const ExportVideoPanelSettings = ({
  setMediaType,
  setCameraPreset,
  setFileName,
  setQuality,
  settingsData,
  durationMs,
  frameRate,
  resolution,
  mediaType
}) => (
  <div>
    <StyledSection>Video Effects</StyledSection>
    <InputGrid rows={2}>
      <StyledLabelCell>Timestamp</StyledLabelCell> {/* TODO add functionality  */}
      <ItemSelector
        selectedItems={['None']}
        options={['None', 'White', 'Black']}
        multiSelect={false}
        searchable={false}
        onChange={() => {}}
      />
      <StyledLabelCell>Camera</StyledLabelCell> {/* TODO add functionality */}
      <ItemSelector
        selectedItems={settingsData.cameraPreset}
        options={[
          'None',
          'Orbit (90º)',
          'Orbit (180º)',
          'Orbit (360º)',
          'North to South',
          'South to North',
          'East to West',
          'West to East',
          'Zoom Out',
          'Zoom In'
        ]}
        multiSelect={false}
        searchable={false}
        onChange={setCameraPreset}
      />
    </InputGrid>
    <StyledSection>Export Settings</StyledSection> {/* TODO add functionality  */}
    <InputGrid rows={3}>
      <StyledLabelCell>File Name</StyledLabelCell>
      <Input placeholder={settingsData.fileName} onChange={setFileName} />
      <StyledLabelCell>Media Type</StyledLabelCell> {/* TODO add functionality  */}
      <ItemSelector
        selectedItems={settingsData.mediaType}
        options={['GIF', 'WebM Video', 'PNG Sequence', 'JPEG Sequence']}
        multiSelect={false}
        searchable={false}
        onChange={setMediaType}
      />
      <StyledLabelCell>Quality</StyledLabelCell> {/* TODO add functionality  */}
      <ItemSelector
        selectedItems={settingsData.resolution}
        options={['Good (540p)', 'High (720p)', 'Highest (1080p)']}
        multiSelect={false}
        searchable={false}
        onChange={setQuality}
      />
    </InputGrid>
    <InputGrid style={{marginTop: DEFAULT_ROW_GAP}} rows={2} rowHeight="18px">
      <StyledLabelCell>Duration</StyledLabelCell> {/* TODO add functionality  */}
      <StyledValueCell>{msConversion(durationMs)}</StyledValueCell>
      <StyledLabelCell>File Size</StyledLabelCell> {/* TODO add functionality  */}
      <StyledValueCell>
        {estimateFileSize(frameRate, resolution, durationMs, mediaType)}
      </StyledValueCell>
    </InputGrid>
  </div>
);

export default withTheme(ExportVideoPanelSettings);
