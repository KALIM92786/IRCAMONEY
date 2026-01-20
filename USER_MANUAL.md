# IRCAMONEY - User Manual

Welcome to IRCAMONEY! This guide will walk you through all the features of the platform to help you monitor and manage your trading accounts effectively.

## 1. Getting Started

### First Login
- **URL**: Access the platform via the URL provided by your administrator.
- **Credentials**: Use the username and password provided to you. If you are the first user, the default credentials are:
  - **Username**: `admin`
  - **Password**: `admin123`

### Changing Your Password
For security, it is crucial to change your password immediately after your first login.
1.  Navigate to the **Profile** page from the sidebar.
2.  Enter your new password in the "New Password" and "Confirm Password" fields.
3.  Click **Save Changes**.

## 2. The Dashboard
The Dashboard is your main overview of your trading account's health.

- **Account Selector**: If you have multiple accounts, you can switch between them using the dropdown menu.
- **Stat Cards**:
    - **Balance**: Your account balance, excluding floating profits/losses.
    - **Equity**: Your balance plus or minus any floating profits/losses.
    - **Margin**: The amount of money used to maintain your open positions.
    - **Free Margin**: The funds available to open new positions.
- **Equity Curve**: A real-time chart showing your equity changes over the recent period.
- **Sync Now**: Manually trigger a data refresh from your broker.

## 3. Managing Trades

### Open Trades (`/trades`)
This page shows all your currently active positions.
- **Filter**: Use the search bar to filter trades by symbol (e.g., "XAUUSD").
- **Summary**: View total active trades, total volume, and the estimated floating Profit/Loss.
- **Close a Trade**: Click the **'X'** icon at the end of a trade's row to close it immediately.
- **Close All**: Use the "Close All" button to close all trades on the current account (or all filtered trades). **Use with caution!**

### Trade History (`/history`)
Review all your closed trades.
- **Filter**: Filter by trade side (Buy/Sell).
- **Pagination**: Navigate through your trade history using the page controls at the bottom.
- **Export**: Click the **Download** icon to export your trade history as a CSV file for analysis in other tools like Excel.

### Archived Trades (`/archive`)
This page shows trades older than 90 days that have been moved from the main history to reduce clutter.

## 4. Analytics & Reports

### Equity Curve (`/equity`)
A detailed view of your account's performance over time.
- **Brush & Zoom**: Use the slider at the bottom of the chart to zoom into specific time periods.
- **Tooltip**: Hover over the chart to see the exact equity value at any point in time.

### Portfolio (`/portfolio`)
See a breakdown of your market exposure.
- **Pie Chart**: Visualizes your asset allocation based on the volume of open trades for each symbol.
- **Exposure Details**: A list view showing the total lots traded for each asset.

### Daily Reports (`/reports/daily`)
Get a day-by-day summary of your trading performance, including net profit, total trades, win/loss count, and win rate.

### Strategy Performance (`/strategy`)
Analyze the effectiveness of your trading strategy with key metrics like:
- **Net Profit**: Total profit or loss.
- **Win Rate**: The percentage of profitable trades.
- **Profit Factor**: Gross profit divided by gross loss.

## 5. Settings & Configuration

### Profile (`/profile`)
- Update your email address.
- Change your password.

### Settings (`/settings`)
- **Preferences**:
    - **Theme**: Switch between Light and Dark mode.
    - **Notifications**: Enable or disable platform notifications.
- **Broker Connection**:
    - Add or update your RoboForex Account ID and API Token.
    - **Fetch Accounts from Broker**: After adding credentials, click this to load your account details into the platform.
- **Danger Zone**:
    - **Delete Account**: Permanently delete your user account and all associated data. This action is irreversible.

### Security
- **2FA**: Enable Two-Factor Authentication for an extra layer of security.
- **Sessions**: View and revoke active login sessions on other devices.

## 6. Additional Features

### Trading Journal (`/journal`)
Attach notes to your closed trades to analyze your decisions, emotions, and strategy execution.

### Financial Goals (`/goals`)
Set and track financial targets. The platform will show your progress based on your account's current balance.

### Referrals (`/referrals`)
Invite others to the platform and track your referral history.

### Support (`/support`)
Create and view support tickets if you need assistance from the platform administrator.