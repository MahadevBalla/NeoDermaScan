import React from 'react';
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
  Paper,
  Image,
  Anchor,
  Box
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconBrandGoogle,
  IconBrandFacebook,
  IconLock,
  IconAt
} from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
    },
  });

  const handleSubmit = (values) => {
    console.log('Login values:', values);
    // Here you would handle authentication
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <Container size="sm">
        <Paper
          radius="lg"
          withBorder
          p={0}
          className="overflow-hidden shadow-xl border-teal-100 flex flex-col md:flex-row"
        >
          {/* Left side (image) - hidden on mobile */}
          <div className="hidden md:block w-2/5 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-teal-600/90 to-teal-800/90 z-10" />
            <Image
              src="/login-side-image.jpg"
              alt="Skin health"
              className="absolute inset-0 w-full h-full object-cover"
              fallbackSrc="https://via.placeholder.com/600x900/teal/ffffff?text=SkinHealth"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center p-8">
              <div className="mb-auto">
                <img
                  src="/logo-white.png"
                  alt="Logo"
                  className="h-10 mb-6"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150x40/teal/ffffff?text=SkinAI";
                  }}
                />
              </div>
              <div className="mb-8">
                <Title order={2} className="text-white mb-4">
                  Welcome Back
                </Title>
                <Text className="text-white/80">
                  Access your account to check your skin analysis history and get personalized recommendations.
                </Text>
              </div>
              <div className="mt-auto">
                <Text size="xs" className="text-white/60">
                  "This platform has completely changed how I monitor my skin health."
                </Text>
                <Group align="center" mt="xs">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm" />
                  <div>
                    <Text size="sm" className="text-white">
                      Jessica M.
                    </Text>
                    <Text size="xs" className="text-white/70">
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
                src="/logo.png"
                alt="Logo"
                className="h-10 mx-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/150x40/teal/000000?text=SkinAI";
                }}
              />
            </div>

            <Title order={2} className="text-teal-800 mb-2 md:hidden text-center">
              Welcome Back
            </Title>

            <Title order={3} className="text-teal-800 mb-6">
              Sign in to your account
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
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

              <Group justify="space-between" className="mb-6" align="center">
                <Checkbox
                  label="Remember me"
                  {...form.getInputProps('rememberMe', { type: 'checkbox' })}
                />
                <Anchor
                  component={Link}
                  to="/forgot-password"
                  size="sm"
                  className="text-teal-700"
                >
                  Forgot password?
                </Anchor>
              </Group>

              <Button
                type="submit"
                size="md"
                radius="md"
                fullWidth
                className="bg-teal-600 hover:bg-teal-700 mb-4"
              >
                Sign In
              </Button>

              <Divider
                label="Or continue with"
                labelPosition="center"
                my="lg"
              />

              <Group grow mb="md" spacing="md">
                <Button
                  leftSection={<IconBrandGoogle size={16} />}
                  variant="outline"
                  className="border-gray-300 text-gray-700"
                >
                  Google
                </Button>
                <Button
                  leftSection={<IconBrandFacebook size={16} />}
                  variant="outline"
                  className="border-gray-300 text-gray-700"
                >
                  Facebook
                </Button>
              </Group>

              <Text className="text-center text-gray-600 mt-6">
                Don't have an account?{' '}
                <Anchor
                  component={Link}
                  to="/signup"
                  className="font-medium text-coral-500 hover:text-coral-600"
                >
                  Create account
                </Anchor>
              </Text>
            </form>
          </div>
        </Paper>
      </Container>
    </div>
  );
};

export default Login;