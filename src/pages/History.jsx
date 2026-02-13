import React from 'react';
import { ArrowLeft, Clock, FileText, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const History = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 pb-24 md:pb-8 transition-colors duration-300">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header removed to avoid duplicate back buttons */}

                {/* Empty State */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                        <Clock className="w-10 h-10 text-gray-400 dark:text-zinc-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No History Yet</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                        Your scanned products and activities will appear here. Start scanning QR codes to build your history!
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-strong text-white font-semibold shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center gap-2"
                    >
                        <ShoppingBag size={18} />
                        <span>Browse Products</span>
                    </button>
                </div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <FileText size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Track Scans</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            View all your scanned products, verification status, and cashback details in one place.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                                <ShoppingBag size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Product Timeline</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            See your complete product journey from scan to reward redemption.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;
