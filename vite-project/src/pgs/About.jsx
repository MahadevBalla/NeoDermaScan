import React from 'react';
import {
  Text,
  Title,
  Container,
  Group,
  Paper,
  SimpleGrid,
  ThemeIcon,
  Box,
  Avatar,
  Accordion,
  Timeline,
  Image,
  Button,
  rem
} from '@mantine/core';
import {
  IconMicroscope,
  IconBrain,
  IconHeartHandshake,
  IconShieldLock,
  IconCalendarStats,
  IconCertificate,
  IconUserCircle
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';

const About = () => {
  const team = [
    {
      name: "Dr. David Daniels",
      title: "Chief Medical Officer",
      image: "/team-david.jpg",
      fallback: "https://via.placeholder.com/200/teal/ffffff?text=SC",
      bio: "Board-certified dermatologist with 15+ years of clinical experience and a passion for technology's role in healthcare."
    },
    {
      name: "Paarth Maha Dih",
      title: "Lead AI Engineer",
      image: "/team-paarth2.jpg",
      fallback: "https://via.placeholder.com/200/teal/ffffff?text=MR",
      bio: "ML specialist with background in computer vision and medical imaging analysis from Stanford University."
    },
    {
      name: "Dr. Mahadev Balla",
      title: "Research Director",
      image: "/team-mahadev.jpg",
      fallback: "https://via.placeholder.com/200/teal/ffffff?text=AP",
      bio: "PhD in Medical Informatics with extensive research on machine learning applications in dermatological diagnostics."
    },
    {
      name: "Vedaant Mahale",
      title: "Product Director",
      image: "/team-vedaant2.jpg",
      fallback: "https://via.placeholder.com/200/teal/ffffff?text=DK",
      bio: "Former healthcare product lead with experience designing intuitive medical technology interfaces."
    },
  ];

  const values = [
    {
      icon: IconMicroscope,
      title: 'Scientific Rigor',
      description: 'We base all our technology on peer-reviewed science and maintain the highest standards of accuracy.',
    },
    {
      icon: IconBrain,
      title: 'Continuous Learning',
      description: 'Our algorithms are constantly improving through ongoing research and development.',
    },
    {
      icon: IconHeartHandshake,
      title: 'Patient-Centered',
      description: "'We design every feature with patients' needs, concerns, and experiences in mind.'",
    },
    {
      icon: IconShieldLock,
      title: 'Ethical AI',
      description: 'We maintain strict ethical guidelines for how AI is developed and implemented in healthcare.',
    },
  ];

  const faqs = [
    {
      question: "How accurate is the skin analysis?",
      answer: "Our AI system has been clinically validated with an accuracy rate of over 91% for common skin conditions, comparable to board-certified dermatologists. However, our tool is meant to be an assistive technology and not a replacement for professional medical diagnosis."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take your privacy seriously. All images are encrypted, and we comply with HIPAA regulations. Your data is never sold to third parties, and you can request deletion at any time. Images are only used to provide you with analysis and, with explicit permission, to improve our algorithms."
    },
    {
      question: "How should I take photos for best results?",
      answer: "For optimal results, take photos in natural daylight (not direct sunlight), make sure the affected area is clearly visible and in focus, include a size reference if possible (like a coin), and take multiple angles if the condition appears different from different perspectives."
    },
    {
      question: "What skin conditions can your AI detect?",
      answer: "Our system can currently identify potential indicators of over 50 common skin conditions, including acne, rosacea, eczema, psoriasis, and various forms of skin cancer including melanoma. We're constantly expanding our capabilities through ongoing research."
    },
    {
      question: "How soon should I expect results?",
      answer: "Analysis is typically completed within 15-30 seconds after uploading your image. You'll receive a notification when your results are ready to view."
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-24 rounded-2xl mx-2">
        <Container size="lg">
          <div className="max-w-3xl">
            <Title className="text-4xl md:text-5xl font-bold mb-6">
              Our Mission: Early Detection Saves Lives
            </Title>
            <Text className="text-xl text-white/90 mb-8 leading-relaxed my-2">
              We're leveraging artificial intelligence to make professional-quality skin analysis accessible to everyone, anywhere. By detecting potential issues early, we help people take control of their skin health and seek appropriate care when needed.
            </Text>
            <Group className='mt-2'>
              <ThemeIcon
                color='orange'
                size={60}
                radius="md"
                className="bg-white/20 backdrop-blur-sm !bg-gradient-to-r !from-red-500 !to-orange-500 !text-white !font-semibold !shadow-lg !shadow-red-400/50 !transform !transition-all !duration-300 hover:!bg-gradient-to-r hover:!from-orange-500 hover:!to-red-500 
    active:!scale-95 active:!shadow-orange-600/50 focus:!outline-none focus:!ring-2 focus:!ring-red-500 focus:!ring-offset-2 my-2"
              >
                <IconCertificate size={30} className="text-white" />
              </ThemeIcon>
              <div>
                <Text fw={700} className="text-white">Clinically Validated</Text>
                <Text className="text-white/80">91% accuracy rate on common skin conditions</Text>
              </div>
            </Group>
          </div>
        </Container>
      </div>

      {/* Our Story Section */}
      <Container size="lg" className="py-20">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={50}>
          <div>
            <Title order={2} className="text-teal-800 mb-6">
              Our Story
            </Title>
            <Text className="text-gray-600 mb-4 leading-relaxed">
              Founded in 2022 by a team of dermatologists, AI researchers, and healthcare technology experts, our platform was born from a shared vision: making early skin disease detection accessible to everyone.
            </Text>
            <Text className="text-gray-600 mb-4 leading-relaxed">
              After witnessing how delayed diagnosis affected patient outcomes, Dr. Sarah Chen partnered with AI specialist Michael Rodriguez to develop an algorithm that could match dermatologists' diagnostic abilities.
            </Text>
            <Text className="text-gray-600 mb-6 leading-relaxed">
              Today, our technology has analyzed over 500,000 skin images and helped countless users identify potential skin conditions early, when treatment is most effective.
            </Text>

            <Timeline className='mt-4' color="orange" radius="md" active={3} bulletSize={28} lineWidth={3}>
              <Timeline.Item bullet={<IconCalendarStats size={12} />} title="2022">
                <Text size="sm" className="text-gray-600">
                  Company founded, initial AI research begins
                </Text>
              </Timeline.Item>

              <Timeline.Item bullet={<IconCalendarStats size={12} />} title="2023">
                <Text size="sm" className="text-gray-600">
                  First clinical validation study completed with 87% accuracy
                </Text>
              </Timeline.Item>

              <Timeline.Item bullet={<IconCalendarStats size={12} />} title="2024">
                <Text size="sm" className="text-gray-600">
                  Platform launch, partnerships with 5 leading hospitals
                </Text>
              </Timeline.Item>

              <Timeline.Item bullet={<IconCalendarStats size={12} />} title="2025">
                <Text size="sm" className="text-gray-600">
                  Algorithm accuracy reaches 91%, mobile app released
                </Text>
              </Timeline.Item>
            </Timeline>
          </div>

          <div className="flex items-center">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/about-team.jpg"
                alt="Our team of medical professionals and engineers"
                className="w-full h-auto"
                fallbackSrc="https://via.placeholder.com/600x400/teal/ffffff?text=OurTeam"
              />
            </div>
          </div>
        </SimpleGrid>
      </Container>

      {/* Our Values */}
      <div className="bg-gray-50 py-20">
        <Container size="lg">
          <Title order={2} className="text-teal-800 text-center mb-4">
            Our Values
          </Title>
          <Text className="text-gray-600 text-center w-full mx-auto mb-16">
            These core principles guide everything we do, from how we develop our technology to how we interact with users.
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" className='mt-4'>
            {values.map((value) => (
              <Paper
                key={value.title}
                withBorder
                p="xl"
                radius="md"
                className="hover:shadow-lg transition-shadow border-teal-50 flex"
              >
                <ThemeIcon
                  color='orange'
                  size={60}
                  radius="md"
                  className="mb-4 !bg-gradient-to-r !from-red-500 !to-orange-500 !text-white !font-semibold !shadow-lg !shadow-red-400/50 !transform !transition-all !duration-300 hover:!bg-gradient-to-r hover:!from-orange-500 hover:!to-red-500 
    active:!scale-95 active:!shadow-orange-600/50 focus:!outline-none focus:!ring-2 focus:!ring-red-500 focus:!ring-offset-2 bg-teal-100 text-teal-700 mr-4 flex-shrink-0"
                >
                  <value.icon size={26} stroke={1.5} />
                </ThemeIcon>
                <div>
                  <Title order={4} className="mb-2 text-teal-800">
                    {value.title}
                  </Title>
                  <Text className="text-gray-600 leading-relaxed">
                    {value.description}
                  </Text>
                </div>
              </Paper>
            ))}
          </SimpleGrid>
        </Container>
      </div>

      {/* Team Section */}
      <Container size="lg" className="py-20">
        <Title order={2} className="text-teal-800 text-center mb-4">
          Meet Our Team
        </Title>
        <Text className="text-gray-600 text-center w-full mx-auto mb-16">
          Our multidisciplinary team brings together expertise in dermatology, artificial intelligence, and healthcare technology.
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl" className='mt-4'>
          {team.map((member) => (
            <Paper
              key={member.name}
              withBorder
              p="xl"
              radius="md"
              className="hover:shadow-lg transition-shadow border-teal-50 text-center"
            >
              <Avatar
                src={member.image}
                alt={member.name}
                size={120}
                radius={120}
                mx="auto"
                mb={4}
                className="border-4 border-teal-50"
                fallbackProps={{
                  children: <IconUserCircle size={80} stroke={1} className="text-teal-700" />,
                }}
              />
              <Title order={4} className="mb-1 text-teal-800">
                {member.name}
              </Title>
              <Text className="text-lavender-700 mb-3 font-medium">
                {member.title}
              </Text>
              <Text className="text-gray-600 leading-relaxed mt-4">
                {member.bio}
              </Text>
            </Paper>
          ))}
        </SimpleGrid>
      </Container>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-20">
        <Container size="lg">
          <Title order={2} className="text-teal-800 text-center mb-4">
            Frequently Asked Questions
          </Title>
          <Text className="text-gray-600 text-center w-full mx-auto mb-16">
            Find answers to common questions about our platform, technology, and services.
          </Text>

          <Paper
            withBorder
            radius="md"
            className="border-teal-100 max-w-3xl mx-auto mt-4"
          >
            <Accordion variant="contained">
              {faqs.map((faq, index) => (
                <Accordion.Item key={index} value={`faq-${index}`}>
                  <Accordion.Control>
                    <Text fw={600} className="text-teal-800">
                      {faq.question}
                    </Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Text className="text-gray-600">
                      {faq.answer}
                    </Text>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Paper>

          <Box className="max-w-3xl mx-auto mt-12 text-center">
            <Text className="text-gray-600 mb-4">
              Didn't find what you're looking for? Contact our support team for more information.
            </Text>
            <Button
              component={Link}
              to="/contact"
              variant="outline"
              color='red'
              size="md"
              radius="md"
              className="mt-4 !text-white-500 !border-white-500 hover:!border-red-500 hover:!bg-red-500 hover:!text-white transform hover:!scale-103 transition-all duration-300 !shadow-md"
            >
              Contact Us
            </Button>
          </Box>
        </Container>
      </div>
    </div>
  );
};

export default About;