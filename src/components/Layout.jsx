import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, Gift, Home, ShoppingBag, Wallet } from "lucide-react";

import { LiquidButton } from "./ui/LiquidGlassButton";
import { useLocation, useMatch, useNavigate } from "react-router-dom";
import LiquidDock from "./LiquidDock";
import { useTheme } from "./ThemeProvider";
import UserProfileMenu from "./UserProfileMenu";
import { getWalletSummary } from "../lib/api";
import { AUTH_CHANGE_EVENT, AUTH_TOKEN_KEY, clearAuthToken } from "../lib/auth";

const Layout = ({ children }) => {
  const mainRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const giftCardsListMatch = useMatch("/gift-cards-list/:categoryId");
  const giftCardInfoMatch = useMatch("/gift-card-info/:id");
  const isHome = location.pathname === "/";

  const headerTitle = (() => {
    if (isHome) return "";
    if (giftCardInfoMatch?.params?.id) return "Gift Card Info";
    if (giftCardsListMatch?.params?.categoryId) return "Gift Cards";
    if (location.pathname.startsWith("/gift-cards-list")) return "Gift Cards";
    if (location.pathname.startsWith("/gift-card-info"))
      return "Gift Card Info";
    if (location.pathname.startsWith("/gift-cards")) return "Store";
    if (location.pathname.startsWith("/wallet")) return "vCash";
    if (location.pathname.startsWith("/store")) return "Rewards Store";
    if (location.pathname.startsWith("/vendor-dashboard"))
      return "Vendor Dashboard";
    if (location.pathname.startsWith("/admin")) return "Admin Console";
    if (location.pathname.startsWith("/brand-details")) return "Brand Details";
    if (location.pathname.startsWith("/product-info")) return "Product Info";
    if (location.pathname.startsWith("/product-report"))
      return "Product Reports";
    if (location.pathname.startsWith("/history")) return "History";
    return "Assured Rewards";
  })();

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [location.pathname]);

  const { effectiveTheme } = useTheme();
  const logoSrc = "/light theme incentify logo.png";
  const [authToken, setAuthToken] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(AUTH_TOKEN_KEY) || "";
  });
  const [walletBalance, setWalletBalance] = useState(null);
  const [isWalletLoading, setIsWalletLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleAuthChange = () => {
      setAuthToken(localStorage.getItem(AUTH_TOKEN_KEY) || "");
    };
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    return () =>
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
  }, []);

  useEffect(() => {
    if (!isHome) return;
    if (!authToken) {
      setWalletBalance(null);
      return;
    }
    let isActive = true;
    setIsWalletLoading(true);
    (async () => {
      try {
        const data = await getWalletSummary(authToken);
        if (!isActive) return;
        const balanceValue = data?.wallet?.balance;
        const numericBalance = Number(balanceValue);
        setWalletBalance(Number.isFinite(numericBalance) ? numericBalance : 0);
      } catch (err) {
        if (!isActive) return;
        if (err?.status === 401) {
          clearAuthToken();
          setAuthToken("");
        }
        setWalletBalance(null);
      } finally {
        if (isActive) {
          setIsWalletLoading(false);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [authToken, isHome]);

  return (
    <div className="min-h-[100dvh] bg-gray-100 flex justify-center safe-area-x">
      {/* Mobile Container - limits width on desktop to look like a phone */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-950 min-h-[100dvh] shadow-2xl relative flex flex-col transition-colors duration-300">
        {/* TOP HEADER */}
        <header
          className={`bg-white dark:bg-zinc-950/80 backdrop-blur-md px-4 pt-safe ${isHome ? "py-3" : "py-3"} sticky top-0 z-50 shadow-sm dark:shadow-zinc-900 border-b border-transparent dark:border-zinc-800 flex items-center transition-colors duration-300 ${
            isHome ? "justify-between" : "justify-start"
          }`}
        >
          {isHome ? (
            <>
              <div className="flex items-center gap-2">
                <div className="h-12 w-40 overflow-visible flex items-center">
                  <img
                    src={logoSrc}
                    alt="Assured Rewards"
                    className="h-16 w-auto object-contain object-left scale-125 origin-left"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* ModeToggle removed */}
                {/* Wallet Balance Pill */}
                <div
                  onClick={() => navigate("/wallet")}
                  className="bg-primary dark:bg-primary-strong text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium shadow-md cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Wallet size={14} />
                  <span>
                    {authToken
                      ? isWalletLoading
                        ? "\u20B9 0.00"
                        : `\u20B9 ${(walletBalance ?? 0).toFixed(2)}`
                      : "\u20B9 0.00"}
                  </span>
                </div>
                <UserProfileMenu />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between w-full h-12">
              <div className="flex items-center gap-3">
                <LiquidButton
                  type="button"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="rounded-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-white/70 dark:border-zinc-800/70 text-gray-800 dark:text-gray-100 shadow-md"
                  aria-label="Go back"
                >
                  <ChevronLeft size={18} className="text-current" />
                </LiquidButton>
                <h1 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                  {headerTitle}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {/* ModeToggle removed */}
                <UserProfileMenu />
              </div>
            </div>
          )}
        </header>

        {/* MAIN CONTENT AREA (Scrollable) */}
        <main
          ref={mainRef}
          className="flex-1 transition-colors duration-300 overflow-x-hidden overflow-y-auto ios-scroll"
        >
          <div className="pb-dock-safe">{children}</div>
        </main>

        {/* BOTTOM NAVIGATION */}
        <LiquidDock
          items={[
            { path: "/", icon: <Home size={20} />, label: "Home" },
            { path: "/gift-cards", icon: <Gift size={20} />, label: "Store" },
            { path: "/wallet", icon: <Wallet size={20} />, label: "vCash" },
          ]}
        />
      </div>
    </div>
  );
};

export default Layout;
