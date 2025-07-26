'use client';

import React, { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import ScrapePageModal from './components/ScrapePageModal';

export default function Chat() {
    const {
        messages,
        input,
        status,
        handleInputChange,
        handleSubmit,
        setMessages,
    } = useChat({
        api: '/api/chat',
    });

    const [showModal, setShowModal] = useState(false);
    const isLoading = status === 'streaming';

    return (
        <div className="flex flex-col w-full max-w-2xl mx-auto py-12 stretch">
            <h1 className="text-3xl font-bold mb-8 text-center">
                Movie ChatBot
            </h1>

            <button
                className="mb-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer"
                onClick={() => setShowModal(true)}
            >
                Scrape Page For Knowledge
            </button>

            <ScrapePageModal
                showModal={showModal}
                setShowModal={setShowModal}
            />

            <form onSubmit={handleSubmit} className="flex space-x-2 mb-10">
                <input
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={input}
                    placeholder="Ask about top 10 highest grossing movies of all time..."
                    onChange={handleInputChange}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                >
                    Send
                </button>
                <button
                    type="button"
                    className="bg-gray-500 hover:bg-gray-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                    onClick={() => setMessages([])}
                >
                    Clear Chat
                </button>
            </form>

            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                m.role === 'user'
                                    ? 'bg-blue-500 text-white ml-auto'
                                    : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                            <div className="text-sm font-semibold mb-1">
                                {m.role === 'user' ? 'You' : 'Assistant'}
                            </div>
                            <div className="whitespace-pre-wrap">
                                {m.content}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
