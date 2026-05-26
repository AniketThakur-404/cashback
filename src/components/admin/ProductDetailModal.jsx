import React from 'react';
import { X } from 'lucide-react';

/**
 * Modal to display detailed information about a product order.
 * Props:
 *  - isOpen: boolean
 *  - onClose: function
 *  - product: object containing order details
 */
const ProductDetailModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0f0f11] border border-slate-200/60 dark:border-white/10 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70 dark:border-white/10">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Order #{product.id}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300"><strong>Product:</strong> {product.name}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300"><strong>Quantity:</strong> {product.quantity}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300"><strong>Status:</strong> {product.status}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300"><strong>Amount:</strong> INR {product.amount}</p>
          {/* Add more fields as needed */}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
