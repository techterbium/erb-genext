/* eslint-disable jsx-a11y/media-has-caption */
import { useLocation } from 'react-router-dom';

// import VideoJSP from './VideoJS';
import LegacyVideoPlayer from './LegacyVideoPlayer';

const VideoPlayer = () => {
  const { state } = useLocation();
  const { file, keys, videoOpts } = state;

  return (
    <LegacyVideoPlayer
      src={file.filePath}
      enckeys={keys}
      videoOpts={videoOpts}
    />
  );
};

export default VideoPlayer;
