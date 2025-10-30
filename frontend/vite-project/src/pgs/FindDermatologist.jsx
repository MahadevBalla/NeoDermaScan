import { useState, useEffect, useMemo } from "react";
import {
  Text,
  Title,
  Button,
  Group,
  Paper,
  Card,
  Badge,
  Grid,
  TextInput,
  Select,
  Rating,
  Divider,
  Box,
  LoadingOverlay,
  Alert,
  Accordion,
  Modal
} from "@mantine/core";
import {
  IconSearch,
  IconMapPin,
  IconPhone,
  IconCalendar,
  IconUser,
  IconBriefcase,
  IconClock,
  IconUserCircle,
  IconAlertCircle,
  IconSchool,
  IconCertificate,
  IconBuildingHospital,
  IconAddressBook,
  IconExclamationCircle
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import BookAppointmentForm from "../components/BookAppointmentForm";
import { get, post, patch, authAPI } from "../utils/api";

const FindDermatologist = () => {
  // State for dermatologists from API
  const [dermatologists, setDermatologists] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(null);

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookModalOpened, setBookModalOpened] = useState(false);

  // User location state
  const [userLocation, setUserLocation] = useState(null);

  // Cancel confirmation modal state
  const [cancelModal, setCancelModal] = useState({
    opened: false,
    appointmentId: null,
    doctorName: ""
  });

  const navigate = useNavigate();

  // Get unique specialties and locations for filter options
  const specialties = useMemo(() => {
    const allSpecialties = dermatologists.map(d => d.specialization);
    return [...new Set(allSpecialties)];
  }, [dermatologists]);

  const locations = useMemo(() => {
    const allLocations = dermatologists.map(d => d.address?.city).filter(Boolean);
    return [...new Set(allLocations)];
  }, [dermatologists]);

  // Filter dermatologists based on search and filter criteria
  const filteredDermatologists = useMemo(() => {
    return dermatologists.filter(dermatologist => {
      const matchesSearch = searchTerm === "" ||
        dermatologist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dermatologist.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dermatologist.hospital.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecialty = selectedSpecialty === "All" ||
        dermatologist.specialization === selectedSpecialty;

      const matchesLocation = selectedLocation === "All" ||
        dermatologist.address?.city === selectedLocation;

      return matchesSearch && matchesSpecialty && matchesLocation;
    });
  }, [dermatologists, searchTerm, selectedSpecialty, selectedLocation]);

  // Function to get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to a central location in India to get all doctors
          setUserLocation({ lat: 20.5937, lon: 78.9629 }); // Center of India
        }
      );
    } else {
      // Default to a central location in India to get all doctors
      setUserLocation({ lat: 20.5937, lon: 78.9629 }); // Center of India
    }
  };

  // Function to fetch dermatologists from API
  const fetchDermatologists = async () => {
    if (!userLocation) return;

    setLoading(true);
    setError(null);

    try {
      // First, try to fetch all doctors without any radius limitation
      const allDoctors = await post('/doctors/nearby/', {
        lat: userLocation.lat,
        lon: userLocation.lon,
        radius: 5000, // Use a very large radius (5000km) to ensure we get all doctors across India
      });

      // Store all doctors for filtering
      setDermatologists(allDoctors);

      // If we still don't have 50 doctors, try a different approach
      if (allDoctors.length < 50) {

        // Try fetching without location parameters
        try {
          const fallbackDoctors = await post('/doctors/nearby/', {
            lat: 20.5937, // Center of India
            lon: 78.9629,
            radius: 10000, // Even larger radius
          });

          if (fallbackDoctors.length > allDoctors.length) {
            setDermatologists(fallbackDoctors);
          }
        } catch (fallbackError) {
          console.error("Fallback approach also failed:", fallbackError);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch dermatologists');
      console.error('Error fetching dermatologists:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch appointments from API
  const fetchAppointments = async () => {
    try {
      const data = await get('/appointments/');
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  // Function to cancel an appointment
  const cancelAppointment = async (appointmentId) => {
    try {
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
      setCancelModal({ opened: false, appointmentId: null, doctorName: "" });

      // Show success message
      setError(null);
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('Failed to cancel appointment. Please try again.');
    }
  };

  // Function to open booking modal
  const openBookingModal = (doctor) => {
    setSelectedDoctor(doctor);
    setBookModalOpened(true);
  };

  // Function to close error alert
  const closeErrorAlert = () => {
    setError(null);
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

  // Format address function
  const formatAddress = (address) => {
    if (!address) return 'Address not available';

    const parts = [
      address.address_line_1,
      address.address_line_2,
      address.city,
      address.state,
      address.pincode
    ];

    return parts.filter(Boolean).join(', ');
  };

  // Format working hours function
  const formatWorkingHours = (workingHours) => {
    if (!workingHours) return 'Working hours not available';

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const formattedHours = [];

    for (const day of days) {
      const hours = workingHours[day];
      if (hours && hours !== 'Closed') {
        formattedHours.push(`${day.charAt(0).toUpperCase() + day.slice(1, 3)}: ${hours}`);
      }
    }

    return formattedHours.join(', ');
  };

  // Check authentication on component mount
  useEffect(() => {
    const isAuth = authAPI.isAuthenticated();
    if (!isAuth) {
      setAuthError('Please log in to access this page');
      return;
    }

    getUserLocation();
  }, []);

  // Fetch dermatologists when location changes (not filters)
  useEffect(() => {
    if (userLocation && authAPI.isAuthenticated()) {
      fetchDermatologists();
    }
  }, [userLocation]); // Removed dependencies on filters to avoid refetching when they change

  // Fetch appointments on component mount
  useEffect(() => {
    if (authAPI.isAuthenticated()) {
      fetchAppointments();
    }
  }, []);

  // Status Badge renderer
  const getStatusBadge = (status) => {
    const statusMap = {
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

  // If not authenticated, show login prompt
  if (!authAPI.isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50 py-20 flex items-center justify-center">
        <Paper withBorder p="xl" radius="md" className="max-w-md w-full">
          <Title order={2} className="text-center text-teal-800 mb-4">
            Authentication Required
          </Title>
          <Text className="text-center mb-6">
            {authError || 'Please log in to access the dermatologist search page.'}
          </Text>
          <Button
            fullWidth
            className="!bg-gradient-to-r !from-red-500 !to-orange-500 !text-white !font-semibold !shadow-lg !shadow-red-400/50 !transform hover:scale-103 !transition-all !duration-300 hover:!bg-gradient-to-r hover:!from-orange-500 hover:!to-red-500 active:!scale-95 active:!shadow-orange-600/50 focus:!outline-none focus:!ring-2 focus:!ring-red-500 focus:!ring-offset-2"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </Paper>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10" style={{ width: '100vw', marginLeft: 'calc(-1 * (100vw - 100%) / 2)' }}>
      {/* Header Section */}
      <div className="text-center mb-8 px-8">
        <Title order={1} className="text-teal-800 mb-4">
          Find a Dermatologist in India
        </Title>
        <Text className="text-gray-600">
          Connect with top-rated dermatologists across India for expert skin care
          and treatment. Book appointments easily through our platform.
        </Text>
      </div>

      {/* Main Content Grid */}
      <div className="px-8">
        <Grid>
          {/* Left Column - Dermatologists Search and List */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            {/* Search and Filter Section */}
            <Paper withBorder p="md" radius="md" className="mb-6 border-teal-100 shadow-sm">
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    placeholder="Search by name, specialty, or hospital"
                    leftSection={<IconSearch size={16} />}
                    radius="md"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.currentTarget.value)}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 3 }}>
                  <Select
                    placeholder="All Specialties"
                    data={["All", ...specialties]}
                    radius="md"
                    value={selectedSpecialty}
                    onChange={setSelectedSpecialty}
                    clearable
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 3 }}>
                  <Select
                    placeholder="All Locations"
                    data={["All", ...locations]}
                    radius="md"
                    value={selectedLocation}
                    onChange={setSelectedLocation}
                    clearable
                  />
                </Grid.Col>
              </Grid>
            </Paper>

            {/* Results count */}
            <Group mb="md">
              <Text c="dimmed">
                Showing {filteredDermatologists.length} of {dermatologists.length} dermatologists
              </Text>
              {dermatologists.length < 50 && (
                <Alert icon={<IconExclamationCircle size={16} />} color="orange" withCloseButton onClose={closeErrorAlert}>
                  Only {dermatologists.length} dermatologists found. Expected: 50.
                </Alert>
              )}
            </Group>

            {/* Error message */}
            {error && (
              <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md" onClose={closeErrorAlert} withCloseButton>
                {error}
              </Alert>
            )}

            {/* Loading overlay */}
            <LoadingOverlay visible={loading} />

            {/* Dermatologists List - Enhanced Cards */}
            <div className="space-y-6">
              {filteredDermatologists.map((dermatologist) => (
                <Card
                  key={dermatologist.id}
                  withBorder
                  radius="md"
                  padding="lg"
                  className="border-teal-100 hover:shadow-md transition-all duration-300 shadow-sm"
                >
                  <Grid>
                    <Grid.Col span={12}>
                      <Group justify="space-between" align="flex-start" mb="md">
                        <div>
                          <Group align="center" mb="xs">
                            <Text fw={700} size="xl" className="text-teal-800">
                              {dermatologist.name}
                            </Text>
                            <Badge
                              color="teal"
                              variant="light"
                              size="sm"
                            >
                              {dermatologist.specialization}
                            </Badge>
                          </Group>

                          <Group mb="xs">
                            <Rating value={4.5} fractions={2} readOnly />
                            <Text fz="xs" c="dimmed">
                              (4.5)
                            </Text>
                          </Group>
                        </div>

                        <div className="text-right">
                          <Group gap="md">
                            {dermatologist.distance_km !== undefined && (
                              <Badge color="blue" variant="light">
                                {dermatologist.distance_km} km away
                              </Badge>
                            )}
                            <Button
                              radius="md"
                              size="sm"
                              className="!bg-gradient-to-r !from-red-500 !to-orange-500 !text-white !font-semibold !shadow-lg !shadow-red-400/50 !transform hover:scale-103 !transition-all !duration-300 hover:!bg-gradient-to-r hover:!from-orange-500 hover:!to-red-500 active:!scale-95 active:!shadow-orange-600/50 focus:!outline-none focus:!ring-2 focus:!ring-red-500 focus:!ring-offset-2"
                              onClick={() => openBookingModal(dermatologist)}
                            >
                              Book Appointment
                            </Button>
                          </Group>
                        </div>
                      </Group>

                      <Divider my="md" />

                      <Accordion>
                        <Accordion.Item value="details">
                          <Accordion.Control>
                            <Group>
                              <IconUser size={16} />
                              <Text fw={600}>Doctor Details</Text>
                            </Group>
                          </Accordion.Control>
                          <Accordion.Panel>
                            <Grid>
                              <Grid.Col span={6}>
                                <Group mb="xs" wrap="nowrap">
                                  <IconBriefcase size={14} className="text-teal-600 flex-shrink-0" />
                                  <Text fz="sm"><span className="font-medium">Hospital:</span> {dermatologist.hospital}</Text>
                                </Group>

                                <Group mb="xs" wrap="nowrap">
                                  <IconUser size={14} className="text-teal-600 flex-shrink-0" />
                                  <Text fz="sm"><span className="font-medium">Experience:</span> {dermatologist.years_of_experience} years</Text>
                                </Group>

                                <Group mb="xs" wrap="nowrap">
                                  <IconPhone size={14} className="text-teal-600 flex-shrink-0" />
                                  <Text fz="sm"><span className="font-medium">Phone:</span> {dermatologist.phone || "Not available"}</Text>
                                </Group>

                                <Box mb="xs">
                                  <Group wrap="nowrap" mb={2}>
                                    <IconSchool size={14} className="text-teal-600 flex-shrink-0" />
                                    <Text fz="sm"><span className="font-medium">Qualifications:</span></Text>
                                  </Group>
                                  <Text fz="sm" pl={28}>{dermatologist.qualifications}</Text>
                                </Box>
                              </Grid.Col>

                              <Grid.Col span={6}>
                                <Group mb="xs" wrap="nowrap">
                                  <IconCertificate size={14} className="text-teal-600 flex-shrink-0" />
                                  <Text fz="sm"><span className="font-medium">License:</span> {dermatologist.license_number}</Text>
                                </Group>

                                <Box mb="xs">
                                  <Group wrap="nowrap" mb={2}>
                                    <IconClock size={14} className="text-teal-600 flex-shrink-0" />
                                    <Text fz="sm"><span className="font-medium">Working Hours:</span></Text>
                                  </Group>
                                  <Text fz="sm" pl={28}>{formatWorkingHours(dermatologist.working_hours)}</Text>
                                </Box>
                              </Grid.Col>
                            </Grid>
                          </Accordion.Panel>
                        </Accordion.Item>

                        <Accordion.Item value="address">
                          <Accordion.Control>
                            <Group>
                              <IconMapPin size={16} />
                              <Text fw={600}>Clinic Address</Text>
                            </Group>
                          </Accordion.Control>
                          <Accordion.Panel>
                            <Group mb="xs" wrap="nowrap">
                              <IconBuildingHospital size={14} className="text-teal-600 flex-shrink-0" />
                              <Text fz="sm">{formatAddress(dermatologist.address)}</Text>
                            </Group>

                            {dermatologist.address?.landmark && (
                              <Group mb="xs" wrap="nowrap">
                                <IconAddressBook size={14} className="text-teal-600 flex-shrink-0" />
                                <Text fz="sm"><span className="font-medium">Landmark:</span> {dermatologist.address.landmark}</Text>
                              </Group>
                            )}
                          </Accordion.Panel>
                        </Accordion.Item>
                      </Accordion>
                    </Grid.Col>
                  </Grid>
                </Card>
              ))}
            </div>

            {/* No results message */}
            {filteredDermatologists.length === 0 && !loading && (
              <Paper withBorder p="xl" radius="md" className="text-center border-teal-100">
                <Text c="dimmed">No dermatologists match your search criteria. Please try different filters.</Text>
              </Paper>
            )}
          </Grid.Col>

          {/* Right Column - Appointments */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper withBorder p="md" radius="md" className="border-teal-100 h-full shadow-sm">
              <Group justify="space-between" mb="md">
                <Title order={3} className="text-teal-800">
                  Your Appointments
                </Title>
                <Badge color="teal" variant="light">
                  {appointments.length}
                </Badge>
              </Group>

              <Divider my="md" />

              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <Card
                      key={appointment.id}
                      withBorder
                      padding="md"
                      radius="md"
                      className="border-lavender-100 bg-lavender-50/30"
                    >
                      <Group mb="xs">
                        <IconUserCircle size={20} className="text-teal-600" />
                        <Text fw={600} className="text-teal-800">
                          Dr. {appointment.doctor.name}
                        </Text>
                      </Group>

                      <Text size="xs" c="dimmed" mb="xs">
                        {appointment.doctor.specialization}
                      </Text>

                      <Group mb="xs">
                        <IconCalendar size={14} className="text-teal-600" />
                        <Text size="sm">{new Date(appointment.date).toLocaleDateString()}</Text>
                      </Group>

                      <Group mb="xs">
                        <IconClock size={14} className="text-teal-600" />
                        <Text size="sm">{appointment.time_slot}</Text>
                      </Group>

                      <Group mb="xs">
                        <IconBriefcase size={14} className="text-teal-600" />
                        <Text size="sm">{appointment.doctor.hospital}</Text>
                      </Group>

                      <Group justify="space-between" mt="md">
                        {getStatusBadge(appointment.status)}
                        {appointment.status === 'booked' && (
                          <Button
                            variant="outline"
                            color="red"
                            size="xs"
                            radius="md"
                            onClick={() => openCancelModal(appointment.id, appointment.doctor.name)}
                          >
                            Cancel
                          </Button>
                        )}
                      </Group>
                    </Card>
                  ))}
                </div>
              ) : (
                <Paper withBorder p="md" radius="md" className="text-center border-teal-100 bg-teal-50/30">
                  <Text c="dimmed">You don't have any upcoming appointments.</Text>
                  <Button
                    variant="subtle"
                    color="teal"
                    size="sm"
                    mt="md"
                    radius="md"
                  >
                    Book an Appointment
                  </Button>
                </Paper>
              )}
            </Paper>
          </Grid.Col>
        </Grid>
      </div>

      {/* Book Appointment Modal */}
      {selectedDoctor && (
        <BookAppointmentForm
          opened={bookModalOpened}
          onClose={() => setBookModalOpened(false)}
          doctor={selectedDoctor}
          onAppointmentBooked={fetchAppointments}
        />
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        opened={cancelModal.opened}
        onClose={closeCancelModal}
        withOverlay={false}
        title={
          <Group>
            <IconExclamationCircle color="orange" size={24} />
            <Text fw={600}>Confirm Cancellation</Text>
          </Group>
        }
        size="md"
        centered
      >
        <Text mb="lg">
          Are you sure you want to cancel your appointment with <span className="font-semibold">Dr. {cancelModal.doctorName}</span>?
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="outline" onClick={closeCancelModal}>
            Keep Appointment
          </Button>
          <Button
            color="red"
            onClick={() => cancelAppointment(cancelModal.appointmentId)}
            className="!bg-gradient-to-r !from-red-500 !to-orange-500 !text-white !font-semibold !shadow-lg !shadow-red-400/50 !transform hover:scale-103 !transition-all !duration-300 hover:!bg-gradient-to-r hover:!from-orange-500 hover:!to-red-500 active:!scale-95 active:!shadow-orange-600/50 focus:!outline-none focus:!ring-2 focus:!ring-red-500 focus:!ring-offset-2"
          >
            Confirm Cancellation
          </Button>
        </Group>
      </Modal>
    </div>
  );
};

export default FindDermatologist;