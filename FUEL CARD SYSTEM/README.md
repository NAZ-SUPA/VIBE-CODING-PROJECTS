# Fuel Rationing & Card Management System

[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com)

A high-performance enterprise fuel distribution and card rationing application built with **Laravel 11**, **React 18**, **TypeScript**, and **Tailwind CSS v4**. The system enforces fair subsidized fuel allocation across citizens using 6-digit physical ID cards, preventing double-dispensing through automated 7-day cooldown calculations.

---

## 📋 Architectural Overview & Core Logic

### 1. The 7-Day Rationing Rule
* **Card Identification:** Citizens hold unique 6-digit physical cards (e.g. `000000` to `999999`).
* **Fuel Types:** Fuel is categorized into **Gas** (Gasoline/LPG: Kurdish "گاز", Arabic "غاز") and **Oil** (Petrol/Benzine: Kurdish "بەنزین", Arabic "بنزين").
* **Cooldown Mechanism:** Once a card is used to purchase either Gas or Oil, it enters an immediate **7-day lock period**. Querying a blocked card returns clean integer countdown days (ceiling rounded) alongside the exact future calendar date/time when fuel can next be purchased.

### 2. Strict Role Segregation & Permissions
* **Public Citizens:** Can query 6-digit card rationing status on the public portal without authentication.
* **Station Administrators (`station_admin`):** Local station operators authorized to verify card eligibility and record fuel transactions. Restricted from viewing or managing administrators and cards.
* **Super Administrators (`super_admin`):** Executive headquarters managers authorized to issue physical cards, register station administrators, and inspect logs. Restricted from dispensing fuel.

---

## ✨ Core Feature Breakdown

### 1. Public Citizen Portal (`UserPanel.tsx`)
* Real-time card status checking with 6-digit zero-padded string handling.
* Visual status indicators:
  * 🟢 **Eligible / Ready:** Never used or cooldown expired.
  * 🔴 **Blocked / In Cooldown:** Displays exact remaining days (e.g. `7 days remaining`) and exact calendar date of availability (e.g. `Eligible on: September 13, 2026`).

### 2. Station Admin Panel (`AdminPanel.tsx` - Dispense View)
* Authenticated station operator interface.
* Dual action buttons for **Gas** and **Oil** dispensing.
* Real-time 403 Forbidden intercept for cards in cooldown, displaying localized warning banners.
* Digital transaction receipt generator detailing card ID, fuel type, station location, and timestamp.

### 3. Super Admin Dashboard (`AdminPanel.tsx` - Management Tabs)
* **Manage Admins Tab:** Register new station administrators (Username, Password, Station Location) and revoke/delete existing accounts.
* **Card Management Tab:** Issue new 6-digit physical cards, search cards in real-time, inspect status, and delete unused cards.
* **Custom React Confirmation Modal:** Reusable dark glassmorphic modal (`ConfirmationModal.tsx`) with keyboard listeners (`Escape` key), click-outside closing, and i18n support.

### 4. Internationalization (i18n) & Bidirectional (LTR/RTL) Layout
* Native multi-language support powered by `react-i18next`:
  * **English (`en`)**: LTR layout.
  * **Arabic (`ar`)**: RTL layout (`dir="rtl"`).
  * **Kurdish (`ku`)**: RTL layout (`dir="rtl"`).
* Automatic chevron & directional icon rotation (`rtl:rotate-180`) ensuring navigation arrows follow reading flow in RTL languages.

---

## 🛠 Tech Stack & Requirements

| Layer | Technology | Version |
| :--- | :--- | :--- |
| **Backend Framework** | Laravel | 11.x (PHP 8.2+ / PHP 8.5) |
| **Database** | MySQL | 8.0+ (Default Port: `3307`) |
| **Frontend Framework** | React | 18.3+ (TypeScript) |
| **Build Tool** | Vite | 6.x (`@tailwindcss/vite`) |
| **Styling** | Tailwind CSS | v4.0 |
| **Icons** | Lucide React | Latest |
| **Localization** | `react-i18next` | Latest |

---

## 🚀 Setup & Execution Guide

### Option A: Automated Launch (Windows)
Double-click `run.bat` in the project root folder. This batch script will launch the Laravel API backend (`http://localhost:8000`) and the Vite React frontend (`http://localhost:5173`) in separate command prompt windows simultaneously.

---

### Option B: Manual Installation

#### 1. Database Configuration
Create a MySQL database named `fuel_system` on port `3307` (or adjust `.env` accordingly):
```sql
CREATE DATABASE fuel_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2. Backend Setup (Laravel)
Navigate to the `backend` directory:
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Configure `backend/.env` with your database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3307
DB_DATABASE=fuel_system
DB_USERNAME=root
DB_PASSWORD=
```

Run migrations and seed default administrators:
```bash
php artisan migrate:fresh --seed
```

*(Optional)* Populate 1,000,000 cards in bulk using chunked seeding:
```bash
php artisan db:seed-cards
```

*(Alternative)* Import pre-populated database dump if available:
```bash
mysql -u root -P 3307 fuel_system < database/fuel_system.sql
```

Start the Laravel development server:
```bash
php artisan serve --port=8000
```

#### 3. Frontend Setup (React + Vite)
In a new terminal window, navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔑 Default Credentials

The `AdminSeeder` pre-populates the system with default accounts for initial setup and verification:

| Role | Username | Password | Default Station / Scope | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `superpassword123` | Headquarters | Manage Admins, Issue/Delete Cards |
| **Station Admin** | `admin` | `password123` | Kirkuk Central Station | Dispense Gas & Oil |

---

## 📡 API Reference Summary

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cards/{card_id}/status` | Public | Returns card eligibility, ceiling cooldown days, and unlock date. |
| `POST` | `/api/login` | Public | Authenticates admin credentials, returning Sanctum Bearer token & Admin object. |
| `POST` | `/api/transactions/process` | Station Admin | Processes fuel transaction (returns 403 if in cooldown or non-station admin). |
| `GET` | `/api/super-admin/admins` | Super Admin | Lists all registered station administrators. |
| `POST` | `/api/super-admin/admins` | Super Admin | Registers a new station administrator. |
| `DELETE` | `/api/super-admin/admins/{id}` | Super Admin | Revokes/deletes a station administrator. |
| `GET` | `/api/super-admin/cards` | Super Admin | Returns paginated list of cards with search & status filters. |
| `POST` | `/api/super-admin/cards` | Super Admin | Issues a new 6-digit physical card. |
| `DELETE` | `/api/super-admin/cards/{card_id}` | Super Admin | Deletes an unused physical card. |

---

## 🧪 End-to-End Verification Protocol

To verify the full system functionality end-to-end:

1. **Super Admin Setup**: Log in at `/admin` as `superadmin` / `superpassword123`.
   * Create a new station admin under **Manage Admins**.
   * Issue a new 6-digit card (e.g. `888999`) under **Card Management**.
2. **Public Eligibility Check**: Switch to the public User Panel (`/`). Enter card `888999`. Confirm it displays **Eligible / Ready** (Green).
3. **Station Fuel Dispensing**: Log in as `admin` / `password123`. Enter card `888999` and click **Oil** (بەنزین / بنزين). Confirm success receipt appears.
4. **Cooldown Verification**: Return to public User Panel and query card `888999`. Confirm it displays as **Blocked** with `7` days remaining and exact future unlock date.
5. **Fraud Prevention**: Return to Station Admin panel and attempt to dispense **Gas** to card `888999`. Confirm the request is rejected with a 403 error banner.
6. **i18n & RTL Check**: Toggle language between **English**, **العربية**, and **کوردی**. Verify text translations and confirm navigation arrows mirror correctly (`rtl:rotate-180`).

---

## 📄 License
This project is open-source software built for subsidized fuel rationing distribution.
