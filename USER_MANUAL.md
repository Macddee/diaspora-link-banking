# DiasporaLink Banking — User Manual

A quick, end-to-end guide to using the DiasporaLink Banking web app.

- **Live URL:** https://diaspora-link-banking.vercel.app/
- **Audience:** Customers (regular users) and System Administrators
- **Currency:** All balances and transfers are in **USD**

---

## 1. Demo Accounts

Use these credentials to explore the app.

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@diasporalink.app` | `admin@Diaspora` |
| Regular User | `man@gmail.com` | `Macd@2002` |

> Each newly registered user automatically receives a **$1,000 starter balance** for testing transfers.

---

## 2. Getting Started

### 2.1 Create an Account (Sign Up)
1. Go to https://diaspora-link-banking.vercel.app/
2. Click **Sign Up**.
3. Enter your email, create a password, and verify your email if prompted.
4. You will be redirected to your **Dashboard** with a $1,000 starter balance.

### 2.2 Sign In
1. Click **Sign In** on the home page.
2. Enter your email and password.
3. You'll land on the **Dashboard** (regular user) or **Admin Portal** (admin).

### 2.3 Sign Out
- Click **Sign Out** at the bottom of the left sidebar (or in the mobile menu).

---

## 3. Navigation Overview

The left sidebar (or bottom navigation on mobile) shows different items based on your role.

**Regular user menu:**
- Dashboard
- Transfers
- History
- Support
- Profile

**Admin menu:**
- Admin Portal
- Transactions
- Profile

---

## 4. For Regular Users

### 4.1 Dashboard
The Dashboard shows your financial snapshot at a glance:
- **Total Balance** — current funds in your wallet.
- **Monthly In** — total money received this month.
- **Monthly Out** — total money sent this month.
- **Recent Activity** — your last 5 transactions (sender/receiver, status, amount).
- **Account Status** — green dot = Active, red dot = Frozen.

> If your account is **Frozen**, you cannot send transfers. Contact Support.

### 4.2 Sending Money (Transfers)
1. Click **Transfers** in the sidebar.
2. Enter the **Recipient Email** (must be a registered DiasporaLink user).
3. Enter the **Amount (USD)** — must be greater than 0.
4. Click **Review Transfer**.
5. Confirm the details in the review modal, then submit.
6. You'll see a success toast and the recipient is credited instantly.

**Common errors:**
| Message | Meaning |
|---|---|
| *Recipient not found in our system.* | The email is not a registered DiasporaLink user. |
| *Insufficient funds.* | Your balance is lower than the requested amount. |
| *Internal transfers to self are not allowed via this form.* | You entered your own email. |
| *Account is frozen. Please contact support.* | An admin has frozen your account. |

> Transfers are **instant**, **fee-free**, and **within the network** only.

### 4.3 Transaction History
1. Click **History** in the sidebar.
2. View every transaction you have sent or received, sorted newest first.
3. Each row shows the counterparty's email, status, date/time, and amount (color-coded green for received, dark for sent).

### 4.4 Support
1. Click **Support** in the sidebar.
2. Click **New Ticket** (or use the form).
3. Enter a **Subject** and a detailed **Message** describing your issue.
4. Submit. The ticket appears in your list with status **OPEN**.
5. When an admin resolves it, the status changes to **RESOLVED**.

### 4.5 Profile
1. Click **Profile** in the sidebar.
2. Update your **Name** and click save.
3. Email is managed via your sign-in credentials and is read-only here.
4. Your **KYC Status** is displayed (VERIFIED or PENDING).

---

## 5. For Administrators

Sign in with the admin account (`admin@diasporalink.app`) to access these tools.

### 5.1 Admin Portal — Overview Tab
The **Admin Portal** opens to the Overview tab and shows:
- **Total Users** — number of registered customers.
- **System Funds** — sum of every account balance across the platform.
- **Open Tickets** — count of unresolved support requests.
- **Recent System Activity** — last 10 transactions across the entire platform.

### 5.2 Users Tab — Manage Customers
Click the **Users** tab to see every registered user with:
- Name and email
- Role (user / admin)
- KYC Status (PENDING / VERIFIED)
- Account Status (Active / Frozen)

**Actions you can take per user:**
- **Verify KYC** — appears for users with PENDING KYC; one click marks them VERIFIED.
- **Freeze / Unfreeze** — toggles the user's ability to send transfers. Admin accounts cannot be frozen.

### 5.3 Tickets Tab — Resolve Support Requests
Click the **Tickets** tab to see every support ticket, including:
- The submitting user's email
- Subject and message
- Date/time and status

Click **Mark Resolved** on an OPEN ticket to close it. The user will see the updated status on their Support page.

### 5.4 Transactions Page — Reverse Transfers
1. Click **Transactions** in the sidebar.
2. Browse the full ledger of every transfer on the platform.
3. To reverse a transfer, click **Reverse** next to the transaction.
   - Funds are moved back from the receiver to the sender.
   - The original transaction is marked **REVERSED**.
   - A new compensating transaction is recorded.
4. A transaction can only be reversed **once**.

> Use reversals only for fraud, error, or disputed transfers. Both accounts must still exist.

---

## 6. Account Status Reference

| Status | Meaning |
|---|---|
| **Active** | Account in good standing; can send and receive. |
| **Frozen** | Cannot send transfers; can still receive. Set by an admin. |
| **KYC: VERIFIED** | Identity confirmed (auto-set on signup in this demo). |
| **KYC: PENDING** | Identity not yet confirmed by an admin. |
| **Transaction: COMPLETED** | Funds successfully moved. |
| **Transaction: REVERSED** | Original transfer rolled back by an admin. |

---

## 7. Mobile Experience
- The sidebar collapses into a **mobile navigation bar** at the bottom of the screen.
- All tables (users, tickets, transactions) switch to **card layouts** for easier reading.
- All actions (transfer, freeze, resolve, reverse) work the same on mobile and desktop.

---

## 8. Troubleshooting & FAQ

**Q: I can't sign in.**
- Double-check the email and password.
- Make sure you completed email verification when signing up.

**Q: My transfer says "Recipient not found".**
- The recipient must be a registered DiasporaLink user. Ask them to sign up first.

**Q: My balance didn't update after a transfer.**
- Refresh the **Dashboard**. Balances revalidate automatically but a hard refresh forces a fresh fetch.

**Q: I'm an admin but I don't see the Admin Portal.**
- Only the **first user ever registered** is auto-promoted to admin. Use the admin credentials above.

**Q: Can I delete my account?**
- Self-service deletion is not available in this demo. Submit a support ticket.

**Q: Are real funds involved?**
- No. This is a **simulation** for demonstration purposes. All balances are virtual.

---

## 9. Security Notes
- Authentication is handled by **Clerk**; passwords are never stored by the application directly.
- Always sign out on shared devices.
- Admin actions (freeze, reverse, resolve, verify KYC) are restricted to accounts with the `admin` role on the server side.

---

*DiasporaLink Banking — User Manual · Last updated: May 2026*
