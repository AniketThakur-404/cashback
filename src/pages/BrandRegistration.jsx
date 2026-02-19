"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Check,
  Building2,
  Globe,
  MapPin,
  Upload,
  FileText,
  Briefcase,
  LayoutGrid,
  Loader2,
  ShoppingBag,
  Utensils,
  Laptop,
  Shirt,
  Plane,
  Heart,
  Music,
  Camera,
  Coffee,
  Zap,
  User, // Added
  Mail, // Added
  Phone, // Added
  Lock,
  X,
  Eye,
  EyeOff,
  CreditCard, // Added
  Banknote, // Added
  ShieldCheck, // Added
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "../lib/apiClient";
import { uploadImage } from "../lib/api";
import { cn } from "../lib/utils";

// ============================================================================
// CONSTANTS & OPTIONS
// ============================================================================

const INDUSTRY_OPTIONS = [
  {
    value: "retail",
    label: "Retail & E-commerce",
    icon: ShoppingBag,
    description: "Online and offline stores",
  },
  {
    value: "food_beverage",
    label: "Food & Beverage",
    icon: Utensils,
    description: "Restaurants, cafes, packaged food",
  },
  {
    value: "technology",
    label: "Technology & SaaS",
    icon: Laptop,
    description: "Software, hardware, IT services",
  },
  {
    value: "fashion_lifestyle",
    label: "Fashion & Lifestyle",
    icon: Shirt,
    description: "Apparel, accessories, beauty",
  },
  {
    value: "travel_hospitality",
    label: "Travel & Hospitality",
    icon: Plane,
    description: "Hotels, tours, agencies",
  },
  {
    value: "health_wellness",
    label: "Health & Wellness",
    icon: Heart,
    description: "Fitness, medical, personal care",
  },
  {
    value: "entertainment",
    label: "Entertainment & Media",
    icon: Music,
    description: "Music, film, content creation",
  },
  {
    value: "creative_arts",
    label: "Creative Arts",
    icon: Camera,
    description: "Design, photography, art",
  },
  {
    value: "services",
    label: "Professional Services",
    icon: Briefcase,
    description: "Consulting, legal, financial",
  },
  {
    value: "other",
    label: "Other",
    icon: LayoutGrid,
    description: "Various other industries",
  },
];

const STEPS = [
  { id: 0, key: "plan", label: "Choose Plan" },
  { id: 1, key: "account", label: "Account" },
  { id: 2, key: "identity", label: "Brand Identity" },
  { id: 3, key: "industry", label: "Industry" },
  { id: 4, key: "details", label: "Brand Details" },
  { id: 5, key: "review", label: "Review & Submit" },
];

// ============================================================================
// UI COMPONENTS (Inline for portability)
// ============================================================================

const Button = ({
  className,
  variant = "primary",
  size = "default",
  ...props
}) => {
  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary-strong shadow-lg shadow-primary/20",
    outline: "border border-gray-200 bg-white hover:bg-gray-50 text-gray-900",
    ghost: "hover:bg-gray-50 text-gray-500 hover:text-gray-900",
  };
  const sizes = {
    default: "h-11 px-6 py-2",
    sm: "h-9 px-3",
    lg: "h-14 px-8 text-lg",
    icon: "h-10 w-10 p-0 flex items-center justify-center",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
};

const Input = ({ className, ...props }) => (
  <input
    className={cn(
      "flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
      className,
    )}
    {...props}
  />
);

const Label = ({ className, ...props }) => (
  <label
    className={cn(
      "text-sm font-medium leading-none text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className,
    )}
    {...props}
  />
);

const Textarea = ({ className, ...props }) => (
  <textarea
    className={cn(
      "flex min-h-[120px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-all duration-200",
      className,
    )}
    {...props}
  />
);

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StepHeader = ({ title, subtitle }) => (
  <div className="mb-8 text-center px-4">
    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight tracking-tight">
      {title}
    </h1>
    {subtitle && (
      <p className="text-gray-500 text-base md:text-lg max-w-lg mx-auto font-light">
        {subtitle}
      </p>
    )}
  </div>
);

const OptionCard = ({ selected, onClick, label, description, icon: Icon }) => (
  <motion.button
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    type="button"
    onClick={onClick}
    className={cn(
      "group relative w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-300 overflow-hidden text-left",
      selected
        ? "border-primary/50 bg-primary/5 shadow-sm"
        : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300",
    )}
  >
    {selected && (
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
    )}

    <div className="flex items-center gap-4 md:gap-5">
      {Icon && (
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
            selected
              ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
              : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600",
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div>
        <h3
          className={cn(
            "text-base md:text-lg font-semibold transition-colors",
            selected ? "text-primary" : "text-gray-900",
          )}
        >
          {label}
        </h3>
        {description && (
          <p className="text-gray-500 text-xs md:text-sm mt-1 group-hover:text-gray-600 transition-colors line-clamp-1">
            {description}
          </p>
        )}
      </div>
    </div>

    <div
      className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 ml-4 transition-all duration-300 border",
        selected
          ? "bg-primary border-primary text-white scale-110"
          : "bg-transparent border-gray-200 text-transparent group-hover:border-gray-300",
      )}
    >
      <Check className="w-3.5 h-3.5 stroke-3" />
    </div>
  </motion.button>
);

const ActionButton = ({ onClick, disabled, loading, children }) => (
  <Button
    onClick={onClick}
    disabled={disabled || loading}
    className="w-full h-14 text-base font-bold rounded-full bg-primary text-white hover:bg-primary-strong transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(5,150,105,0.2)] disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
  >
    {loading ? (
      <span className="flex items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        Processing...
      </span>
    ) : (
      children
    )}
  </Button>
);

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

const BrandRegistration = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Always start at Step 0 (Account)
  const [currentStep, setCurrentStep] = useState(0);
  const isLoggedIn = Boolean(token);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Username validation state
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // 'available' or 'taken'

  // Form State
  const [formData, setFormData] = useState({
    // Plan Field
    planType: "prepaid",

    // Account Fields
    contactName: "",
    companyName: "",
    designation: "",
    email: "",
    phoneNumber: "",
    alternatePhone: "",
    username: "",
    password: "",
    confirmPassword: "",

    // Brand Fields
    name: "",
    website: "",
    industry: "",
    logoUrl: "",
    logoFile: null, // Store actual file
    logoPreview: null, // Store local preview URL
    description: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
  });

  const totalSteps = STEPS.length - 1; // 0 to 5

  // Handlers
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
    if (field === "username") {
      setUsernameStatus(null);
    }
  };

  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) return;
    setIsCheckingUsername(true);
    try {
      const res = await apiRequest("/api/auth/check-username", {
        method: "POST",
        body: { username: username.trim() },
      });
      setUsernameStatus(res.available ? "available" : "taken");
    } catch (err) {
      console.error("Username check failed", err);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size/type if needed
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("Image size too large (max 5MB)");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          logoFile: file,
          logoPreview: reader.result,
          logoUrl: "", // Clear manual URL if file selected
        }));
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Plan
        if (!formData.planType) return "Please select a plan type.";
        return "";
      case 1: // Account
        if (!formData.contactName.trim()) return "Contact name is required.";
        if (!formData.designation.trim()) return "Designation is required.";
        if (!formData.phoneNumber.trim()) return "Phone number is required.";
        if (!formData.email.trim() || !formData.email.includes("@"))
          return "Valid email is required.";
        if (!formData.username.trim()) return "Username is required.";
        if (usernameStatus === "taken") return "Username is already taken.";
        // Password is only required for new users (not logged in)
        if (!isLoggedIn) {
          if (formData.password.length < 6)
            return "Password must be at least 6 characters.";
          if (formData.password !== formData.confirmPassword)
            return "Passwords do not match.";
        } else {
          // For logged-in users, password is optional but must be valid if provided
          if (formData.password && formData.password.length < 6)
            return "Password must be at least 6 characters.";
          if (
            formData.password &&
            formData.password !== formData.confirmPassword
          )
            return "Passwords do not match.";
        }
        return "";
      case 2: // Identity
        if (!formData.companyName.trim()) return "Company name is required.";
        if (!formData.name.trim()) return "Brand name is required.";
        if (formData.website && !formData.website.includes("."))
          return "Please enter a valid website URL.";
        return "";
      case 3: // Industry
        if (!formData.industry) return "Please select an industry.";
        return "";
      case 4: // Details
        if (!formData.description.trim())
          return "Brand description is required.";
        if (!formData.address.trim()) return "Street address is required.";
        if (!formData.city.trim()) return "City is required.";
        if (!formData.state.trim()) return "State is required.";
        if (!formData.pincode.trim()) return "Pincode is required.";
        if (!formData.gstNumber.trim()) return "GST number is required.";
        return "";
      default:
        return "";
    }
  };

  const handleNext = () => {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (currentStep < 5) {
      setCurrentStep((curr) => curr + 1);
      setError("");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((curr) => curr - 1);
      setError("");
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async () => {
    const validationError = validateStep(currentStep);
    if (validationError && currentStep !== 5) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      let activeToken = token;

      // 1. Register User if not logged in
      if (!activeToken) {
        const registerRes = await apiRequest("/api/auth/register", {
          method: "POST",
          body: {
            name: formData.contactName,
            email: formData.email,
            username: formData.username,
            password: formData.password,
            role: "vendor",
          },
        });

        if (registerRes.token) {
          activeToken = registerRes.token;
          localStorage.setItem("token", activeToken); // Save for session
          setToken(activeToken); // Update state
        } else {
          throw new Error("Registration succeeded but no token returned.");
        }
      } else if (formData.password && formData.password.length >= 6) {
        // 2. For logged-in users: Set/Update Password if provided
        try {
          await apiRequest("/api/auth/set-password", {
            method: "POST",
            body: {
              password: formData.password,
            },
            token: activeToken,
          });
        } catch (pwErr) {
          console.error("Password update failed:", pwErr);
          // Non-blocking: Log but continue with brand creation
        }
      }

      {
        /* 3. Get image URL (Upload or use existing) */
      }
      let finalLogoUrl = formData.logoUrl;

      if (formData.logoFile) {
        try {
          const uploadRes = await uploadImage(activeToken, formData.logoFile);
          // endpoint returns { message, url }
          finalLogoUrl = uploadRes.url;
        } catch (uploadErr) {
          console.error("Image upload failed:", uploadErr);
          throw new Error(
            "Failed to upload logo. Please try again or use a URL.",
          );
        }
      }

      // 2. Update Vendor Profile with Business Info
      await apiRequest("/api/vendor/profile", {
        method: "PUT",
        body: {
          businessName: formData.companyName,
          contactPhone: formData.phoneNumber,
          alternatePhone: formData.alternatePhone,
          designation: formData.designation,
          gstin: formData.gstNumber,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        token: activeToken,
      });

      // 4. Create Brand
      await apiRequest("/api/vendor/brands", {
        method: "POST",
        body: {
          name: formData.name,
          website: formData.website,
          industry: formData.industry,
          logoUrl: finalLogoUrl,
          description: formData.description,
          defaultPlanType: formData.planType,
        },
        token: activeToken,
      });

      // Success
      // alert("Welcome! Your brand has been registered.");
      navigate("/vendor-dashboard"); // Redirect to Dashboard
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "Failed to process request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle logout for fresh registration
  const handleStartFresh = () => {
    localStorage.removeItem("token");
    setToken(null);
    setFormData((prev) => ({
      ...prev,
      contactName: "",
      email: "",
      password: "",
      confirmPassword: "",
    }));
  };

  // Render Plan Selection Step
  const renderPlanStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <StepHeader
        title="Choose your billing plan"
        subtitle="Select how you want to fund your cashback campaigns."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Prepaid Plan */}
        <button
          type="button"
          onClick={() => handleFieldChange("planType", "prepaid")}
          className={cn(
            "relative p-6 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-md flex flex-col h-full",
            formData.planType === "prepaid"
              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
              : "border-gray-100 bg-white hover:border-gray-200",
          )}
        >
          {formData.planType === "prepaid" && (
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm z-10">
              <Check className="w-5 h-5 text-white stroke-3" />
            </div>
          )}
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
            <Banknote className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Prepaid Plan</h3>
          <p className="text-gray-500 text-sm mb-6 grow">
            Pay upfront, get full control. Lock your cashback budget before
            launching campaigns.
          </p>
          <div className="space-y-3 pt-4 border-t border-gray-100/50">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Best for fixed budgets</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>No risk of overspending</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Instant qr activation</span>
            </div>
          </div>
        </button>

        {/* Postpaid Plan */}
        <button
          type="button"
          onClick={() => handleFieldChange("planType", "postpaid")}
          className={cn(
            "relative p-6 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-md flex flex-col h-full",
            formData.planType === "postpaid"
              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
              : "border-gray-100 bg-white hover:border-gray-200",
          )}
        >
          {formData.planType === "postpaid" && (
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm z-10">
              <Check className="w-5 h-5 text-white stroke-3" />
            </div>
          )}
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Postpaid Plan
          </h3>
          <p className="text-gray-500 text-sm mb-6 grow">
            Pay as you go. No upfront budget lock — pay only when QR codes are
            redeemed.
          </p>
          <div className="space-y-3 pt-4 border-t border-gray-100/50">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Maximum flexibility</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Pay only for results</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Pay according to sheet</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  // Render Account Step
  const renderAccountStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <StepHeader
        title={isLoggedIn ? "Verify Account" : "Create Account"}
        subtitle={
          isLoggedIn
            ? "You're logged in. Continue with your account or start fresh."
            : "First, let's create your vendor access."
        }
      />

      {isLoggedIn && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-primary/20 shadow-sm">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-gray-900 font-medium">Currently logged in</p>
              <p className="text-gray-500 text-sm">
                You can continue with this account or create a new one
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStartFresh}
            className="text-sm text-primary hover:text-primary/80 font-medium underline underline-offset-4"
          >
            Register New Account
          </button>
        </div>
      )}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-base text-gray-900">Username</Label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <User className="w-5 h-5" />
            </div>
            <Input
              placeholder="unique_username"
              className={cn(
                "pl-12 h-14 bg-gray-50 border-gray-200 text-lg focus:border-primary/50 transition-all",
                usernameStatus === "available" &&
                  "border-green-500 bg-green-50/30",
                usernameStatus === "taken" && "border-red-500 bg-red-50/30",
              )}
              value={formData.username}
              onChange={(e) => {
                const val = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9_]/g, "");
                handleFieldChange("username", val);
              }}
              onBlur={(e) => checkUsernameAvailability(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
              {isCheckingUsername && (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              )}
              {!isCheckingUsername && usernameStatus === "available" && (
                <Check className="w-5 h-5 text-green-500" />
              )}
              {!isCheckingUsername && usernameStatus === "taken" && (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>
          {usernameStatus === "taken" && (
            <p className="text-xs text-red-500 mt-1 ml-1">
              Username already taken.
            </p>
          )}
          {usernameStatus === "available" && (
            <p className="text-xs text-green-600 mt-1 ml-1">
              Username is available!
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-base text-gray-900">Full Name</Label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <User className="w-5 h-5" />
            </div>
            <Input
              placeholder="John Doe"
              className="pl-12 h-14 bg-gray-50 border-gray-200 text-lg focus:border-primary/50 transition-all"
              value={formData.contactName}
              onChange={(e) => handleFieldChange("contactName", e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-base text-gray-900">Designation</Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <Input
                placeholder="e.g. CEO, Director"
                className="pl-12 h-14 bg-gray-50 border-gray-200 text-lg focus:border-primary/50 transition-all"
                value={formData.designation}
                onChange={(e) =>
                  handleFieldChange("designation", e.target.value)
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-gray-900">Phone Number</Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Phone className="w-5 h-5" />
              </div>
              <Input
                type="tel"
                placeholder="10-digit mobile"
                className="pl-12 h-14 bg-gray-50 border-gray-200 text-lg focus:border-primary/50 transition-all"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleFieldChange("phoneNumber", e.target.value)
                }
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-base text-gray-900">
            Alternate Mobile (Optional)
          </Label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Phone className="w-5 h-5" />
            </div>
            <Input
              type="tel"
              placeholder="Alternate mobile number"
              className="pl-12 h-14 bg-gray-50 border-gray-200 text-lg focus:border-primary/50 transition-all"
              value={formData.alternatePhone}
              onChange={(e) =>
                handleFieldChange("alternatePhone", e.target.value)
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-base text-gray-900">Work Email</Label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="w-5 h-5" />
            </div>
            <Input
              type="email"
              placeholder="name@company.com"
              className="pl-12 h-14 bg-gray-50 border-gray-200 text-lg focus:border-primary/50 transition-all"
              value={formData.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-base text-gray-900">
              Password{" "}
              {isLoggedIn && (
                <span className="text-gray-400 text-sm font-normal">
                  (optional)
                </span>
              )}
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="******"
                className="pl-12 pr-12 h-14 bg-gray-50 border-gray-200 text-lg focus:border-primary/50 transition-all"
                value={formData.password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex="-1"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-gray-900">Confirm Password</Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="******"
                className="pl-12 pr-12 h-14 bg-gray-50 border-gray-200 text-lg focus:border-primary/50 transition-all"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleFieldChange("confirmPassword", e.target.value)
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex="-1"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
        <p className="text-gray-500 text-sm text-center pt-2">
          Already have an account?{" "}
          <a href="/vendor" className="text-primary hover:underline">
            Log in here
          </a>
        </p>
      </div>
    </div>
  );

  // ... (Steps 1, 2, 3 remain same - just update formData references if needed, but we used same object)

  // ... Copy Step 1-3 from existing file but ensure they are included in the render ...

  // Wait, to use replace_file_content effectively I need to be careful not to delete the existing render steps if I don't include them in ReplacementContent.
  // The Tool says: "ReplacementContent must be a complete drop-in replacement of the TargetContent".
  // I should select the block from "const BrandRegistration = () => {" to the end.

  // Since I cannot see the FULL file content in my memory buffer cleanly for a huge One-Shot replacement without risking mistakes,
  // I will use "replace_file_content" on the Specific Block "const BrandRegistration ... " and rewrite the component body.

  // I need to make sure I include renderStep1, renderStep2, renderStep3, renderStep4 definitions inside.
  // I will include them in my ReplacementContent.

  // Let's grab the render functions from the file view I just did (Step 152).
  // I will copy them into my replacement content to ensure they are preserved.

  const renderIdentityStep = () => (
    // Identity
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <StepHeader
        title="What's your brand called?"
        subtitle="Let's start with the basics of your brand identity."
      />

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-base text-gray-900">Company Name</Label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Building2 className="w-5 h-5" />
            </div>
            <Input
              placeholder="e.g. Acme Corp Pvt Ltd"
              className="pl-12 h-14 bg-gray-50 border-gray-200 text-lg focus:border-primary/50 transition-all"
              value={formData.companyName}
              onChange={(e) => handleFieldChange("companyName", e.target.value)}
              autoFocus={currentStep === 1}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-base text-gray-900">Brand Name</Label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Building2 className="w-5 h-5" />
            </div>
            <Input
              placeholder="e.g. Acme Brand"
              className="pl-12 h-14 bg-gray-50 border-gray-200 text-lg focus:border-primary/50 transition-all"
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-base text-gray-900">Website (Optional)</Label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Globe className="w-5 h-5" />
            </div>
            <Input
              placeholder="e.g. www.acme.com"
              className="pl-12 h-14 bg-gray-50 border-gray-200 text-lg focus:border-primary/50 transition-all"
              value={formData.website}
              onChange={(e) => handleFieldChange("website", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderIndustryStep = () => (
    // Industry
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <StepHeader
        title="Which industry fits best?"
        subtitle="Helping us categorize your brand for better visibility."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {INDUSTRY_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            selected={formData.industry === option.value}
            onClick={() => handleFieldChange("industry", option.value)}
            label={option.label}
            description={option.description}
            icon={option.icon}
          />
        ))}
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    // Details
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <StepHeader
        title="Tell us more"
        subtitle="Add a logo and detailed description to make your brand stand out."
      />

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-base text-gray-900">Brand Logo</Label>
          <div className="flex flex-col gap-4">
            {/* Drag & Drop / Click Area */}
            <div className="relative group">
              <input
                type="file"
                id="logo-upload-step"
                className="hidden"
                accept="image/*"
                onChange={handleLogoChange}
              />
              <label
                htmlFor="logo-upload-step"
                className={`w-full h-32 rounded-xl flex flex-col items-center justify-center border-2 border-dashed transition-all cursor-pointer overflow-hidden relative ${
                  formData.logoPreview
                    ? "border-primary bg-white/5"
                    : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                {formData.logoPreview ? (
                  <>
                    <img
                      src={formData.logoPreview}
                      alt="Logo Preview"
                      className="h-full w-auto object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-gray-900 text-sm font-medium flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Change
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-3 border border-gray-100">
                      <Upload
                        size={20}
                        className="text-gray-400 group-hover:text-primary transition-colors"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      SVG, PNG, JPG (max 5MB)
                    </span>
                  </>
                )}
              </label>
              {formData.logoPreview && (
                <button
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      logoFile: null,
                      logoPreview: null,
                    }))
                  }
                  className="absolute -top-2 -right-2 bg-red-500/90 text-white p-1 rounded-full shadow-lg hover:bg-red-500 transition-colors"
                  title="Remove logo"
                >
                  <X size={14} fill="currentColor" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-base text-gray-900">Description</Label>
          <div className="relative">
            <div className="absolute left-4 top-4 text-gray-400">
              <FileText className="w-5 h-5" />
            </div>
            <Textarea
              placeholder="Describe your brand's mission, products, or services..."
              className="pl-12 min-h-[160px] bg-gray-50 border-gray-200 text-lg focus:border-primary/50 transition-all leading-relaxed placeholder:text-gray-400"
              value={formData.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-base text-gray-900">Street Address</Label>
          <div className="relative">
            <div className="absolute left-4 top-4 text-gray-400">
              <MapPin className="w-5 h-5" />
            </div>
            <Textarea
              placeholder="e.g. 123 Main St, Suite 100"
              className="pl-12 bg-gray-50 border-gray-200 text-lg focus:border-primary/50 transition-all min-h-[100px]"
              value={formData.address}
              onChange={(e) => handleFieldChange("address", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-base text-gray-900">City</Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <MapPin className="w-5 h-5" />
              </div>
              <Input
                placeholder="City"
                className="pl-12 h-14 bg-gray-50 border-gray-200 text-lg focus:border-primary/50 transition-all"
                value={formData.city}
                onChange={(e) => handleFieldChange("city", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-gray-900">State</Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <MapPin className="w-5 h-5" />
              </div>
              <Input
                placeholder="State"
                className="pl-12 h-14 bg-gray-50 border-gray-200 text-lg focus:border-primary/50 transition-all"
                value={formData.state}
                onChange={(e) => handleFieldChange("state", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-base text-gray-900">Pincode</Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <MapPin className="w-5 h-5" />
              </div>
              <Input
                placeholder="6-digit pincode"
                className="pl-12 h-14 bg-gray-50 border-gray-200 text-lg focus:border-primary/50 transition-all"
                value={formData.pincode}
                onChange={(e) => handleFieldChange("pincode", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-gray-900">GST Number</Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FileText className="w-5 h-5" />
              </div>
              <Input
                placeholder="GSTIN"
                className="pl-12 h-14 bg-gray-50 border-gray-200 text-lg focus:border-primary/50 transition-all"
                value={formData.gstNumber}
                onChange={(e) => handleFieldChange("gstNumber", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    // Review
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <StepHeader
        title="Review & Submit"
        subtitle="Please verify your information before creating the brand."
      />

      <div className="bg-gray-50 rounded-3xl border border-gray-200 overflow-hidden divide-y divide-gray-100 shadow-sm">
        <div className="p-6 md:p-8 flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 shadow-sm">
            {formData.logoPreview || formData.logoUrl ? (
              <img
                src={formData.logoPreview || formData.logoUrl}
                alt="Logo"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              <Building2 className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-gray-900">
              {formData.name}
            </h3>
            <div className="flex items-center gap-2 text-primary">
              <Globe className="w-4 h-4" />
              <a
                href={formData.website}
                target="_blank"
                rel="noreferrer"
                className="text-sm underline hover:no-underline font-medium"
              >
                {formData.website || "No website"}
              </a>
            </div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600 shadow-sm mt-2">
              {INDUSTRY_OPTIONS.find((i) => i.value === formData.industry)
                ?.label || formData.industry}
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-2">
          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-widest">
            Description
          </h4>
          <p className="text-gray-700 leading-relaxed text-lg">
            {formData.description || "No description provided."}
          </p>
        </div>

        {/* Account & Company Summary */}
        <div className="p-6 md:p-8 space-y-4 bg-white/50">
          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-widest">
            Registration Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Contact</p>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span className="font-medium">{formData.contactName}</span>
                <span className="text-gray-400 text-sm">
                  ({formData.designation})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>{formData.email}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Company</p>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="font-medium">{formData.companyName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>{formData.phoneNumber}</span>
                {formData.alternatePhone && (
                  <span className="text-gray-400 text-sm">
                    / {formData.alternatePhone}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <p className="text-xs text-gray-400">Compliance & Location</p>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm">GST: {formData.gstNumber}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <span className="text-sm line-clamp-2">
                  {formData.address}, {formData.city}, {formData.state} -{" "}
                  {formData.pincode}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 text-gray-400 text-sm">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        Ready to take off
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 flex flex-col font-sans selection:bg-primary/30 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <div
          className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div className="absolute top-[40%] -left-[20%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center px-6 md:px-12 w-full max-w-7xl mx-auto">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all text-gray-500 hover:text-gray-900 shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex justify-center">
          {/* Steps Pills */}
          <div className="flex items-center gap-2">
            {/* Only show steps relevant to the user context? Or show all? Show all for completeness or conditionally */}
            {STEPS.map((step) => {
              if (token && step.id === 1) return null; // Skip Account step if logged in
              return (
                <div
                  key={step.id}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500 ease-out",
                    step.id <= currentStep
                      ? "bg-primary w-8 shadow-[0_0_10px_rgba(5,150,105,0.3)]"
                      : "bg-gray-200 w-2",
                  )}
                />
              );
            })}
          </div>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-6 pt-24 pb-40 relative z-10">
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && renderPlanStep()}
              {currentStep === 1 && renderAccountStep()}
              {currentStep === 2 && renderIdentityStep()}
              {currentStep === 3 && renderIndustryStep()}
              {currentStep === 4 && renderDetailsStep()}
              {currentStep === 5 && renderReviewStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3 w-full shadow-sm"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {error}
          </motion.div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 md:p-8 bg-white/90 backdrop-blur-sm z-40 border-t border-gray-100">
        <div className="max-w-md mx-auto">
          <ActionButton
            onClick={currentStep === 5 ? handleSubmit : handleNext}
            loading={isSubmitting}
          >
            {currentStep === 5 ? (
              <span className="flex items-center gap-2 justify-center">
                Launch Brand <Zap className="w-5 h-5 fill-current" />
              </span>
            ) : (
              "Continue"
            )}
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default BrandRegistration;
