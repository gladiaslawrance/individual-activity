# API Endpoints & REST Architecture Documentation

The **Rate Limiting and API Abuse Detection System** exposes a secure, documented RESTful API implemented in Node.js and Express.js. All protected endpoints require a valid JWT token passed in the `Authorization: Bearer <token>` header.

---

## Base URL
- Development: `http://localhost:5000/api`
- Production: `/api`

---

## 1. Authentication Endpoints

### 1.1 Administrator Login
- **Route**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "admin@security.local",
    "password": "Admin@123456"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "673f4e19...",
      "username": "SecOps_Admin",
      "email": "admin@security.local",
      "role": "superadmin",
      "lastLogin": "2026-11-23T17:23:50.000Z"
    }
  }
  ```

### 1.2 Get Current Admin Profile
- **Route**: `GET /api/auth/me`
- **Access**: Private (Admin Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "admin": {
      "_id": "673f4e19...",
      "username": "SecOps_Admin",
      "email": "admin@security.local",
      "role": "superadmin"
    }
  }
  ```

---

## 2. Client Management Endpoints

### 2.1 List All Clients
- **Route**: `GET /api/clients`
- **Access**: Private
- **Query Parameters**:
  - `search`: Filter by name, client ID, IP, or email
  - `state`: Filter by FSM state (`NORMAL`, `WARNED`, `THROTTLED`, `BLOCKED`)
  - `status`: Filter by account status (`active`, `suspended`, `revoked`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 6,
    "clients": [
      {
        "clientId": "client_alpha_finance",
        "name": "Alpha Financial Core",
        "email": "api-team@alphafinance.com",
        "apiKey": "sec_9f82bc7104d538e12470a93108c42b10",
        "ipAddress": "192.168.1.101",
        "requestLimit": 20,
        "currentState": "NORMAL",
        "activeWindowCount": 4,
        "requestCount": 8,
        "violationCount": 0
      }
    ]
  }
  ```

### 2.2 Register New Client
- **Route**: `POST /api/clients`
- **Access**: Private
- **Request Body**:
  ```json
  {
    "name": "Microservice Checkout Hub",
    "email": "checkout@payments.io",
    "ipAddress": "192.168.1.120",
    "requestLimit": 25
  }
  ```
- **Response (201 Created)**: Returns registered client with auto-generated secure API Key (`sec_...`) and unique Client ID.

### 2.3 Unblock Client
- **Route**: `POST /api/clients/:id/unblock`
- **Access**: Private
- **Action**: Restores client from `BLOCKED` or `THROTTLED` to `NORMAL` (S0), resets violation count to 0, and logs an admin-triggered state transition.

### 2.4 Reset Rate-Limit Counters
- **Route**: `POST /api/clients/:id/reset-counter`
- **Access**: Private
- **Action**: Resets window request counter and cooldown timer.

---

## 3. API Request Simulator Endpoints

### 3.1 Simulate Single API Request
- **Route**: `POST /api/requests/simulate`
- **Access**: Private
- **Request Body**:
  ```json
  {
    "clientId": "client_alpha_finance",
    "endpoint": "/api/v1/orders",
    "method": "GET",
    "payload": null,
    "customRequestId": "req_manual_01"
  }
  ```
- **Response (200 OK / 429 Too Many Requests / 403 Forbidden / 400 Bad Request)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "requestId": "req_manual_01",
    "fsmState": "NORMAL",
    "processingResult": "SUCCESS",
    "reason": "Traffic within safe baseline capacity (< 70% of 20 reqs)",
    "rateLimit": {
      "limit": 20,
      "currentWindowCount": 5,
      "remaining": 15,
      "cooldownRemainingSeconds": 0
    },
    "alertGenerated": false
  }
  ```

### 3.2 Bulk Request Dispatch
- **Route**: `POST /api/requests/bulk`
- **Access**: Private
- **Request Body**:
  ```json
  {
    "clientId": "client_alpha_finance",
    "endpoint": "/api/v1/telemetry",
    "method": "POST",
    "count": 10
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "summary": {
      "totalSent": 10,
      "succeeded": 10,
      "throttled": 0,
      "blocked": 0,
      "finalFsmState": "WARNED",
      "violationCount": 0
    },
    "results": [...]
  }
  ```

---

## 4. Threat Alerts & Abuse Detection Endpoints

### 4.1 Get Abuse Alerts
- **Route**: `GET /api/alerts`
- **Access**: Private
- **Query Parameters**: `severity`, `resolutionStatus`, `search`, `page`, `limit`

### 4.2 Resolve Alert
- **Route**: `PUT /api/alerts/:id/resolve`
- **Access**: Private
- **Request Body**:
  ```json
  {
    "resolutionStatus": "RESOLVED"
  }
  ```

---

## 5. Finite State Machine (FSM) Endpoints

### 5.1 Get States Metadata
- **Route**: `GET /api/fsm/states`
- **Access**: Private

### 5.2 Get Transition Rules Matrix
- **Route**: `GET /api/fsm/transitions`
- **Access**: Private

### 5.3 Get Transition History Log
- **Route**: `GET /api/fsm/history`
- **Access**: Private

---

## 6. System Settings Endpoints

### 6.1 Get System Settings
- **Route**: `GET /api/settings`
- **Access**: Private

### 6.2 Update System Settings
- **Route**: `PUT /api/settings`
- **Access**: Private
- **Request Body**:
  ```json
  {
    "requestLimit": 25,
    "timeWindow": 60,
    "warningThreshold": 75,
    "throttlingThreshold": 100,
    "cooldownDuration": 30,
    "autoBlockThreshold": 3,
    "simulationInterval": 400
  }
  ```
