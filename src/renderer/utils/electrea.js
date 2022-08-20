import { Buffer } from 'buffer';

const videoOpts = {
  src: '',
  type: 'application/dash+xml',
  keySystemOptions: [
    {
      name: 'org.w3.clearkey',
      options: {
        clearkeys: {},
      },
    },
  ],
};

const getVideoOpts = (src, keys) => {
  videoOpts.src = src;
  const k = Buffer.from(keys.key, 'base64')
    .toString('base64')
    .replace(/=/g, '');
  const i = Buffer.from(keys.kid, 'base64')
    .toString('base64')
    .replace(/=/g, '');
  videoOpts.keySystemOptions[0].options.clearkeys = {};
  videoOpts.keySystemOptions[0].options.clearkeys[i] = k;
  console.log(videoOpts);
  return videoOpts;
};

export { getVideoOpts };
