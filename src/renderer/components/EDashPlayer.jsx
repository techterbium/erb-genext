/* eslint-disable react/self-closing-comp */
/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import * as dashjs from 'dashjs';
import { useLocation } from 'react-router-dom';

export default class EDashPlayer extends React.Component {
  componentDidMount() {
    const keyData = {
      'org.w3.clearkey': {
        clearkeys: {
          m3b4JiWfBUnx3XuDCb5d4g: 'tUHZFq5wPvS9Xx3e5XHeLQ',
        },
      },
    };

    const keyData1 = {
      'org.w3.clearkey': {
        clearkeys: {
          nrQFDeRLSAKTLifXUIPiZg: 'FmY0xnWCPCNaSpRG-tUuTQ',
        },
      },
    };
    // const url = '/Users/vikky/videos/first/01krishna.asar/stream.mpd';
    const url = 'C:\\Users\\vikra\\vids\\01krishna.asar\\stream.mpd';
    // const url = '/Users/vikky/videos/first/01RuralReconstruction.asar/stream.mpd';
    // const url =
    //   'https://media.axprod.net/TestVectors/v7-MultiDRM-SingleKey/Manifest_1080p_ClearKey.mpd';
    console.log('Dash initialising...', this.player);
    const video = this.player;
    const dashjsplayer = dashjs.MediaPlayer().create();
    dashjsplayer.initialize(video, url, true);
    dashjsplayer.setProtectionData(keyData);
    dashjsplayer.updateSettings({
      debug: {
        logLevel: dashjs.Debug.LOG_LEVEL_DEBUG,
      },
    });
    console.log('Dash initialized DONE');
  }

  render() {
    console.log('Render in DASH');
    return (
      <div style={{ maxWidth: '100px', maxHeight: '100px' }}>
        <video
          width="400"
          height="300"
          ref={(playerr) => {
            this.player = playerr;
          }}
          controls
          autoPlay
        />
      </div>
    );
  }
}
