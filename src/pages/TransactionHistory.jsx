import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowDownCircle, ArrowUpCircle, Filter, Calendar, X } from 'lucide-react';
import { getTransactionHistory } from '../lib/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
    const [filters, setFilters] = useState({ type: '', status: '', startDate: '', endDate: '' });
    const [showFilters, setShowFilters] = useState(false);

    const loadTransactions = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await getTransactionHistory({ ...filters, page, limit: 20 });
            setTransactions(response.transactions || []);
            setPagination(response.pagination || {});
        } catch (error) {
            console.error('Failed to load transactions:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadTransactions(1);
    }, [loadTransactions]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ type: '', status: '', startDate: '', endDate: '' });
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const colors = {
            success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            pending: 'bg-amber-100 text-amber-800 border-amber-200',
            failed: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="p-4">
                    <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
                    <p className="text-sm text-gray-600">All your wallet activity</p>
                </div>

                {/* Filter Toggle */}
                <div className="px-4 pb-4">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg font-medium text-gray-700"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                        {(filters.type || filters.status || filters.startDate || filters.endDate) && (
                            <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                                Active
                            </span>
                        )}
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="px-4 pb-4 space-y-3 border-t pt-4">
                        <div className="grid grid-cols-2 gap-3">
                            <select
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">All Types</option>
                                <option value="credit">Credit</option>
                                <option value="debit">Debit</option>
                            </select>

                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">All Status</option>
                                <option value="success">Success</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => loadTransactions(1)}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Transactions List */}
            <div className="p-4 space-y-3">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="xl" />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No transactions found</p>
                    </div>
                ) : (
                    <>
                        {transactions.map((tx) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl p-4 shadow-sm border"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-100' : 'bg-red-100'
                                            }`}>
                                            {tx.type === 'credit' ? (
                                                <ArrowDownCircle className="w-5 h-5 text-emerald-600" />
                                            ) : (
                                                <ArrowUpCircle className="w-5 h-5 text-red-600" />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">
                                                {tx.description || 'Transaction'}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-0.5">
                                                {formatDate(tx.createdAt)}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span
                                                    className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusBadge(tx.status)}`}
                                                >
                                                    {tx.status}
                                                </span>
                                                {tx.referenceId && (
                                                    <span className="text-xs text-gray-500">
                                                        Ref: {tx.referenceId.slice(0, 12)}...
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className={`text-lg font-bold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'
                                            }`}>
                                            {tx.type === 'credit' ? '+' : '-'}₹{parseFloat(tx.amount).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">{tx.category}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 pt-4">
                                <button
                                    onClick={() => loadTransactions(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="px-4 py-2 bg-white border rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 bg-gray-100 rounded-lg font-medium">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => loadTransactions(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    className="px-4 py-2 bg-white border rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;
