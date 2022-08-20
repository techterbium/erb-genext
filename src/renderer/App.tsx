import { useEffect, useState } from 'react';
import {
  MemoryRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from 'react-router-dom';

import VideoPlayer from './components/VideoPlayer';
import icon from '../../assets/icon.svg';
import './App.css';
import Licenses from './views/Licenses';
import DashPlayer from './components/DashPlayer';
import FDashPlayer from './components/FDashPlayer';
import EDashPlayer from './components/eDashPlayer';

const Hello = () => {
  const [rsp, setResp] = useState(null);
  const nav = useNavigate();

  if (rsp) {
    const { asarFileInfo, keys, videoOpts } = rsp;
    console.log('Hello', asarFileInfo, keys, videoOpts);
    nav('/dash', { state: { file: asarFileInfo, keys, videoOpts } });
  }

  useEffect(() => {
    window.electron.ipcRenderer.once('file-selected', (resp) => {
      console.log('resp', resp);
      // setFile(asarFileInfo);
      // setKeys(keys);
      setResp(resp);
    });
  }, []);

  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>Electrea 3.0</h1>
    </div>
  );
};

const Login = () => {
  useEffect(() => {
    window.electron.ipcRenderer.sendMessage('login-flow', true);
  }, []);
  return <div className="Hello">Login</div>;
};

const Config = () => {
  const [cfg, setCfg] = useState({});
  useEffect(() => {
    window.electron.ipcRenderer.sendMessage('get-config', []);
    window.electron.ipcRenderer.once('get-config-resp', (resp) => {
      setCfg(resp);
    });
  }, []);

  return <span>{JSON.stringify(cfg)}</span>;
};

export default function App() {
  return (
    <div>
      <Router>
        <nav>
          <Link to="/">Homepage</Link>
          <Link to="login">Login</Link>
          <Link to="licenses">Licenses</Link>
          <Link to="dash">Dash</Link>
          <Link to="edash">eDash</Link>
          <Link to="video">VideoPlayer</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Hello />} />
          <Route path="/login" element={<Login />} />
          <Route path="/licenses" element={<Licenses />} />
          <Route path="/dash" element={<DashPlayer />} />
          <Route path="/edash" element={<EDashPlayer />} />
          <Route path="/video" element={<VideoPlayer />} />
        </Routes>
      </Router>
    </div>
  );
}
