# Student Management Portal - CSE Batch 2024

A full-stack application for managing student records, attendance, and fee details, featuring a modern analytical dashboard and a mobile-friendly student portal.

## Access Credentials

### Admin Access
- **Username:** `admin2024`
- **Password:** `admin2024`
- **Capabilities:** View all student records, see analytical charts, search directory.

### Student Access
- **Username:** Use Roll Number (e.g., `701/24`, `702/24`)
- **Password:** `student123` (Default for all students)
- **Capabilities:** View personal profile, fee status, and attendance summary.

## Setup & Running

1. **Install Dependencies:**
   - Backend:
     ```powershell
     cd server
     npm install
     ```
   - Frontend:
     ```powershell
     cd client
     npm install
     ```

2. **Start the Servers:**
   - Backend:
     ```powershell
     cd server
     node index.js
     ```
   - Frontend:
     ```powershell
     cd client
     npm run dev
     ```

### Accessing the Application
Once both the backend and frontend are running, open your browser and navigate to `http://localhost:5173` to access the Student Management Portal.

## Tech Stack
- **Frontend:** React, Tailwind CSS 4, Recharts, Lucide Icons
- **Backend:** Node.js, Express
- **Database:** SQLite
- **Data Import:** XLSX Parser (Initial data seeded from `complete batch 2024 3rd sem.xls`)
