import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { MantineProvider, Button, Burger, Drawer, ScrollArea } from '@mantine/core';

const NavBar = ({ isLoggedIn, setIsLoggedIn }) => {
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get the current route location

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Clear the auth token
    setIsLoggedIn(false);
    navigate('/login');
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
        <Link key={link.to} to={link.to}>
          <Button
            color={location.pathname === link.to ? 'teal' : 'gray'} // Highlight current page
            variant={location.pathname === link.to ? 'filled' : 'subtle'} // Filled for current page
          >
            {link.label}
          </Button>
        </Link>
      ))}

      {isLoggedIn && (
        <Button
          color="red"
          variant="subtle"
          onClick={handleLogout}
        >
          Logout
        </Button>
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
              color={location.pathname === link.to ? 'teal' : 'gray'} // Highlight current page
              variant={location.pathname === link.to ? 'filled' : 'subtle'} // Filled for current page
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
      <div className='flex flex-row items-center text-center gap-1'>
        <div><img src="/logo-white.png" alt="" className='h-8 w-8' /></div>
        <div className="text-xl font-bold text-teal-600">NeoDermaScan</div>
      </div>

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


export default NavBar;