import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { MantineProvider, Button, Tooltip, Burger, Drawer, ScrollArea } from '@mantine/core';
import Login from './pgs/Login';
import Signup from './pgs/Signup';
import Home from './pgs/Home';
import About from './pgs/About';
import Upload from './pgs/Upload';
import Dashboard from './pgs/Dashboard';
import './index.css';

function NavBar({ isLoggedIn, setIsLoggedIn }) {
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
  };
  
  // Links configuration based on authentication state
  const navLinks = [
    { to: '/', label: 'Home', always: true },
    { to: '/about', label: 'About', always: true },
    { to: '/login', label: 'Login', auth: false },
    { to: '/signup', label: 'Signup', auth: false },
    { to: '/upload', label: 'Upload', always: true },
    { to: '/dashboard', label: 'Dashboard', auth: true }
  ];
  
  // Filter links based on authentication status
  const filteredLinks = navLinks.filter(link => 
    link.always || (link.auth === undefined) || (link.auth === isLoggedIn)
  );
  
  // Desktop navigation
  const desktopNav = (
    <div className="hidden md:flex justify-center gap-6">
      {filteredLinks.map((link) => (
        <Tooltip key={link.to} label={link.label} position="bottom" withArrow>
          <Link to={link.to}>
            <Button 
              color={link.to === '/' ? 'teal' : 'gray'} 
              variant="subtle"
            >
              {link.label}
            </Button>
          </Link>
        </Tooltip>
      ))}
      
      {isLoggedIn && (
        <Tooltip label="Logout" position="bottom" withArrow>
          <Button 
            color="red" 
            variant="subtle"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Tooltip>
      )}
    </div>
  );
  
  // Mobile navigation drawer content
  const mobileNavContent = (
    <ScrollArea h="100%" p="md">
      <div className="flex flex-col space-y-4">
        {filteredLinks.map((link) => (
          <Link 
            key={link.to} 
            to={link.to}
            onClick={() => setOpened(false)}
          >
            <Button 
              color={link.to === '/' ? 'teal' : 'gray'} 
              variant="subtle"
              fullWidth
            >
              {link.label}
            </Button>
          </Link>
        ))}
        
        {isLoggedIn && (
          <Button 
            color="red" 
            variant="subtle"
            fullWidth
            onClick={() => {
              handleLogout();
              setOpened(false);
            }}
          >
            Logout
          </Button>
        )}
      </div>
    </ScrollArea>
  );

  return (
    <nav className="fixed top-0 w-full bg-gray-100 shadow-md py-4 px-6 z-50 flex justify-between items-center">
      <div className="text-xl font-bold text-teal-600">NeoDermaScan</div>
      
      {/* Desktop Navigation */}
      {desktopNav}
      
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Burger
          opened={opened}
          onClick={() => setOpened(!opened)}
          size="sm"
          color="teal"
        />
        <Drawer
          opened={opened}
          onClose={() => setOpened(false)}
          title="Navigation"
          padding="xl"
          size="xs"
          position="right"
        >
          {mobileNavContent}
        </Drawer>
      </div>
    </nav>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // You might want to check for authentication on app load
  useEffect(() => {
    // Example: check localStorage or a cookie for auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
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