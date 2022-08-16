import { useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route, Link } from 'react-router-dom';

import VideoPlayer from './components/VideoPlayer';
import icon from '../../assets/icon.svg';
import './App.css';

const Hello = () => {
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

export default function App() {
  return (
    <div>
      <Router>
        <nav>
          <Link to="/">Homepage</Link>
          <Link to="login">Login</Link>
          <Link to="video">VideoPlayer</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Hello />} />
          <Route path="/login" element={<Login />} />
          <Route path="/video" element={<VideoPlayer />} />
        </Routes>
      </Router>
    </div>
  );
}
