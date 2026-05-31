<div align="center">

# 💰 Monai

### AI-Powered Personal Expense Tracker

Track expenses, manage budgets, and gain intelligent financial insights with AI.

![React](https://img.shields.io/badge/Frontend-React-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-success)
![License](https://img.shields.io/badge/License-MIT-yellow)

</div>

---

## 📖 Introduction

**Monai** is a modern expense tracking platform that helps users manage their personal finances efficiently. Users can record daily expenses, categorize transactions, monitor spending patterns, and receive AI-generated insights to better understand their financial habits.

The application provides an intuitive dashboard, detailed analytics, budget management tools, and an AI assistant that helps users make smarter financial decisions.

---

## ✨ Features

### 💸 Expense Management

* Add, edit, and delete expenses.
* Categorize transactions for better organization.
* Track spending history with detailed records.

### 📊 Financial Analytics

* Monthly and yearly expense summaries.
* Category-wise spending breakdown.
* Interactive charts and visualizations.
* Spending trend analysis.

### 🤖 AI-Powered Insights

* Personalized financial insights.
* Spending pattern detection.
* Budget recommendations.
* Smart answers to finance-related queries.

### 🎯 Budget Tracking

* Set monthly spending goals.
* Monitor budget utilization.
* Identify overspending categories.

### 🔐 Secure Authentication

* User registration and login.
* JWT-based authentication.
* Secure password storage.
* Protected user data.

### 🎨 Modern User Interface

* Responsive design for desktop and mobile browsers.
* Light and dark mode support.
* Clean and intuitive dashboard.

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Authentication

* JWT (JSON Web Tokens)
* HTTP-only Cookies

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd monai
```

### 2. Install Dependencies

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory and add:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Start the Backend Server

```bash
npm run dev
```

### 5. Start the Frontend

```bash
npm run dev
```

### 6. Open the Application

Navigate to:

```text
http://localhost:5173
```

---

## 📂 Project Structure

```text
Monai/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── assets/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/
│
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/new-feature
```

3. Commit your changes.

```bash
git commit -m "Add new feature"
```

4. Push to your branch.

```bash
git push origin feature/new-feature
```

5. Open a Pull Request.

---

## 📄 License

This project is licensed under the [MIT License](https://github.com/mayswind/ezbookkeeping/blob/master/LICENSE).

---

## 🌟 Future Enhancements

* AI Integration.
* Recurring expense management.
* Expense prediction using AI.
* Export reports as PDF and Excel.
* Multi-currency support.
* Progressive Web App (PWA).
* Advanced financial goal tracking.

---

## 👨‍💻 Author

Developed as a full-stack finance management project to simplify expense tracking and provide intelligent financial insights through AI.
