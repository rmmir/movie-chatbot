'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useState } from 'react';

type ScrapePageModalProps = {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
};

const ScrapePageModal: React.FC<ScrapePageModalProps> = ({
    showModal,
    setShowModal,
}) => {
    const [scrapeUrl, setScrapeUrl] = useState('');
    const [scrapeStatus, setScrapeStatus] = useState<
        'idle' | 'loading' | 'success' | 'error'
    >('idle');
    const [scrapeError, setScrapeError] = useState('');

    const handleScrape = async (e: React.FormEvent) => {
        e.preventDefault();
        setScrapeStatus('loading');
        setScrapeError('');
        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: scrapeUrl }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to scrape');
            }
            setScrapeStatus('success');
            setScrapeUrl('');
        } catch (err: any) {
            setScrapeStatus('error');
            setScrapeError(err.message);
        }
    };

    return (
        <Dialog
            open={showModal}
            onClose={() => {
                setShowModal(false);
                setScrapeStatus('idle');
                setScrapeError('');
                setScrapeUrl('');
            }}
            className="relative z-50"
        >
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                    <DialogTitle className="text-xl font-bold mb-4">
                        Add Page to Scrape
                    </DialogTitle>
                    <form onSubmit={handleScrape}>
                        <input
                            type="url"
                            className="w-full border px-3 py-2 rounded mb-2"
                            placeholder="Enter page URL"
                            value={scrapeUrl}
                            onChange={(e) => setScrapeUrl(e.target.value)}
                            required
                        />
                        <div className="flex space-x-2">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
                                disabled={scrapeStatus === 'loading'}
                            >
                                {scrapeStatus === 'loading'
                                    ? 'Scraping...'
                                    : 'Scrape & Store'}
                            </button>
                            <button
                                type="button"
                                className="bg-gray-400 text-white px-4 py-2 rounded cursor-pointer"
                                onClick={() => {
                                    setShowModal(false);
                                    setScrapeStatus('idle');
                                    setScrapeError('');
                                    setScrapeUrl('');
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                        {scrapeStatus === 'success' && (
                            <div className="text-green-600 mt-2">
                                Page scraped and stored!
                            </div>
                        )}
                        {scrapeStatus === 'error' && (
                            <div className="text-red-600 mt-2">
                                {scrapeError}
                            </div>
                        )}
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ScrapePageModal;
