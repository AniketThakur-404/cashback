import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import GiftCards from './pages/GiftCards';
import GiftCardsList from './pages/GiftCardsList';
import GiftCardInfo from './pages/GiftCardInfo';
import BrandDetails from './pages/BrandDetails';
import ProductInfo from './pages/ProductInfo';
import LiquidGlassDemo from './pages/LiquidGlassDemo';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Store from './pages/Store';
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import VendorSignup from './pages/VendorSignup';
import HelpSupport from './pages/HelpSupport';
import VendorLandingPage from './pages/VendorLandingPage';
import { ThemeProvider } from './components/ThemeProvider';
import RedeemQr from './pages/RedeemQr';
import Claim from './pages/Claim';
import BrandRegistration from './pages/BrandRegistration';
import UXDemo from './pages/UXDemo';
import { ToastProvider } from './components/ui/ToastContext';
import { ToastContainer } from './components/ui/Toast';
import CameraScan from './pages/CameraScan';
import QRScanPage from './pages/QRScanPage';
import QRResultPage from './pages/QRResultPage';
import TransactionHistory from './pages/TransactionHistory';
import RedeemPage from './pages/RedeemPage';
import PayoutStatus from './pages/PayoutStatus';
import ManageUPI from './pages/ManageUPI';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import ContactUs from './pages/ContactUs';
import History from './pages/History';
import ProductReport from './pages/ProductReport';

function App() {
  const AppLayout = () => (
    <Layout>
      <Outlet />
    </Layout>
  );

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
            <Route path="/admin/:section" element={<AdminDashboard />} />
            <Route path="/admin/:section/:subSection" element={<AdminDashboard />} />
            <Route path="/vendor-dashboard" element={<VendorDashboard />} />
            <Route path="/vendor" element={<VendorLandingPage />} />
            <Route path="/vendor/:section" element={<VendorDashboard />} />
            <Route path="/vendor-signup" element={<VendorSignup />} />
            <Route path="/redeem/:hash" element={<RedeemQr />} />
            <Route path="/claim" element={<Claim />} />
            <Route path="/brand-registration" element={<BrandRegistration />} />
            <Route path="/ux-demo" element={<UXDemo />} />
            <Route path="/vendor-landing" element={<VendorLandingPage />} />

            {/* QR Scan Flow */}
            <Route path="/scan" element={<CameraScan />} />
            <Route path="/scan/:hash" element={<QRScanPage />} />
            <Route path="/scan/result" element={<QRResultPage />} />

            {/* Standalone legal/info pages */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/contact" element={<ContactUs />} />

            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/gift-cards" element={<GiftCards />} />
              <Route path="/gift-cards-list" element={<GiftCardsList />} />
              <Route path="/gift-cards-list/:categoryId" element={<GiftCardsList />} />
              <Route path="/gift-card-info" element={<GiftCardInfo />} />
              <Route path="/gift-card-info/:id" element={<GiftCardInfo />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/wallet/transactions" element={<TransactionHistory />} />
              <Route path="/wallet/redeem" element={<RedeemPage />} />
              <Route path="/payout/:id" element={<PayoutStatus />} />

              {/* Profile with sub-routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/upi" element={<ManageUPI />} />
              <Route path="/profile/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/profile/terms" element={<TermsConditions />} />
              <Route path="/profile/contact" element={<ContactUs />} />

              <Route path="/store" element={<Store />} />
              <Route path="/brand-details" element={<BrandDetails />} />
              <Route path="/brand-details/:id" element={<BrandDetails />} />
              <Route path="/brandDetails" element={<BrandDetails />} />
              <Route path="/brandDetails/:id" element={<BrandDetails />} />
              <Route path="/product-info" element={<ProductInfo />} />
              <Route path="/product-info/:id" element={<ProductInfo />} />
              <Route path="/productInfo" element={<ProductInfo />} />
              <Route path="/productInfo/:id" element={<ProductInfo />} />
              <Route path="/liquid-glass" element={<LiquidGlassDemo />} />
              <Route path="/help" element={<HelpSupport />} />
              <Route path="/history" element={<History />} />
              <Route path="/product-report" element={<ProductReport />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <ToastContainer />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
