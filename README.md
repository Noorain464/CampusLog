# CampusLog 📱

**CampusLog** is a Full-Stack Mobile Application designed to digitally transform the inefficient manual borrowing process in educational institutions. It replaces physical logbooks with a secure mobile application, allowing students to request items remotely and administrators to manage approvals efficiently.

## 🚀 Problem Statement
Many educational institutions still rely on manual logbooks for borrowing sports, lab, or library equipment. This leads to:
* [cite_start]**Manual Inefficiency:** Writing details in physical books is slow and error-prone[cite: 7].
* [cite_start]**Missed Requests:** Students struggle to find staff members for permission[cite: 8].
* [cite_start]**Lack of History:** No digital trail of who borrowed what and when[cite: 9].

## 🛠️ Tech Stack
[cite_start]This project uses a Full-Stack architecture as required by the final project guidelines[cite: 40].

* [cite_start]**Frontend:** React Native (Expo) [cite: 33]
* [cite_start]**Backend:** Node.js & Express [cite: 36]
* [cite_start]**Database:** MongoDB (Mongoose) [cite: 39]
* **Authentication:** JWT (JSON Web Tokens)
* **Styling:** NativeWind (Tailwind CSS)

## ✨ Features Implemented

### 🎓 Student Module
* [cite_start]**Inventory Catalog:** View real-time availability of items (e.g., Cricket Bat, Lab Equipment)[cite: 12].
* [cite_start]**Remote Request:** Request items directly from the app without finding staff physically[cite: 12].
* [cite_start]**Status Tracking:** View the status of requests (Pending, Approved, Rejected)[cite: 13].

### 🛡️ Admin Module
* [cite_start]**Approval Dashboard:** View a list of all pending student requests[cite: 18].
* [cite_start]**Action Requests:** Approve or Reject requests with a single tap[cite: 18].
* [cite_start]**Return Management:** Mark items as returned to update inventory automatically[cite: 30].

## ⚙️ How to Run Locally

### Prerequisites
* Node.js installed
* MongoDB Atlas connection string (or local MongoDB)
* Expo Go app on your phone (or Android Emulator)

### 1. Backend Setup
1.  Navigate to the server folder:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `server` directory with the following credentials:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string_here
    JWT_SECRET=your_secret_key_here
    ```
4.  Start the server:
    ```bash
    npm start
    ```
    *The server should run on http://localhost:5000*

### 2. Mobile App (Frontend) Setup
1.  Navigate to the root project folder:
    ```bash
    cd ..
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Expo server:
    ```bash
    npx expo start
    ```
4.  Scan the QR code with your Expo Go app (Android/iOS).

> **Note:** Ensure your phone and computer are on the same Wi-Fi network, or use an emulator.

## 📡 API Documentation (Basic)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **Auth** | | |
| `POST` | `/api/auth/register` | Register a new student/admin |
| `POST` | `/api/auth/login` | Login and receive JWT |
| **Inventory** | | |
| `GET` | `/api/inventory` | Get all available items |
| **Transactions** | | |
| `POST` | `/api/transaction/request` | Student requests an item |
| `GET` | `/api/transaction/pending` | Admin gets all pending requests |
| `POST` | `/api/transaction/approve` | Admin approves a request |
| `POST` | `/api/transaction/reject` | Admin rejects a request |

## 🔮 Future Scope
* **Push Notifications:** Integration with FCM to alert admins of new requests instantly.
* **Overdue Reminders:** Automated alerts for items not returned on time.

---
*Submitted for the Final Year Project - Mobile Application Development*