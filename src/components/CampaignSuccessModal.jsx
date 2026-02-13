import React from 'react';
import { Check, ArrowRight, X, Sparkles } from 'lucide-react';
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from '../styles/buttonStyles';

const CampaignSuccessModal = ({ campaign, onClose, onGoToQrGeneration }) => {
    if (!campaign) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                {/* Success Icon */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#059669] to-[#047857] rounded-full blur-2xl opacity-50 animate-pulse"></div>
                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#059669] to-[#047857] flex items-center justify-center shadow-xl">
                            <Check size={40} className="text-white" strokeWidth={3} />
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                            Campaign Created!
                            <Sparkles size={20} className="text-[#059669]" />
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Your campaign "{campaign.title}" has been successfully created
                        </p>
                    </div>
                </div>

                {/* Campaign Details */}
                <div className="space-y-3 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Campaign ID</span>
                        <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                            {campaign.id?.slice(0, 12)}...
                        </span>
                    </div>
                    {campaign.subtotal && (
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Budget</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                ₹{Number(campaign.subtotal).toFixed(2)}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                        <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                            Pending Payment
                        </span>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="space-y-3 p-4 bg-gradient-to-br from-[#059669]/10 to-[#047857]/5 dark:from-[#059669]/5 dark:to-[#047857]/5 rounded-2xl border border-[#059669]/20">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ArrowRight size={16} className="text-[#059669]" />
                        Next Steps
                    </h3>
                    <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                            <span className="font-semibold text-[#059669] mt-0.5">1.</span>
                            <span>Go to the <strong>Pending Campaigns</strong> tab</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-semibold text-[#059669] mt-0.5">2.</span>
                            <span>Review your campaign details and pricing</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-semibold text-[#059669] mt-0.5">3.</span>
                            <span>Click <strong>"Pay & Activate"</strong> to generate QR codes</span>
                        </li>
                    </ol>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className={`flex-1 ${SECONDARY_BUTTON}`}
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            onGoToQrGeneration();
                            onClose();
                        }}
                        className={`flex-1 ${PRIMARY_BUTTON} flex items-center justify-center gap-2`}
                    >
                        Go to Pending
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CampaignSuccessModal;
