/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';

// import '../lib/css/videojs-overlay.css';
// import '../lib/css/video-js.min.css';

// import overlay from 'videojs-overlay';
// import videojs from '../lib/js/video.min';
// import '../lib/js/videojs-dash.min';
// import '../lib/js/dash.all.min';
// import '../lib/js/videojs-overlay.min';

// import 'dashjs/index';
// import 'videojs-contrib-dash/dist/videojs-dash';
// import 'videojs-overlay/dist/videojs-overlay';
// import videojs from 'video.js';

import 'video.js/dist/video-js.css';
import 'videojs-overlay/dist/videojs-overlay.css';

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

class LegacyVideoPlayer extends React.Component {

  componentDidMount() {
    const { src, enckeys, videoOpts } = this.props;
    this.player = videojs(this.videoNode, { ...videoJsOptions });
    // this.player.registerPlugin('overlay', overlay);
    console.log('videoOpts', videoOpts);
    this.player.src(videoOpts);
    // this.setOverlay();
    this.showInterval = setInterval(this.triggerShowEvents, 15000); // 15 seconds
    this.player.on('error', (e) => {
      console.trace();
      console.error(e);
    });
  }

  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
    clearInterval(this.triggerShowEvents);
    clearInterval(this.triggerHideEvents);
  }

  randomGenerator = () => {
    this.randomNumber = Math.floor(Math.random() * 4) + 1;
    console.log('ELE:RND', this.randomNumber);
    return this.randomNumber;
  };

  triggerShowEvents = () => {
    const rnd = this.randomGenerator();
    this.player.trigger(`showOverlay${rnd}`);
    setTimeout(
      (rn) => {
        this.player.trigger(`hideOverlay${rn}`);
      },
      4000,
      rnd
    );
  };

  setOverlay = () => {
    // const usr = getAppUser();
    const usr = { name: 'Vikram', email: 'vikkyno1@gmail.com' };
    this.player.overlay({
      content: `${usr.name} <br> ${usr.email}`,
      attachToControlBar: true,
      overlays: [
        { start: 'showOverlay1', end: 'hideOverlay1', align: 'center' },
        { start: 'showOverlay2', end: 'hideOverlay2', align: 'top-right' },
        { start: 'showOverlay3', end: 'hideOverlay3', align: 'bottom-left' },
        { start: 'showOverlay4', end: 'hideOverlay4', align: 'bottom' },
      ],
    });
  };

  playbackControl = (delta) => {
    this.player.currentTime(this.player.currentTime() + delta);
  };

  render() {

    console.log('videojs', videojs);

    return (
      <div>
        <div>
          <video
            ref={(node) => {
              this.videoNode = node;
            }}
            className="video-js"
          />
        </div>
      </div>
    );
  }
}

export default LegacyVideoPlayer;
