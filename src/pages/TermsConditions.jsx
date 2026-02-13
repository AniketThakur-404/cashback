import React from 'react';
import { ArrowLeft, FileCheck, UserCheck, AlertTriangle, Scale, Ban, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsConditions = () => {
    const navigate = useNavigate();

    const sections = [
        {
            icon: FileCheck,
            title: "Acceptance of Terms",
            content: [
                "By accessing and using Assured Rewards, you accept and agree to be bound by these Terms",
                "If you do not agree to these terms, please do not use our services",
                "We reserve the right to modify these terms at any time",
                "Continued use after changes constitutes acceptance of modified terms"
            ]
        },
        {
            icon: UserCheck,
            title: "User Obligations",
            content: [
                "Provide accurate and complete registration information",
                "Maintain the security of your account credentials",
                "Use the platform only for legitimate cashback reward purposes",
                "Not engage in fraudulent activities or abuse the system",
                "Scan only genuine products you have purchased",
                "Comply with all applicable laws and regulations"
            ]
        },
        {
            icon: Scale,
            title: "Cashback & Rewards",
            content: [
                "Cashback amounts are determined by partner brands and campaigns",
                "Rewards are subject to verification and approval",
                "Processing times may vary depending on the campaign",
                "We reserve the right to withhold or reverse rewards for fraudulent activity",
                "Minimum redemption amounts may apply",
                "Rewards may expire as per campaign terms"
            ]
        },
        {
            icon: AlertTriangle,
            title: "Limitations of Liability",
            content: [
                "Services are provided 'as is' without warranties of any kind",
                "We are not liable for indirect, incidental, or consequential damages",
                "Not responsible for partner brand products or services",
                "Technical issues or downtime may occur without liability",
                "Maximum liability limited to the amount of rewards in your account"
            ]
        },
        {
            icon: Ban,
            title: "Prohibited Activities",
            content: [
                "Creating multiple accounts to abuse rewards",
                "Scanning products you did not purchase",
                "Sharing or selling QR codes",
                "Attempting to hack or breach our systems",
                "Using automated tools or bots",
                "Impersonating other users or entities"
            ]
        },
        {
            icon: RefreshCw,
            title: "Account Termination",
            content: [
                "We may suspend or terminate accounts for violations of these terms",
                "You may close your account at any time",
                "Upon termination, unused rewards may be forfeited",
                "We reserve the right to refuse service to anyone"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 pb-24 md:pb-8 transition-colors duration-300">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 rounded-full hover:bg-white dark:hover:bg-zinc-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Terms & Conditions</h1>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Last updated: February 10, 2026
                    </p>

                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            Welcome to Assured Rewards. These Terms and Conditions govern your use of our cashback
                            rewards platform. Please read them carefully before using our services.
                        </p>

                        <div className="space-y-8">
                            {sections.map((section, index) => (
                                <div key={index} className="border-l-4 border-primary pl-4 py-2">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                                            <section.icon size={20} />
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {section.title}
                                        </h2>
                                    </div>
                                    <ul className="space-y-2 ml-13">
                                        {section.content.map((item, idx) => (
                                            <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                                <span className="text-primary mt-1.5">•</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                                <h3 className="font-bold text-amber-900 dark:text-amber-400 mb-2 flex items-center gap-2">
                                    <AlertTriangle size={18} />
                                    Important Notice
                                </h3>
                                <p className="text-sm text-amber-800 dark:text-amber-300">
                                    Violation of these terms may result in immediate account suspension and forfeiture
                                    of all rewards. We take fraud and abuse seriously.
                                </p>
                            </div>

                            <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <strong>Governing Law:</strong> These terms are governed by the laws of India.
                                    Any disputes shall be resolved in the courts of [Your Jurisdiction].
                                </p>
                            </div>

                            <div className="text-center pt-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Questions about our Terms? Contact us at legal@assuredrewards.in
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsConditions;
