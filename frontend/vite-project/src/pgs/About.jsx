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
import { motion, useAnimation, useInView } from 'framer-motion';
import { useEffect } from 'react';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionTitle = motion(Title);
const MotionText = motion(Text);
const MotionGroup = motion(Group);
const MotionImage = motion(Image);

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const cardAnimation = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 200
    }
  },
  hover: {
    y: -10,
    transition: { duration: 0.3 }
  }
};

const heroAnimation = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      staggerChildren: 0.3
    }
  }
};

const heroTextAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const AnimatedSection = ({ children, className, delay = 0 }) => {
  const controls = useAnimation();
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, threshold: 0.2 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.8,
            ease: "easeOut",
            delay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

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
    <motion.div
      className="min-h-screen mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <motion.div
        className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-24 rounded-2xl mx-2 px-4"
        variants={heroAnimation}
        initial="hidden"
        animate="visible"
      >
        <Container size="lg">
          <motion.div className="max-w-3xl flex-col justify-center">
            <MotionTitle
              className="text-4xl md:text-5xl font-bold mb-6"
              variants={heroTextAnimation}
            >
              Our Mission: Early Detection Saves Lives
            </MotionTitle>
            <MotionText
              className="text-xl text-white/90 mb-8 leading-relaxed my-2"
              variants={heroTextAnimation}
            >
              We're leveraging artificial intelligence to make professional-quality skin analysis accessible to everyone, anywhere. By detecting potential issues early, we help people take control of their skin health and seek appropriate care when needed.
            </MotionText>
            <MotionGroup
              className='mt-2'
              variants={heroTextAnimation}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ThemeIcon
                  color='orange'
                  size={60}
                  radius="md"
                  className="bg-white/20 backdrop-blur-sm !bg-gradient-to-r !from-red-500 !to-orange-500 !text-white !font-semibold !shadow-lg !shadow-red-400/50 !transform !transition-all !duration-300 hover:!bg-gradient-to-r hover:!from-orange-500 hover:!to-red-500 
    active:!scale-95 active:!shadow-orange-600/50 focus:!outline-none focus:!ring-2 focus:!ring-red-500 focus:!ring-offset-2 my-2"
                >
                  <IconCertificate size={30} className="text-white" />
                </ThemeIcon>
              </motion.div>
              <div>
                <Text fw={700} className="text-white">Clinically Validated</Text>
                <Text className="text-white/80">91% accuracy rate on common skin conditions</Text>
              </div>
            </MotionGroup>
          </motion.div>
        </Container>
      </motion.div>

      {/* Our Story Section */}
      <AnimatedSection className="py-20">
        <Container size="lg">
          <MotionSimpleGrid
            cols={{ base: 1, md: 2 }}
            spacing={50}
            variants={staggerChildren}
          >
            <motion.div variants={fadeIn}>
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

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
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
              </motion.div>
            </motion.div>

            <motion.div
              className="flex items-center"
              variants={fadeIn}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="rounded-2xl overflow-hidden shadow-xl"
                initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.3,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <MotionImage
                  src="/about-team.jpg"
                  alt="Our team of medical professionals and engineers"
                  className="w-full h-auto"
                  fallbackSrc="https://via.placeholder.com/600x400/teal/ffffff?text=OurTeam"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            </motion.div>
          </MotionSimpleGrid>
        </Container>
      </AnimatedSection>

      {/* Our Values */}
      <AnimatedSection className="bg-gray-50 py-20">
        <Container size="lg">
          <MotionTitle
            order={2}
            className="text-teal-800 text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our Values
          </MotionTitle>
          <MotionText
            className="text-gray-600 text-center w-full mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            These core principles guide everything we do, from how we develop our technology to how we interact with users.
          </MotionText>

          <motion.div
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" className='mt-4'>
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  variants={cardAnimation}
                  whileHover="hover"
                  custom={index}
                >
                  <Paper
                    withBorder
                    p="xl"
                    radius="md"
                    className="hover:shadow-lg transition-shadow border-teal-50 flex"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ThemeIcon
                        color='orange'
                        size={60}
                        radius="md"
                        className="mb-4 !bg-gradient-to-r !from-red-500 !to-orange-500 !text-white !font-semibold !shadow-lg !shadow-red-400/50 !transform !transition-all !duration-300 hover:!bg-gradient-to-r hover:!from-orange-500 hover:!to-red-500 
          active:!scale-95 active:!shadow-orange-600/50 focus:!outline-none focus:!ring-2 focus:!ring-red-500 focus:!ring-offset-2 bg-teal-100 mr-4 flex-shrink-0"
                      >
                        <value.icon size={26} stroke={1.5} />
                      </ThemeIcon>
                    </motion.div>
                    <div>
                      <Title order={4} className="mb-2 text-teal-800">
                        {value.title}
                      </Title>
                      <Text className="text-gray-600 leading-relaxed">
                        {value.description}
                      </Text>
                    </div>
                  </Paper>
                </motion.div>
              ))}
            </SimpleGrid>
          </motion.div>
        </Container>
      </AnimatedSection>

      {/* Team Section */}
      <AnimatedSection className="py-20" delay={0.2}>
        <Container size="lg">
          <MotionTitle
            order={2}
            className="text-teal-800 text-center mb-4"
            variants={fadeIn}
          >
            Meet Our Team
          </MotionTitle>
          <MotionText
            className="text-gray-600 text-center w-full mx-auto mb-16"
            variants={fadeIn}
          >
            Our multidisciplinary team brings together expertise in dermatology, artificial intelligence, and healthcare technology.
          </MotionText>

          <motion.div
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl" className='mt-4'>
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  variants={cardAnimation}
                  whileHover="hover"
                  custom={index}
                >
                  <Paper
                    withBorder
                    p="xl"
                    radius="md"
                    className="hover:shadow-lg transition-shadow border-teal-50 text-center"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                      <Avatar
                        src={member.image}
                        alt={member.name}
                        size={120}
                        radius={120}
                        mx="auto"
                        mb={4}
                        className="border-4 border-teal-50"
                        fallback={<IconUserCircle size={80} stroke={1} className="text-teal-700" />}
                      />
                    </motion.div>
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
                </motion.div>
              ))}
            </SimpleGrid>
          </motion.div>
        </Container>
      </AnimatedSection>

      {/* FAQ Section */}
      <AnimatedSection className="bg-gray-50 py-20" delay={0.3}>
        <Container size="lg">
          <MotionTitle
            order={2}
            className="text-teal-800 text-center mb-4"
            variants={fadeIn}
          >
            Frequently Asked Questions
          </MotionTitle>
          <MotionText
            className="text-gray-600 text-center w-full mx-auto mb-16"
            variants={fadeIn}
          >
            Find answers to common questions about our platform, technology, and services.
          </MotionText>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Paper
              withBorder
              radius="md"
              className="border-teal-100 max-w-3xl mx-auto mt-4"
            >
              <Accordion variant="contained">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <Accordion.Item value={`faq-${index}`}>
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
                  </motion.div>
                ))}
              </Accordion>
            </Paper>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Box className="max-w-3xl mx-auto mt-12 text-center">
              <Text className="text-gray-600 mb-4">
                Didn't find what you're looking for? Contact our support team for more information.
              </Text>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
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
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </AnimatedSection>
    </motion.div>
  );
};

export default About;