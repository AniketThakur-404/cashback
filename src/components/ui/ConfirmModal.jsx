import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2, Info, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { lockModalScroll, unlockModalScroll } from '../../lib/modalScrollLock';

const typeConfig = {
    danger: {
        icon: Trash2,
        iconColor: 'text-red-500',
        iconBg: 'bg-red-500/10 dark:bg-red-500/20',
        confirmVariant: 'danger',
    },
    warning: {
        icon: AlertTriangle,
        iconColor: 'text-amber-500',
        iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
        confirmVariant: 'primary',
    },
    info: {
        icon: Info,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
        confirmVariant: 'primary',
    },
    success: {
        icon: CheckCircle,
        iconColor: 'text-emerald-500',
        iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        confirmVariant: 'success',
    },
};

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    loading = false,
    showCancel = true,
}) {
    const config = typeConfig[type] || typeConfig.danger;
    const Icon = config.icon;

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape' && !loading) {
            onClose();
        }
    }, [onClose, loading]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            lockModalScroll();
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            if (isOpen) {
                unlockModalScroll();
            }
        };
    }, [isOpen, handleKeyDown]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={loading ? undefined : onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-white/10 overflow-hidden"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                        >
                            <X size={18} className="text-slate-500" />
                        </button>

                        <div className="p-6">
                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-full ${config.iconBg} flex items-center justify-center mx-auto mb-4`}>
                                <Icon size={28} className={config.iconColor} />
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
                                {title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
                                {message}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3">
                                {showCancel && (
                                    <Button
                                        variant="secondary"
                                        className="flex-1"
                                        onClick={onClose}
                                        disabled={loading}
                                    >
                                        {cancelText}
                                    </Button>
                                )}
                                <Button
                                    variant={config.confirmVariant}
                                    className={showCancel ? "flex-1" : "w-full"}
                                    onClick={onConfirm}
                                    loading={loading}
                                >
                                    {confirmText}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// Hook for easier usage with promises
export function useConfirmModal() {
    const [modalState, setModalState] = React.useState({
        isOpen: false,
        resolve: null,
        props: {},
    });

    const confirm = useCallback((props = {}) => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                resolve,
                props,
            });
        });
    }, []);

    const handleClose = useCallback(() => {
        if (modalState.resolve) {
            modalState.resolve(false);
        }
        setModalState({ isOpen: false, resolve: null, props: {} });
    }, [modalState]);

    const handleConfirm = useCallback(() => {
        if (modalState.resolve) {
            modalState.resolve(true);
        }
        setModalState({ isOpen: false, resolve: null, props: {} });
    }, [modalState]);

    const ConfirmModalComponent = useCallback(() => (
        <ConfirmModal
            isOpen={modalState.isOpen}
            onClose={handleClose}
            onConfirm={handleConfirm}
            {...modalState.props}
        />
    ), [modalState, handleClose, handleConfirm]);

    return { confirm, ConfirmModal: ConfirmModalComponent };
}

export default ConfirmModal;
