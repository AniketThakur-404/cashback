import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Phone } from "lucide-react";
import { sendOtp, verifyOtp } from "../../lib/api";
import { storeAuthToken } from "../../lib/auth";

const WalletAuth = ({ onLoginSuccess, initialMode = "login" }) => {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(initialMode === "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  React.useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const isValidPhone = (phone) => {
    // Accept 10-digit Indian numbers, optionally prefixed with +91 or 91
    const cleaned = phone.replace(/[\s\-()]/g, "");
    return /^(\+91|91)?[6-9]\d{9}$/.test(cleaned);
  };

  const normalizePhone = (phone) => {
    let cleaned = phone.replace(/[\s\-()]/g, "");
    // Strip +91 or 91 prefix to get raw 10-digit number
    if (cleaned.startsWith("+91")) cleaned = cleaned.slice(3);
    else if (cleaned.startsWith("91") && cleaned.length === 12) cleaned = cleaned.slice(2);
    return cleaned;
  };

  const handleSendOtp = async () => {
    if (!isLoginMode) {
      if (!name.trim()) {
        setError("Enter your name to continue.");
        return;
      }
    }
    if (!phoneNumber.trim()) {
      setError("Enter your phone number to receive an OTP.");
      return;
    }
    if (!isValidPhone(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setError("");
    setStatus("");
    setIsSendingOtp(true);
    try {
      const normalized = normalizePhone(phoneNumber);
      const data = await sendOtp(
        normalized,
        isLoginMode ? undefined : email.trim().toLowerCase() || undefined,
        isLoginMode ? undefined : name.trim(),
        undefined // dob is no longer collected
      );
      setOtpSent(true);
      setStatus("A verification code has been sent to your phone via SMS.");
      setResendCooldown(30); // 30 seconds cooldown
    } catch (err) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError("Enter the OTP to continue.");
      return;
    }
    setError("");
    setStatus("");
    setIsVerifyingOtp(true);
    try {
      const normalized = normalizePhone(phoneNumber);
      const data = await verifyOtp(normalized, otp.trim());
      storeAuthToken(data.token);
      setStatus("Verified. Wallet connected.");
      if (onLoginSuccess) {
        onLoginSuccess(data.token);
      }
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 shadow-xl shadow-zinc-900/5 space-y-6 w-full max-w-xl mx-auto">
      <div className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-white">
        <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-xl text-primary">
          <ShieldCheck size={24} />
        </div>
        {isLoginMode ? "Login to view Wallet" : "Sign Up for Wallet"}
      </div>

      <div className="space-y-4">
        {!isLoginMode && (
          <>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-2xl border-0 bg-gray-50 dark:bg-zinc-800/50 px-4 py-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400"
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-500 dark:text-gray-400 pointer-events-none">
              <Phone size={16} />
              <span className="text-sm font-semibold">+91</span>
              <span className="text-gray-300 dark:text-zinc-600">|</span>
            </div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="Enter phone number"
              maxLength={10}
              className="w-full rounded-2xl border-0 bg-gray-50 dark:bg-zinc-800/50 pl-[5.5rem] pr-4 py-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {!isLoginMode && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
              Email Address <span className="text-gray-400 dark:text-gray-500 font-normal normal-case">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-2xl border-0 bg-gray-50 dark:bg-zinc-800/50 px-4 py-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400"
            />
          </div>
        )}

        {!otpSent ? (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isSendingOtp}
            className="w-full rounded-2xl bg-primary hover:bg-primary-strong text-white font-bold py-3.5 shadow-lg shadow-primary/25 disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSendingOtp 
              ? "Sending Code..." 
              : isLoginMode 
                ? "Send Verification Code" 
                : "Sign Up & Send Code"}
          </button>
        ) : (
          <>
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="0 0 0 0 0 0"
                  maxLength={6}
                  className="w-full rounded-2xl border-2 border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 px-4 py-4 text-gray-900 dark:text-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-gray-300 tracking-[0.75em] text-center font-bold text-2xl shadow-inner"
                />
              </div>
              
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || resendCooldown > 0}
                  className="text-xs font-bold text-primary hover:text-primary-strong disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {isSendingOtp 
                    ? "Sending..." 
                    : resendCooldown > 0 
                      ? `Resend available in ${resendCooldown}s` 
                      : "Didn't receive the code? Resend"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp}
                className="w-full rounded-2xl bg-gray-900 text-white font-bold py-3.5 shadow-lg disabled:opacity-60 dark:bg-white dark:text-gray-900 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isVerifyingOtp ? "Verifying..." : "Verify & Connect Wallet"}
              </button>
            </div>
          </>
        )}
        {!otpSent && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                if (isLoginMode) {
                  navigate("/signup");
                } else {
                  navigate("/signin");
                }
                setIsLoginMode(!isLoginMode);
                setError("");
                setStatus("");
              }}
              className="text-xs font-bold text-primary hover:text-primary-strong transition-colors"
            >
              {isLoginMode ? "New user? Sign up here" : "Already have an account? Login"}
            </button>
          </div>
        )}
      </div>



      {status && (
        <div className="p-4 bg-primary/5 border border-primary/10 text-primary text-sm font-semibold rounded-2xl text-center animate-in fade-in zoom-in-95 duration-300">
          {status}
        </div>
      )}

      {error && (
        <div 
          onClick={() => {
            const lowerError = error.toLowerCase();
            if (lowerError.includes('sign up')) {
              setIsLoginMode(false);
              navigate("/signup");
              setError("");
              setStatus("");
            } else if (lowerError.includes('login')) {
              setIsLoginMode(true);
              navigate("/signin");
              setError("");
              setStatus("");
            }
          }}
          className={`p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-2xl text-center animate-in shake-in ${
            error.toLowerCase().includes('sign up') || error.toLowerCase().includes('login') 
              ? 'cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-all active:scale-[0.98]' 
              : ''
          }`}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default WalletAuth;
