import React from 'react';
import { ArrowLeft, Shield, Eye, Lock, Users, FileText, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    const sections = [
        {
            icon: Shield,
            title: "Information We Collect",
            content: [
                "Personal information (name, email, phone number) when you register",
                "Transaction history and cashback earnings",
                "Device information and usage data",
                "Location data for service delivery",
                "QR code scanning activity"
            ]
        },
        {
            icon: Eye,
            title: "How We Use Your Information",
            content: [
                "Process cashback rewards and transactions",
                "Verify product authenticity and prevent fraud",
                "Send notifications about offers and rewards",
                "Improve our services and user experience",
                "Comply with legal obligations"
            ]
        },
        {
            icon: Lock,
            title: "Data Security",
            content: [
                "We use industry-standard encryption to protect your data",
                "Secure servers with regular security audits",
                "Limited access to personal information",
                "Regular backups and disaster recovery procedures"
            ]
        },
        {
            icon: Users,
            title: "Information Sharing",
            content: [
                "We do not sell your personal information to third parties",
                "Partner brands may receive aggregated, anonymized data",
                "Service providers who assist in operations (under strict agreements)",
                "Law enforcement when legally required"
            ]
        },
        {
            icon: FileText,
            title: "Your Rights",
            content: [
                "Access your personal data at any time",
                "Request correction of inaccurate information",
                "Delete your account and associated data",
                "Opt-out of marketing communications",
                "Export your data in a portable format"
            ]
        },
        {
            icon: Mail,
            title: "Contact Us",
            content: [
                "For privacy concerns, email us at privacy@assuredrewards.in",
                "Data protection queries: dpo@assuredrewards.in",
                "Response time: Within 48 hours"
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Last updated: February 10, 2026
                    </p>

                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            At Assured Rewards, we take your privacy seriously. This Privacy Policy explains how we collect,
                            use, disclose, and safeguard your information when you use our cashback rewards platform.
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

                        <div className="mt-8 p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Note:</strong> We may update this Privacy Policy from time to time.
                                We will notify you of any changes by posting the new Privacy Policy on this page
                                and updating the "Last updated" date.
                            </p>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                By using Assured Rewards, you agree to this Privacy Policy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
