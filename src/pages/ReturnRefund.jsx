import React from "react";
import { Link } from "react-router-dom";

const ReturnRefund = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 pb-24 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Return &amp; Refund Policy
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-snug">
            Assured Rewards keeps your cashback history, wallet balance and
            campaign participation safe. These simple steps explain how we handle
            product returns, refunds and wallet adjustments once a verified scan
            has been completed.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 flex gap-3">
            <span>
              <Link
                to="/privacy-policy"
                className="text-primary hover:underline"
              >
                Privacy Policy
              </Link>
            </span>
            <span>
              <Link
                to="/terms"
                className="text-primary hover:underline"
              >
                Terms &amp; Conditions
              </Link>
            </span>
          </p>
        </header>

        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Return Conditions
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Products that are part of an Assured Rewards campaign are eligible
            for return only if the QR code scan is pending confirmation or if a
            genuine order has not shipped yet. Contact the partnered brand or
            our support team to initiate a return: <strong>+91 83689 26325 </strong>
            or <strong>support@assuredrewards.in</strong>.
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>Keep the original packaging that carries the QR label.</li>
            <li>Provide the scan hash shown in your wallet history.</li>
            <li>Refund requests after 10 days need approval from the brand.</li>
          </ul>
        </section>

        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Refund Timeline
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Once we confirm a return, the refunded amount (cashback or wallet
            credit) is processed within 48 hours. The credited amount appears
            automatically in your Assured Rewards wallet under the Wallet tab.
            If a partner brand processes the refund, it will be reflected within
            one business day after we receive confirmation.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>
              If a refund is approved after you already redeemed a reward
              product, the points are adjusted automatically and you receive a
              notification on the homepage feed.
            </p>
            <p>
              We do not charge a restocking fee for verified returns. Physical
              shipping costs are handled by the brands based on their own
              logistics policies.
            </p>
          </div>
        </section>

        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Disputes and Escalation
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            If a refunded amount fails to appear, reply to the same support
            request or email <strong>support@assuredrewards.in</strong> with your
            campaign name, QR hash, and sampling date. Our team reviews
            disputes within 24 hours and communicates status updates via the
            notifications center.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            For policy clarifications, call <strong>+91 83689 26325</strong> and
            ask for the returns desk; we log each call and add it to your wallet
            history for auditing.
          </p>
        </section>

        <footer className="bg-gray-900 rounded-3xl p-6 text-white text-sm space-y-3">
          <p className="font-semibold text-white">Need help?</p>
          <p>
            Our support team is available Monday to Saturday, 10 AM to 7 PM IST.
          </p>
          <p>
            Email: <strong>support@assuredrewards.in</strong> · Phone:{" "}
            <strong>+91 83689 26325</strong>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ReturnRefund;
