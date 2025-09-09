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
  Select
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconLock, IconAt, IconUser, IconCheck } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signup } from '../slices/authSlice';

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const form = useForm({
    initialValues: {
      full_name: '',
      email: '',
      phone_no: '',
      notification_preference: 'whatsapp',
      password: '',
      confirm_password: '',
      terms: false,
    },
    validate: {
      full_name: (value) => (value.trim().length >= 2 ? null : 'Name must be at least 2 characters'),
      phone_no: (value) => /^\+?[1-9]\d{7,14}$/.test(value) ? null : 'Enter a valid phone number',
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
      confirm_password: (value, values) =>
        value === values.password ? null : 'Passwords do not match',
      terms: (value) => (value ? null : 'You must accept the terms and conditions'),
    },
  });

  const handleSubmit = (values) => {
    dispatch(signup({
      full_name: values.full_name,
      email: values.email,
      phone_no: values.phone_no,
      notification_preference: values.notification_preference,
      password: values.password,
      confirm_password: values.confirm_password,
      rememberMe: true,
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
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150x40/teal/ffffff?text=SkinAI";
                  }}
                />
              </div>
              <div className="mb-8">
                <Title order={2} className="!text-white mb-4">Join Us</Title>
                <Text className="!text-white/80">
                  Create an account to start your journey towards better skin health with personalized recommendations.
                </Text>
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

            <Title order={2} className="text-teal-800 mb-2 md:hidden text-center">Join Us</Title>
            <Title order={3} className="text-teal-800 mb-6">Create your account</Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <TextInput
                label="Full Name"
                placeholder="John Doe"
                size="md"
                radius="md"
                icon={<IconUser size={16} />}
                className="mb-4"
                {...form.getInputProps('full_name')}
              />

              <Group grow className="mb-4">
                <TextInput
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                  size="md"
                  radius="md"
                  {...form.getInputProps('phone_no')}
                />

                <Select
                  label="Notification Preference"
                  placeholder="Select"
                  size="md"
                  radius="md"
                  data={[
                    { value: 'whatsapp', label: 'WhatsApp' },
                    { value: 'sms', label: 'SMS' },
                    { value: 'email', label: 'Email' },
                  ]}
                  onChange={(val) => form.setFieldValue('notification_preference', val)}
                  searchable
                  clearable={false}
                />

              </Group>

              <TextInput
                label="Email"
                placeholder="your@email.com"
                size="md"
                radius="md"
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
                {...form.getInputProps('confirm_password')}
              />

              <Checkbox
                label={
                  <Text>
                    I agree to the{' '}
                    <Anchor href="/terms" className="text-teal-700 hover:underline">terms and conditions</Anchor>
                  </Text>
                }
                {...form.getInputProps('terms', { type: 'checkbox' })}
                className="mb-6"
              />

              {error && <Text color="red">{error}</Text>}

              <Button
                type="submit"
                size="md"
                radius="md"
                fullWidth
                loading={loading}
                className="mb-4 !bg-gradient-to-r !from-red-500 !to-orange-500 !text-white !font-semibold !shadow-lg !shadow-red-900/50 !transform hover:scale-103 !transition-all !duration-300 hover:!bg-gradient-to-r hover:!from-orange-500 hover:!to-red-500 
    active:!scale-95 active:!shadow-orange-600/50 focus:!outline-none focus:!ring-2 focus:!ring-red-500 focus:!ring-offset-2"
              >
                Create Account
              </Button>

              <Divider label="Or continue with" labelPosition="center" my="lg" />

              <Text className="text-center text-gray-600 mt-6">
                Already have an account?{' '}
                <Anchor component={Link} to="/login" className="font-medium text-red-500 hover:text-red-600">
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
