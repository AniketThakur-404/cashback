# Assured Rewards: Working Feature Flow Documentation

This document captures the currently implemented end-to-end product flow in this codebase, with focus on campaign creation and operational lifecycle across Admin, Vendor, and Customer journeys.

## 1. System Snapshot

- Frontend: React + Vite SPA (`src/`).
- Backend: Express + Prisma + PostgreSQL (`cashback backend/cashback/src`).
- Core domains:
  - Identity/Auth
  - Vendor onboarding
  - Brand and product setup
  - Campaign creation and activation
  - QR generation and redemption
  - Wallet, recharge, withdrawals, store redemption
  - Admin controls, support, and system settings

## 2. Roles and Responsibilities

- `customer`
  - Login, scan/redeem QR, wallet usage, store redemption, support tickets.
- `vendor`
  - Manage profile/brand/products/campaigns, recharge wallet, pay campaigns, generate/download QRs, monitor redemptions/orders/support.
- `admin`
  - Manage users/vendors/brands/campaigns/orders/withdrawals/wallet adjustments/system settings/activity logs.

## 3. Core Data Model (Operational)

- `User` -> one-to-one optional `Vendor` and `Wallet`.
- `Vendor` -> one `Brand` (current implementation enforces unique `vendorId` in Brand).
- `Brand` -> many `Product`, many `Campaign`, one `Subscription`.
- `Campaign` -> many `QRCode`, optional `Product`, has `allocations` JSON for tiered cashback quantities.
- `Wallet` -> many `Transaction`, many `Withdrawal`.
- `QROrder` -> purchased QR batches for campaigns.
- `Claim` -> token-based wallet credit flow.

## 4. Campaign Creation Flow (Primary Research Section)

### 4.1 Vendor UI Flow (current implementation)

1. Vendor signs in to `VendorDashboard`.
2. Vendor creates/selects product first.
3. Vendor creates campaign with:
  - `title`
  - `productId`
  - short `description`
  - allocation rows: `cashbackAmount + quantity (+ derived total)`
4. Frontend validates at least one valid allocation row.
5. Frontend computes:
  - `cashbackAmount` (max of row cashback values)
  - `totalBudget` and `subtotal` (sum of row totals)
  - `startDate` (today) and `endDate` (subscription end or fallback +3 months)
6. Request sent to `POST /api/vendor/campaigns`.
7. Backend creates campaign with `status = pending`.
8. Vendor pays campaign using `POST /api/vendor/campaigns/:id/pay`.
9. On successful payment:
  - wallet debited (cashback budget + print/tech fee),
  - transaction logged (`campaign_payment`),
  - campaign set to `active`,
  - QR codes auto-generated from allocations.

### 4.2 Backend Campaign Creation Rules

- Endpoint: `POST /api/vendor/campaigns`
- Validations:
  - Brand must exist and be `active`.
  - Product (if provided) must exist and belong to same brand.
- Normalization:
  - `totalBudget` and `subtotal` are derived if not explicitly valid.
  - `allocations` stored as JSON.
- Status on creation: `pending`.
- Vendor notification created: `"Campaign created and pending activation."`

### 4.3 Campaign Activation and Cost Formula

- Endpoint: `POST /api/vendor/campaigns/:id/pay`
- Tech fee source:
  - vendor `techFeePerQr` if set,
  - else brand `qrPricePerUnit`,
  - else fallback `1`.
- Cost:
  - `baseBudget = subtotal || totalBudget || 0`
  - `totalQty = sum(allocations.quantity)`
  - `printCost = totalQty * techFeePerQr`
  - `totalCost = baseBudget + printCost`
- On success:
  - debit wallet `totalCost`
  - transaction category `campaign_payment`
  - campaign status -> `active`
  - QRs generated from allocations with per-row cashback.

### 4.4 Alternate QR Purchase Flow (after campaign active)

- Endpoint: `POST /api/vendor/qrs/order`
- Use case: buy/generate additional QR batch with explicit quantity + cashback.
- Wallet debited for:
  - cashback total + print/tech fee total
- Transaction category: `qr_purchase`
- Creates paid `QROrder` and generated QR rows.

## 5. End-to-End Product Flow

### 5.1 Vendor Onboarding

Path A: Self-registration (`/vendor-signup`)
- `POST /api/auth/vendor/register`
- Creates:
  - `User(role=vendor, active)`
  - `Vendor(status=pending)`
  - `Brand(status=pending)`
  - `Wallet(balance=0)`
- Admin notified to review.

Path B: Brand registration wizard (`/brand-registration`)
- Registers vendor-like user (if not logged in), uploads logo, creates brand via vendor route.
- Brand creation in this path is active immediately in current backend behavior.

### 5.2 Admin Review and Governance

- Vendor status control: `PUT /api/admin/vendors/:id/verify`
- Brand status control: `PUT /api/admin/brands/:id/verify`
- Campaign status control:
  - `PUT /api/admin/campaigns/:id/verify` (active/rejected)
  - `PUT /api/admin/campaigns/:id/status` (active/paused/rejected/completed)
- Admin can directly edit campaign fields and delete campaign.

### 5.3 QR Redemption (Customer Journey)

1. Customer scans QR.
2. Public pre-check: `GET /api/public/qrs/:hash` (validity preview).
3. Protected redeem: `POST /api/user/scan-qr/:hash`.
4. Redemption transaction:
  - QR validated (not redeemed, allowed status, campaign date window).
  - Cashback credited to user wallet (`cashback_payout` credit).
  - If primary UPI exists, immediate debit withdrawal entry created (instant payout behavior).
  - QR marked redeemed with `redeemedByUserId`, `redeemedAt`.
5. Vendor gets notification about redemption.

### 5.4 Claim Token Flow

- Admin/testing claim creation: `POST /api/claim/create` (admin only).
- Customer preview: `GET /api/claim/preview?token=...`.
- Customer redeem: `POST /api/claim/redeem`.
- Idempotent behavior:
  - same user can re-open already-claimed token and see prior result,
  - other users are blocked from claiming already-claimed token.

### 5.5 Wallet and Payments

Recharge:
- `POST /api/payments/order` -> Razorpay order.
- `POST /api/payments/verify` -> verify signature and credit wallet (`recharge`).

Withdrawals:
- User/vendor withdrawal request: `POST /api/payments/withdraw` or `POST /api/user/payout`.
- Admin settlement: `PUT /api/admin/withdrawals/:id/process` (`processed` or `rejected`).
- On rejection, refund transaction is generated.

### 5.6 Store Redemption

- Public catalog source: `GET /api/public/store` (from system settings metadata with fallback dataset).
- Customer redeem product: `POST /api/user/store/redeem`.
- Effect:
  - debit wallet,
  - create transaction (`withdrawal` category used for store redeem),
  - create user notification.

### 5.7 Support and Notifications

- Customer support:
  - `POST /api/user/support`
  - `GET /api/user/support`
- Vendor support:
  - `POST /api/vendor/support`
  - `GET /api/vendor/support`
- Admin handles all tickets:
  - `GET /api/admin/support`
  - `PUT /api/admin/support/:id`
- Notifications exist for wallet events, redemptions, campaign/order events, and support workflows.

## 6. Status Transition Maps

### 6.1 Campaign

- Typical: `pending -> active -> paused/completed/rejected`
- Vendor creation starts at `pending`.
- Vendor pay action moves to `active`.
- Admin/vendor can pause/resume (`active <-> paused` depending on route and role).

### 6.2 QR

- Created as `generated` (or `active` in order-pay path).
- Redeem flow accepts `generated` and `assigned`.
- Redeem sets `status = redeemed`.

### 6.3 Vendor and Brand

- Vendor: `pending | active | paused | rejected | expired`
- Brand: `pending | active | inactive | rejected`

### 6.4 Withdrawal

- Request starts `pending`.
- Admin process sets `processed` or `rejected`.
- Rejected path refunds wallet.

## 7. Route Groups (Quick API Index)

- Auth: `/api/auth/*`
- Public read-only content: `/api/public/*`
- Customer operations: `/api/user/*`
- Wallet view/payout methods: `/api/wallet/*`
- Vendor operations: `/api/vendor/*`
- Payments/Razorpay: `/api/payments/*`
- Admin controls: `/api/admin/*`
- Claim token flow: `/api/claim/*`
- Upload: `/api/upload`

## 8. Working Feature Checklist (Current Code)

- Vendor self-signup and pending approval flow.
- Admin dashboard controls for users/vendors/brands/campaigns/orders/withdrawals.
- Vendor product + campaign creation with allocation-based budgeting.
- Campaign payment activation and automatic QR generation.
- Additional QR ordering and PDF downloads.
- Customer QR scan/redeem with wallet credit + optional instant payout behavior.
- Wallet recharge through Razorpay verification path.
- Store redeem product with wallet debit.
- Support tickets and notification pipelines.
- System settings with metadata for home banners and redeem store.
- Activity logging and vendor activity logging.

## 9. Known Implementation Notes (Important for Research)

- `subscriptionMiddleware` exists but is not currently mounted on routes, so subscription gating is not enforced centrally.
- In frontend API utility, `requestWithdrawal` points to `/api/user/withdrawals` while the backend withdrawal request endpoints are `/api/user/payout` and `/api/payments/withdraw`. This can affect older wallet UI paths.
- There are multiple wallet-related route families (`/api/user/*`, `/api/wallet/*`, `/api/payments/*`) because both legacy and newer flows coexist.

## 10. Recommended Research Angles

1. Normalize one canonical withdrawal API and align frontend callers.
2. Enforce subscription checks consistently by mounting `requireActiveSubscription`.
3. Standardize QR status lifecycle (`generated` vs `active`) to remove ambiguity.
4. Define a single onboarding path (self-signup vs brand-registration wizard) and unify status semantics.
5. Split wallet transaction categories for store redemption vs payout withdrawal to improve reporting clarity.

