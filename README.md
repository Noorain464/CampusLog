# CampusLog 📱

**CampusLog** is a Full-Stack Mobile Application designed to digitally transform the inefficient manual borrowing process in educational institutions. It replaces physical logbooks with a secure mobile application, allowing students to request items remotely and administrators to manage approvals efficiently.

## 🚀 Problem Statement
Many educational institutions still rely on manual logbooks for borrowing sports, lab, or library equipment. This leads to:
* Writing details in physical books is slow and error-prone.
* Students struggle to find staff members for permission.
* No digital trail of who borrowed what and when.

## 🛠️ Tech Stack
This project uses a Full-Stack architecture as required by the final project guidelines.

* **Frontend:** React Native (Expo) 
* **Backend:** Node.js & Express 
* **Database:** MongoDB (Mongoose) 
* **Authentication:** JWT (JSON Web Tokens)
* **Styling:** NativeWind (Tailwind CSS)

## ✨ Features Implemented

### 🎓 Student Module
* **Inventory Catalog:** View real-time availability of items (e.g., Cricket Bat, Lab Equipment).
* **Remote Request:** Request items directly from the app without finding staff physically.
* **Status Tracking:** View the status of requests (Pending, Approved, Rejected).

### 🛡️ Admin Module
* **Approval Dashboard:** View a list of all pending student requests.
* **Action Requests:** Approve or Reject requests with a single tap.
* **Return Management:** Mark items as returned to update inventory automatically.

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
    MONGODB_URI
    JWT_SECRET
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

