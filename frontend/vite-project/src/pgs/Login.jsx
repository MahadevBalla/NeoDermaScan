import { useEffect } from 'react';
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
import { IconLock, IconAt } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../slices/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

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
    dispatch(login({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe,
    }));
  };

  useEffect(() => {
    if (isAuthenticated) navigate('/profile');
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50 py-20 w-full">
      <Container size="lg">
        <div
          style={{ width: '100%' }}
          radius="lg"
          p={0}
          className="overflow-hidden shadow-xl border-teal-100 flex flex-col md:flex-row rounded-2xl"
        >
          {/* Left side (form) */}
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
                <Anchor component={Link} to="/forgot-password" size="sm" className="text-teal-700">
                  Forgot password?
                </Anchor>
              </Group>

              {error && <Text color="red" size="sm" className="mb-4">{error}</Text>}

              <Button
                type="submit"
                size="md"
                radius="md"
                fullWidth
                loading={loading}
                className="mb-4 !bg-gradient-to-r !from-red-500 !to-orange-500 !text-white !font-semibold !shadow-lg !shadow-red-900/50 !transform hover:scale-103 !transition-all !duration-300 hover:!bg-gradient-to-r hover:!from-orange-500 hover:!to-red-500 
    active:!scale-95 active:!shadow-orange-600/50 focus:!outline-none focus:!ring-2 focus:!ring-red-500 focus:!ring-offset-2"
              >
                Sign In
              </Button>

              <Divider label="Or continue with" labelPosition="center" my="lg" />

              <Text className="text-center text-gray-600 mt-6">
                Don't have an account?{' '}
                <Anchor component={Link} to="/signup" className="font-medium text-red-500 hover:text-red-600">
                  Create account
                </Anchor>
              </Text>
            </form>
          </div>

          {/* Right side (image) - hidden on mobile */}
          <div className="hidden md:block w-2/5 relative rounded-bl-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-teal-600/90 to-teal-800/90 z-10" />
            <Image
              src="/login-side-image.jpg"
              alt="Skin health"
              className="absolute inset-0 w-full h-full object-cover"
              fallbackSrc="https://via.placeholder.com/600x900/teal/ffffff?text=SkinHealth"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8">
              <div className="mb-auto">
                <img
                  src="/logo-white.png"
                  alt="Logo"
                  className="w-[225px] h-[200px]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150x40/teal/ffffff?text=SkinAI";
                  }}
                />
              </div>
              <div className="mb-8 text-center">
                <Title order={2} className="!text-white">
                  Welcome Back
                </Title>
                <Text className="!text-white/80">
                  Access your account to check your skin analysis history and get personalized recommendations.
                </Text>
              </div>
              <div className="mt-auto text-center">
                <Text size="xs" className="!text-white/60">
                  "This platform has completely changed how I monitor my skin health."
                </Text>
                <Group align="center" mt="xs" className="text-white">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm" />
                  <div>
                    <Text size="sm">Jessica M.</Text>
                    <Text size="xs" className="!text-white/70">Platform User</Text>
                  </div>
                </Group>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Login;
