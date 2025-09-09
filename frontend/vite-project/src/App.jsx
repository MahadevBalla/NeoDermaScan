import { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MantineProvider, ActionIcon, Drawer } from '@mantine/core';
import { MessageCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshToken, fetchProfile } from './slices/authSlice';
import NavBar from "./components/NavBar";
import Home from "./pgs/Home";
import Signup from "./pgs/Signup";
const Login = lazy(() => import("./pgs/Login"));
const About = lazy(() => import("./pgs/About"));
const Upload = lazy(() => import("./pgs/Upload"));
const MyProfile = lazy(() => import("./pgs/MyProfile"));
const AIChatAssistant = lazy(() => import("./components/AIChatAssistant"));

function PrivateRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Login />;
}

const App = () => {
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const dispatch = useDispatch();
  const { tokens } = useSelector(state => state.auth);

  useEffect(() => {
    let interval;
    if (tokens) {
      dispatch(fetchProfile(tokens.access));
      interval = setInterval(() => dispatch(refreshToken(tokens.refresh)), 4 * 60 * 1000);
    }
    return () => clearInterval(interval);
  }, [tokens]);

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <div className="relative flex flex-col min-h-screen">
        <NavBar />
        <div className="flex items-center justify-center flex-grow pt-20 bg-gray-50">
          <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/upload"
                element={
                  <PrivateRoute>
                    <Upload />
                  </PrivateRoute>}
              />
              <Route
                path="/find-doctor"
                element={
                  <PrivateRoute>
                    <Upload />
                  </PrivateRoute>}
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <MyProfile />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </div>

        <div className="fixed bottom-6 right-6 z-50">
          <ActionIcon
            variant="filled"
            color="teal"
            radius="xl"
            size="xl"
            onClick={() => setChatDrawerOpen(true)}
            className="w-14 h-14 shadow-lg !bg-gradient-to-r !from-red-500 !to-orange-500 !text-white !font-semibold !shadow-red-500/50 !transform hover:scale-103 !transition-all !duration-300 hover:!bg-gradient-to-r hover:!from-orange-500 hover:!to-red-500 
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
          classNames={{ title: 'text-teal-600 font-bold px-4 py-2' }}
          zIndex={1000}
        >
          <div className="h-[calc(100vh-60px)]">
            <AIChatAssistant isVisible={chatDrawerOpen} />
          </div>
        </Drawer>
      </div>
    </MantineProvider>
  );
};

export default App;
