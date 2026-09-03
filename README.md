# 🎓 Coaching Institute Platform

A modern full-stack coaching institute platform built for managing students, courses, quizzes, enquiries, and admin operations in one place.

This project is a strong in showcasing full-stack development, authentication, REST APIs, database integration, and production deployment.

---

## ✨ Highlights

- Responsive React + Vite frontend
- Node.js + Express backend
- MongoDB database integration
- Student login and signup flow
- Admin dashboard and management panels
- Course and quiz/test modules
- Enquiry management system
- Production-ready frontend/backend deployment setup

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Deployment | Vercel, Render |
| Tools | Git, GitHub, npm |

---

## 📁 Project Structure

```bash
coaching-institute/
├── backend/
│   ├── src/
│   ├── package.json
│   ├── server.js
│   └── .env
└── frontend/
    ├── src/
    ├── public/
    ├── package.json
    ├── vite.config.js
    └── .env
```

---

## 🚀 Features

### Student Side
- User registration and login
- Browse coaching programs/courses
- Access quiz and test modules
- Submit enquiries

### Admin Side
- Manage users
- Manage courses
- Manage quizzes and questions
- Manage enquiries
- Dashboard overview
- Manage schools, teams, coupons, and question papers

---

## ⚙️ Prerequisites

Make sure these are installed on your system:

- Node.js 18+
- npm
- Git
- MongoDB Atlas account or local MongoDB

Check versions:

```bash
node -v
npm -v
git --version
```

---

## 📥 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/coaching-institute.git
cd coaching-institute
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file inside both `backend` and `frontend` folders.

### Backend `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

For production:

```env
VITE_API_BASE_URL=https://your-backend-name.onrender.com/api
```

---

## ▶️ Run Locally

You need **two terminals** to run the project.

### Start backend

```bash
cd backend
npm run dev
```

If there is no dev script:

```bash
node server.js
```

### Start frontend

```bash
cd frontend
npm run dev
```

Typical local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

---

## 🌐 API Routes

### Frontend Pages
- `/`
- `/about`
- `/courses`
- `/login`
- `/signup`
- `/enquire`
- `/quiz`
- `/take-test`
- `/admin/...`

### Backend Endpoints
- `/api/auth`
- `/api/courses`
- `/api/quizzes`
- `/api/questions`
- `/api/users`
- `/api/dashboard`
- `/api/question-papers`
- `/api/enquiries`

---

## 🚢 Deployment

### Frontend Deployment on Vercel

1. Push the project to GitHub
2. Import repository into Vercel
3. Set **Root Directory** to `frontend`
4. Add environment variable:

```env
VITE_API_BASE_URL=https://your-backend-name.onrender.com/api
```

5. Add a `vercel.json` file inside `frontend`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This prevents React Router pages from showing 404 on refresh.

### Backend Deployment on Render

1. Create a new Web Service in Render
2. Connect the same GitHub repository
3. Set **Root Directory** to `backend`
4. Build command:

```bash
npm install
```

5. Start command:

```bash
node server.js
```

6. Add environment variables in Render dashboard

---

## 🧩 Common Issues

### Login works locally but not in production
- Cause: hardcoded localhost API URLs
- Fix: use `VITE_API_BASE_URL` everywhere

### 404 on page refresh in Vercel
- Cause: missing SPA rewrite rule
- Fix: add `vercel.json`

### CORS error
- Cause: backend does not allow frontend domain
- Fix: update backend CORS configuration

### `ERR_CONNECTION_REFUSED`
- Cause: frontend still calling localhost in production
- Fix: replace all hardcoded URLs with environment-based config

---


---

Example:

```md
## Demo
- Live Site: https://coaching-institute-steel.vercel.app/
- API Health: https://your-backend.onrender.com/api/health
- Admin Login: Creds On Personnel Request To Me
```

---

## 📜 Scripts

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

### Backend

```bash
npm run dev
node server.js
```

---

## 🔒 Security Notes

- Never push `.env` files to GitHub
- Use different secrets for development and production
- Keep production keys in Render and Vercel environment settings
- Restrict CORS to trusted domains only

---

## 🚀 Future Improvements

- Forgot password flow
- Role-based access control
- Payment integration
- Test analytics dashboard
- File/image upload system
- Unit and integration tests
- Docker support

---

## 👨‍💻 Author

```md
Created by
GitHub: https://github.com/ShahilDiont
LinkedIn: www.linkedin.com/in/shahil-ahamed-6aaa75287
Portfolio: https://your-portfolio.com
```

---

## 📄 License

```md
MIT License
```


This project demonstrates practical full-stack development skills including frontend architecture, backend API development, authentication, environment configuration, deployment, and real-world admin workflows.
