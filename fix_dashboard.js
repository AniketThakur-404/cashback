const fs = require('fs');
const path = 'e:\\webapp\\src\\pages\\AdminDashboard.jsx';

try {
    let content = fs.readFileSync(path, 'utf8');
    const lines = content.split('\n');

    // Construct new imports
    const newImports = `import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import {
  Activity, ArrowLeftRight, BarChart2, BarChart3, AlertTriangle, Banknote, Bell, Building2, ChevronRight,
  CircleDollarSign, ClipboardList, CreditCard, Download, HandCoins, LayoutGrid, LogOut, Menu, Megaphone,
  PanelLeftClose, PanelLeftOpen, Package, PiggyBank, Plus, QrCode, RefreshCw, ScanLine, Search, ShieldCheck,
  Sparkles, Store, TrendingUp, UserRound, Users, Upload
} from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import UserAccountManager from "../components/admin/UserAccountManager";
import UserWalletModal from "../components/admin/UserWalletModal";
import VendorAccountManager from "../components/admin/VendorAccountManager";
// import AddBrandModal from "../components/admin/AddBrandModal"; // Commented out as not found

import {
  getAdminDashboard, getAdminFinanceSummary, getAdminUsers, updateAdminUserStatus, getAdminActivityLogs,
  getAdminSystemSettings, getAdminNotifications, getAdminBrands, getAdminVendors, getAdminCampaigns,
  getAdminTransactions, getAdminTransactionsFiltered, getAdminQrs, getAdminQrBatch, getAdminWithdrawals,
  processAdminWithdrawal, getAdminSupportTickets, replyAdminSupportTicket, getAdminSubscriptions,
  updateAdminVendorSubscription, getAdminVendorOverview, updateAdminSystemSettings, updateAdminVendorDetails,
  updateAdminVendorCredentials, getAdminVendorCredentialRequests, approveAdminCredentialRequest,
  rejectAdminCredentialRequest, getAdminBrandOverview, updateAdminBrandDetails, adjustVendorWalletAdmin,
  createAdminBrand, updateAdminVendorStatus, updateAdminBrandStatus, creditVendorWalletAdmin,
  updateAdminCampaignStatus, updateAdminCampaignDetails, getAdminCampaignAnalytics, deleteAdminCampaign,
  loginWithEmail, getMe
} from "../lib/api";
`;

    // Find where the imports end (likely around line 60 where 'useTheme' was)
    // We'll search for 'export default function' or 'const AdminDashboard' to be safe, 
    // or just replace first 60 lines if we are sure.
    // The user identified line 1-60 as the block.
    // But let's be smarter: splice the new imports into the array.

    // Remove lines 0 to 60 (exclusive? inclusive?)
    // Line 60 matches 'import { useTheme }' in old file.
    // New imports INCLUDE 'useTheme'.
    // So we replace lines 0 to 60ish.

    // Let's find index of the first line that IS NOT an import or part of the broken block.
    // We know lines 1-60 are imports.
    // We can just execute the replacement of lines 0-60.

    lines.splice(0, 61, newImports);

    let newContent = lines.join('\n');

    // Fix the garbage line
    // "er}lectedUser(null);lse);" -> "setSelectedUser(null);"
    // "onClose={() => {er}lectedUser(null);lse);" -> "onClose={() => setSelectedUser(null)}"

    // Note: we need to handle the case where it might be split across lines or minified.
    // Since we ran prettier, it should be on one line if it's compact.

    // Use regex to replace the known garbage pattern
    // Pattern: /\{er\}lectedUser/ => "setSelectedUser"
    // Pattern: /;lse\);/ => "code for false? or just closing parenthesis"

    if (newContent.includes('er}lectedUser')) {
        console.log('Found garbage string, fixing...');
        newContent = newContent.replace(/{er}lectedUser/g, 'setSelectedUser');
    }

    if (newContent.includes(';lse);')) {
        console.log('Found garbage suffix, fixing...');
        // This often looks like: onClose={() => setSelectedUser(null);lse);}
        // Maybe it was setIsUserModalOpen(false);?
        // Let's replace ';lse);' with ')}' or similar if it fits syntax.
        // Safer: replace ';lse);' with '; setIsUserModalOpen(false)}' IF we have that state.
        // But we don't know if we have setIsUserModalOpen.
        // Let's assume it was garbage from 'false);'
        newContent = newContent.replace(/;lse\);/g, '}');
    }

    // Also verify UserAccountManager usage
    // If it's not there, adding it is tricky via this script without parsing.
    // usage of setSelectedUser implies we have state.
    // But we didn't add state yet!

    // We should add state in this script too.
    // Search for 'const AdminDashboard = () => {'
    // and insert state hook after it.

    const componentStart = newContent.indexOf('const AdminDashboard = () => {');
    if (componentStart !== -1) {
        const insertPoint = newContent.indexOf('{', componentStart) + 1;
        const stateLogic = '\n  const [selectedUser, setSelectedUser] = useState(null);';
        newContent = newContent.slice(0, insertPoint) + stateLogic + newContent.slice(insertPoint);
        console.log('Injected selectedUser state.');
    } else {
        console.log('Could not find AdminDashboard component start.');
    }

    fs.writeFileSync(path, newContent, 'utf8');
    console.log('AdminDashboard.jsx successfully patched.');

} catch (err) {
    console.error(err);
}
