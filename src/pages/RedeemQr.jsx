import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { verifyPublicQr, scanQR } from "../lib/api";
import { AUTH_TOKEN_KEY, storePostLoginRedirect } from "../lib/auth";
import {
  Loader2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  Home,
} from "lucide-react";
import { captureClientLocation } from "../lib/location";

const RedeemQr = () => {
  const { hash } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [redeemStatus, setRedeemStatus] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const shouldAutoClaim = useMemo(
    () => searchParams.get("claim") === "1",
    [searchParams],
  );

  useEffect(() => {
    const fetchQrCtx = async () => {
      try {
        const res = await verifyPublicQr(hash);
        setData(res);
      } catch (err) {
        setError(err.message || "Invalid or expired QR code");
        if (err.data?.qr) {
          const qr = err.data.qr;
          setData({
            campaign: qr.Campaign?.title,
            brand: qr.Campaign?.Brand?.name,
            amount: qr.cashbackAmount || qr.Campaign?.cashbackAmount,
            endDate: qr.Campaign?.endDate,
            status: qr.status,
            isError: true,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchQrCtx();
  }, [hash]);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (
      !token ||
      !shouldAutoClaim ||
      redeemStatus ||
      redeeming ||
      data?.isError
    )
      return;

    const autoClaim = async () => {
      setRedeeming(true);
      try {
        const locationPayload = await captureClientLocation();
        const res = await scanQR(hash, token, locationPayload);
        setRedeemStatus({
          success: true,
          message: res.message,
          amount: res.amount,
        });
      } catch (err) {
        if (err?.status === 401) {
          storePostLoginRedirect(`/redeem/${hash}?claim=1`);
          navigate("/wallet");
          return;
        }
        setRedeemStatus({ success: false, message: err.message });
        if (err.data?.qr) {
          const qr = err.data.qr;
          setData((prev) => ({
            ...prev,
            campaign: qr.Campaign?.title,
            brand: qr.Campaign?.Brand?.name,
            amount: qr.cashbackAmount || qr.Campaign?.cashbackAmount,
            endDate: qr.Campaign?.endDate,
            status: qr.status,
            isError: true,
          }));
        }
      } finally {
        setRedeeming(false);
      }
    };

    autoClaim();
  }, [hash, redeemStatus, redeeming, shouldAutoClaim, navigate, data?.isError]);

  const handleRedeem = async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      storePostLoginRedirect(`/redeem/${hash}?claim=1`);
      navigate("/wallet");
      return;
    }

    setRedeeming(true);
    try {
      const locationPayload = await captureClientLocation();
      const res = await scanQR(hash, token, locationPayload);
      setRedeemStatus({
        success: true,
        message: res.message,
        amount: res.amount,
      });
    } catch (err) {
      if (err?.status === 401) {
        storePostLoginRedirect(`/redeem/${hash}?claim=1`);
        navigate("/wallet");
        return;
      }
      setRedeemStatus({ success: false, message: err.message });
      if (err.data?.qr) {
        const qr = err.data.qr;
        setData((prev) => ({
          ...prev,
          campaign: qr.Campaign?.title,
          brand: qr.Campaign?.Brand?.name,
          amount: qr.cashbackAmount || qr.Campaign?.cashbackAmount,
          endDate: qr.Campaign?.endDate,
          status: qr.status,
          isError: true,
        }));
      }
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-700">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900 p-6">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">Error</h1>
        <p className="text-slate-600">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold transition-all hover:bg-slate-800"
        >
          <Home size={18} />
          Go Home
        </button>
      </div>
    );
  }

  const isRedeemed =
    data?.status === "redeemed" ||
    error === "QR Code already redeemed" ||
    redeemStatus?.message === "QR Code already redeemed";
  const isExpired =
    error === "Campaign expired or not started" ||
    redeemStatus?.message === "Campaign expired or not started";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 ${data?.isError ? "bg-red-200/40" : "bg-emerald-200/50"} rounded-full blur-[100px] transition-colors duration-500`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${data?.isError ? "bg-orange-200/30" : "bg-sky-200/40"} rounded-full blur-[100px] transition-colors duration-500`}
        />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div
            className={`w-16 h-16 ${data?.isError ? "bg-red-100" : "bg-emerald-100"} rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-500`}
          >
            {isRedeemed ? (
              <AlertCircle size={32} className="text-red-600" />
            ) : isExpired ? (
              <XCircle size={32} className="text-red-600" />
            ) : data?.isError ? (
              <AlertCircle size={32} className="text-red-600" />
            ) : (
              <ShieldCheck size={32} className="text-emerald-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 max-w-[90%] mx-auto leading-tight">
            {isRedeemed
              ? "Already Redeemed"
              : isExpired
                ? "Campaign is ended"
                : data?.isError
                  ? "Oops! something went wrong"
                  : "You've found a reward!"}
          </h1>
          <p className="text-slate-500 text-sm">
            {isRedeemed
              ? "This reward has already been claimed"
              : isExpired
                ? "Better luck next time"
                : data?.isError
                  ? error
                  : "Scan verified successfully"}
          </p>
        </div>

        <div className="space-y-4 py-6 border-y border-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-sm">Campaign</span>
            <span className="font-medium text-slate-1000 text-right">
              {data.campaign}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-sm">Brand</span>
            <span className="font-medium text-slate-900">{data.brand}</span>
          </div>
          {data.endDate && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Campaign End Date</span>
              <div className="flex items-center gap-1.5 text-slate-900 font-medium">
                <Calendar size={14} className="text-slate-400" />
                <span>
                  {new Date(data.endDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          )}
          {!data.isError && (
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-sm">Cashback Value</span>
              <span className="font-bold text-2xl text-emerald-600">
                Rs {data.amount}
              </span>
            </div>
          )}
        </div>

        {redeemStatus && !data.isError && (
          <div
            className={`p-4 rounded-xl text-sm font-medium flex items-start gap-3 ${redeemStatus.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
          >
            {redeemStatus.success ? (
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
            )}
            <div>{redeemStatus.message}</div>
          </div>
        )}

        {data.isError ? (
          <button
            onClick={() => navigate("/")}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Back to Home
          </button>
        ) : !redeemStatus?.success ? (
          <button
            onClick={handleRedeem}
            disabled={redeeming}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-emerald-900/20"
          >
            {redeeming ? "Processing..." : "Claim Cashback Now"}
          </button>
        ) : (
          <button
            onClick={() => navigate("/wallet")}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-3.5 rounded-xl transition-all"
          >
            View Wallet
          </button>
        )}
      </div>
    </div>
  );
};

export default RedeemQr;
