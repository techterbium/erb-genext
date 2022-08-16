/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import { useLocation } from 'react-router-dom';

import 'video.js/dist/video-js.css';
import 'videojs-overlay/dist/videojs-overlay.css';

// import 'video.js/dist/video';
import videojs from 'video.js';
import 'dashjs/dist/dash.all.min';
import 'videojs-contrib-dash/dist/videojs-dash';
import 'videojs-overlay/dist/videojs-overlay';
import VideoJSP from './VideoJS';

import { getVideoOpts } from '../utils/electrea';

const videoJsOptions = {
  autoplay: true,
  controls: true,
  width: 720,
  height: 400,
  playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3],
  html5: {
    dash: {
      overrideNative: true,
    },
    nativeAudioTracks: false,
    nativeVideoTracks: false,
  },
};

const VideoPlayer = () => {
  const playerRef = React.useRef(null);
  const { state } = useLocation();
  const { file, keys } = state;

  const handlePlayerReady = (player: any) => {
    playerRef.current = player;
    console.log('abcd', file, keys);
    console.log('abcd', getVideoOpts(file.filePath, keys));

    player.src = getVideoOpts(file.filePath, keys);

    // You can handle player events here, for example:
    player.on('waiting', () => {
      videojs.log('player is waiting');
    });

    player.on('dispose', () => {
      videojs.log('player will dispose');
    });
  };

  return (
    <div>
      <VideoJSP
        options={videoJsOptions}
        onReady={handlePlayerReady}
        file={file}
        encKeys={keys}
      />
    </div>
  );
};

export default VideoPlayer;
