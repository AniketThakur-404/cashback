import React from 'react';
import { motion } from 'framer-motion';

const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
};

export function LoadingSpinner({
    size = 'md',
    className = '',
    color = 'currentColor',
    text = ''
}) {
    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <motion.div
                className={`${sizes[size]} border-2 border-current border-t-transparent rounded-full`}
                style={{ color }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            {text && (
                <span className="text-sm text-slate-500 dark:text-slate-400">{text}</span>
            )}
        </div>
    );
}

export function LoadingDots({ className = '' }) {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-2 h-2 bg-current rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.15,
                    }}
                />
            ))}
        </div>
    );
}

export function LoadingPulse({ className = '' }) {
    return (
        <motion.div
            className={`w-3 h-3 bg-primary rounded-full ${className}`}
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
        />
    );
}

export function FullPageLoader({ text = 'Loading...' }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size="xl" color="var(--primary)" />
                <p className="text-lg font-medium text-slate-900 dark:text-white">{text}</p>
            </div>
        </div>
    );
}

export default LoadingSpinner;
