import { useState, useEffect } from 'react';
import {
  Modal,
  Title,
  Text,
  Button,
  Group,
  Paper,
  Divider,
  Badge,
  Grid,
  Box,
  LoadingOverlay,
  Alert,
  Menu,
  ScrollArea
} from '@mantine/core';
import {
  IconCheck,
  IconAlertCircle,
  IconChevronDown,
  IconLock
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { post, get } from '../utils/api';
import { DateTime } from 'luxon';

const BookAppointmentForm = ({ opened, onClose, doctor, onAppointmentBooked }) => {
  const [loading, setLoading] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    patientName: '',
    patientContact: '',
    reason: '',
    paymentMethod: 'cash'
  });
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [bookedTimeSlots, setBookedTimeSlots] = useState([]);
  const [error, setError] = useState(null);

  // Parse doctor's working hours
  const workingHours = doctor.working_hours || {};

  // Parse working hours in format "10:00 AM - 5:00 PM" to { start: "10:00", end: "17:00" }
  const parseWorkingHours = (hoursString) => {
    if (hoursString === "Closed") return null;

    const parts = hoursString.split(' - ');
    if (parts.length !== 2) return null;

    const parseTime = (timeStr) => {
      const [time, period] = timeStr.trim().split(' ');
      let [hours, minutes] = time.split(':').map(Number);

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    return {
      start: parseTime(parts[0]),
      end: parseTime(parts[1])
    };
  };

  // Get available days from working hours in order
  const getOrderedAvailableDays = () => {
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const availableDays = Object.keys(workingHours)
      .filter(day => workingHours[day] !== "Closed")
      .map(day => day.charAt(0).toUpperCase() + day.slice(1, 3)); // e.g., "monday" -> "Mon"

    // Sort days according to the week order
    return availableDays.sort((a, b) => {
      const aIndex = dayOrder.indexOf(a.toLowerCase());
      const bIndex = dayOrder.indexOf(b.toLowerCase());
      return aIndex - bIndex;
    });
  };

  // Generate dates for the next 2 weeks for available days
  const generateAvailableDates = () => {
    const dates = [];
    const today = DateTime.now();
    const orderedDays = getOrderedAvailableDays();

    for (let i = 0; i < 14; i++) {
      const date = today.plus({ days: i });
      // Get abbreviated day name (e.g., "Mon")
      const dayName = date.toFormat('EEE');

      // Check if this day is in the list of available days (case-insensitive)
      if (orderedDays.some(day => day.toLowerCase() === dayName.toLowerCase())) {
        dates.push({
          value: date.toFormat('yyyy-MM-dd'),
          label: date.toFormat('EEE, MMM dd'),
          dayName: dayName
        });
      }
    }

    return dates;
  };

  // Generate time slots based on doctor's working hours
  const generateTimeSlots = (selectedDate) => {
    if (!selectedDate) return [];

    const dateObj = DateTime.fromISO(selectedDate);
    // Get full day name (e.g., "Monday") and convert to lowercase to match working_hours keys
    const dayName = dateObj.toFormat('EEEE').toLowerCase();
    const hoursString = workingHours[dayName];

    if (!hoursString || hoursString === "Closed") return [];

    const parsedHours = parseWorkingHours(hoursString);
    if (!parsedHours) return [];

    const { start, end } = parsedHours;
    const slots = [];

    // Parse start and end times
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    // Generate 30-minute slots
    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      const displayTime = DateTime.fromObject({ hour: currentHour, minute: currentMinute }).toFormat('hh:mm a');

      slots.push({
        value: timeString,
        label: displayTime
      });

      // Add 30 minutes
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }

    return slots;
  };

  // Fetch booked appointments for the selected doctor and date
  const fetchBookedAppointments = async (doctorId, date) => {
    if (!doctorId || !date) return;

    try {
      // Use the appointments endpoint with query parameters for doctor_id and date
      const response = await get(`/appointments/?doctor_id=${doctorId}&date=${date}`);

      // Process the response to get booked time slots
      const bookedSlots = response
        .filter(appt => appt.status === 'booked')
        .map(appt => {
          // Convert time from "HH:MM:SS" format to "HH:MM" for comparison
          if (appt.time_slot) {
            const timeParts = appt.time_slot.split(':');
            if (timeParts.length >= 2) {
              const timeSlot = `${timeParts[0]}:${timeParts[1]}`;
              return timeSlot;
            }
          }
          return null;
        })
        .filter(Boolean); // Remove any null values

      setBookedTimeSlots(bookedSlots);
    } catch (err) {
      console.error('Error fetching booked appointments:', err);
      setBookedTimeSlots([]);
    }
  };

  // Update available dates when doctor changes
  useEffect(() => {
    if (opened && doctor) {
      const dates = generateAvailableDates();
      setAvailableDates(dates);

      // Reset form data
      setAppointmentData({
        date: '',
        time: '',
        patientName: '',
        patientContact: '',
        reason: '',
        paymentMethod: 'cash'
      });
      setBookedTimeSlots([]);
      setError(null);
    }
  }, [opened, doctor]);

  // Update available time slots when date changes
  useEffect(() => {
    if (appointmentData.date) {
      const slots = generateTimeSlots(appointmentData.date);
      setAvailableTimeSlots(slots);

      // Fetch booked appointments for this date
      fetchBookedAppointments(doctor.id, appointmentData.date);

      // Reset time if previously selected
      setAppointmentData(prev => ({ ...prev, time: '' }));
    } else {
      setAvailableTimeSlots([]);
      setBookedTimeSlots([]);
    }
  }, [appointmentData.date]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!appointmentData.date || !appointmentData.time) {
      setError('Please select both date and time for your appointment');
      return;
    }

    // Check if the selected time slot is already booked
    if (bookedTimeSlots.includes(appointmentData.time)) {
      setError('This time slot is already booked. Please select a different time.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format time to HH:MM:SS for backend compatibility
      const formattedTime = `${appointmentData.time}:00`;

      const response = await post('/appointments/', {
        doctor_id: doctor.id,
        date: appointmentData.date,
        time_slot: formattedTime,
      });

      notifications.show({
        title: 'Appointment Booked',
        message: `Your appointment with Dr. ${doctor.name} has been confirmed for ${DateTime.fromISO(appointmentData.date).toFormat('MMM dd, yyyy')} at ${DateTime.fromFormat(appointmentData.time, 'HH:mm').toFormat('hh:mm a')}`,
        color: 'teal',
        icon: <IconCheck size={16} />
      });

      // Refresh appointments list
      onAppointmentBooked();
      onClose();
    } catch (err) {
      // Extract detailed error message from backend response
      let errorMessage = 'Failed to book appointment';

      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.data) {
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          } else if (err.response.data.detail) {
            errorMessage = err.response.data.detail;
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          } else if (err.response.data.error) {
            errorMessage = err.response.data.error;
          }
        }
        console.error('Backend error response:', err.response.data);
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = err.message;
      }

      setError(errorMessage);
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setAppointmentData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  // Close error alert
  const closeErrorAlert = () => {
    setError(null);
  };

  // Custom Date Selector Component
  const DateSelector = () => (
    <Box>
      <Text size="sm" fw={500} mb="xs">Available Date</Text>
      <Menu
        shadow="md"
        width={200}
        position="bottom"
        withArrow
        trigger="click"
        closeOnItemClick
        withinPortal={true}
        styles={{
          dropdown: {
            zIndex: 10001, // Higher than modal
          }
        }}
      >
        <Menu.Target>
          <Button
            variant="outline"
            fullWidth
            rightSection={<IconChevronDown size={14} />}
            style={{ textAlign: 'left' }}
          >
            {appointmentData.date
              ? availableDates.find(d => d.value === appointmentData.date)?.label || 'Select a date'
              : 'Select a date'}
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <ScrollArea h={200}>
            {availableDates.length > 0 ? (
              availableDates.map((date) => (
                <Menu.Item
                  key={date.value}
                  onClick={() => handleInputChange('date', date.value)}
                >
                  {date.label}
                </Menu.Item>
              ))
            ) : (
              <Text size="sm" p="xs" c="dimmed">No available dates</Text>
            )}
          </ScrollArea>
        </Menu.Dropdown>
      </Menu>
      {availableDates.length === 0 && (
        <Text size="xs" c="red" mt="xs">No available dates in the next 2 weeks</Text>
      )}
      {availableDates.length > 0 && (
        <Text size="xs" c="dimmed" mt="xs">
          Available on: {getOrderedAvailableDays().join(', ')}
        </Text>
      )}
    </Box>
  );

  // Custom Time Selector Component
  const TimeSelector = () => (
    <Box>
      <Text size="sm" fw={500} mb="xs">Available Time</Text>
      <Menu
        shadow="md"
        width={200}
        position="bottom"
        withArrow
        trigger="click"
        closeOnItemClick
        disabled={!appointmentData.date}
        withinPortal={true}
        styles={{
          dropdown: {
            zIndex: 10001, // Higher than modal
          }
        }}
      >
        <Menu.Target>
          <Button
            variant="outline"
            fullWidth
            rightSection={<IconChevronDown size={14} />}
            style={{ textAlign: 'left' }}
            disabled={!appointmentData.date}
          >
            {appointmentData.time
              ? availableTimeSlots.find(t => t.value === appointmentData.time)?.label || 'Select a time'
              : 'Select a time'}
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <ScrollArea h={200}>
            {availableTimeSlots.length > 0 ? (
              availableTimeSlots.map((time) => {
                const isBooked = bookedTimeSlots.includes(time.value);
                return (
                  <Menu.Item
                    key={time.value}
                    onClick={() => !isBooked && handleInputChange('time', time.value)}
                    disabled={isBooked}
                    leftSection={isBooked ? <IconLock size={14} /> : null}
                    c={isBooked ? "dimmed" : undefined}
                    bg={isBooked ? "red.0" : undefined}
                  >
                    <Group justify="space-between">
                      <Text>{time.label}</Text>
                      {isBooked && <Badge size="xs" color="red">Booked</Badge>}
                    </Group>
                  </Menu.Item>
                );
              })
            ) : (
              <Text size="sm" p="xs" c="dimmed">
                {appointmentData.date ? 'No available time slots' : 'Select a date first'}
              </Text>
            )}
          </ScrollArea>
        </Menu.Dropdown>
      </Menu>
      {appointmentData.date && availableTimeSlots.length === 0 && (
        <Text size="xs" c="red" mt="xs">No available time slots for selected date</Text>
      )}
      {appointmentData.date && availableTimeSlots.length > 0 && (
        <Text size="xs" c="dimmed" mt="xs">
          Working hours: {workingHours[DateTime.fromISO(appointmentData.date).toFormat('EEEE').toLowerCase()]}
        </Text>
      )}
    </Box>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="lg" fw={600}>Book Appointment with {doctor.name}</Text>
      }
      size="lg"
      padding="xl"
      withinPortal={true}
      zIndex={9999}
      trapFocus={true}
      returnFocus={true}
      closeOnClickOutside={false}
      closeOnEscape={false}
      centered
      styles={{
        modal: {
          zIndex: 9999,
        },
        inner: {
          zIndex: 9999,
        },
        content: {
          zIndex: 9999,
        }
      }}
    >
      <LoadingOverlay visible={loading} />

      <Box pos="relative" style={{ zIndex: 10000 }}>
        <Paper withBorder p="md" radius="md" mb="md">
          <Group>
            <div>
              <Text fw={600}>{doctor.name}</Text>
              <Text size="sm" c="dimmed">{doctor.specialization}</Text>
              <Text size="sm" c="dimmed">{doctor.hospital}</Text>
            </div>
            <Badge color="teal">{doctor.years_of_experience} years experience</Badge>
          </Group>
        </Paper>

        {/* Error alert */}
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md" onClose={closeErrorAlert} withCloseButton>
            {error}
          </Alert>
        )}

        <Divider my="md" />

        <form onSubmit={handleSubmit}>
          <Grid>
            <Grid.Col span={12}>
              <Title order={4} mb="md" className="text-teal-800">
                Select Date & Time
              </Title>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <DateSelector />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <TimeSelector />
            </Grid.Col>
          </Grid>

          <Divider my="md" />

          <Group justify="space-between" mt="md">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="!bg-gradient-to-r !from-red-500 !to-orange-500 !text-white !font-semibold !shadow-lg !shadow-red-400/50 !transform hover:scale-103 !transition-all !duration-300 hover:!bg-gradient-to-r hover:!from-orange-500 hover:!to-red-500 active:!scale-95 active:!shadow-orange-600/50 focus:!outline-none focus:!ring-2 focus:!ring-red-500 focus:!ring-offset-2"
            >
              Confirm Booking
            </Button>
          </Group>
        </form>
      </Box>
    </Modal>
  );
};

export default BookAppointmentForm;