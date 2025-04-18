import { useState } from 'react';
import { TextInput, Group, Text, Paper, ScrollArea, Button } from '@mantine/core';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AnimatePresence, motion } from 'framer-motion';

const AIChatAssistant = ({ isVisible }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

            if (!apiKey) {
                throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file');
            }

            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: input }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
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
                            <Text size="lg" weight={700} className="text-teal-600 pl-2">AI Assistant</Text>
                            <Text size="xs" className="text-gray-600">Powered by Gemini Flash 1.5</Text>
                        </div>

                        <ScrollArea className="flex-1 p-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    Start a conversation with the AI assistant
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
                                            {message.role === 'user' ? 'You' : 'AI Assistant'}
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
                                    <Text size="sm" weight={600} className="mb-1">AI Assistant</Text>
                                    <Text className="animate-pulse">Thinking...</Text>
                                </Paper>
                            )}
                            {error && (
                                <Paper
                                    className="p-3 mb-3 bg-red-50 text-red-700"
                                    shadow="xs"
                                    radius="md"
                                >
                                    Error: {error}
                                </Paper>
                            )}
                        </ScrollArea>

                        <div className="p-4 border-t bg-gray-100">
                            <Group spacing={8}>
                                <TextInput
                                    placeholder="Ask a question..."
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
                        </div>
                    </motion.div></motion.div>
            )}
        </AnimatePresence>
    );
};

export default AIChatAssistant;