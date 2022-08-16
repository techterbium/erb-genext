import { createRoot } from 'react-dom/client';

// import '../../node_modules/video.js/dist/video-js.min.css';
// import '../../node_modules/videojs-overlay/dist/videojs-overlay.css';

// import '../../node_modules/video.js/dist/video';
// import '../../node_modules/videojs-contrib-dash/dist/videojs-dash';
// import '../../node_modules/videojs-overlay/dist/videojs-overlay';

import App from './App';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);
