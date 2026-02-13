import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { scanQR } from '../lib/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AUTH_TOKEN_KEY, storePostLoginRedirect } from '../lib/auth';

const QRScanPage = () => {
    const { hash } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState('checking'); // checking, validating, error

    useEffect(() => {
        const handleQRScan = async () => {
            // Check if user is logged in
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) {
                // Redirect to wallet login with return URL
                const returnUrl = `/scan/${hash}`;
                storePostLoginRedirect(returnUrl);
                navigate(`/wallet`);
                return;
            }

            setStatus('validating');

            try {
                // Call backend to scan and redeem
                const response = await scanQR(hash, token);

                // Navigate to result page with success data
                navigate('/scan/result', {
                    state: {
                        success: true,
                        amount: response.amount,
                        campaign: response.campaign,
                        brand: response.brand,
                        walletBalance: response.walletBalance,
                        payoutTo: response.payoutTo
                    }
                });

            } catch (error) {
                if (error?.status === 401) {
                    const returnUrl = `/scan/${hash}`;
                    storePostLoginRedirect(returnUrl);
                    navigate(`/wallet`);
                    return;
                }
                // Navigate to result page with error
                navigate('/scan/result', {
                    state: {
                        success: false,
                        error: error.response?.data?.message || error.message || 'QR scan failed'
                    }
                });
            }
        };

        handleQRScan();
    }, [hash, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
                <LoadingSpinner size="xl" />
                <p className="mt-4 text-lg font-medium text-gray-900">
                    {status === 'checking' ? 'Checking authentication...' : 'Validating QR code...'}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                    Please wait while we process your scan
                </p>
            </div>
        </div>
    );
};

export default QRScanPage;
