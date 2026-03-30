# নীলান্তি (Nilanti) — Premium Organic E-Commerce 🌿👗

> **আভিজাত্য আর গুণগত মানের বিশ্বস্ততার বুনন।**  
> *(The weave of prestige and quality trust.)*

Nilanti is a modern, premium e-commerce platform dedicated to high-end organic clothing. This project combines a stunning minimalist user experience with a powerful administrative backend, built for efficiency and scale.

---

## ✨ Key Features

### 🛍️ For Customers
- **📱 Responsive Design**: Fully optimized for mobile, tablet, and desktop browsing.
- **✨ Premium UI**: Modern aesthetic with smooth animations and glassmorphism.
- **🛍️ Seamless Shopping**: Advanced filtering by category, real-time cart management, and one-page checkout.
- **🚚 Live Tracking**: Integrated order tracking for customers to check delivery status.
- **💬 Live Support**: Integrated chat widget for real-time customer assistance.
- **👤 User Accounts**: Save orders and manage profiles via Firebase Authentication.

### 👮 For Admins
- **📊 Comprehensive Dashboard**: Sales analytics, revenue tracking, and order overview.
- **📦 Inventory Management**: Full CRUD for products, categories, and inventory stock.
- **🎫 Marketing Tools**: Dynamic banner management and coupon code system.
- **🚚 Courier Automation**: Integrated with **Steadfast** and **BD Courier** for automated shipping.
- **💬 Admin Chat Panel**: Manage customer inquiries directly from the dashboard.
- **💸 Transaction Registry**: Track all payment successes and incomplete order recovery.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18 (Vite), TypeScript |
| **Styling** | Tailwind CSS 4, Shadcn/UI, Lucide Icons |
| **State/Data** | TanStack Query (React Query), Context API |
| **Backend/Auth** | Firebase Auth, Firebase Storage |
| **Routing** | React Router Dom 6 |
| **Animations** | Framer Motion, Tailwind Animate |
| **Integrations** | Steadfast API, BD Courier API, ImgBB |

---

## 🚀 Installation & Local Setup

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Steps
1. **Clone the project**
   ```bash
   git clone https://github.com/yeatasim-cse9/nilanti.git
   cd nilanti
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root and add your keys (see `.env.example` if available, or use the project dashboard keys):
   ```env
   VITE_FIREBASE_API_KEY="..."
   VITE_STEADFAST_API_KEY="..."
   VITE_BD_COURIER_API_KEY="..."
   # (Check .env for full list)
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

---

## 🌐 Deployment on Vercel

This project is optimized for Vercel. 

1. Push your code to GitHub.
2. Link your repository in [Vercel Dashboard](https://vercel.com).
3. **Important**: Add all environment variables from `.env` to the Vercel Settings.
4. The `vercel.json` already handles the SPA routing and API proxying.

---

## 📄 License & Ownership

© 2024 **নীলান্তি (Nilanti)**. All Rights Reserved. Built with ❤️ for the organic fashion community.
