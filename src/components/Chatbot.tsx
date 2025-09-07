import { useState, useRef, useEffect } from 'react';
import { axiosInstance } from '../api/apis';
import { useToast } from './Toast';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isTyping?: boolean;
    data?: any[];
    operation?: string;
    count?: number;
}

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
    onRefresh?: () => void;
}

function Chatbot({ isOpen, onClose, onRefresh }: ChatbotProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    // Initialize with welcome message
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMessage: Message = {
                id: 'welcome',
                role: 'assistant',
                content: "👋 Hello! I'm your AI assistant for user management. I can help you:\n\n• Create new users\n• Update existing users\n• Delete users\n• Search for users\n• Answer questions about user data\n\nWhat would you like to do today?",
                timestamp: new Date()
            };
            setMessages([welcomeMessage]);
        }
    }, [isOpen, messages.length]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Focus input when chatbot opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
        const newMessage: Message = {
            ...message,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
        return newMessage.id;
    };

    const simulateTyping = async (duration = 1000) => {
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, duration));
        setIsTyping(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const userMessage = userInput.trim();
        setUserInput('');
        setIsLoading(true);

        // Add user message
        addMessage({
            role: 'user',
            content: userMessage
        });

        try {
            // Simulate typing
            await simulateTyping(800 + Math.random() * 1200);

            // Send to backend
            const response = await axiosInstance.get(`/chat/${encodeURIComponent(userMessage)}`);

            // Add bot response with data if available
            addMessage({
                role: 'assistant',
                content: response.data.message,
                data: response.data.data || response.data.users,
                operation: response.data.operation,
                count: response.data.count
            });

            // Refresh data if operation was successful
            if (response.data.operation && 
                ['create', 'update', 'delete'].includes(response.data.operation)) {
                onRefresh?.();
                showToast(`User ${response.data.operation} operation completed!`, 'success');
            }

        } catch (error: any) {
            console.error('Chat error:', error);
            addMessage({
                role: 'assistant',
                content: "❌ Sorry, I encountered an error processing your request. Please try again or contact support if the issue persists."
            });
            showToast('Failed to send message', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const formatMessage = (content: string) => {
        return content.split('\n').map((line, index) => (
            <div key={index} className={line.trim() === '' ? 'h-2' : ''}>
                {line.startsWith('•') ? (
                    <div className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>{line.substring(1).trim()}</span>
                    </div>
                ) : line.startsWith('**') && line.endsWith('**') ? (
                    <strong className="text-gray-900">{line.slice(2, -2)}</strong>
                ) : (
                    line
                )}
            </div>
        ));
    };

    const renderUserData = (data: any[]) => {
        if (!data || data.length === 0) return null;

        return (
            <div className="mt-3 space-y-2">
                <div className="text-xs font-medium text-gray-600 mb-2">📊 Found {data.length} user(s):</div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                    {data.map((user, index) => (
                        <div key={user._id || index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-medium text-blue-600">
                                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{user.name || 'Unknown'}</span>
                                    </div>
                                    <div className="text-xs text-gray-600 space-y-1">
                                        {user.email && (
                                            <div className="flex items-center space-x-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                </svg>
                                                <span>{user.email}</span>
                                            </div>
                                        )}
                                        {user.phone && (
                                            <div className="flex items-center space-x-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span>{user.phone}</span>
                                            </div>
                                        )}
                                        {user.address && (
                                            <div className="flex items-center space-x-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>{user.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const TypingIndicator = () => (
        <div className="flex items-center space-x-1 p-3">
            <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-xs text-gray-500 ml-2">AI is typing...</span>
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col max-h-[600px] animate-slideIn">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold">AI Assistant</h3>
                        <p className="text-xs text-blue-100">User Management Helper</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}
                    >
                        <div className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {/* Avatar */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                message.role === 'user' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            }`}>
                                {message.role === 'user' ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </div>

                            {/* Message bubble */}
                            <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                                message.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-md'
                                    : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                            }`}>
                                <div className="text-sm leading-relaxed">
                                    {formatMessage(message.content)}
                                </div>
                                
                                {/* Render user data if available */}
                                {message.role === 'assistant' && message.data && message.operation === 'read' && (
                                    renderUserData(message.data)
                                )}
                                
                                <div className={`text-xs mt-2 ${
                                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex justify-start animate-slideUp">
                        <div className="flex items-start space-x-2 max-w-[80%]">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 border border-gray-200 shadow-sm">
                                <TypingIndicator />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                <div className="flex space-x-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Ask me anything about user management..."
                        disabled={isLoading}
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !userInput.trim()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Press Enter to send</span>
                    <span className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span>Online</span>
                    </span>
                </div>
            </form>
        </div>
    );
}

export default Chatbot;