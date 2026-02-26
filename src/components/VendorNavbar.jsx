import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Button = ({
  children,
  className,
  variant = "default",
  size = "default",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  const variants = {
    default: "bg-emerald-600 text-white hover:bg-emerald-700",
    outline:
      "border border-input hover:bg-emerald-50 hover:text-emerald-700 text-emerald-600",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "underline-offset-4 hover:underline text-primary",
  };
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-12 px-8 rounded-md text-lg",
    icon: "h-10 w-10",
  };

  const variantStyles = variants[variant] || variants.default;
  const sizeStyles = sizes[size] || sizes.default;

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const VendorNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logoSrc = "/light theme incentify logo.png";
  const APP_NAME = "Assured Rewards";

  const isLandingPage =
    location.pathname === "/vendor" || location.pathname === "/vendor-landing";

  const scrollToSection = (sectionId) => {
    if (isLandingPage) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      // Update hash without jump
      window.history.pushState(null, null, `#${sectionId}`);
    } else {
      navigate(`/vendor#${sectionId}`);
    }
  };

  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/vendor")}
        >
          <img
            src={logoSrc}
            alt={APP_NAME}
            className="h-15 w-auto object-contain"
          />
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
          <button
            onClick={() => scrollToSection("features")}
            className="hover:text-emerald-600 transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="hover:text-emerald-600 transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection("pricing")}
            className="hover:text-emerald-600 transition-colors"
          >
            Pricing
          </button>
        </div>
        <Button
          variant="outline"
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
          onClick={() => navigate("/vendor-dashboard")}
        >
          Login
        </Button>
      </div>
    </nav>
  );
};

export default VendorNavbar;
