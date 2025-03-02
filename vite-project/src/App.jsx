import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { MantineProvider, Button } from '@mantine/core';
import Login from './pgs/Login';
import Signup from './pgs/Signup';
import Home from './pgs/Home';
import About from './pgs/About';
import Upload from './pgs/Upload';
import Dashboard from './pgs/Dashboard';
import './index.css';

function App() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Router>
        <nav className="fixed top-0 w-full bg-gray-100 shadow-md flex justify-center gap-6 py-4 z-50">
          <Link to="/">
            <Button variant="subtle">Home</Button>
          </Link>
          <Link to="/about">
            <Button variant="subtle">About</Button>
          </Link>
          <Link to="/login">
            <Button variant="subtle">Login</Button>
          </Link>
          <Link to="/signup">
            <Button variant="subtle">Signup</Button>
          </Link>
          <Link to="/upload">
            <Button variant="subtle">Upload</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="subtle">Dashboard</Button>
          </Link>
        </nav>

        <div className="flex items-center justify-center min-h-screen pt-20 bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </MantineProvider>
  );
}

export default App;