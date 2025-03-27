import React, { useState } from 'react';
import {
  Text,
  Title,
  Button,
  Container,
  TextInput,
  PasswordInput,
  Checkbox,
  Group,
  Divider,
  Image,
  Anchor,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconBrandGoogle,
  IconBrandFacebook,
  IconLock,
  IconAt,
  IconUser,
  IconCheck
} from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../firebaseConfig';

const Signup = ({ onSignupSuccess }) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
    validate: {
      name: (value) => (value.trim().length >= 2 ? null : 'Name must be at least 2 characters'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Passwords do not match',
      terms: (value) => (value ? null : 'You must accept the terms and conditions'),
    },
  });

  const handleEmailSignup = async (values) => {
    try {
      // Create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: values.name
      });

      // Get ID token to send to backend
      const idToken = await userCredential.user.getIdToken();

      // Send token to backend for additional processing
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email
        })
      });

      if (!response.ok) {
        throw new Error('Backend registration failed');
      }

      // Handle successful signup
      if (onSignupSuccess) {
        onSignupSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.message);
      console.error('Signup Error:', error);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      console.log('User Data:', {
        name: result.user.displayName,
        email: result.user.email,
        idToken
      });

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email
        })
      });

      // Important: Check response status before parsing JSON
      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.error || 'Registration failed');
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Detailed Signup Error:', {
        message: error.message,
        code: error.code,
        fullError: error
      });
      setError(error.message || 'An unexpected error occurred');
    }
  };

  const handleFacebookSignup = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const idToken = await result.user.getIdToken();

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email
        })
      });

      if (!response.ok) {
        throw new Error('Backend registration failed');
      }

      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  // const handleSubmit = (values) => {
  //   console.log('Signup values:', values);

  //   // Here you would handle signup with your backend
  //   // For now we'll simulate successful registration
  //   localStorage.setItem('authToken', 'example-auth-token');
  //   localStorage.setItem('userName', values.name);
  //   localStorage.setItem('userEmail', values.email);

  //   // Call the onSignupSuccess prop passed from App component
  //   if (onSignupSuccess) {
  //     onSignupSuccess();
  //   } else {
  //     // Fallback navigation if prop not provided
  //     navigate('/dashboard');
  //   }
  // };

  const handleSubmit = (values) => {
    handleEmailSignup(values);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 w-full">
      <Container size="lg">
        <div
          style={{ width: '100%' }}
          p={0}
          className="overflow-hidden shadow-xl border-teal-100 flex flex-col md:flex-row rounded-2xl"
        >
          {/* Left side (image) - hidden on mobile */}
          <div className="hidden md:block w-2/5 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-teal-600/90 to-teal-800/90 z-10" />
            <Image
              src="/signup-side-image.jpg"
              alt="Skin health"
              className="absolute inset-0 w-full h-full object-contain"
              fallbackSrc="https://via.placeholder.com/600x900/teal/ffffff?text=SkinHealth"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center p-8">
              <div className="mb-auto">
                <img
                  src="/logo-white.png"
                  alt="Logo"
                  className=""
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150x40/teal/ffffff?text=SkinAI";
                  }}
                />
              </div>
              <div className="mb-8">
                <Title order={2} className="!text-white mb-4">
                  Join Us
                </Title>
                <Text className="!text-white/80">
                  Create an account to start your journey towards better skin health with personalized recommendations.
                </Text>
              </div>
              <div className="mt-auto">
                <Text size="xs" className="!text-white/60">
                  "This platform has completely changed how I monitor my skin health."
                </Text>
                <Group align="center" mt="xs">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm" />
                  <div>
                    <Text size="sm" className="!text-white">
                      Jessica M.
                    </Text>
                    <Text size="xs" className="!text-white/70">
                      Platform User
                    </Text>
                  </div>
                </Group>
              </div>
            </div>
          </div>

          {/* Right side (form) */}
          <div className="w-full md:w-3/5 p-8 md:p-12 bg-white">
            <div className="md:hidden mb-8">
              <img
                src="/logo-white.png"
                alt="Logo"
                className="h-10 mx-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/150x40/teal/000000?text=SkinAI";
                }}
              />
            </div>

            <Title order={2} className="text-teal-800 mb-2 md:hidden text-center">
              Join Us
            </Title>

            <Title order={3} className="text-teal-800 mb-6">
              Create your account
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <TextInput
                label="Full Name"
                placeholder="John Doe"
                size="md"
                radius="md"
                mb="md"
                icon={<IconUser size={16} />}
                className="mb-4"
                {...form.getInputProps('name')}
              />

              <TextInput
                label="Email"
                placeholder="your@email.com"
                size="md"
                radius="md"
                mb="md"
                icon={<IconAt size={16} />}
                className="mb-4"
                {...form.getInputProps('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                size="md"
                radius="md"
                icon={<IconLock size={16} />}
                className="mb-4"
                {...form.getInputProps('password')}
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                size="md"
                radius="md"
                icon={<IconCheck size={16} />}
                className="mb-4"
                {...form.getInputProps('confirmPassword')}
              />

              <Checkbox
                label={
                  <Text>
                    I agree to the{' '}
                    <Anchor href="/terms" className="text-teal-700 hover:underline">
                      terms and conditions
                    </Anchor>
                  </Text>
                }
                {...form.getInputProps('terms', { type: 'checkbox' })}
                className="mb-6"
              />

              <Button
                type="submit"
                size="md"
                radius="md"
                fullWidth
                className="mb-4 !bg-gradient-to-r !from-red-500 !to-orange-500 !text-white !font-semibold !shadow-lg !shadow-red-900/50 !transform hover:scale-103 !transition-all !duration-300 hover:!bg-gradient-to-r hover:!from-orange-500 hover:!to-red-500 
    active:!scale-95 active:!shadow-orange-600/50 focus:!outline-none focus:!ring-2 focus:!ring-red-500 focus:!ring-offset-2"
              >
                Create Account
              </Button>

              <Divider
                label="Or continue with"
                labelPosition="center"
                my="lg"
              />

              {error && <Text color="red">{error}</Text>}

              <Group grow mb="md" spacing="md">
                <Button
                  leftSection={<IconBrandGoogle size={16} />}
                  variant="outline"
                  onClick={handleGoogleSignup}
                  className="border-gray-300 text-gray-700"
                >
                  Google
                </Button>
                <Button
                  leftSection={<IconBrandFacebook size={16} />}
                  variant="outline"
                  onClick={handleFacebookSignup}
                  className="border-gray-300 text-gray-700"
                >
                  Facebook
                </Button>
              </Group>

              <Text className="text-center text-gray-600 mt-6">
                Already have an account?{' '}
                <Anchor
                  component={Link}
                  to="/login"
                  className="font-medium text-red-500 hover:text-red-600"
                >
                  Log in
                </Anchor>
              </Text>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Signup;