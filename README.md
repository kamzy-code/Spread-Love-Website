# Spread Love Network 🎉  
Surprise Call Booking Web App – Delivering Joy, One Call at a Time ❤️📞

Spread Love Network is a fullstack web platform designed to help users effortlessly book personalized surprise calls for loved ones on special occasions such as birthdays, anniversaries, and other milestones. It empowers admins and surprise call reps to manage and execute these calls across Nigeria with efficiency, empathy, and a human touch.

## 🌐 Live Site  
🔗 https://spreadlovenetwork.com  
---

## 📦 Tech Stack

| Layer       | Technology                                   |
|-------------|----------------------------------------------|
| Frontend    | Next.js 14, Tailwind CSS, TypeScript, React Query |
| Backend     | Node.js, Express.js, TypeScript              |
| Database    | MongoDB (Mongoose ODM)                       |
| Auth        | JWT-based Authentication (Admin & Rep roles) |
| Hosting     | Frontend (Vercel), Backend (Render), MongoDB Atlas |
| Logging     | Winston + Daily Rotate + BetterStack Logs    |
| Dev Tools   | ESLint, Prettier, GitHub, Insomnia           |

---

## 🎯 Features

### 🛍️ Customer-Facing

- Beautiful mobile-first UI for booking surprise calls
- Form validation and friendly UX
- Unique Booking ID generation (e.g., SLN-83627483)
- Responsive success page and email confirmation (if set)

### 🧑‍💼 Admin Dashboard

- Admin authentication & role-based access (super admin, rep)
- View and filter bookings (status, call type, rep, date range)
- Assign/unassign bookings manually or auto-assign reps on new booking
- Booking details view, update and status management (pending → assigned → executed)
- Dashboard analytics: daily/weekly/monthly stats

### 💬 Rep Dashboard

- Secure login for surprise call reps
- View assigned calls and update status (executed / failed)
- Add internal notes and upload proof of call if needed

### 🧩 Additional Features

- Server-side pagination, filtering, sorting using React Query
- LocalStorage filter persistence
- Rate limiting middleware for backend endpoints
- API logging with Winston (info, warn, error levels)
- Log viewer and compressed download (.zip) from Admin panel
- Optional Google Drive upload for compressed logs

---

## 🚀 Getting Started (Local Development)

### Prerequisites:

- Node.js ≥ 18
- MongoDB URI (Atlas or local)
- Vercel or Render account for deployment (optional)

### Backend Setup

```bash
cd backend
npm install
npm run dev

Create a .env file with the following:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
BASE_URL=http://localhost:5000

Frontend Setup
cd frontend
npm install
npm run dev

Folder Structure

spread-love-network/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── services/
│   │   └── utils/
│   └── ...
│
├── frontend/
│   ├── components/
│   ├── app/
│   ├── lib/
│   ├── features/
│   └── ...
│
└── README.md
