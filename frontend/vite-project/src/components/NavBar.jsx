import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, Burger, Drawer, ScrollArea } from '@mantine/core';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';

const NavBar = () => {
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Home', always: true },
    { to: '/about', label: 'About', always: true },
    { to: '/login', label: 'Login', auth: false },
    { to: '/signup', label: 'Signup', auth: false },
    { to: '/upload', label: 'Upload', always: true },
    { to: '/find-doctor', label: 'Find Dermats', auth: true },
    { to: '/profile', label: 'My Profile', auth: true },
  ];

  const filteredLinks = navLinks.filter(link =>
    link.always || link.auth === undefined || link.auth === isAuthenticated
  );

  const desktopNav = (
    <div className="hidden md:flex justify-center gap-6">
      {filteredLinks.map((link) => (
        <Link key={link.to} to={link.to}>
          <Button
            color={location.pathname === link.to ? 'teal' : 'gray'}
            variant={location.pathname === link.to ? 'filled' : 'subtle'}
          >
            {link.label}
          </Button>
        </Link>
      ))}
      {isAuthenticated && (
        <Button color="red" variant="subtle" onClick={handleLogout}>
          Logout
        </Button>
      )}
    </div>
  );

  const mobileNavContent = (
    <ScrollArea h="100%" p="md">
      <div className="flex flex-col space-y-4">
        {filteredLinks.map((link) => (
          <Link key={link.to} to={link.to} onClick={() => setOpened(false)}>
            <Button
              color={location.pathname === link.to ? 'teal' : 'gray'}
              variant={location.pathname === link.to ? 'filled' : 'subtle'}
              fullWidth
            >
              {link.label}
            </Button>
          </Link>
        ))}
        {isAuthenticated && (
          <Button
            color="red"
            variant="subtle"
            fullWidth
            onClick={() => { handleLogout(); setOpened(false); }}
          >
            Logout
          </Button>
        )}
      </div>
    </ScrollArea>
  );

  return (
    <nav className="fixed top-0 w-full bg-gray-100 shadow-md py-4 px-6 z-50 flex justify-between items-center">
      <div className="flex flex-row items-center text-center gap-1">
        <div><img src="/logo-white.png" alt="" className="h-8 w-8" /></div>
        <div className="text-xl font-bold text-teal-600">NeoDermaScan</div>
      </div>
      {desktopNav}
      <div className="md:hidden">
        <Burger opened={opened} onClick={() => setOpened(!opened)} size="sm" color="teal" />
        <Drawer opened={opened} onClose={() => setOpened(false)} title="Navigation" padding="xl" size="xs" position="right">
          {mobileNavContent}
        </Drawer>
      </div>
    </nav>
  );
};

export default NavBar;
