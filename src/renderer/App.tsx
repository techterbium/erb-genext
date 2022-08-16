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

const Hello = () => {
  const [file, setFile] = useState(null);
  const [keys, setKeys] = useState(null);
  const nav = useNavigate();

  if (file) {
    console.log('Hello', file, keys);
    nav('/video', { state: { file, keys } });
  }

  useEffect(() => {
    window.electron.ipcRenderer.once('file-selected', (resp) => {
      console.log('resp', resp);
      const { asarFileInfo, keys } = resp;
      setFile(asarFileInfo);
      setKeys(keys);
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
          <Link to="config">Config</Link>
          <Link to="video">VideoPlayer</Link>
        </nav>
        <Routes>
          <Route index path="/" element={<Hello />} />
          <Route path="/login" element={<Login />} />
          <Route path="/licenses" element={<Licenses />} />
          <Route path="/config" element={<Config />} />
          <Route path="/video" element={<VideoPlayer />} />
        </Routes>
      </Router>
    </div>
  );
}
