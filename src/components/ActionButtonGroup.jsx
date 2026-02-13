import React from 'react';
import { Plus, ArrowLeftRight, Download } from 'lucide-react';

// Simplified Liquid Button for Action Group
const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary' }) => {
    const isPrimary = variant === 'primary';

    return (
        <button
            onClick={onClick}
            className={`
                relative group overflow-hidden px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all duration-300
                ${isPrimary
                    ? 'text-white shadow-[0_0_20px_rgba(5,150,105,0.3)] hover:shadow-[0_0_30px_rgba(5,150,105,0.5)] hover:scale-105'
                    : 'text-slate-200 border border-white/10 hover:bg-white/5 hover:border-white/30 hover:scale-105'
                }
            `}
        >
            {isPrimary && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#059669] to-[#047857] opacity-100 transition-opacity" />
            )}

            {/* Content */}
            <div className="relative z-10 flex items-center gap-2">
                <Icon size={20} className={isPrimary ? 'text-white' : 'text-[#059669]'} />
                <span>{label}</span>
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />
        </button>
    );
};

const ActionButtonGroup = ({ onAddMoney, onTransferMoney, onWithdraw }) => {
    return (
        <div className="flex items-center gap-4">
            <ActionButton
                onClick={onAddMoney}
                icon={Plus}
                label="Add Money"
                variant="primary"
            />

            <ActionButton
                onClick={onTransferMoney}
                icon={ArrowLeftRight}
                label="Transfer Money"
                variant="secondary"
            />

            <ActionButton
                onClick={onWithdraw}
                icon={Download}
                label="Withdraw"
                variant="secondary"
            />
        </div>
    );
};

export default ActionButtonGroup;
