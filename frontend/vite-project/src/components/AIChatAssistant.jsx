import { useState } from 'react';
import { TextInput, Group, Text, Paper, ScrollArea, Button, Alert } from '@mantine/core';
import { Send, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AnimatePresence } from 'framer-motion';

const AIChatAssistant = ({ isVisible }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [topicWarning, setTopicWarning] = useState(false);

    // Expanded keywords for skin, dermatology, and general medical topics
    const medicalKeywords = [
        // Skin cancer specific
        'skin cancer', 'melanoma', 'carcinoma', 'basal cell', 'squamous cell',
        // Dermatology
        'dermatologist', 'dermatology', 'skin specialist',
        // General skin conditions
        'skin', 'mole', 'rash', 'acne', 'eczema', 'psoriasis', 'rosacea',
        'skin lesion', 'skin biopsy', 'skin tag', 'birthmark', 'freckle',
        // Skin care
        'sun protection', 'sunscreen', 'skin care', 'moisturizer', 'skin health',
        // Medical procedures
        'skin exam', 'dermatoscope', 'biopsy', 'skin surgery',
        // Symptoms
        'itchy skin', 'dry skin', 'red skin', 'skin bump', 'skin spot',
        // Other skin conditions
        'actinic keratosis', 'skin tumor', 'skin abnormality', 'hives', 'warts',
        'fungal infection', 'bacterial infection', 'viral infection',
        // Medical facilities
        'hospital', 'clinic', 'medical center', 'dermatology clinic',
        // Medical professionals
        'doctor', 'physician', 'surgeon', 'oncologist',
        // General medical terms
        'diagnosis', 'treatment', 'symptoms', 'medication', 'therapy',
        'prevention', 'screening', 'test', 'medical advice'
    ];

    // Allowed conversational phrases
    const conversationalPhrases = [
        'hi', 'hello', 'hey', 'how are you', 'good morning', 'good afternoon', 'good evening',
        'thanks', 'thank you', 'okay', 'bye', 'goodbye', 'see you', 'help', 'what can you do'
    ];

    // Check if input is conversational or medical/skin related
    const isValidInput = (text) => {
        const lowerText = text.toLowerCase().trim();

        // Check if it's a conversational phrase
        const isConversational = conversationalPhrases.some(phrase =>
            lowerText.includes(phrase) || lowerText === phrase
        );

        // Check if it's medical/skin related
        const isMedicalRelated = medicalKeywords.some(keyword =>
            lowerText.includes(keyword)
        );

        return isConversational || isMedicalRelated;
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        // Check if the question is valid (conversational or medical/skin related)
        if (!isValidInput(input)) {
            setTopicWarning(true);
            return;
        }

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);
        setTopicWarning(false);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

            if (!apiKey) {
                throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file');
            }

            const systemPrompt = `You are a specialized medical assistant focused on dermatology, skin health, and related medical fields.
            - For greetings and basic conversation, respond politely and briefly.
            - Provide detailed information about:
              * Skin conditions (acne, eczema, psoriasis, rashes, etc.)
              * Skin cancer (melanoma, basal cell carcinoma, squamous cell carcinoma)
              * Skin care and sun protection
              * Dermatology procedures and treatments
              * When to see a dermatologist
              * General skin health information
            - You can answer questions about related medical fields, hospitals, and medical professionals as they pertain to skin health.
            - Always advise consulting a dermatologist or medical professional for specific medical concerns.
            - Do not provide definitive diagnoses or specific treatment plans for individual cases.`;

            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: `${systemPrompt}\n\nUser: ${input}` }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 1024
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to get response from Gemini API');
            }

            if (data.candidates && data.candidates[0]?.content) {
                const aiMessage = {
                    role: 'assistant',
                    content: data.candidates[0].content.parts[0].text
                };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                throw new Error('Unexpected response format from Gemini API');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error calling Gemini API:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence initial={false}>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col h-full"
                >
                    <motion.div className="flex flex-col h-full">
                        <div className="p-4 border-b bg-gray-100">
                            <Text size="lg" weight={700} className="text-teal-600 pl-2">Skin & Dermatology Assistant</Text>
                            <Text size="xs" className="text-gray-600">Specialized in skin health, dermatology, and related medical fields</Text>
                        </div>

                        <ScrollArea className="flex-1 p-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <Text mb="md">Ask about skin health, dermatology, or related medical topics</Text>
                                    <Text size="sm" color="dimmed">
                                        Example: "What are the warning signs of skin cancer?" or "How can I treat acne?"
                                    </Text>
                                </div>
                            ) : (
                                messages.map((message, index) => (
                                    <Paper
                                        key={index}
                                        className={`p-3 mb-3 max-w-[80%] ${message.role === 'user'
                                            ? 'ml-auto bg-teal-50'
                                            : 'mr-auto bg-gray-50'
                                            }`}
                                        shadow="xs"
                                        radius="md"
                                    >
                                        <Text size="sm" weight={600} className="mb-1">
                                            {message.role === 'user' ? 'You' : 'Skin & Dermatology Assistant'}
                                        </Text>
                                        {message.role === 'assistant' ? (
                                            <div className="markdown-content">
                                                <ReactMarkdown>{message.content}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <Text className="whitespace-pre-wrap">{message.content}</Text>
                                        )}
                                    </Paper>
                                ))
                            )}
                            {isLoading && (
                                <Paper
                                    className="p-3 mb-3 max-w-[80%] mr-auto bg-gray-50"
                                    shadow="xs"
                                    radius="md"
                                >
                                    <Text size="sm" weight={600} className="mb-1">Skin & Dermatology Assistant</Text>
                                    <Text className="animate-pulse">Thinking...</Text>
                                </Paper>
                            )}
                            {error && (
                                <Paper
                                    className="p-3 mb-3 bg-red-50 text-red-700"
                                    shadow="xs"
                                    radius="md"
                                >
                                    <Group>
                                        <AlertCircle size={18} />
                                        <Text>Error: {error}</Text>
                                    </Group>
                                </Paper>
                            )}
                            {topicWarning && (
                                <Alert icon={<AlertCircle size={16} />} color="orange" className="mb-3">
                                    <Text size="sm">
                                        I can only answer questions about skin health, dermatology, and related medical topics.
                                        Please ask a related question, such as "What are the symptoms of eczema?"
                                        or "When should I see a dermatologist?"
                                    </Text>
                                </Alert>
                            )}
                        </ScrollArea>

                        <div className="p-4 border-t bg-gray-100">
                            <Group spacing={8}>
                                <TextInput
                                    placeholder="Ask about skin health, dermatology, or related medical topics..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    disabled={isLoading}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={sendMessage}
                                    disabled={isLoading || !input.trim()}
                                    color="teal"
                                    rightIcon={<Send size={16} />}
                                >
                                    Send
                                </Button>
                            </Group>
                            <Text size="xs" color="dimmed" mt="xs">
                                This assistant answers questions about skin health, dermatology, and related medical fields.
                            </Text>
                        </div>
                    </motion.div></motion.div>
            )}
        </AnimatePresence>
    );
};

export default AIChatAssistant; 