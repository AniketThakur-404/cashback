import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { requestWithdrawal } from "../../lib/api";

const formatAmount = (value) => {
    if (value === undefined || value === null) return "0.00";
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric.toFixed(2);
    return String(value);
};

const WithdrawCard = ({ token, balance, onWithdrawSuccess }) => {
    const [amount, setAmount] = useState("");
    const [methodType, setMethodType] = useState("upi");
    const [upiId, setUpiId] = useState("");
    const [bankAccountNumber, setBankAccountNumber] = useState("");
    const [bankIfsc, setBankIfsc] = useState("");
    const [bankAccountHolder, setBankAccountHolder] = useState("");
    const [bankName, setBankName] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("idle");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleWithdraw = async () => {
        if (!amount || Number(amount) <= 0) {
            setMessage("Enter a valid amount.");
            setStatus("error");
            return;
        }

        const currentBalance = Number(balance || 0);
        if (Number(amount) > currentBalance) {
            setMessage("Insufficient balance.");
            setStatus("error");
            return;
        }

        if (methodType === "upi") {
            if (!upiId.trim()) {
                setMessage("Enter a valid UPI ID.");
                setStatus("error");
                return;
            }
        } else {
            if (!bankAccountNumber.trim() || !bankIfsc.trim()) {
                setMessage("Enter account number and IFSC code.");
                setStatus("error");
                return;
            }
            if (!/^[0-9]{9,18}$/.test(bankAccountNumber.trim())) {
                setMessage("Invalid bank account number.");
                setStatus("error");
                return;
            }
            if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(bankIfsc.trim())) {
                setMessage("Invalid IFSC code.");
                setStatus("error");
                return;
            }
        }

        setIsSubmitting(true);
        setMessage("");
        setStatus("idle");

        try {
            const payload =
                methodType === "upi"
                    ? { amount: Number(amount), upiId: upiId.trim() }
                    : {
                        amount: Number(amount),
                        bank: {
                            accountNumber: bankAccountNumber.trim(),
                            ifsc: bankIfsc.trim().toUpperCase(),
                            accountHolderName: bankAccountHolder.trim(),
                            bankName: bankName.trim(),
                        },
                    };

            await requestWithdrawal(token, payload);
            setMessage(`Withdrawal of INR ${formatAmount(amount)} requested successfully.`);
            setStatus("success");
            setAmount("");

            if (methodType === "upi") {
                setUpiId("");
            } else {
                setBankAccountNumber("");
                setBankIfsc("");
                setBankAccountHolder("");
                setBankName("");
            }

            if (onWithdrawSuccess) onWithdrawSuccess();
        } catch (err) {
            setMessage(err.message || "Withdrawal failed.");
            setStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl">
                    <ArrowUpRight size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Withdraw to Bank</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">UPI or Net Banking transfer</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
                    <button
                        type="button"
                        onClick={() => setMethodType("upi")}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${methodType === "upi"
                                ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-500 dark:text-gray-300"
                            }`}
                    >
                        UPI
                    </button>
                    <button
                        type="button"
                        onClick={() => setMethodType("bank")}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${methodType === "bank"
                                ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-500 dark:text-gray-300"
                            }`}
                    >
                        Net Banking
                    </button>
                </div>

                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">INR</span>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-rose-500/20 text-gray-900 dark:text-white transition-all placeholder:text-gray-400"
                    />
                </div>

                {methodType === "upi" ? (
                    <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="UPI ID (e.g. user@okhdfcbank)"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-rose-500/20 text-gray-900 dark:text-white transition-all placeholder:text-gray-400"
                    />
                ) : (
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={bankAccountHolder}
                            onChange={(e) => setBankAccountHolder(e.target.value)}
                            placeholder="Account holder name"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-rose-500/20 text-gray-900 dark:text-white transition-all placeholder:text-gray-400"
                        />
                        <input
                            type="text"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="Bank name (optional)"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-rose-500/20 text-gray-900 dark:text-white transition-all placeholder:text-gray-400"
                        />
                        <input
                            type="text"
                            value={bankAccountNumber}
                            onChange={(e) => setBankAccountNumber(e.target.value)}
                            placeholder="Account number"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-rose-500/20 text-gray-900 dark:text-white transition-all placeholder:text-gray-400"
                        />
                        <input
                            type="text"
                            value={bankIfsc}
                            onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                            placeholder="IFSC code (e.g. HDFC0001234)"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-rose-500/20 text-gray-900 dark:text-white transition-all placeholder:text-gray-400 uppercase"
                        />
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleWithdraw}
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                    {isSubmitting ? "Processing..." : "Withdraw"}
                </button>
            </div>

            {message && (
                <div className={`mt-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${status === "success"
                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                        : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                    }`}>
                    {status === "success" ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    )}
                    {message}
                </div>
            )}
        </div>
    );
};

export default WithdrawCard;
