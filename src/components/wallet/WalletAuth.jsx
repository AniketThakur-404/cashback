import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Phone, Mail } from "lucide-react";
import { sendOtp, verifyOtp, googleLogin } from "../../lib/api";
import { storeAuthToken } from "../../lib/auth";

const WalletAuth = ({ onLoginSuccess, initialMode = "login" }) => {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(initialMode === "login");
  const [authMethod, setAuthMethod] = useState("email"); // "phone" or "email"
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

  // Google Authentication State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const handleGoogleLogin = async (selectedEmail, selectedName) => {
    setError("");
    setStatus("");
    setIsGoogleSigningIn(true);
    try {
      const data = await googleLogin(selectedEmail, selectedName);
      storeAuthToken(data.token);
      setStatus("Successfully authenticated with Google!");
      setShowGoogleModal(false);
      if (onLoginSuccess) {
        onLoginSuccess(data.token);
      }
    } catch (err) {
      setError(err.message || "Google authentication failed.");
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  React.useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleMethodChange = (method) => {
    setAuthMethod(method);
    setError("");
    setStatus("");
    setOtpSent(false);
    setOtp("");
  };

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

  const isValidEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleSendOtp = async () => {
    if (!isLoginMode) {
      if (!name.trim()) {
        setError("Enter your name to continue.");
        return;
      }
    }

    let targetPhone = "";
    let targetEmail = "";

    if (authMethod === "phone") {
      if (!phoneNumber.trim()) {
        setError("Enter your phone number to receive an OTP.");
        return;
      }
      if (!isValidPhone(phoneNumber)) {
        setError("Please enter a valid 10-digit phone number.");
        return;
      }
      targetPhone = normalizePhone(phoneNumber);
      targetEmail = !isLoginMode && email.trim() ? email.trim().toLowerCase() : "";
    } else {
      if (!email.trim()) {
        setError("Enter your email address to receive an OTP.");
        return;
      }
      if (!isValidEmail(email)) {
        setError("Please enter a valid email address.");
        return;
      }
      targetEmail = email.trim().toLowerCase();
      targetPhone = !isLoginMode && phoneNumber.trim() ? normalizePhone(phoneNumber) : "";
    }

    setError("");
    setStatus("");
    setIsSendingOtp(true);
    try {
      await sendOtp(
        targetPhone || undefined,
        targetEmail || undefined,
        isLoginMode ? undefined : name.trim(),
        undefined // dob is no longer collected
      );
      setOtpSent(true);
      setStatus(
        authMethod === "phone"
          ? "A verification code has been sent to your phone via SMS."
          : "A verification code has been sent to your email address."
      );
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
      const targetPhone = authMethod === "phone" ? normalizePhone(phoneNumber) : undefined;
      const targetEmail = authMethod === "email" ? email.trim().toLowerCase() : undefined;
      const data = await verifyOtp(targetPhone, otp.trim(), targetEmail);
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

      {/* Premium Auth Method Tabs */}
      {!otpSent && (
        <div className="flex p-1 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-zinc-800/40">
          <button
            type="button"
            onClick={() => handleMethodChange("email")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
              authMethod === "email"
                ? "bg-white dark:bg-zinc-700 text-primary dark:text-white shadow-md shadow-zinc-200/50 dark:shadow-none"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200"
            }`}
          >
            <Mail size={16} />
            <span>Email OTP</span>
          </button>
          <button
            type="button"
            onClick={() => handleMethodChange("phone")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
              authMethod === "phone"
                ? "bg-white dark:bg-zinc-700 text-primary dark:text-white shadow-md shadow-zinc-200/50 dark:shadow-none"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200"
            }`}
          >
            <Phone size={16} />
            <span>Mobile OTP</span>
          </button>
        </div>
      )}

      <div className="space-y-4">
        {!isLoginMode && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
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
        )}

        {/* Primary Input based on method */}
        {authMethod === "phone" ? (
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
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-500 dark:text-gray-400 pointer-events-none">
                <Mail size={16} />
                <span className="text-gray-300 dark:text-zinc-600">|</span>
              </div>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter email address"
                className="w-full rounded-2xl border-0 bg-gray-50 dark:bg-zinc-800/50 pl-12 pr-4 py-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
        )}

        {/* Optional input for the other channel in Sign Up mode */}
        {!isLoginMode && (
          authMethod === "phone" ? (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
                Email Address <span className="text-gray-400 dark:text-gray-500 font-normal normal-case">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-500 dark:text-gray-400 pointer-events-none">
                  <Mail size={16} />
                  <span className="text-gray-300 dark:text-zinc-600">|</span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter optional email"
                  className="w-full rounded-2xl border-0 bg-gray-50 dark:bg-zinc-800/50 pl-12 pr-4 py-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
                Phone Number <span className="text-gray-400 dark:text-gray-500 font-normal normal-case">(optional)</span>
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
                  placeholder="Enter optional phone"
                  maxLength={10}
                  className="w-full rounded-2xl border-0 bg-gray-50 dark:bg-zinc-800/50 pl-[5.5rem] pr-4 py-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>
          )
        )}

        {!otpSent ? (
          <div className="space-y-3">
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

            {/* Premium Google Button */}
            <div className="relative flex items-center justify-center my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100 dark:border-zinc-800/80"></div>
              </div>
              <span className="relative px-3 bg-white dark:bg-zinc-900 text-xs font-bold uppercase tracking-wider text-gray-400">
                or
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-800/40 text-gray-700 dark:text-zinc-200 font-bold py-3.5 hover:bg-gray-50 dark:hover:bg-zinc-800/60 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.48c0,-0.6 -0.05,-1.17 -0.13,-1.7Z" fill="#4285f4" />
                <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.58c-0.92,0.62 -2.1,0.98 -3.3,0.98c-2.33,0 -4.3,-1.57 -5.01,-3.69H2.88v2.66c1.48,2.94 4.51,4.83 7.98,4.83Z" fill="#34a853" />
                <path d="M6.99,13.1c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7V7.04H2.88c-0.6,1.2 -0.94,2.56 -0.94,4.01c0,1.45 0.34,2.81 0.94,4.01l4.11,-3.02Z" fill="#fbbc05" />
                <path d="M12,6.12c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,3.46 14.43,2.6 12,2.6c-3.47,0 -6.5,1.89 -7.98,4.83l4.11,3.02c0.71,-2.11 2.68,-3.69 5.01,-3.69Z" fill="#ea4335" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
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
      {/* Google Simulated Choose Account Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 w-full max-w-md shadow-2xl space-y-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          >
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-4">
              <svg className="w-10 h-10" viewBox="0 0 24 24">
                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.48c0,-0.6 -0.05,-1.17 -0.13,-1.7Z" fill="#4285f4" />
                <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.58c-0.92,0.62 -2.1,0.98 -3.3,0.98c-2.33,0 -4.3,-1.57 -5.01,-3.69H2.88v2.66c1.48,2.94 4.51,4.83 7.98,4.83Z" fill="#34a853" />
                <path d="M6.99,13.1c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7V7.04H2.88c-0.6,1.2 -0.94,2.56 -0.94,4.01c0,1.45 0.34,2.81 0.94,4.01l4.11,-3.02Z" fill="#fbbc05" />
                <path d="M12,6.12c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,3.46 14.43,2.6 12,2.6c-3.47,0 -6.5,1.89 -7.98,4.83l4.11,3.02c0.71,-2.11 2.68,-3.69 5.01,-3.69Z" fill="#ea4335" />
              </svg>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Choose an account</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">to continue to Hype Cashback</p>
              </div>
            </div>

            {/* Account List */}
            {!showCustomGoogleInput ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleGoogleLogin("john.doe@gmail.com", "John Doe")}
                  disabled={isGoogleSigningIn}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-base">
                    JD
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">John Doe</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">john.doe@gmail.com</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleGoogleLogin("jane.smith@gmail.com", "Jane Smith")}
                  disabled={isGoogleSigningIn}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-base">
                    JS
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Jane Smith</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">jane.smith@gmail.com</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(true)}
                  disabled={isGoogleSigningIn}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 flex items-center justify-center font-bold text-lg">
                    +
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Use another account</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sign in with a different email</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
                    Google Name
                  </label>
                  <input
                    type="text"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-2xl border-0 bg-gray-50 dark:bg-zinc-800/50 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
                    Google Email
                  </label>
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full rounded-2xl border-0 bg-gray-50 dark:bg-zinc-800/50 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomGoogleInput(false)}
                    className="flex-1 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 font-bold py-2.5 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGoogleLogin(customGoogleEmail, customGoogleName)}
                    disabled={isGoogleSigningIn || !customGoogleEmail.trim()}
                    className="flex-1 rounded-xl bg-primary hover:bg-primary-strong text-white font-bold py-2.5 transition-colors disabled:opacity-50"
                  >
                    {isGoogleSigningIn ? "Signing in..." : "Continue"}
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800/60">
              <button
                type="button"
                onClick={() => {
                  setShowGoogleModal(false);
                  setShowCustomGoogleInput(false);
                }}
                className="text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <span className="text-xs text-gray-400">Protected by Google</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletAuth;
