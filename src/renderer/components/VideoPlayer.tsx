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
  return <div>video player</div>;
};

export default VideoPlayer;
