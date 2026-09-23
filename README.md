# 🌱 AgroSetu

**AgroSetu** is an AI-powered agricultural supply chain optimization platform designed to bridge the gap between farmers, industries, and logistics providers. By leveraging real-time data, predictive AI, and GIS routing, AgroSetu minimizes post-harvest losses, transforms agricultural residue into value, and optimizes cold-chain logistics.

🚀 **Live Demo:** [https://agrosetu-delta.vercel.app/](https://agrosetu-delta.vercel.app/)

![AgroSetu Dashboard](https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop) *(Placeholder image)*

---

## ✨ Key Features

* **🤖 AI-Driven Smart Matching:** Automatically connects farmers with agricultural residue (e.g., Rice Straw, Sugarcane Bagasse) to industries demanding biomass, optimizing for distance, moisture, and quality.
* **🚚 Live Logistics & OSRM Routing:** Interactive maps tracking real-time vehicle movement, clustering collection points, and plotting optimized delivery routes.
* **🌡️ Freshness Prediction:** Uses Google Gemini AI to analyze environmental data (temperature, humidity) and predict the remaining shelf-life of perishable produce.
* **🔔 Real-Time Procurement Alerts:** Instant notification system alerting farmers the moment an industry procures their listed residue.
* **❄️ Cooling Hubs Integration:** Geolocation-based discovery of nearby cold storage facilities to protect at-risk harvests.
* **🔐 Secure Role-Based Dashboards:** Dedicated, customized interfaces for Farmers and Industries backed by Supabase Row Level Security.

---

## 🛠️ Technology Stack

### Frontend (User Interface)
* **Framework:** Next.js 14 (App Router)
* **Library:** React 19
* **Styling:** Tailwind CSS & `shadcn/ui`
* **Maps:** Leaflet & `react-leaflet`
* **Deployment:** Vercel

### Backend (API & AI)
* **Framework:** Python / FastAPI
* **AI Integration:** Google Gemini API (`google-genai`)
* **Routing:** OSRM (Open Source Routing Machine)
* **Deployment:** Render

### Database & Authentication
* **Platform:** Supabase
* **Database:** PostgreSQL
* **Auth:** Supabase Auth (JWT)

---

## 🚀 Getting Started (Local Development)

### Prerequisites
* Node.js (v18+)
* Python 3.11+
* Supabase Account
* Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/hariprasad143nh-maker/agrosetu.git
cd agrosetu
```

### 2. Setup the Frontend
```bash
# Install dependencies
npm install

# Create a .env.local file with your Supabase keys
echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key" >> .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" >> .env.local

# Run the development server
npm run dev
```
*The frontend will run at `http://localhost:3000`*

### 3. Setup the Backend
```bash
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Create a .env file with your secrets
echo "SUPABASE_URL=your_supabase_url" > .env
echo "SUPABASE_KEY=your_service_role_key" >> .env
echo "GEMINI_API_KEY=your_gemini_key" >> .env

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```
*The backend API will run at `http://localhost:8000`*

---

## 🌍 Production Architecture
AgroSetu is built for modern cloud scale. The Next.js frontend is deployed edge-first on **Vercel**, while the heavy computational AI and routing tasks are handled by a dedicated Python FastAPI service running on **Render**. Data is securely synchronized via **Supabase**.

---

<p align="center">
  Built with ❤️ for the future of sustainable agriculture.
</p>
