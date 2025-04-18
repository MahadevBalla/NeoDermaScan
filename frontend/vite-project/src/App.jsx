import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { MantineProvider, ActionIcon, Drawer } from '@mantine/core';
import { MessageCircle } from 'lucide-react';
import Login from './pgs/Login';
import Signup from './pgs/Signup';
import Home from './pgs/Home';
import About from './pgs/About';
import Upload from './pgs/Upload';
import Dashboard from './pgs/Dashboard';
import NavBar from './NavBar';
import AIChatAssistant from './AIChatAssistant';
import './index.css';
import './App.css'

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

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
        <div className="relative flex flex-col min-h-screen">
          <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          <div className="flex items-center justify-center flex-grow pt-20 bg-gray-50">
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

          <div className="fixed bottom-6 right-6 z-50">
            <ActionIcon
              variant="filled"
              color="teal"
              radius="xl"
              size="xl"
              onClick={() => setChatDrawerOpen(true)}
              className="w-14 h-14 shadow-lg !bg-gradient-to-r !from-red-500 !to-orange-500 !text-white !font-semibold !shadow-lg !shadow-red-500/50 !transform hover:scale-103 !transition-all !duration-300 hover:!bg-gradient-to-r hover:!from-orange-500 hover:!to-red-500 
    active:!scale-95 active:!shadow-orange-600/50 focus:!outline-none focus:!ring-2 "
            >
              <MessageCircle size={24} />
            </ActionIcon>
          </div>

          <Drawer
            opened={chatDrawerOpen}
            onClose={() => setChatDrawerOpen(false)}
            padding={0}
            size="md"
            position="right"
            title=""
            classNames={{
              title: 'text-teal-600 font-bold px-4 py-2',
            }}
            zIndex={1000}
          >
            <div className="h-[calc(100vh-60px)]">
              <AIChatAssistant isVisible={chatDrawerOpen} />
            </div>
          </Drawer>
        </div>
      </Router>
    </MantineProvider>
  );
}

export default App;