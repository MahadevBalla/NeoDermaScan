import React from "react";
import { Link } from "react-router-dom";
import {
  Text,
  Title,
  Button,
  Container,
  Group,
  Paper,
  SimpleGrid,
  ThemeIcon,
  Card,
  Image,
  rem,
  Overlay,
  Center,
} from "@mantine/core";
import {
  IconStethoscope,
  IconShieldCheck,
  IconCertificate,
  IconDeviceAnalytics,
  IconArrowRight,
} from "@tabler/icons-react";

const Home = () => {
  const features = [
    {
      icon: IconStethoscope,
      title: "Expert Diagnosis",
      description:
        "Get accurate skin analysis powered by advanced AI technology trained by dermatologists.",
    },
    {
      icon: IconShieldCheck,
      title: "Privacy Focused",
      description:
        "Your data is encrypted and never shared. We prioritize your privacy at every step.",
    },
    {
      icon: IconCertificate,
      title: "Medical Grade",
      description:
        "Our algorithms are clinically validated and meet medical standards for accuracy.",
    },
    {
      icon: IconDeviceAnalytics,
      title: "Instant Results",
      description:
        "Receive analysis within seconds of uploading your skin images.",
    },
  ];

  return (
    <div className="min-h-screen w-[80vw] mt-4">
      {/* Hero Section */}
      <div className="relative h-screen max-h-[60vh] overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/60 to-teal-800/90 z-10" />
        <Image
          src="/hero-skin-health.jpeg"
          alt="Skin health"
          className="absolute inset-0 w-full h-full object-cover"
          fallbackSrc="https://via.placeholder.com/1200x700/teal/ffffff?text=SkinHealth"
        />
        <Container size="lg" className="relative z-20 h-full">
          <div className="flex flex-col justify-center h-full pt-16 pb-20 gap-y-6">
            <Title className="text-white text-4xl md:text-6xl font-bold text-center w-full leading-tight mb-6">
              Advanced Skin Disease Detection Powered by AI
            </Title>
            <Text className="text-white/90 text-xl text-center w-full mb-10 ">
              Get accurate skin analysis in seconds. Upload a photo and our AI
              will help identify potential skin conditions with medical-grade
              precision.
            </Text>
            <Group className="w-full flex flex-row !justify-center center">
              <Button
                component={Link}
                to="/upload"
                size="lg"
                radius="md"
                className="
    !bg-gradient-to-r !from-red-500 !to-orange-500 !text-white !font-semibold !shadow-lg !shadow-red-500/50 !transform hover:scale-103 !transition-all !duration-300 hover:!bg-gradient-to-r hover:!from-orange-500 hover:!to-red-500 
    active:!scale-95 active:!shadow-orange-600/50 focus:!outline-none focus:!ring-2 focus:!ring-red-500 focus:!ring-offset-2"
              >
                Analyze Your Skin Now
              </Button>
              <Button
                color="white"
                component={Link}
                to="/about"
                variant="outline"
                size="lg"
                radius="md"
                className="!text-white-500 !border-white-500 hover:!border-red-500 hover:!bg-red-500 hover:!text-white transform hover:!scale-103 transition-all duration-300 !shadow-md"
              >
                Learn More
              </Button>
            </Group>
          </div>
        </Container>
      </div>

      {/* Features Section */}
      <Container size="lg" className="py-20">
        <Title order={2} className="text-teal-800 text-center mb-4">
          Why Choose Our Platform
        </Title>
        <Text className="text-gray-600 text-center w-full mx-auto mb-16">
          Our advanced AI system helps detect potential skin conditions early,
          providing peace of mind and encouraging timely medical consultations.
        </Text>

        <SimpleGrid className="mt-4" cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
          {features.map((feature) => (
            <Paper
              key={feature.title}
              withBorder
              p="xl"
              radius="md"
              className="hover:shadow-lg transition-shadow border-teal-50"
            >
              <ThemeIcon
                color="teal"
                size={70}
                radius="md"
                className=" mb-4 !bg-gradient-to-r !from-red-500 !to-orange-500 !text-white !font-semibold !shadow-lg !shadow-red-400/50 !transform !transition-all !duration-300 hover:!bg-gradient-to-r hover:!from-orange-500 hover:!to-red-500 
    active:!scale-95 active:!shadow-orange-600/50 focus:!outline-none focus:!ring-2 focus:!ring-red-500 focus:!ring-offset-2"
              >
                <feature.icon size={30} stroke={1.5} />
              </ThemeIcon>
              <Title order={4} className="mb-2 text-teal-800">
                {feature.title}
              </Title>
              <Text className="text-gray-600 leading-relaxed">
                {feature.description}
              </Text>
            </Paper>
          ))}
        </SimpleGrid>
      </Container>

      {/* How It Works Section */}
      <div className="bg-gray-50 pb-20">
        <Container size="lg">
          <Title order={2} className="text-teal-800 text-center mb-4">
            How It Works
          </Title>
          <Text className="text-gray-600 text-center mx-auto mb-16 w-full">
            Get started in three simple steps and receive accurate skin analysis
            powered by our advanced AI algorithms.
          </Text>

          <SimpleGrid className="mt-4" cols={{ base: 1, md: 3 }} spacing="xl">
            {[
              {
                title: "Upload a Photo",
                description:
                  "Take a clear photo of the skin area you're concerned about and upload it securely to our platform.",
                image: "/upload-illustration.jpg",
                fallback:
                  "https://via.placeholder.com/500x300/teal/ffffff?text=Upload",
              },
              {
                title: "AI Analysis",
                description:
                  "Our advanced algorithm analyzes the image, looking for patterns associated with various skin conditions.",
                image: "/analysis-illustration.jpg",
                fallback:
                  "https://via.placeholder.com/500x300/teal/ffffff?text=Analysis",
              },
              {
                title: "Get Results",
                description:
                  "Receive a detailed report with potential matches and recommended next steps for your skin health.",
                image: "/results-illustration.jpeg",
                fallback:
                  "https://via.placeholder.com/500x300/teal/ffffff?text=Results",
              },
            ].map((step, index) => (
              <Card
                key={index}
                p="lg"
                radius="md"
                withBorder
                className="border-teal-100 overflow-hidden"
              >
                <Card.Section>
                  <div className="relative h-48">
                    <Image
                      src={step.image}
                      alt={step.title}
                      className="h-full w-full object-cover"
                      fallbackSrc={step.fallback}
                    />
                    <div className="absolute top-3 left-3 bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </div>
                </Card.Section>
                <Title order={4} className="mt-4 mb-2 text-teal-800">
                  {step.title}
                </Title>
                <Text className="text-gray-600 mb-4">{step.description}</Text>
              </Card>
            ))}
          </SimpleGrid>

          <Center mt={40}>
            <Button
              component={Link}
              to="/upload"
              size="lg"
              radius="md"
              rightSection={<IconArrowRight size={18} />}
              className="!bg-gradient-to-r !from-red-500 !to-orange-500 !text-white !font-semibold !shadow-lg !shadow-red-500/50 !transform hover:scale-103 !transition-all !duration-300 hover:!bg-gradient-to-r hover:!from-orange-500 hover:!to-red-500 
    active:!scale-95 active:!shadow-orange-600/50 focus:!outline-none focus:!ring-2 focus:!ring-red-500 focus:!ring-offset-2"
            >
              Try It Now
            </Button>
          </Center>
        </Container>
      </div>

      {/* CTA Section */}
      <div className="relative pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-lavender-500/10" />
        <Container size="md" className="relative">
          <Paper
            withBorder
            p={{ base: "md", md: "xl" }}
            radius="lg"
            className="bg-white border-teal-100 shadow-xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-70" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-lavender-200 rounded-full translate-y-1/2 -translate-x-1/2 opacity-70" />

            <div className="relative z-10">
              <Title order={2} className="text-teal-800 text-center mb-4">
                Take Control of Your Skin Health Today
              </Title>
              <Text className="mt-2 text-gray-600 text-center w-full mx-auto mb-8">
                Join thousands of users who have gained peace of mind through
                early detection and professional guidance for their skin
                concerns.
              </Text>
              <Group justify="center" gap="md" className="mt-4">
                <Button
                  component={Link}
                  to="/signup"
                  size="lg"
                  radius="md"
                  className="!bg-gradient-to-r !from-red-500 !to-orange-500 !text-white !font-semibold !shadow-lg !shadow-red-500/50 !transform hover:scale-103 !transition-all !duration-300 hover:!bg-gradient-to-r hover:!from-orange-500 hover:!to-red-500 
    active:!scale-95 active:!shadow-orange-600/50 focus:!outline-none focus:!ring-2 focus:!ring-red-500 focus:!ring-offset-2"
                >
                  Create Free Account
                </Button>
                <Button
                  component={Link}
                  to="/upload"
                  variant="outline"
                  size="lg"
                  radius="md"
                  color="red"
                  className="!text-white-500 !border-white-500 hover:!border-red-500 hover:!bg-red-500 hover:!text-white transform hover:!scale-103 transition-all duration-300 !shadow-md"
                >
                  Try Without Account
                </Button>
              </Group>
            </div>
          </Paper>
        </Container>
      </div>
    </div>
  );
};

export default Home;
