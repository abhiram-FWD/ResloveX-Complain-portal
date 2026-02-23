# ResolveX — Public Complaint Portal

> An accountability-driven complaint management platform built on the MERN stack with real-time updates via Socket.io.

---

## What Makes ResolveX Different

| Feature                 | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| **Responsibility Lock** | No silent forwarding — every transfer is tracked          |
| **Soft-Close**          | Citizens must verify resolution before a complaint closes |
| **Per-Stage Delay**     | Transparent time-tracking at each officer's desk          |
| **Officer Scorecard**   | Public performance metrics visible to all                 |
| **Live Updates**        | Real-time status changes powered by Socket.io             |

---

## Tech Stack

| Layer    | Technology                                                |
| -------- | --------------------------------------------------------- |
| Frontend | React + Vite + Tailwind CSS + Socket.io-client + Recharts |
| Backend  | Node.js + Express + Socket.io                             |
| Database | MongoDB Atlas                                             |
| Storage  | Cloudinary                                                |
| Deploy   | Vercel (frontend) + Render (backend)                      |

---

## Project Structure

```
Complain-portal/
├── Backend/
│   ├── config/
│   │   ├── cloudinary.js        # Cloudinary storage config
│   │   ├── db.js                # MongoDB connection
│   │   └── seedCategories.js    # Category seed script
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── authorityController.js
│   │   └── complaintController.js
│   ├── middleware/              # Auth & other middleware
│   ├── models/
│   │   ├── Category.js
│   │   ├── Complaint.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── authorityRoutes.js
│   │   └── complaintRoutes.js
│   ├── scripts/
│   │   └── createAdmin.js       # Admin account creation script
│   ├── socket/
│   │   ├── io.js                # Socket.io instance
│   │   └── socketHandler.js     # Real-time event handlers
│   ├── utils/
│   │   ├── generateId.js
│   │   └── sendNotification.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── authority/
    │   │   ├── common/
    │   │   ├── complaint/
    │   │   └── dashboard/
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   └── useSocket.js
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── AdminLogin.jsx
    │   │   ├── AuthorityDashboard.jsx
    │   │   ├── CitizenDashboard.jsx
    │   │   ├── ComplaintDetail.jsx
    │   │   ├── FileComplaint.jsx
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── PublicDashboard.jsx
    │   │   ├── Register.jsx
    │   │   └── TrackComplaint.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   ├── authService.js
    │   │   ├── complaintService.js
    │   │   └── dashboardService.js
    │   └── utils/
    │       ├── formatDate.js
    │       └── statusHelpers.js
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## Local Setup

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### Backend

```bash
cd Backend
npm install
cp .env.example .env
# Fill in your environment variables in .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL in .env
npm run dev
```

### Seed Data & Admin

```bash
# Seed complaint categories
node Backend/config/seedCategories.js

# Create an admin account
node Backend/scripts/createAdmin.js
```

---

## Environment Variables

**Backend (`Backend/.env`)**

```
MONGO_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=5000
```

**Frontend (`frontend/.env`)**

```
VITE_API_URL=http://localhost:5000
```

---

## Deployment

### Frontend → Vercel

1. Connect your repository to Vercel
2. Set the `VITE_API_URL` environment variable to your Render backend URL
3. Deploy from the `frontend/` directory

### Backend → Render

1. Create a new Web Service on Render
2. Set all environment variables from `Backend/.env.example`
3. Set the start command to `node server.js`

### Database → MongoDB Atlas

1. Create a free cluster on MongoDB Atlas
2. Whitelist `0.0.0.0/0` under Network Access to support Render's dynamic IPs
3. Copy the connection string into `MONGO_URI`

---

## User Roles

| Role          | Access                                                         |
| ------------- | -------------------------------------------------------------- |
| **Citizen**   | File complaints, track status, verify resolution               |
| **Authority** | View assigned complaints, update status, add remarks           |
| **Admin**     | Manage users, authorities, categories, and view all complaints |

---

## License

MIT
