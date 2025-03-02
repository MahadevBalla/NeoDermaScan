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
  Progress, 
  Image, 
  Card,
  Stepper,
  rem,
  Loader,
  Badge
} from '@mantine/core';
import { 
  IconUpload, 
  IconPhotoScan, 
  IconFileAnalytics, 
  IconInfoCircle, 
  IconPhoto,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconArrowRight
} from '@tabler/icons-react';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { Link } from 'react-router-dom';

const Upload = () => {
  const [active, setActive] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const handleDrop = (files) => {
    setUploadedFile(files[0]);
    setActive(1);
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    // Simulate analysis delay
    setTimeout(() => {
      setAnalyzing(false);
      setActive(2);
      // Mock results
      setResults({
        prediction: "Melanoma",
        confidence: 87.5,
        risk: "High",
        recommendations: [
          "Schedule an appointment with a dermatologist as soon as possible",
          "Avoid sun exposure to the affected area",
          "Take clear photos to track any changes"
        ],
        similarCases: 156,
        differentialDiagnosis: [
          { condition: "Melanoma", probability: 87.5 },
          { condition: "Dysplastic nevus", probability: 8.2 },
          { condition: "Seborrheic keratosis", probability: 4.3 }
        ]
      });
    }, 3000);
  };

  const handleReset = () => {
    setUploadedFile(null);
    setResults(null);
    setActive(0);
  };

  const tips = [
    {
      title: "Good Lighting",
      description: "Take photos in natural daylight for accurate colors and details."
    },
    {
      title: "Multiple Angles",
      description: "Capture the affected area from different perspectives."
    },
    {
      title: "Include Scale Reference",
      description: "Place a coin or ruler next to the lesion for size context."
    },
    {
      title: "Clear Focus",
      description: "Ensure the image is sharp and clearly shows texture and borders."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <Container size="lg">
        <Paper
          withBorder
          radius="lg"
          p={0}
          className="overflow-hidden shadow-lg border-teal-100 bg-white"
        >
          <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-8 px-8">
            <Title order={2} className="mb-2">
              Skin Condition Analysis
            </Title>
            <Text className="text-white/90">
              Upload a photo of your skin concern to receive AI-powered analysis and recommendations.
            </Text>
          </div>
          
          <div className="p-8">
            <Stepper 
              active={active} 
              onStepClick={setActive}
              breakpoint="sm"
              allowNextStepsSelect={false}
              className="mb-10"
            >
              <Stepper.Step
                label="Upload Image"
                description="Upload a skin photo"
                icon={<IconUpload size={18} />}
                completedIcon={<IconCheck size={18} />}
              >
                <div className="py-6">
                  <Dropzone
                    onDrop={handleDrop}
                    accept={IMAGE_MIME_TYPE}
                    maxSize={5 * 1024 * 1024}
                    multiple={false}
                    padding="xl"
                    className="border-dashed border-2 border-teal-200 bg-teal-50/50 hover:bg-teal-50 transition-colors cursor-pointer"
                  >
                    <Group justify="center" gap="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
                      <Dropzone.Accept>
                        <IconCheck
                          size={50}
                          stroke={1.5}
                          className="text-teal-600"
                        />
                      </Dropzone.Accept>
                      <Dropzone.Reject>
                        <IconX
                          size={50}
                          stroke={1.5}
                          className="text-red-500"
                        />
                      </Dropzone.Reject>
                      <Dropzone.Idle>
                        <IconPhoto
                          size={50}
                          stroke={1.5}
                          className="text-teal-600"
                        />
                      </Dropzone.Idle>

                      <div className="text-center">
                        <Text size="xl" fw={700} className="text-teal-800 mb-2">
                          Drag images here or click to select files
                        </Text>
                        <Text size="sm" className="text-gray-600 max-w-md mx-auto">
                          Upload a clear image of the skin area you're concerned about. Files should not exceed 5MB.
                        </Text>
                      </div>
                    </Group>
                  </Dropzone>
                </div>
                
                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} className="mt-8">
                  {tips.map((tip, index) => (
                    <Card 
                      key={index} 
                      withBorder 
                      radius="md"
                      padding="md"
                      className="border-teal-100"
                    >
                      <Group align="flex-start" noWrap>
                        <ThemeIcon
                          size={36}
                          radius="md"
                          className="bg-teal-100 text-teal-700"
                        >
                          <IconInfoCircle size={20} />
                        </ThemeIcon>
                        <div>
                          <Text fw={600} className="text-teal-800 mb-1">
                            {tip.title}
                          </Text>
                          <Text size="sm" className="text-gray-600">
                            {tip.description}
                          </Text>
                        </div>
                      </Group>
                    </Card>
                  ))}
                </SimpleGrid>
              </Stepper.Step>

              <Stepper.Step
                label="Review"
                description="Confirm your image"
                icon={<IconPhotoScan size={18} />}
                completedIcon={<IconCheck size={18} />}
              >
                <div className="py-6">
                  {uploadedFile && (
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="md:w-1/2">
                        <div className="border border-teal-200 rounded-lg overflow-hidden shadow-md">
                          <Image
                            src={URL.createObjectURL(uploadedFile)}
                            alt="Uploaded skin image"
                            className="w-full h-auto"
                            fit="contain"
                          />
                        </div>
                      </div>
                      <div className="md:w-1/2">
                        <Title order={3} className="text-teal-800 mb-3">
                          Image Preview
                        </Title>
                        <Text className="text-gray-600 mb-4">
                          Please confirm this is the image you want to analyze. For accurate results, make sure:
                        </Text>
                        <ul className="list-disc pl-5 mb-6 text-gray-600 space-y-2">
                          <li>The affected area is clearly visible</li>
                          <li>The image is in focus and well-lit</li>
                          <li>The skin condition is centered in the frame</li>
                        </ul>
                        
                        <Group>
                          <Button
                            onClick={handleReset}
                            variant="outline"
                            className="border-gray-300 text-gray-700"
                          >
                            Choose Different Image
                          </Button>
                          <Button
                            onClick={handleAnalyze}
                            size="md"
                            className="bg-coral-500 hover:bg-coral-600"
                            rightSection={analyzing ? <Loader size="xs" color="white" /> : null}
                            disabled={analyzing}
                          >
                            {analyzing ? "Analyzing..." : "Analyze Image"}
                          </Button>
                        </Group>
                        
                        {analyzing && (
                          <div className="mt-6">
                            <Text size="sm" className="text-gray-600 mb-2">
                              Processing your image...
                            </Text>
                            <Progress value={analyzing ? 65 : 0} size="sm" radius="xl" color="teal" animated />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Stepper.Step>

              <Stepper.Step
                label="Results"
                description="View analysis"
                icon={<IconFileAnalytics size={18} />}
              >
                <div className="py-6">
                  {results && (
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="md:w-2/5">
                        <div className="border border-teal-200 rounded-lg overflow-hidden shadow-md">
                          <Image
                            src={URL.createObjectURL(uploadedFile)}
                            alt="Analyzed skin image"
                            className="w-full h-auto"
                            fit="contain"
                          />
                        </div>
                        
                        <Paper withBorder p="md" radius="md" className="mt-6 border-lavender-200">
                          <Text fw={600} className="text-teal-800 mb-2">
                            Differential Diagnosis
                          </Text>
                          {results.differentialDiagnosis.map((item, index) => (
                            <Group key={index} justify="space-between" className="mb-2">
                              <Text size="sm" className="text-gray-700">
                                {item.condition}
                              </Text>
                              <Group gap="xs">
                                <Text size="sm" fw={500} className={index === 0 ? "text-coral-600" : "text-gray-600"}>
                                  {item.probability.toFixed(1)}%
                                </Text>
                                <Progress 
                                  value={item.probability} 
                                  size="sm" 
                                  w={80} 
                                  color={index === 0 ? "coral" : "blue"} 
                                />
                              </Group>
                            </Group>
                          ))}
                          <Text size="xs" className="text-gray-500 mt-3">
                            Based on analysis of {results.similarCases} similar cases
                          </Text>
                        </Paper>
                      </div>
                      
                      <div className="md:w-3/5">
                        <div className="flex items-center gap-3 mb-6">
                          <Title order={3} className="text-teal-800">
                            Analysis Results
                          </Title>
                          <Badge 
                            size="lg" 
                            radius="md" 
                            className="bg-red-100 text-red-700 border-red-200"
                          >
                            {results.risk} Risk
                          </Badge>
                        </div>
                        
                        <Paper withBorder p="lg" radius="md" className="mb-6 border-red-200 bg-red-50/30">
                          <Group>
                            <ThemeIcon 
                              size={40} 
                              radius="md" 
                              className="bg-red-100 text-red-700"
                            >
                              <IconAlertCircle size={24} />
                            </ThemeIcon>
                            <div>
                              <Text fw={700} size="lg" className="text-red-800">
                                Possible {results.prediction} Detected
                              </Text>
                              <Text className="text-gray-700">
                                Confidence: {results.confidence.toFixed(1)}% - Please consult with a healthcare provider
                              </Text>
                            </div>
                          </Group>
                        </Paper>
                        
                        <Title order={4} className="text-teal-800 mb-3">
                          Recommendations
                        </Title>
                        <ul className="list-disc pl-5 mb-6 text-gray-700 space-y-2">
                          {results.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                        
                        <Title order={4} className="text-teal-800 mb-3">
                          Next Steps
                        </Title>
                        <Text className="text-gray-700 mb-4">
                          This analysis is not a medical diagnosis. Please consult with a dermatologist for proper evaluation and treatment options.
                        </Text>
                        
                        <Group mt={6}>
                          <Button
                            onClick={handleReset}
                            variant="outline"
                            className="border-gray-300 text-gray-700"
                          >
                            Upload New Image
                          </Button>
                          <Button
                            component={Link}
                            to="/find-doctor"
                            className="bg-coral-500 hover:bg-coral-600"
                            rightSection={<IconArrowRight size={18} />}
                          >
                            Find a Dermatologist
                          </Button>
                        </Group>
                        
                        <Text size="sm" className="text-gray-500 mt-6">
                          You can access this analysis report anytime in your account history.
                        </Text>
                      </div>
                    </div>
                  )}
                </div>
              </Stepper.Step>
            </Stepper>
          </div>
        </Paper>
      </Container>
    </div>
  );
};

export default Upload;