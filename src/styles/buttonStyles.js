// Button Style Constants for Vendor Dashboard

// Primary Action Button - Main CTAs
export const PRIMARY_BUTTON = "px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-strong text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";

// Secondary Action Button - Less prominent actions
export const SECONDARY_BUTTON = "px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

// Danger Button - Delete/Remove actions
export const DANGER_BUTTON = "px-5 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 active:scale-[0.98] shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

// Success Button - Confirmation actions
export const SUCCESS_BUTTON = "px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-strong active:scale-[0.98] shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

// Ghost Button - Subtle actions
export const GHOST_BUTTON = "px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200";

// Icon Button - Small icon-only buttons
export const ICON_BUTTON = "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white";

// Tab Button - For tab navigation
export const TAB_BUTTON_BASE = "px-4 py-2.5 text-sm font-semibold transition-all duration-200";
export const TAB_BUTTON_ACTIVE = "border-b-2 border-primary text-primary";
export const TAB_BUTTON_INACTIVE = "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-b-2 border-transparent";

// Link Button - Text links that behave like buttons
export const LINK_BUTTON = "text-sm font-semibold text-primary hover:text-primary-strong transition-colors duration-200 flex items-center gap-1";

// Utility functions
export const combineClasses = (...classes) => classes.filter(Boolean).join(' ');

export const getTabButtonClass = (isActive) =>
    combineClasses(TAB_BUTTON_BASE, isActive ? TAB_BUTTON_ACTIVE : TAB_BUTTON_INACTIVE);
