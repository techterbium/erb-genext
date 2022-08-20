/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useState } from 'react';
import * as dashjs from 'dashjs';
import { useLocation } from 'react-router-dom';

const FDashPlayer = () => {
  const { state } = useLocation();
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    // const { resp } = state;
    const { file, keys, videoOpts } = state;
    console.log(file, keys, videoOpts);
    const dashjsplayer = dashjs.MediaPlayer().create();
    dashjsplayer.initialize(player, file.filePath, true);
    dashjsplayer.setProtectionData(videoOpts);
  }, []);

  return (
    <div>
      <video
        ref={(playerr) => {
          setPlayer(playerr);
        }}
        autoPlay
        controls
      />
    </div>
  );
};

export default FDashPlayer;
