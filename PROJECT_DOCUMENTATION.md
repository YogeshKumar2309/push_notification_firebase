# 🔔 Push Notification Firebase - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Backend Documentation](#backend-documentation)
4. [Frontend Documentation](#frontend-documentation)
5. [How Notifications Work](#how-notifications-work)
6. [Setup & Configuration](#setup--configuration)

---

## 🎯 Project Overview

Ye ek **Push Notification System** hai jo Firebase Cloud Messaging (FCM) use karta hai. 

**Main Features:**
- ✅ User authentication (Register/Login)
- ✅ FCM token generation aur management
- ✅ Push notifications send karna
- ✅ Foreground aur background dono mein notifications display
- ✅ Multiple devices support

---

## 📁 Folder Structure

```
push_notification_firebase/
├── backend/                          # Node.js Express Server
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   ├── firebase.js              # Firebase Admin SDK initialization
│   │   └── firebase-service-account.json  # Firebase credentials (SECRET!)
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT authentication middleware
│   ├── models/
│   │   ├── User.js                  # User database schema
│   │   └── Notification.js          # Notification schema (optional)
│   ├── routes/
│   │   ├── authRoutes.js            # Login/Register endpoints
│   │   └── notificationRoutes.js    # Notification endpoints
│   ├── services/
│   │   └── notificationService.js   # Firebase notification sending logic
│   ├── package.json                 # Dependencies
│   └── server.js                    # Main server file
│
├── frontend/                         # React + Vite
│   ├── public/
│   │   └── firebase-messaging-sw.js # Service Worker (background notifications)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.jsx             # Main home page (send notifications button)
│   │   │   ├── Login.jsx            # Login component
│   │   │   └── Register.jsx         # Register component
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication context (Redux like)
│   │   ├── services/
│   │   │   ├── firebase.js          # Firebase client SDK + notification permission
│   │   │   ├── api.js               # Axios API calls
│   │   │   └── notificationService.js  # (empty - can be used for future)
│   │   ├── App.jsx                  # Main app component with routing
│   │   ├── main.jsx                 # Entry point + Service Worker registration
│   │   └── index.css                # Global styles
│   ├── .env                         # Environment variables
│   ├── package.json                 # Dependencies
│   └── vite.config.js              # Vite configuration
│
├── firebaseConfig.js                # (root level - not used currently)
└── README.md                        # Project info

```

---

## 🖥️ Backend Documentation

### **1️⃣ server.js - Main Server File**

**Location:** `backend/server.js`

**Kya karta hai:**
- Express server start karta hai port 5000 pe
- CORS enable karta hai (frontend se requests allow karne ke liye)
- MongoDB se connect karta hai
- Routes register karta hai
- Health check endpoint

**Code breakdown:**
```javascript
import express from 'express';
app.use(cors());              // Cross-origin requests allow
app.use(express.json());      // JSON parsing middleware
connectDB();                  // MongoDB connection
app.use('/api/auth', authRoutes);           // Auth routes
app.use('/api/notifications', notificationRoutes);  // Notification routes
```

---

### **2️⃣ config/db.js - Database Connection**

**Location:** `backend/config/db.js`

**Kya karta hai:**
- MongoDB se connect karta hai
- Database URL `process.env.MONGO_URI` se leta hai

**Code:**
```javascript
const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');
};
```

---

### **3️⃣ config/firebase.js - Firebase Admin SDK**

**Location:** `backend/config/firebase.js`

**Kya karta hai:**
- Firebase Admin SDK initialize karta hai
- Service account JSON file se credentials leta hai
- Notifications bhejne ke liye admin access deta hai

**Code:**
```javascript
import admin from 'firebase-admin';

const serviceAccount = JSON.parse(readFileSync('...firebase-service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

**Important:** `firebase-service-account.json` ek secret file hai, `.gitignore` mein add karo!

---

### **4️⃣ models/User.js - User Schema**

**Location:** `backend/models/User.js`

**Database mein user ka structure:**
```javascript
{
  _id: ObjectId,
  name: "Yogesh Kumar",
  email: "yogesh@example.com",
  password: "hashed_password",
  fcmTokens: [
    {
      token: "FCM_TOKEN_HASH",
      deviceInfo: {
        browser: "Chrome",
        os: "Linux",
        device: "Desktop",
        userAgent: "Mozilla..."
      },
      createdAt: "2026-01-14T10:30:00Z"
    }
  ],
  createdAt: "2026-01-14T09:00:00Z"
}
```

**Fields:**
- `name, email, password` - Basic user info
- `fcmTokens[]` - Array of Firebase notification tokens (multiple devices)
- `deviceInfo` - Device details (browser, OS, device type)

---

### **5️⃣ middleware/authMiddleware.js - JWT Authentication**

**Location:** `backend/middleware/authMiddleware.js`

**Kya karta hai:**
- Every protected request mein JWT token check karta hai
- Token validate kar ke user ID extract karta hai
- `req.user` object set karta hai

**Code flow:**
```javascript
const token = req.headers.authorization?.split(' ')[1];  // "Bearer TOKEN" se TOKEN nikalo
verify(token, secret);  // Token verify karo
req.user = decoded;     // User info set karo
next();                 // Next middleware ko call karo
```

---

### **6️⃣ services/notificationService.js - Notification Sending**

**Location:** `backend/services/notificationService.js`

**Kya karta hai:**
- Firebase Cloud Messaging se notifications bhejta hai
- Single token ya multiple tokens ko support karta hai
- Message structure properly format karta hai

**Code:**
```javascript
export const sendNotification = async (tokens, notification) => {
  const messagePayload = {
    notification: {
      title: "Title",
      body: "Message",
      icon: "URL"
    },
    data: {...},        // Extra data
    webpush: {...}      // Web-specific settings
  };

  if (tokens.length > 1) {
    // Multiple users ko notification bhejo
    admin.messaging().sendEachForMulticast({...});
  } else {
    // Single user ko notification bhejo
    admin.messaging().send({...});
  }
};
```

---

### **7️⃣ routes/authRoutes.js - Authentication Endpoints**

**Location:** `backend/routes/authRoutes.js`

**Endpoints:**

#### **POST /api/auth/register**
- Naya user create karta hai
- Password hash karke store karta hai
- JWT token return karta hai

Request:
```json
{
  "name": "Yogesh Kumar",
  "email": "yogesh@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "token": "JWT_TOKEN_HERE",
  "user": { "id": "...", "name": "...", "email": "..." }
}
```

#### **POST /api/auth/login**
- Email aur password check karta hai
- Sahi ho to JWT token return karta hai

Request:
```json
{
  "email": "yogesh@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "token": "JWT_TOKEN_HERE",
  "user": { "id": "...", "name": "...", "email": "..." }
}
```

---

### **8️⃣ routes/notificationRoutes.js - Notification Endpoints**

**Location:** `backend/routes/notificationRoutes.js`

#### **POST /api/notifications/save-token**
- Frontend se FCM token receive karta hai
- User ke database mein save karta hai
- Multiple devices support karta hai

Request (Protected - JWT token required):
```json
{
  "token": "FCM_TOKEN_FROM_BROWSER",
  "deviceInfo": {
    "browser": "Chrome",
    "os": "Linux",
    "device": "Desktop"
  }
}
```

#### **POST /api/notifications/send**
- Current logged-in user ke sare devices ko notification bhejta hai
- Backend test notification define karta hai

Response:
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "result": {
    "success": 1,
    "failed": 0
  }
}
```

#### **POST /api/notifications/send-to/:userId** (New - Testing ke liye)
- Specific user ko notification bhejta hai
- Authentication required nahi hai (testing ke liye)

#### **GET /api/notifications/devices**
- Current user ke sare registered devices list karta hai

Response:
```json
{
  "success": true,
  "devices": [
    {
      "deviceInfo": {...},
      "createdAt": "2026-01-14T10:30:00Z"
    }
  ]
}
```

---

## 🎨 Frontend Documentation

### **1️⃣ main.jsx - Entry Point**

**Location:** `frontend/src/main.jsx`

**Kya karta hai:**
- React app mount karta hai DOM mein
- **Service Worker register karta hai** (background notifications ke liye)

**Code:**
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(() => console.log('✅ Service Worker registered'))
    .catch((error) => console.error('❌ Failed:', error));
}

ReactDOM.createRoot(...).render(<App />);
```

---

### **2️⃣ App.jsx - Main App Component**

**Location:** `frontend/src/App.jsx`

**Kya karta hai:**
- Routing setup karta hai (React Router)
- AuthContext provider wrap karta hai
- Private routes handle karta hai

**Routes:**
- `/` → Home (protected)
- `/login` → Login page
- `/register` → Register page

---

### **3️⃣ context/AuthContext.jsx - Authentication State**

**Location:** `frontend/src/context/AuthContext.jsx`

**Kya karta hai:**
- User authentication state manage karta hai
- Login/Logout functionality provide karta hai
- Token localStorage mein store karta hai

**Provides:**
- `user` - Current logged-in user object
- `loginUser(email, password)` - Login function
- `registerUser(name, email, password)` - Register function
- `logoutUser()` - Logout function

**Code:**
```javascript
const [user, setUser] = useState(null);
const [token, setToken] = useState(localStorage.getItem('token'));

const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', {...});
  setToken(response.token);
  localStorage.setItem('token', response.token);
  setUser(response.user);
};
```

---

### **4️⃣ services/firebase.js - Firebase Client SDK**

**Location:** `frontend/src/services/firebase.js`

**Kya karta hai:**
- Firebase initialize karta hai (web SDK)
- Notification permission request karta hai
- FCM token generate karta hai
- Foreground messages listen karta hai

**Main Functions:**

#### **requestNotificationPermission()**
- User se notification permission maangta hai
- Browser ki service worker ready check karta hai
- FCM token generate karta hai
- Token return karta hai

```javascript
export const requestNotificationPermission = async () => {
  // 1. Notification permission request
  const permission = await Notification.requestPermission();
  
  // 2. Service Worker ready
  const registration = await navigator.serviceWorker.ready;
  
  // 3. FCM token generate
  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration
  });
  
  return token;
};
```

#### **onMessageListener()**
- Foreground notification listener
- App khula hota hai to ye trigger hota hai

```javascript
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('📩 Notification received:', payload);
      resolve(payload);
    });
  });
```

---

### **5️⃣ services/api.js - Axios API Client**

**Location:** `frontend/src/services/api.js`

**Kya karta hai:**
- Axios instance create karta hai base URL ke saath
- JWT token automatically header mein add karta hai
- Backend API calls ke liye functions

**Functions:**

```javascript
// Auth
export const register = async (userData) => {...}
export const login = async (credentials) => {...}

// Notifications
export const saveFCMToken = async (token, deviceInfo) => {...}
export const sendTestNotification = async () => {...}
export const getUserDevices = async () => {...}
```

**Auto Token Injection:**
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

### **6️⃣ components/Home.jsx - Home Page**

**Location:** `frontend/src/components/Home.jsx`

**Kya karta hai:**
- Main user dashboard
- Notifications send karne ka button
- Devices list show karta hai
- Foreground notifications display karta hai

**Key Features:**

#### **initializeNotifications()**
```javascript
const initializeNotifications = async () => {
  // 1. Notification permission request
  const token = await requestNotificationPermission();
  
  // 2. Token save to backend
  await saveFCMToken(token, deviceInfo);
  
  console.log('✅ Token saved');
};
```

#### **handleSendNotification()**
```javascript
const handleSendNotification = async () => {
  try {
    const response = await sendTestNotification();
    alert('✅ Notification sent!');
  } catch (error) {
    alert('❌ Failed: ' + error.message);
  }
};
```

#### **Display**
- Current user info
- Device information
- All registered devices
- Send notification button

---

### **7️⃣ components/Login.jsx**

**Location:** `frontend/src/components/Login.jsx`

**Kya karta hai:**
- Email aur password input lo
- Backend ko login request bhejo
- Token save kar ke home redirect karo

---

### **8️⃣ components/Register.jsx**

**Location:** `frontend/src/components/Register.jsx`

**Kya karta hai:**
- Name, email, password input lo
- Backend ko register request bhejo
- Token save kar ke home redirect karo

---

### **9️⃣ public/firebase-messaging-sw.js - Service Worker**

**Location:** `frontend/public/firebase-messaging-sw.js`

**Kya karta hai:**
- Background mein notifications handle karta hai
- App band hota hai to bhi notification dikhता है
- Notification click handle karta hai

**Code:**
```javascript
importScripts('firebase-app-compat.js');
importScripts('firebase-messaging-compat.js');

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || 'https://softzen.in';
  clients.matchAll({...}).then((windowClients) => {
    // Open notification URL in window
  });
});
```

---

### **🔟 .env - Environment Variables**

**Location:** `frontend/.env`

**Variables:**
```dotenv
# Backend API
VITE_API_URL=http://localhost:5000/api

# Firebase config (from Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=push-notificaiton-softzen.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=push-notificaiton-softzen
VITE_FIREBASE_STORAGE_BUCKET=push-notificaiton-softzen.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=232976564886
VITE_FIREBASE_APP_ID=1:232976564886:web:b5c0e72b78a050211638b7

# VAPID Key (for web push)
VITE_FIREBASE_VAPID_KEY=GD7ySF_q276W8gaGiobJ56R7GNq6ciJkeAUxvT0CCvA
```

---

## 🔔 How Notifications Work

### **Complete Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────┐
│                    NOTIFICATION FLOW                         │
└─────────────────────────────────────────────────────────────┘

STEP 1: USER OPENS WEBSITE
├─ main.jsx: Service Worker register
├─ App.jsx: Routes load
└─ Home.jsx: initializeNotifications() call

STEP 2: REQUEST PERMISSION
├─ firebase.js: requestNotificationPermission()
├─ Browser: "Do you want to allow notifications?" prompt
└─ User: ALLOW click

STEP 3: GET FCM TOKEN
├─ firebase.js: Service Worker ready check
├─ firebase.js: getToken(messaging, vapidKey, SW)
├─ Firebase: Token generate
└─ Return token to frontend

STEP 4: SAVE TOKEN TO BACKEND
├─ Home.jsx: saveFCMToken(token, deviceInfo)
├─ API: POST /api/notifications/save-token
├─ Backend: Save token in User.fcmTokens[]
└─ Success response

STEP 5: SEND NOTIFICATION (FROM BACKEND)
├─ Home.jsx: sendTestNotification() or
├─ Backend: POST /api/notifications/send
├─ notificationService.js: Prepare message
├─ Firebase Admin: admin.messaging().send()
└─ Firebase: Send to FCM

STEP 6A: NOTIFICATION DISPLAY (APP OPEN - FOREGROUND)
├─ firebase.js: onMessageListener() triggers
├─ Home.jsx: setNotification(payload)
└─ UI: Show notification in app

STEP 6B: NOTIFICATION DISPLAY (APP CLOSED - BACKGROUND)
├─ firebase-messaging-sw.js: onBackgroundMessage() triggers
├─ Service Worker: self.registration.showNotification()
└─ OS: System notification shows

STEP 7: USER CLICKS NOTIFICATION
├─ firebase-messaging-sw.js: notificationclick event
├─ Opens: notification.data.url
└─ Frontend: Redirects to link
```

---

## ⚙️ Setup & Configuration

### **Backend Setup**

```bash
cd backend
npm install
```

**Create `.env` file:**
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_secret_key_here
```

**Download Firebase service account:**
1. Go to Firebase Console → Project Settings
2. Go to Service Accounts tab
3. Click "Generate new private key"
4. Save as `config/firebase-service-account.json`

**Run:**
```bash
npm run dev
```

---

### **Frontend Setup**

```bash
cd frontend
npm install
```

**Create `.env` file (already done - check values):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_VAPID_KEY=...
```

**Run:**
```bash
npm run dev
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: "Invalid ECDSA P-256 public key"**
- VAPID key invalid hai
- Firebase Console → Cloud Messaging → Generate new key pair
- New public key `.env` mein paste karo

### **Issue 2: "No FCM tokens found"**
- Browser notifications disable hain
- Permission deny kiya hoga
- Browser settings mein notifications enable karo

### **Issue 3: "Failed to send notification: 400 Bad Request"**
- Message structure wrong hai
- VAPID key invalid hai
- User ke fcmTokens empty hain

### **Issue 4: Service Worker not registering**
- `/firebase-messaging-sw.js` file check karo (public folder mein hona chahiye)
- Vite config check karo
- Browser cache clear karo

---

## 📚 Technology Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- Firebase Admin SDK
- JWT for authentication
- bcryptjs for password hashing

**Frontend:**
- React 18 + Vite
- React Router for navigation
- Axios for HTTP requests
- Firebase Web SDK
- Service Workers for background notifications

**Infrastructure:**
- Firebase Cloud Messaging (FCM)
- MongoDB Atlas (cloud database)

---

## 🚀 Testing

### **Test 1: Register User**
1. Go to http://localhost:5173
2. Register → Fill form → Submit
3. Check backend logs

### **Test 2: Notification Permission**
1. Login
2. Browser should ask for notification permission
3. Allow it
4. Check console: "✅ Token saved to backend"

### **Test 3: Send Notification**
1. Click "🔔 Send Test Notification" button
2. Check browser notification
3. Check backend logs for Firebase response

### **Test 4: Multiple Devices**
1. Open same user account in 2 browsers
2. Allow notifications in both
3. Send notification - both devices should receive

---

**Created by:** Yogesh Kumar 🎯
**Last Updated:** January 14, 2026
**Status:** Active Development 🚀
