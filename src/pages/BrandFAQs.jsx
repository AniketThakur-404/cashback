import React, { useEffect, useState } from "react";
import { ChevronLeft, HelpCircle, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BrandFAQs = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      q: "How do I redeem my brand rewards?",
      a: "To redeem brand rewards, go to the 'Store' tab and choose the desired item. If you have enough points, click 'Redeem Now'. You may also scan QR codes from participating brand products.",
    },
    {
      q: "Are the gift cards valid across all stores?",
      a: "Gift cards are specific to each brand. Please check the 'Terms and Conditions' on the gift card details page for information on participating locations.",
    },
    {
      q: "Can I transfer my points to another account?",
      a: "Currently, points are non-transferable and can only be used by the account that earned them.",
    },
    {
      q: "When do my points expire?",
      a: "Points are valid for 12 months from the date they are earned. You can check your point history in your Profile or Wallet tabs.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 pb-24 md:pb-8 transition-colors duration-300 font-admin-body">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Brand FAQs
          </h1>
        </div>

        <div className="bg-primary/10 rounded-3xl p-6 flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
            <HelpCircle size={24} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">
              Have questions?
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Find answers about our partnering brands and their rewards.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className={`bg-white dark:bg-zinc-900 rounded-2xl border ${isOpen ? "border-primary/50 shadow-md" : "border-gray-100 dark:border-zinc-800 shadow-sm"} p-4 cursor-pointer hover:border-primary/30 transition-all duration-300`}
              >
                <div className="flex justify-between items-start gap-3">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug">
                    {faq.q}
                  </h3>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180 text-primary" : ""}`}
                  />
                </div>
                {isOpen && (
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed animate-in fade-in slide-in-from-top-1">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center pt-6">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Still need help?
          </p>
          <button
            onClick={() => navigate("/profile/contact")}
            className="text-sm font-bold text-primary hover:text-primary-strong transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandFAQs;
