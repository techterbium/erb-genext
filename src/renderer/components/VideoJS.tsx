/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import { getVideoOpts } from 'renderer/utils/electrea';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoJSP = (props: {
  options: any;
  onReady: any;
  file: any;
  encKeys: any;
}) => {
  const videoRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const { options, onReady, file, encKeys } = props;

  React.useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      const videoElement = videoRef.current;

      if (!videoElement) return;

      playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready');
        onReady && onReady(player);
      });
      const player = playerRef.current;
      playerRef.current.src = getVideoOpts(file.filePath, encKeys);

      // You could update an existing player in the `else` block here
      // on prop change, for example:
    } else {
      // const player = playerRef.current;
      // player.autoplay(options.autoplay);
      // player.src(options.sources);
    }
  }, [options, videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  );
};

export default VideoJSP;
