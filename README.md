<div align="center">

# 🌿 Chinar Agro AI

### Intelligent Agricultural Advisory & Precision Farming Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.3+-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev)

**A full-stack AI-powered precision agriculture system** that combines deep learning, classical ML, and Google Gemini to deliver real-time disease diagnosis, crop recommendations, yield forecasting, pesticide authentication, and AI-driven farm advisory — all through a premium, console-grade web interface.

---

[Overview](#-project-overview) · [Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [API Reference](#-api-reference) · [Supported Crops & Diseases](#-supported-crops--diseases) · [Deployment](#-deployment)

</div>

---

## 📖 Project Overview

**Chinar Agro AI** is an end-to-end intelligent agricultural advisory platform designed to empower farmers, agronomists, and agricultural researchers with AI-driven decision support. The system addresses critical challenges in modern agriculture — crop disease identification, optimal crop selection, yield estimation, and counterfeit pesticide detection — through a unified, multilingual web interface.

### The Problem
Farmers in developing regions face significant losses due to undiagnosed crop diseases, suboptimal crop choices for their soil conditions, unpredictable yields, and widespread counterfeit pesticides. Access to expert agronomic advice is limited and expensive.

### Our Solution
Chinar Agro AI brings laboratory-grade agricultural intelligence directly to the farmer's device:

- **🔬 Upload a leaf photo** → Get instant disease diagnosis with treatment recommendations across **52 disease classes** and **16 crop species**
- **🌾 Enter soil & weather data** → Receive AI-optimized crop recommendations from **22 crop types** with confidence scores
- **📊 Select region & crop** → Get yield forecasts trained on **8.7 million historical records** covering **500+ crop types** worldwide
- **🧪 Scan a pesticide label** → Run an 11-step AI authentication pipeline to detect counterfeit products
- **🤖 Ask any farming question** → Get expert advice from an AI farm assistant in English, Hindi, or Urdu
- **📑 Generate reports** → Compile comprehensive farm intelligence reports with one-click branded PDF export

### Who Is This For?
- **Farmers** — Get instant crop health diagnosis and personalized recommendations without needing an agronomist
- **Agricultural Extension Officers** — Use the platform as a diagnostic aid in the field
- **Researchers & Students** — Explore multi-model ensemble architectures, feature engineering, and AI-driven pipelines
- **Agri-Tech Startups** — A reference architecture for agricultural AI systems; production readiness depends on deployment, security, model validation, and storage configuration

---

## ✨ Features

### 🔬 Disease Detection — 52 Classes, 3-Model Ensemble
- **Tri-Model Ensemble**: EfficientNet-B0 + ResNet-50 + EfficientNet-B1 with weighted probability fusion
- **52 disease classes** across **14 crop species** (Apple, Blueberry, Cassava, Cherry, Corn, Grape, Orange, Peach, Pepper, Potato, Raspberry, Rice, Soybean, Squash, Strawberry, Tomato)
- Grad-CAM heatmap visualization showing exactly where the model looks
- Open-set detection: rejects out-of-distribution images as "Unknown Disease"
- Severity assessment, risk evaluation, treatment recommendations (via Gemini AI)
- Trained on **~115,000 images** from PlantVillage + PlantDoc + Cassava Leaf Disease datasets

### 🌾 Crop Recommendation — 22 Crops
- **Voting Ensemble** of RandomForest + XGBoost + LightGBM
- 7 soil & weather inputs → 21 engineered features (nutrient ratios, log transforms, interaction terms)
- Top-K crop predictions with confidence probabilities
- AI-powered advisory explaining why a crop is recommended for the given conditions
- Trained on **~6,600 samples**

### 📊 Yield Forecasting
- RandomForestRegressor (200 trees) trained on **~8.7 million records**
- Supports global regions, crop-specific yield thresholds, and seasonal analysis
- Yield level classification: LOW / MEDIUM / HIGH with crop-specific calibration
- Historical yield trend analysis across years
- Weather-enhanced yield predictions with real-time climate data integration

### 🧪 Pesticide Authentication — 11-Step AI Pipeline
- **Step 1**: OCR extraction (product name, brand, manufacturer, active ingredient, registration number, batch, expiry, hazard symbols, etc.)
- **Step 2**: Product identification (brand, product, category)
- **Step 3**: Official reference retrieval from Gemini's knowledge base
- **Step 4**: Field-by-field packaging comparison (14 fields, each rated MATCH/PARTIAL MATCH/MISMATCH)
- **Step 5**: Tampering detection (print quality, label integrity, font inconsistencies, spelling errors)
- **Step 6**: Expiry date validation
- **Step 7**: Registration number format verification
- **Step 8**: Packaging similarity score (0-100%)
- **Step 9**: Risk assessment (LOW/MEDIUM/HIGH with confidence score)
- **Step 10**: Decision checklist (every check as PASS/WARNING/FAIL)
- **Step 11**: Final recommendation with crop suitability
- **Never claims "genuine"** — uses evidence-based risk assessment only

### 🤖 Farm Assistant
- Context-aware conversational AI (powered by Google Gemini 2.0 Flash)
- Agricultural domain expertise: pest management, soil health, irrigation, crop planning
- Multi-language support (English, Hindi, Urdu)

### 📑 Farm Intelligence Report
- Unified report compiler combining disease diagnosis + crop recommendation + yield forecast
- Interactive data visualization with soil nutrient progress bars, climate analytics cards
- **One-click branded PDF export** with professional layout (jsPDF vector rendering)
- Expert agronomic advisory based on soil parameter analysis

### 🎨 Premium Frontend
- SaaS-grade console design (dark-forest theme, Linear/Stripe-inspired)
- Design system with reusable components: Cards, Badges, Inputs, Tilt effects, Tooltips
- Lenis smooth scrolling, Framer Motion page transitions
- Responsive sidebar navigation with mobile support
- Multi-language support (English / Hindi / Urdu)

---

## 🏗️ Architecture

```
ChinarAgroAi/
├── ai_api/                    # FastAPI backend (REST API)
│   ├── api.py                 # All endpoints & middleware
│   └── .env                   # GEMINI_API_KEY (not committed)
│
├── frontend/                  # React 19 frontend
│   ├── src/
│   │   ├── design-system/     # Tokens, animations, reusable components
│   │   ├── layout/            # AppLayout, sidebar, footer
│   │   ├── pages/             # Disease, Crop, Yield, Report, PesticideAuth, FarmAssistant, Home
│   │   ├── components/        # LanguageSwitcher
│   │   ├── locales/           # i18n translations (en, hi, ur)
│   │   └── App.js             # Router & layout wrapper
│   ├── tailwind.config.js     # Custom dark-forest theme tokens
│   └── package.json
│
├── smart_system/              # Core ML engine layer
│   ├── config.py              # Centralized configuration & thresholds
│   ├── disease_engine.py      # EfficientNet-B0 disease classifier
│   ├── ensemble_engine.py     # Tri-model ensemble (B0 + R50 + B1)
│   ├── crop_engine.py         # Crop recommendation (voting ensemble)
│   ├── yield_engine.py        # Yield prediction (RandomForest)
│   ├── pesticide_engine.py    # 11-step Gemini-powered auth pipeline
│   ├── plant_doctor/          # Similarity search (FAISS + CLIP)
│   └── yield_predictor/       # Weather-enhanced yield pipeline
│
├── disease_model/             # Disease detection training & models
│   ├── models/                # .pth weights, class_names.json
│   └── scripts/               # Training, evaluation, prediction scripts
│
├── crop_model/                # Crop recommendation training & models
│   ├── models/                # .pkl model + label_encoder
│   └── scripts/               # Training & feature engineering
│
├── yield_model/               # Yield prediction training & models
│   ├── models/                # .pkl model + encoders + metadata
│   └── scripts/               # Training scripts
│
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Container deployment config (add if not present)
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **Google Gemini API Key** ([Get one free](https://ai.google.dev))

### 1. Clone & Install Backend

```bash
git clone https://github.com/Adeelariq/Chinar-Agro-Ai.git
cd Chinar-Agro-Ai

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: .\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Set Environment Variables

Create `ai_api/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here

# Optional — restrict CORS (comma-separated origins). Defaults to localhost:3000 / 127.0.0.1:3000.
# ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.example.com

# Optional — protect POST /ensemble-weights. Set a strong random string.
# ADMIN_TOKEN=change-me-to-a-long-random-secret
```

### 3. Start Backend API

```bash
cd ai_api
python -m uvicorn api:app --reload --port 8000
```

The API will be live at `http://localhost:8000`. Verify with `http://localhost:8000/health`.

### 4. Start Frontend

```bash
cd frontend
npm install
npm start
```

The app will open at `http://localhost:3000`.

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | System health check & model status |
| `POST` | `/predict-disease` | Basic disease prediction (single model) |
| `POST` | `/detect-disease` | **Full ensemble** disease diagnosis + Grad-CAM + AI advisory |
| `GET/POST` | `/ensemble-weights` | View/update ensemble model weights |
| `POST` | `/predict-crop` | Crop recommendation from soil & weather data |
| `POST` | `/ask-ai-crop` | AI-powered crop advisory (Gemini) |
| `POST` | `/predict-yield` | Basic yield prediction |
| `POST` | `/predict-yield-v2` | Enhanced yield prediction with weather |
| `POST` | `/predict-yield-v2/full` | Full yield prediction with metadata |
| `POST` | `/yield-trends` | Historical yield trend analysis |
| `POST` | `/farm-assistant` | Conversational farm AI assistant |
| `POST` | `/plant-doctor` | FAISS + CLIP similarity-based diagnosis |
| `POST` | `/verify-pesticide` | 11-step pesticide authentication pipeline |
| `POST` | `/chinar-agro-report` | Unified farm intelligence report |

---

## 🌱 Supported Crops & Diseases

### Disease Detection — 52 Classes across 16 Crops

| Crop | Diseases Detected | Total |
|------|------------------|-------|
| 🍎 Apple | Scab, Black Rot, Cedar Apple Rust, Healthy | 4 |
| 🫐 Blueberry | Healthy | 1 |
| 🌿 Cassava | Bacterial Blight, Brown Streak, Green Mottle, Mosaic, Healthy | 5 |
| 🍒 Cherry | Powdery Mildew, Healthy | 2 |
| 🌽 Corn (Maize) | Cercospora/Gray Leaf Spot, Common Rust, Northern Leaf Blight, Healthy | 4+1 |
| 🍇 Grape | Black Rot, Esca (Black Measles), Leaf Blight, Healthy | 4 |
| 🍊 Orange | Huanglongbing (Citrus Greening) | 1 |
| 🍑 Peach | Bacterial Spot, Healthy | 2 |
| 🫑 Pepper (Bell) | Bacterial Spot, Healthy | 2 |
| 🥔 Potato | Early Blight, Late Blight, Healthy | 3 |
| 🫐 Raspberry | Healthy | 1 |
| 🌾 Rice | Bacterial Leaf Blight, Brown Spot, Leaf Blast, Leaf Scald, Narrow Brown Leaf Spot, Rice Hispa, Sheath Blight, Healthy | 8 |
| 🍓 Strawberry | Leaf Scorch, Healthy | 2 |
| 🍅 Tomato | Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Spider Mites, Target Spot, Yellow Leaf Curl Virus, Mosaic Virus, Healthy | 10 |
| 🫘 Soybean | Healthy | 1 |
| 🎃 Squash | Powdery Mildew | 1 |

### Crop Recommendation — 22 Crops

The system can recommend the optimal crop based on 7 soil and weather parameters (Nitrogen, Phosphorus, Potassium, Temperature, Humidity, pH, Rainfall):

| # | Crop | # | Crop | # | Crop |
|---|------|---|------|---|------|
| 1 | Apple | 9 | Jute | 17 | Orange |
| 2 | Banana | 10 | Kidney Beans | 18 | Papaya |
| 3 | Blackgram | 11 | Lentil | 19 | Pigeon Peas |
| 4 | Chickpea | 12 | Maize | 20 | Pomegranate |
| 5 | Coconut | 13 | Mango | 21 | Rice |
| 6 | Coffee | 14 | Moth Beans | 22 | Watermelon |
| 7 | Cotton | 15 | Mung Bean | | |
| 8 | Grapes | 16 | Muskmelon | | |

### Yield Forecasting

- Supports **100+ regions/countries** worldwide
- Covers **500+ crop types** from the FAO Global Yield dataset
- Trained on **~8.7 million** historical yield records
- Season-aware predictions (Kharif, Rabi, Whole Year, Autumn, Summer, Winter)

---

## 🧠 Model Details

| Model | Architecture | Training Data | Accuracy |
|-------|-------------|---------------|----------|
| Disease Detector (Primary) | EfficientNet-B0 (fine-tuned, ImageNet V2) | ~115,000 images | ~96% (validation) |
| Disease Ensemble | B0 (40%) + ResNet-50 (30%) + B1 (30%) | Same dataset | ~97% (ensemble) |
| Crop Recommender | VotingClassifier (RF + XGBoost + LGBM) | ~6,600 samples | ~99% (cross-val) |
| Yield Predictor | RandomForestRegressor (200 trees) | ~8.7M records | R² ~0.94 |
| Pesticide Authenticator | Google Gemini 2.0 Flash (structured output) | Real-time inference | N/A (generative) |

---

## 🌐 Deployment

### Backend API — Google Cloud Run

The FastAPI backend can be deployed as a container on Google Cloud Run. Before deploying:

1. Confirm that every required model-weight file is available in the build context or fetched securely during startup.
2. Confirm that the Python dependencies install successfully on the selected CPU architecture.
3. Configure `GEMINI_API_KEY` as a Cloud Run environment variable or Secret Manager secret. Do not commit real keys to Git.
4. Configure CORS to allow only the production frontend origin.
5. Set the service's container port to the port supplied by Cloud Run (`PORT`, commonly `8080`).
6. Test `/health` and each AI endpoint after deployment. Check memory usage during model loading and inference; choose a service memory allocation that fits the models.

Cloud Run requires a Google Cloud billing account. Usage may incur charges if the free-tier allowances are exceeded, so configure budgets and alerts before public launch. See the [Cloud Run documentation](https://cloud.google.com/run/docs).

### Frontend — Vercel or Netlify

The frontend is a Create React App project. Set the frontend root directory to `frontend`, use `npm install` and `npm run build`, and publish the `build/` directory.

Configure this build-time environment variable in the frontend hosting dashboard:

```env
REACT_APP_API_URL=https://YOUR-BACKEND-URL
```

Replace the example value with the actual deployed backend URL, then trigger a fresh frontend deployment. Do not put server-side secrets in frontend environment variables.

### Environment Variables

| Variable | Where | Required | Description |
|----------|-------|----------|-------------|
| `GEMINI_API_KEY` | `ai_api/.env` (server-side) | For Gemini-powered features | Server-side Gemini API key; **keep it secret** |
| `ALLOWED_ORIGINS` | `ai_api/.env` (server-side) | Recommended for production | Comma-separated list of allowed CORS origins. Default: `http://localhost:3000,http://127.0.0.1:3000`. Set to your production frontend URL(s) before deploying. |
| `ADMIN_TOKEN` | `ai_api/.env` (server-side) | Recommended | Shared secret required in the `X-Admin-Token` header to call `POST /ensemble-weights`. If unset, the endpoint returns 403 to everyone. |
| `REACT_APP_API_URL` | `frontend/.env.local` (build-time) | Recommended for production | Base URL of the deployed FastAPI backend. Copy `frontend/.env.example` and fill in the deployed URL. |

> **Tip:** Never commit real secrets. Use your hosting provider's secret manager or environment variable dashboard.

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Tailwind CSS, Framer Motion, Recharts, Lucide Icons, i18next |
| **Backend** | FastAPI, Uvicorn, Gunicorn |
| **ML/DL** | PyTorch, Torchvision, scikit-learn, XGBoost, LightGBM |
| **AI** | Google Gemini 2.0 Flash (generative AI, structured output) |
| **Vision** | OpenCV, Pillow, Grad-CAM, CLIP, FAISS |
| **PDF** | jsPDF (client-side vector PDF generation) |
| **Languages** | English 🇬🇧, Hindi 🇮🇳, Urdu 🇵🇰 |

---

<div align="center">

**🌿 Chinar Agro AI — Empowering Farmers with Artificial Intelligence 🌿**

</div>
