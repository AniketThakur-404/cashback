import React from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';

const variants = {
    primary: 'bg-primary hover:bg-primary-strong text-white shadow-md hover:shadow-lg',
    secondary: 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg',
};

const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
    xl: 'px-8 py-4 text-lg rounded-2xl',
};

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    onClick,
    type = 'button',
    ...props
}) {
    const isDisabled = disabled || loading;

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            whileHover={isDisabled ? {} : { scale: 1.02 }}
            whileTap={isDisabled ? {} : { scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-all duration-200
        ${variants[variant]}
        ${sizes[size]}
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
            {...props}
        >
            {loading ? (
                <>
                    <LoadingSpinner size="sm" />
                    <span>{typeof children === 'string' ? children : 'Loading...'}</span>
                </>
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 18} />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 18} />}
                </>
            )}
        </motion.button>
    );
}

export function IconButton({
    icon: Icon,
    variant = 'ghost',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    tooltip = '',
    onClick,
    ...props
}) {
    const isDisabled = disabled || loading;

    const iconSizes = {
        sm: 14,
        md: 18,
        lg: 22,
        xl: 26,
    };

    const btnSizes = {
        sm: 'w-7 h-7',
        md: 'w-9 h-9',
        lg: 'w-11 h-11',
        xl: 'w-14 h-14',
    };

    return (
        <motion.button
            onClick={onClick}
            disabled={isDisabled}
            whileHover={isDisabled ? {} : { scale: 1.1 }}
            whileTap={isDisabled ? {} : { scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            title={tooltip}
            className={`
        inline-flex items-center justify-center rounded-xl
        transition-all duration-200
        ${variants[variant]}
        ${btnSizes[size]}
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
            {...props}
        >
            {loading ? (
                <LoadingSpinner size="sm" />
            ) : (
                Icon && <Icon size={iconSizes[size]} />
            )}
        </motion.button>
    );
}

export default Button;
