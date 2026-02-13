import React from 'react';
import {
    Smartphone,
    Wifi,
    Zap,
    Globe,
    Receipt,
    Dices,
    Tv,
    MoreHorizontal
} from 'lucide-react';

const ServiceIconGrid = ({ onServiceClick }) => {
    const services = [
        { id: 'airtime', label: 'Airtime', icon: Smartphone },
        { id: 'data', label: 'Data', icon: Wifi },
        { id: 'electricity', label: 'Electricity', icon: Zap },
        { id: 'internet', label: 'Internet', icon: Globe },
        { id: 'bills', label: 'Bills', icon: Receipt },
        { id: 'betting', label: 'Betting', icon: Dices },
        { id: 'tv', label: 'TV', icon: Tv },
        { id: 'other', label: 'Other Services', icon: MoreHorizontal },
    ];

    return (
        <div className="grid grid-cols-4 gap-4">
            {services.map((service) => {
                const Icon = service.icon;

                return (
                    <button
                        key={service.id}
                        onClick={() => onServiceClick?.(service.id)}
                        className="group flex flex-col items-center gap-3 transition-transform duration-300 hover:scale-105"
                    >
                        <div className="w-16 h-16 bg-[#059669] rounded-2xl flex items-center justify-center shadow-md hover:shadow-lg hover:shadow-[#059669]/20 transition-all duration-300">
                            <Icon size={32} className="text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">
                            {service.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default ServiceIconGrid;
