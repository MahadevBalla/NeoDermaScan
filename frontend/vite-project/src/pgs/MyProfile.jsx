import { useState, useEffect } from 'react';
import {
  Text,
  Title,
  Container,
  Group,
  Paper,
  Button,
  Alert,
  Avatar,
  Tabs,
  SimpleGrid,
  Grid,
  Card,
  Badge,
  Divider,
  List,
  Accordion,
  Image,
  ThemeIcon,
  Loader,
  Flex,
} from '@mantine/core';
import CustomModal from '../components/CustomModal';
import {
  IconChartLine,
  IconFileAnalytics,
  IconCalendarStats,
  IconUpload,
  IconUserCircle,
  IconMail,
  IconPhoneCall,
  IconBug,
  IconAlertTriangle,
  IconClock,
  IconBriefcase,
  IconMapPin,
  IconAddressBook,
  IconExclamationCircle,
  IconInfoCircle,
  IconPhoto,
  IconCalendar as IconCalendarDate,
  IconChevronRight
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile } from '../slices/authSlice';
import { get, patch } from '../utils/api';

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [cancelModal, setCancelModal] = useState({
    opened: false,
    appointmentId: null,
    doctorName: ""
  });
  const dispatch = useDispatch();
  const { user, tokens, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user && tokens?.access) {
      dispatch(fetchProfile(tokens.access));
    }
  }, [user, tokens, dispatch]);

  // Fetch appointments
  const fetchAppointments = async () => {
    setAppointmentsLoading(true);
    setAppointmentsError(null);

    try {
      const data = await get('/appointments/');

      // Ensure data is an array
      if (Array.isArray(data)) {
        setAppointments(data);
      } else {
        console.error("Appointments data is not an array:", data);
        setAppointmentsError("Invalid appointments data format");
        setAppointments([]);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setAppointmentsError(`Failed to fetch appointments: ${err.message || 'Unknown error'}`);
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Fetch analysis history - Using the correct endpoint from urls.py
  const fetchAnalysisHistory = async () => {
    setAnalysisLoading(true);
    setAnalysisError(null);

    try {
      // Using the correct endpoint from urls.py: /diagnosis/history/
      const data = await get('/diagnosis/history/');

      // Ensure data is an array
      if (Array.isArray(data)) {
        setAnalysisHistory(data);
      } else {
        console.error("Analysis history data is not an array:", data);
        setAnalysisError("Invalid analysis history data format");
        setAnalysisHistory([]);
      }
    } catch (err) {
      console.error('Error fetching analysis history:', err);
      setAnalysisError(`Failed to fetch analysis history: ${err.message || 'Unknown error'}`);
      setAnalysisHistory([]);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    if (tokens?.access) {
      fetchAppointments();
      fetchAnalysisHistory();
    }
  }, [tokens]);

  // Function to cancel an appointment
  const cancelAppointment = async (appointmentId) => {
    try {
      // Show loading state (optional - add a loading state if you want)
      const response = await patch(`/appointments/${appointmentId}/`, {
        status: 'cancelled'
      });

      // Update the appointment status locally
      setAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment.id === appointmentId
            ? { ...appointment, status: 'cancelled' }
            : appointment
        )
      );
      // Close the modal
      closeCancelModal();
      // Clear any previous errors
      setAppointmentsError(null);
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setAppointmentsError('Failed to cancel appointment. Please try again.');
      // Keep modal open on error so user can retry
    }
  };

  // Function to open cancel confirmation modal
  const openCancelModal = (appointmentId, doctorName) => {
    setCancelModal({
      opened: true,
      appointmentId,
      doctorName
    });
  };

  // Function to close cancel confirmation modal
  const closeCancelModal = () => {
    setCancelModal({
      opened: false,
      appointmentId: null,
      doctorName: ""
    });
  };

  // Filter only booked appointments for the upcoming appointments section
  const bookedAppointments = appointments.filter(appointment => appointment.status === 'booked');

  // Stats data - Removed the "Conditions Resolved" stat
  const stats = [
    {
      title: "Analyses",
      value: analysisHistory.length.toString(),
      description: "Total skin analyses",
      icon: IconFileAnalytics,
      color: "teal"
    },
    {
      title: "High Risk",
      value: analysisHistory.filter(a => a.risk === 'High').length.toString(),
      description: "Requiring attention",
      icon: IconAlertTriangle,
      color: "red"
    },
    {
      title: "Follow-ups",
      value: bookedAppointments.length.toString(),
      description: "Scheduled checkups",
      icon: IconCalendarStats,
      color: "blue"
    }
  ];

  // Status Badge renderer
  const getStatusBadge = (status) => {
    const statusMap = {
      'Urgent': { color: 'red', label: 'Urgent' },
      'Follow-up': { color: 'yellow', label: 'Follow-up' },
      'Normal': { color: 'green', label: 'Normal' },
      'booked': { color: 'blue', label: 'Confirmed' },
      'cancelled': { color: 'red', label: 'Cancelled' },
      'completed': { color: 'green', label: 'Completed' },
    };

    const statusInfo = statusMap[status] || { color: 'gray', label: status };

    return (
      <Badge
        color={statusInfo.color}
        variant="light"
        size="sm"
      >
        {statusInfo.label}
      </Badge>
    );
  };

  // Risk Badge renderer
  // const getRiskBadge = (risk) => {
  //   const riskMap = {
  //     'High': { color: 'red', label: 'High Risk' },
  //     'Medium': { color: 'yellow', label: 'Medium Risk' },
  //     'Low': { color: 'green', label: 'Low Risk' },
  //   };

  //   const riskInfo = riskMap[risk] || { color: 'gray', label: risk };

  //   return (
  //     <Badge
  //       color={riskInfo.color}
  //       variant="filled"
  //       size="sm"
  //     >
  //       {riskInfo.label}
  //     </Badge>
  //   );
  // };

  // Get status from risk level
  const getStatusFromRisk = (risk) => {
    if (risk === 'High') return 'Urgent';
    if (risk === 'Medium') return 'Follow-up';
    return 'Normal';
  };

  // Format address function - Updated to handle different address structures
  const formatAddress = (address) => {
    if (!address) return 'Address not available';

    // Handle if address is an object
    if (typeof address === 'object') {
      const parts = [
        address.address_line_1,
        address.address_line_2,
        address.city,
        address.state,
        address.pincode
      ];

      return parts.filter(Boolean).join(', ');
    }

    // Handle if address is a string
    return address;
  };

  // Format date function
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "Date not available";
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid date";
    }
  };

  // Render appointment card with error handling - Updated to properly display address
  const renderAppointmentCard = (appointment, index) => {
    try {
      // Safely access nested properties
      const doctor = appointment.doctor || {};
      const doctorName = doctor.name || "Unknown Doctor";
      const doctorSpecialization = doctor.specialization || "Specialty not specified";
      const hospital = doctor.hospital || "Hospital not specified";

      // Get address with multiple fallbacks
      let doctorAddress = null;
      if (doctor.address) {
        doctorAddress = doctor.address;
      } else if (doctor.addresses && doctor.addresses.length > 0) {
        // If addresses is an array, use the first one
        doctorAddress = doctor.addresses[0];
      } else if (doctor.primary_address) {
        doctorAddress = doctor.primary_address;
      }

      const formattedDate = formatDate(appointment.date);
      const timeSlot = appointment.time_slot || "Time not specified";
      const status = appointment.status || "unknown";

      return (
        <Card
          key={appointment.id || index}
          withBorder
          padding="md"
          radius="md"
          className="border-teal-100 bg-teal-50/30"
        >
          <Group mb="xs">
            <IconUserCircle size={20} className="text-teal-600" />
            <Text fw={600} className="text-teal-800">
              Dr. {doctorName}
            </Text>
          </Group>

          <Text size="xs" c="dimmed" mb="xs">
            {doctorSpecialization}
          </Text>

          <Group mb="xs">
            <IconCalendarDate size={14} className="text-teal-600" />
            <Text size="sm">{formattedDate}</Text>
          </Group>

          <Group mb="xs">
            <IconClock size={14} className="text-teal-600" />
            <Text size="sm">{timeSlot}</Text>
          </Group>

          <Group mb="xs">
            <IconBriefcase size={14} className="text-teal-600" />
            <Text size="sm">{hospital}</Text>
          </Group>

          {/* Address section with better fallbacks */}
          <Group mb="xs">
            <IconMapPin size={14} className="text-teal-600" />
            <Text size="sm">{formatAddress(doctorAddress)}</Text>
          </Group>

          {doctorAddress?.landmark && (
            <Group mb="xs">
              <IconAddressBook size={14} className="text-teal-600" />
              <Text size="sm"><span className="font-medium">Landmark:</span> {doctorAddress.landmark}</Text>
            </Group>
          )}

          <Group justify="space-between" mt="md">
            {getStatusBadge(status)}
            {status === 'booked' && (
              <Button
                variant="outline"
                color="red"
                size="xs"
                radius="md"
                onClick={() => openCancelModal(appointment.id, doctorName)}
              >
                Cancel
              </Button>
            )}
          </Group>
        </Card>
      );
    } catch (error) {
      console.error(`Error rendering appointment ${index}:`, error);
      return (
        <Alert icon={<IconBug size={16} />} title="Rendering Error" color="red" key={index}>
          <Text mb="xs">Error rendering appointment card.</Text>
          <Text>{error.toString()}</Text>
        </Alert>
      );
    }
  };

  // Render analysis card for overview (simplified)
  const renderSimpleAnalysisCard = (analysis, index) => {
    try {
      const status = getStatusFromRisk(analysis.risk);

      return (
        <Card
          key={analysis.id || index}
          withBorder
          padding="md"
          radius="md"
          className="border-teal-50 hover:border-teal-200 transition-colors shadow-sm"
        >
          <Group>
            <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
              <Image
                src={analysis.storage_path}
                alt={`Analysis ${analysis.id}`}
                className="w-full h-full object-cover"
                fallbackSrc={`https://via.placeholder.com/100x100/teal/ffffff?text=${analysis.prediction}`}
                withPlaceholder
                placeholder={<IconPhoto size={24} />}
              />
            </div>
            <div className="flex-grow">
              <Group justify="space-between" mb="xs">
                <Text fw={600} className="text-teal-800">
                  {analysis.prediction}
                </Text>
                <Badge color={status === 'Urgent' ? 'red' : status === 'Follow-up' ? 'yellow' : 'green'}>
                  {status}
                </Badge>
              </Group>
              <Group mb="xs">
                <Text size="xs" className="text-gray-600">
                  {formatDate(analysis.created_at)}
                </Text>
                {/* Changed: Replaced Badge with Group containing IconAlertTriangle and text */}
                <Group gap={4}>
                  <IconAlertTriangle
                    size={14}
                    className={analysis.risk === 'High' ? 'text-red-500' : analysis.risk === 'Medium' ? 'text-yellow-500' : 'text-green-500'}
                  />
                  <Text
                    size="xs"
                    className={analysis.risk === 'High' ? 'text-red-500' : analysis.risk === 'Medium' ? 'text-yellow-500' : 'text-green-500'}
                  >
                    Risk Level: {analysis.risk}
                  </Text>
                </Group>
              </Group>
            </div>
          </Group>

          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              size="sm"
              radius="md"
              className="border-teal-300 text-teal-700 hover:bg-teal-50"
              rightSection={<IconChevronRight size={14} />}
              onClick={() => setActiveTab('history')}
            >
              View Full Report
            </Button>
          </Group>
        </Card>
      );
    } catch (error) {
      console.error(`Error rendering simple analysis card ${index}:`, error);
      return (
        <Alert icon={<IconBug size={16} />} title="Rendering Error" color="red" key={index}>
          <Text mb="xs">Error rendering analysis card.</Text>
          <Text>{error.toString()}</Text>
        </Alert>
      );
    }
  };

  // Render simple appointment card for overview
  const renderSimpleAppointmentCard = (appointment, index) => {
    try {
      const doctor = appointment.doctor || {};
      const doctorName = doctor.name || "Unknown Doctor";
      const formattedDate = formatDate(appointment.date);
      const timeSlot = appointment.time_slot || "Time not specified";

      return (
        <Card
          key={appointment.id || index}
          withBorder
          padding="md"
          radius="md"
          className="border-teal-100 bg-teal-50/30 shadow-sm mb-4"
        >
          <Group>
            <div className="flex-grow">
              <Group mb="xs">
                <Text fw={600} className="text-teal-800">
                  Dr. {doctorName}
                </Text>
              </Group>
              <Group>
                <IconCalendarDate size={14} className="text-teal-600" />
                <Text size="sm" className="text-gray-600">
                  {formattedDate} • {timeSlot}
                </Text>
              </Group>
            </div>
            <Button
              variant="outline"
              size="sm"
              radius="md"
              className="border-teal-300 text-teal-700 hover:bg-teal-50"
              onClick={() => setActiveTab('appointments')}
            >
              View Details
            </Button>
          </Group>
        </Card>
      );
    } catch (error) {
      console.error(`Error rendering simple appointment card ${index}:`, error);
      return (
        <Alert icon={<IconBug size={16} />} title="Rendering Error" color="red" key={index}>
          <Text mb="xs">Error rendering appointment card.</Text>
          <Text>{error.toString()}</Text>
        </Alert>
      );
    }
  };

  // Render analysis card for history tab (detailed)
  const renderAnalysisCard = (analysis, index) => {
    try {
      const formattedDate = formatDate(analysis.created_at);
      const status = getStatusFromRisk(analysis.risk);

      return (
        <Card
          key={analysis.id || index}
          withBorder
          padding="md"
          radius="md"
          className="border-teal-50 hover:border-teal-200 transition-colors shadow-sm"
        >
          <Accordion defaultValue="details">
            <Accordion.Item value="details">
              <Accordion.Control>
                <Group justify="space-between">
                  <Group>
                    <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                      <Image
                        src={analysis.storage_path}
                        alt={`Analysis ${analysis.id}`}
                        className="w-full h-full object-cover"
                        fallbackSrc={`https://via.placeholder.com/100x100/teal/ffffff?text=${analysis.prediction}`}
                        withPlaceholder
                        placeholder={<IconPhoto size={24} />}
                      />
                    </div>
                    <div>
                      <Text fw={600} className="text-teal-800">
                        {analysis.prediction}
                      </Text>
                      <Text size="sm" className="text-gray-600">
                        {formattedDate}
                      </Text>
                    </div>
                  </Group>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(status)}
                    <Text size="sm" className="text-gray-600">
                      ID: {analysis.id}
                    </Text>
                  </div>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Grid>
                  <Grid.Col span={6}>
                    <Group mb="xs" wrap="nowrap">
                      <IconInfoCircle size={14} className="text-teal-600 flex-shrink-0" />
                      <Text fz="sm"><span className="font-medium">Confidence:</span> {analysis.confidence}%</Text>
                    </Group>
                    <Group mb="xs" wrap="nowrap">
                      <IconAlertTriangle size={14} className="text-teal-600 flex-shrink-0" />
                      <Text fz="sm"><span className="font-medium">Risk Level:</span> {analysis.risk}</Text>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group mb="xs" wrap="nowrap">
                      <IconCalendarDate size={14} className="text-teal-600 flex-shrink-0" />
                      <Text fz="sm"><span className="font-medium">Date:</span> {formattedDate}</Text>
                    </Group>
                    <Group mb="xs" wrap="nowrap">
                      <IconPhoto size={14} className="text-teal-600 flex-shrink-0" />
                      <Text fz="sm"><span className="font-medium">Filename:</span> {analysis.filename}</Text>
                    </Group>
                  </Grid.Col>
                </Grid>

                {analysis.recommendations && (
                  <>
                    <Title order={6} mt="md" mb="xs">Recommendations</Title>
                    <List spacing="xs" size="sm">
                      {analysis.recommendations.split('\n').map((rec, i) => (
                        <List.Item key={i}>{rec}</List.Item>
                      ))}
                    </List>
                  </>
                )}

                <Group justify="flex-end" mt="md">
                  <Button
                    variant="outline"
                    size="sm"
                    radius="md"
                    className="border-teal-300 text-teal-700 hover:bg-teal-50"
                  >
                    View Full Report
                  </Button>
                </Group>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Card>
      );
    } catch (error) {
      console.error(`Error rendering analysis ${index}:`, error);
      return (
        <Alert icon={<IconBug size={16} />} title="Rendering Error" color="red" key={index}>
          <Text mb="xs">Error rendering analysis card.</Text>
          <Text>{error.toString()}</Text>
        </Alert>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10" style={{ width: '100vw', marginLeft: 'calc(-1 * (100vw - 100%) / 2)' }}>
      <Container size="lg">
        {/* Header with user info */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-6 px-8 rounded-2xl mb-8 shadow-md">
          <Group wrap="nowrap" align="center">
            <Avatar
              size={84}
              radius="xl"
              color="teal"
              src={user?.profileImage || null}
              fallback={<IconUserCircle size={36} stroke={1.5} color="white" />}
              className="mr-4 border-2 border-white shadow-sm"
            />
            <div className="flex-grow">
              <Title fw={500} className="text-white mb-2">
                {loading ? "Loading..." : `Welcome back, ${user?.full_name || "User"}!`}
              </Title>

              {user && (
                <>
                  <Group wrap="nowrap" gap={10} mb={2}>
                    <IconMail stroke={1.5} size={16} color="white" />
                    <Text c="white">
                      {user.email}
                    </Text>
                  </Group>

                  <Group wrap="nowrap" gap={10}>
                    <IconPhoneCall stroke={1.5} size={16} color="white" />
                    <Text c="white">
                      {user.phone_no ? user.phone_no : 'No phone number provided'}
                    </Text>
                  </Group>
                </>
              )}
            </div>
            <Button
              component={Link}
              to="/upload"
              rightSection={<IconUpload size={16} />}
              className="!bg-gradient-to-r !from-red-500 !to-orange-500 !text-white !font-semibold !shadow-lg !shadow-red-400/50 !transform hover:scale-103 !transition-all !duration-300 hover:!bg-gradient-to-r hover:!from-orange-500 hover:!to-red-500 active:!scale-95 active:!shadow-orange-600/50 focus:!outline-none focus:!ring-2 focus:!ring-red-500 focus:!ring-offset-2"
            >
              New Analysis
            </Button>
          </Group>
        </div>

        {/* Tabs Navigation */}
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          radius="md"
          className="mb-8"
        >
          <Tabs.List className="bg-white p-1 rounded-lg shadow-sm border border-teal-100">
            <Tabs.Tab
              value="overview"
              leftSection={<IconChartLine size={16} />}
              className="data-[active]:bg-teal-50 data-[active]:text-teal-800 rounded-md transition-all"
            >
              Overview
            </Tabs.Tab>
            <Tabs.Tab
              value="history"
              leftSection={<IconFileAnalytics size={16} />}
              className="data-[active]:bg-teal-50 data-[active]:text-teal-800 rounded-md transition-all"
            >
              Analysis History
            </Tabs.Tab>
            <Tabs.Tab
              value="appointments"
              leftSection={<IconCalendarStats size={16} />}
              className="data-[active]:bg-teal-50 data-[active]:text-teal-800 rounded-md transition-all"
            >
              Appointments
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards - Updated to show only 3 cards */}
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" className="mb-8">
              {stats.map((stat) => (
                <Paper
                  key={stat.title}
                  withBorder
                  p="md"
                  radius="md"
                  className="border-teal-100 hover:shadow-md transition-all duration-300 shadow-sm"
                >
                  <Group>
                    <ThemeIcon
                      size={48}
                      radius="md"
                      variant="light"
                      className="bg-blue-100 text-blue-800"
                    >
                      <stat.icon size={24} />
                    </ThemeIcon>
                    <div>
                      <Text size="xl" fw={700} className="text-gray-800">
                        {stat.value}
                      </Text>
                      <Text size="sm" className="text-gray-600">
                        {stat.description}
                      </Text>
                    </div>
                  </Group>
                </Paper>
              ))}
            </SimpleGrid>

            {/* Main Content */}
            <Grid gutter="lg">
              {/* Recent Analyses */}
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Paper
                  withBorder
                  p="lg"
                  radius="md"
                  className="border-teal-100 h-full shadow-sm"
                >
                  <Group justify="space-between" className="mb-4">
                    <Title order={3} className="text-teal-800">
                      Recent Analyses
                    </Title>
                    <Button
                      variant="subtle"
                      rightSection={<IconChartLine size={16} />}
                      onClick={() => setActiveTab('history')}
                      className="text-teal-700"
                    >
                      View All
                    </Button>
                  </Group>

                  {analysisLoading ? (
                    <Flex justify="center" align="center" py="xl">
                      <Loader size="md" />
                    </Flex>
                  ) : analysisError ? (
                    <Alert icon={<IconExclamationCircle size={16} />} title="Error" color="red">
                      {analysisError}
                    </Alert>
                  ) : analysisHistory.length > 0 ? (
                    <div className="space-y-4">
                      {analysisHistory.slice(0, 3).map((analysis, index) => renderSimpleAnalysisCard(analysis, index))}
                    </div>
                  ) : (
                    <Paper withBorder p="md" radius="md" className="text-center border-teal-100 bg-teal-50/30">
                      <Text c="dimmed">You don't have any analysis history yet.</Text>
                      <Button
                        component={Link}
                        to="/upload"
                        variant="subtle"
                        color="teal"
                        size="sm"
                        mt="md"
                        radius="md"
                        className="text-teal-700"
                      >
                        Upload Your First Image
                      </Button>
                    </Paper>
                  )}
                </Paper>
              </Grid.Col>

              {/* Upcoming Appointments */}
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper
                  withBorder
                  p="lg"
                  radius="md"
                  className="border-teal-100 shadow-sm"
                >
                  <Title order={4} className="text-teal-800 mb-6">
                    Upcoming Appointments
                  </Title>

                  {appointmentsLoading ? (
                    <Flex justify="center" align="center" py="xl">
                      <Loader size="md" />
                    </Flex>
                  ) : appointmentsError ? (
                    <Alert icon={<IconExclamationCircle size={16} />} title="Error" color="red">
                      {appointmentsError}
                    </Alert>
                  ) : bookedAppointments.length > 0 ? (
                    <div className="space-y-4 mt-2">
                      {bookedAppointments.map((appointment, index) => renderSimpleAppointmentCard(appointment, index))}
                    </div>
                  ) : (
                    <Paper withBorder p="md" radius="md" className="text-center border-teal-100 bg-teal-50/30">
                      <Text c="dimmed">You don't have any upcoming appointments.</Text>
                      <Button
                        component={Link}
                        to="/find-dermatologist"
                        variant="subtle"
                        color="teal"
                        size="sm"
                        mt="md"
                        radius="md"
                        className="text-teal-700"
                      >
                        Book an Appointment
                      </Button>
                    </Paper>
                  )}
                </Paper>
              </Grid.Col>
            </Grid>
          </>
        )}

        {/* Analysis History Tab Content */}
        {activeTab === 'history' && (
          <Paper withBorder p="md" radius="md" className="border-teal-100 shadow-sm">
            <Group justify="space-between" mb="md">
              <Title order={3} className="text-teal-800">
                Your Analysis History
              </Title>
              <Badge color="teal" variant="light">
                {analysisHistory.length}
              </Badge>
            </Group>

            <Divider my="md" />

            {analysisLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader size="md" />
              </div>
            ) : analysisError ? (
              <Alert icon={<IconExclamationCircle size={16} />} title="Error" color="red" mb="md">
                {analysisError}
              </Alert>
            ) : analysisHistory.length > 0 ? (
              <div className="space-y-4">
                {analysisHistory.map((analysis, index) => renderAnalysisCard(analysis, index))}
              </div>
            ) : (
              <Paper withBorder p="md" radius="md" className="text-center border-teal-100 bg-teal-50/30">
                <Text c="dimmed">You don't have any analysis history yet.</Text>
                <Button
                  component={Link}
                  to="/upload"
                  variant="subtle"
                  color="teal"
                  size="sm"
                  mt="md"
                  radius="md"
                  className="text-teal-700"
                >
                  Upload Your First Image
                </Button>
              </Paper>
            )}
          </Paper>
        )}

        {/* Appointments Tab Content */}
        {activeTab === 'appointments' && (
          <Paper withBorder p="md" radius="md" className="border-teal-100 shadow-sm">
            <Group justify="space-between" mb="md">
              <Title order={3} className="text-teal-800">
                Your Appointments
              </Title>
              <Badge color="teal" variant="light">
                {appointments.length}
              </Badge>
            </Group>

            <Divider my="md" />

            {appointmentsLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader size="md" /> {/* Fixed: Removed extra closing brace */}
              </div>
            ) : appointmentsError ? (
              <Alert icon={<IconExclamationCircle size={16} />} title="Error" color="red" mb="md">
                {appointmentsError}
              </Alert>
            ) : appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map(renderAppointmentCard)}
              </div>
            ) : (
              <Paper withBorder p="md" radius="md" className="text-center border-teal-100 bg-teal-50/30">
                <Text c="dimmed">You don't have any appointments.</Text>
                <Button
                  component={Link}
                  to="/find-dermatologist"
                  variant="subtle"
                  color="teal"
                  size="sm"
                  mt="md"
                  radius="md"
                  className="text-teal-700"
                >
                  Book an Appointment
                </Button>
              </Paper>
            )}
          </Paper>
        )}

        {/* Cancel Confirmation Modal */}
        <CustomModal
          opened={cancelModal.opened}
          onClose={closeCancelModal}
          title={
            <Group gap="xs">
              <IconExclamationCircle color="orange" size={24} />
              <Text size="lg" fw={600}>Confirm Cancellation</Text>
            </Group>
          }
        >
          <Paper p="md" radius="md" withBorder className="border-orange-100 bg-orange-50/30 mb-4">
            <Text className="text-gray-700">
              Are you sure you want to cancel your appointment with{' '}
              <Text component="span" fw={600} className="text-orange-700">
                Dr. {cancelModal.doctorName}
              </Text>?
            </Text>
            <Text size="sm" c="dimmed" mt="xs">
              This action cannot be undone.
            </Text>
          </Paper>

          <Group justify="flex-end" gap="sm">
            <Button
              variant="outline"
              onClick={closeCancelModal}
              className="border-gray-300"
            >
              Keep Appointment
            </Button>
            <Button
              color="red"
              onClick={async () => {
                await cancelAppointment(cancelModal.appointmentId);
              }}
              className="!bg-red-500 hover:!bg-red-600"
            >
              Confirm Cancellation
            </Button>
          </Group>
        </CustomModal>
      </Container>
    </div>
  );
};

export default MyProfile;