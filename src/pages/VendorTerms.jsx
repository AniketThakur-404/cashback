import React from "react";
import {
  ArrowLeft,
  FileCheck,
  Building2,
  AlertTriangle,
  Scale,
  Ban,
  Wallet2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const VendorTerms = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: FileCheck,
      title: "Service Terms",
      content: [
        "Acceptance of these terms is mandatory for creating vendor campaigns",
        "Vendors must provide accurate legal name and contact details",
        "Assured Rewards reserves the right to modify platform behavior and fees",
        "Account access is limited to authorized business representatives",
      ],
    },
    {
      icon: Building2,
      title: "Vendor Obligations",
      content: [
        "Honoring all cashback rewards validated by the Assured Rewards platform",
        "Ensuring products tagged with QR codes are genuine and legal",
        "Maintaining sufficient wallet balance for prepaid cashback campaigns",
        "Setting fair cashback percentages that comply with local advertising laws",
      ],
    },
    {
      icon: Wallet2,
      title: "Financials & Settlements",
      content: [
        "Platform fees are deducted as per the agreed plan at the time of campaign creation",
        "Payouts are processed based on verified customer scan activity",
        "Minimum wallet recharge amounts may apply for active campaigns",
        "Recharges are non-refundable but can be used across multiple campaigns",
      ],
    },
    {
      icon: Ban,
      title: "Prohibited Conduct",
      content: [
        "Generating fake scans or using bots to inflate campaign data",
        "Circumventing platform fees via offline arrangements with customers",
        "Charging customers extra for products because of cashback eligibility",
        "Sharing account credentials with unauthorized third parties",
      ],
    },
    {
      icon: AlertTriangle,
      title: "Termination & Disputes",
      content: [
        "Violation of terms results in immediate campaign suspension",
        "Unclaimed cashback in inactive accounts may be forfeited after 12 months",
        "Disputes regarding scan validity will be resolved by Assured Rewards analytics",
        "Assured Rewards is not responsible for vendor product liability issues",
      ],
    },
    {
      icon: Scale,
      title: "Limitation & Indemnity",
      content: [
        "Vendor agrees to indemnify Assured Rewards against claims related to product quality",
        "Maximum platform liability is limited to the fees paid in the last 30 days",
        "Services are provided 'as-is' with reasonable uptime commitment",
        "Governed by the laws of India; Jurisdictional courts defined in the master agreement",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-gray-50 rounded-2xl hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 transition-all border border-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Vendor Terms & Conditions
          </h1>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-amber-600 mb-6 uppercase tracking-widest">
            Last updated: February 23, 2026
          </p>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 leading-relaxed mb-10 text-lg">
              These terms govern the business relationship between your brand
              and the Assured Rewards platform. By utilizing our QR-based
              retention services, you agree to uphold the following standards of
              integrity.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {sections.map((section, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700">
                      <section.icon size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {section.title}
                    </h2>
                  </div>
                  <ul className="space-y-3">
                    {section.content.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-600 flex items-start gap-3"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-amber-50 rounded-3xl border border-amber-100">
              <div className="flex gap-4">
                <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                <p className="text-sm text-amber-900">
                  <strong>Fraud Policy:</strong> We have a zero-tolerance policy
                  for fraudulent QR management. Suspicious patterns will result
                  in immediate wallet freezing and business blacklisting across
                  the network.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center pt-8 border-t border-gray-50">
              <p className="text-sm text-gray-400">
                Questions about these terms? Reach out to
                legal@assuredrewards.in
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorTerms;
