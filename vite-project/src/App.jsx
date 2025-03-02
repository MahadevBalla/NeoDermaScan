import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { MantineProvider, Button, Burger, Drawer, ScrollArea } from '@mantine/core';
import Login from './pgs/Login';
import Signup from './pgs/Signup';
import Home from './pgs/Home';
import About from './pgs/About';
import Upload from './pgs/Upload';
import Dashboard from './pgs/Dashboard';
import NavBar from './NavBar';
import './index.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false); // Ensure initial state is false if no token exists
    }
  }, []);

  // Wrap login/signup components to handle authentication state change
  const LoginWithAuth = () => {
    const navigate = useNavigate();

    const handleLoginSuccess = () => {
      setIsLoggedIn(true);
      navigate('/dashboard');
    };

    return <Login onLoginSuccess={handleLoginSuccess} />;
  };

  const SignupWithAuth = () => {
    const navigate = useNavigate();

    const handleSignupSuccess = () => {
      setIsLoggedIn(true);
      navigate('/dashboard');
    };

    return <Signup onSignupSuccess={handleSignupSuccess} />;
  };

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Router>
        <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <div className="flex items-center justify-center min-h-screen pt-20 bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<LoginWithAuth />} />
            <Route path="/signup" element={<SignupWithAuth />} />
            <Route path="/upload" element={<Upload />} />
            <Route
              path="/dashboard"
              element={isLoggedIn ? <Dashboard /> : <LoginWithAuth />}
            />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </MantineProvider>
  );
}

export default App;