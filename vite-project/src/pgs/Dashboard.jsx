import React, { useState } from 'react';
import { 
  Text, 
  Title, 
  Button, 
  Container, 
  Group, 
  Paper, 
  SimpleGrid, 
  ThemeIcon, 
  Image, 
  Card,
  Badge,
  Tabs,
  ActionIcon,
  Avatar,
  Menu,
  Grid,
  RingProgress
} from '@mantine/core';
import { 
  IconChartLine, 
  IconCalendarStats, 
  IconFileAnalytics, 
  IconDotsVertical, 
  IconUpload,
  IconDownload,
  IconShare,
  IconTrash,
  IconChevronRight,
  IconCircleCheck,
  IconAlertTriangle,
  IconClock,
  IconUser,
  IconUserCircle
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock user data
  const user = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    memberSince: "Jan 2024",
    profileImage: null
  };
  
  // Mock skin analyses history
  const analysisHistory = [
    {
      id: "A12345",
      date: "Feb 28, 2025",
      area: "Left Forearm",
      prediction: "Melanoma",
      confidence: 87.5,
      risk: "High",
      status: "Urgent",
      image: "/analysis1.jpg",
      seen: true
    },
    {
      id: "A12344",
      date: "Feb 15, 2025",
      area: "Back",
      prediction: "Acne Vulgaris",
      confidence: 94.2,
      risk: "Low",
      status: "Normal",
      image: "/analysis2.jpg",
      seen: true
    },
    {
      id: "A12343",
      date: "Jan 30, 2025",
      area: "Scalp",
      prediction: "Seborrheic Dermatitis",
      confidence: 91.7,
      risk: "Low",
      status: "Normal",
      image: "/analysis3.jpg",
      seen: true
    },
    {
      id: "A12342",
      date: "Jan 10, 2025",
      area: "Face",
      prediction: "Rosacea",
      confidence: 89.3,
      risk: "Medium",
      status: "Follow-up",
      image: "/analysis4.jpg",
      seen: false
    }
  ];
  
  // Stats data
  const stats = [
    {
      title: "Analyses",
      value: "12",
      description: "Total skin analyses",
      icon: IconFileAnalytics,
      color: "teal"
    },
    {
      title: "High Risk",
      value: "1",
      description: "Requiring attention",
      icon: IconAlertTriangle,
      color: "coral"
    },
    {
      title: "Follow-ups",
      value: "3",
      description: "Scheduled checkups",
      icon: IconCalendarStats,
      color: "lavender"
    },
    {
      title: "Resolved",
      value: "8",
      description: "Conditions resolved",
      icon: IconCircleCheck,
      color: "green"
    }
  ];
  
  // Risk distribution for chart
  const riskDistribution = [
    { value: 25, color: '#FF6B6B', label: 'High' },
    { value: 33, color: '#FFCC5C', label: 'Medium' },
    { value: 42, color: '#4ECDC4', label: 'Low' }
  ];
  
  const upcomingAppointments = [
    {
      doctor: "Dr. Sarah Chen",
      specialty: "Dermatologist",
      date: "Mar 10, 2025",
      time: "10:30 AM",
      location: "Greenwood Medical Center"
    }
  ];
  
  // Status Badge renderer
  const getStatusBadge = (status) => {
    const statusMap = {
      'Urgent': { color: 'red', label: 'Urgent' },
      'Follow-up': { color: 'yellow', label: 'Follow-up' },
      'Normal': { color: 'green', label: 'Normal' },
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
  const getRiskBadge = (risk) => {
    const riskMap = {
      'High': { color: 'red', label: 'High Risk' },
      'Medium': { color: 'yellow', label: 'Medium Risk' },
      'Low': { color: 'green', label: 'Low Risk' },
    };
    
    const riskInfo = riskMap[risk] || { color: 'gray', label: risk };
    
    return (
      <Badge 
        color={riskInfo.color}
        variant="filled"
        size="sm"
      >
        {riskInfo.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <Container size="lg">
        {/* Header with user info */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <Avatar 
              size="lg" 
              radius="xl" 
              color="teal"
              fallback={<IconUserCircle size={36} stroke={1.5} />}
              className="mr-4 border-2 border-white shadow-sm"
            />
            <div>
              <Title order={2} className="text-teal-800">
                Welcome back, {user.name}
              </Title>
              <Text size="sm" className="text-gray-500">
                Member since {user.memberSince} • {user.email}
              </Text>
            </div>
          </div>
          <Button 
            component={Link}
            to="/upload"
            rightSection={<IconUpload size={16} />}
            className="bg-coral-500 hover:bg-coral-600"
          >
            New Analysis
          </Button>
        </div>
        
        {/* Tabs Navigation */}
        <Tabs 
          value={activeTab} 
          onChange={setActiveTab}
          radius="md"
          className="mb-8"
        >
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<IconChartLine size={16} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="history" leftSection={<IconFileAnalytics size={16} />}>
              Analysis History
            </Tabs.Tab>
            <Tabs.Tab value="appointments" leftSection={<IconCalendarStats size={16} />}>
              Appointments
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
        
        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" className="mb-8">
              {stats.map((stat) => (
                <Paper
                  key={stat.title}
                  withBorder
                  p="md"
                  radius="md"
                  className="border-teal-100"
                >
                  <Group>
                    <ThemeIcon 
                      size={48} 
                      radius="md" 
                      variant="light"
                      className={`bg-${stat.color}-100 text-${stat.color}-700`}
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
                  className="border-teal-100 h-full"
                >
                  <Group justify="space-between" className="mb-4">
                    <Title order={3} className="text-teal-800">
                      Recent Analyses
                    </Title>
                    <Button 
                      variant="subtle"
                      rightSection={<IconChevronRight size={16} />}
                      component={Link}
                      to="#"
                      onClick={() => setActiveTab('history')}
                      className="text-teal-700"
                    >
                      View All
                    </Button>
                  </Group>
                  
                  {analysisHistory.slice(0, 3).map((analysis) => (
                    <Card 
                      key={analysis.id}
                      withBorder
                      mb="md"
                      padding="md"
                      radius="md"
                      className="border-teal-50 hover:border-teal-200 transition-colors"
                    >
                      <Group>
                        <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                          <Image
                            src={analysis.image}
                            alt={analysis.area}
                            className="w-full h-full object-cover"
                            fallbackSrc={`https://via.placeholder.com/100x100/teal/ffffff?text=${analysis.area}`}
                          />
                        </div>
                        <div className="flex-grow">
                          <Group position="apart">
                            <div>
                              <Text fw={600} className="text-teal-800">
                                {analysis.prediction}
                              </Text>
                              <Text size="sm" className="text-gray-600">
                                {analysis.area} • {analysis.date}
                              </Text>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getStatusBadge(analysis.status)}
                              <Text size="sm" className="text-gray-600">
                                ID: {analysis.id}
                              </Text>
                            </div>
                          </Group>
                        </div>
                        <ActionIcon variant="subtle" color="gray">
                          <IconChevronRight size={18} />
                        </ActionIcon>
                      </Group>
                    </Card>
                  ))}
                </Paper>
              </Grid.Col>
              
              {/* Risk Distribution & Appointments */}
              <Grid.Col span={{ base: 12, md: 4 }}>
                <SimpleGrid cols={1} spacing="lg">
                  {/* Risk Distribution */}
                  <Paper 
                    withBorder 
                    p="lg" 
                    radius="md" 
                    className="border-teal-100"
                  >
                    <Title order={4} className="text-teal-800 mb-4">
                      Risk Distribution
                    </Title>
                    <div className="flex items-center justify-center py-2">
                      <RingProgress
                        size={160}
                        thickness={18}
                        roundCaps
                        sections={riskDistribution}
                        label={(
                          <Text size="sm" ta="center" className="text-gray-700">
                            Total<br />
                            <Text size="xl" fw={700} className="text-teal-800">
                              12
                            </Text>
                            analyses
                          </Text>
                        )}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      {riskDistribution.map((item) => (
                        <div key={item.label} className="text-center">
                          <div 
                            className="w-3 h-3 rounded-full mx-auto mb-1" 
                            style={{ backgroundColor: item.color }} 
                          />
                          <Text size="xs" className="text-gray-600">
                            {item.label}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </Paper>
                  
                  {/* Upcoming Appointments */}
                  <Paper 
                    withBorder 
                    p="lg" 
                    radius="md" 
                    className="border-teal-100"
                  >
                    <Title order={4} className="text-teal-800 mb-4">
                      Upcoming Appointments
                    </Title>
                    
                    {upcomingAppointments.length > 0 ? (
                      upcomingAppointments.map((appointment, index) => (
                        <Card 
                          key={index} 
                          withBorder
                          padding="md"
                          radius="md"
                          className="border-lavender-100 bg-lavender-50/30"
                        >
                          <Group>
                            <ThemeIcon 
                              size={40} 
                              radius="xl" 
                              className="bg-lavender-100 text-lavender-700"
                            >
                              <IconClock size={22} />
                            </ThemeIcon>
                            <div className="flex-grow">
                              <Text size="sm" className="text-gray-800">
                                {appointment.doctor}
                              </Text>
                              <Text size="xs" className="text-gray-600">
                                {appointment.specialty}
                              </Text>
                              <Text size="sm" className="text-teal-700">
                                {appointment.date} • {appointment.time}
                              </Text>
                              <Text size="sm" className="text-gray-500">
                                {appointment.location}
                              </Text>
                            </div>
                          </Group>
                        </Card>
                      ))
                    ) : (
                      <Text size="sm" color="gray">No upcoming appointments.</Text>
                    )}
                  </Paper>
                </SimpleGrid>
              </Grid.Col>
            </Grid>
          </>
        )}
      </Container>
    </div>
  );
};

export default Dashboard;
