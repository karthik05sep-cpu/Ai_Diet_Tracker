<div align="center">

# 🥗 AI Diet Recommendation System

**Personalized nutrition and food recommendations powered by health science and machine learning.**

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active--development-orange)](#-project-status)

[Overview](#-project-overview) •
[Features](#-features) •
[Architecture](#-project-architecture) •
[API Docs](#-api-endpoints) •
[Installation](#-installation) •
[Roadmap](#-future-improvements)

</div>

---

## 🚀 Project Overview

The **AI Diet Recommendation System** takes a user's body metrics and activity level, calculates their daily energy and macronutrient needs, and recommends real foods from a 550+ item nutrition dataset that fit those needs.

It combines three things that are usually built separately in student projects — **health science formulas**, a **machine-learning-evaluated dataset**, and a **working REST API** — into one pipeline you can actually run and query.

```
Body Metrics  →  BMI / BMR / TDEE  →  Macronutrient Targets  →  Ranked Food Recommendations
```

---

## ✨ Features

| Area | What it does | Status |
|---|---|---|
| **Health Analysis** | BMI (+ category), BMR (Mifflin-St Jeor), TDEE (5 activity levels), macronutrient targets | ✅ Done |
| **Recommendation Engine** | Filters and ranks 551 foods against a user's calorie/macro targets | ✅ Done |
| **Machine Learning** | 5 regression models trained to predict food Nutrition Density | ✅ Trained · 🚧 Not yet live in `/api/recommend` |
| **REST API** | FastAPI backend, CORS-enabled, interactive Swagger docs | ✅ Done |
| **Meal Planning** | Multi-meal daily plan generation | 🚧 Module built, not yet exposed via API |
| **Frontend** | Clinical/botanical-themed web UI | 🚧 In progress, not yet in this repo |

---

## 🏗 Project Architecture

<p align="center">
  <img src="docs/images/BlocKDiagram.png" alt="System architecture block diagram" width="700">
</p>

```text
User Input (age, weight, height, activity level)
        │
        ▼
   BMI  →  BMR  →  TDEE  →  Daily Macronutrient Targets
        │
        ▼
        Recommendation Engine
        │
        ├── Food Filtering        (calorie/macro tolerance)
        ├── Nutrition Matching    (macro similarity scoring)
        └── Food Ranking          (nutrition density)
        │
        ▼
   Ranked, Personalized Food Recommendations
```

<details>
<summary>📈 Additional data pipeline diagram</summary>
<p align="center">
  <img src="docs/images/Phase_diagram.png" alt="Data processing phase diagram" width="700">
</p>
</details>

---

## 📂 Folder Structure

```text
Calorie-Tracker/
│
├── backend/
│   ├── app.py                     # FastAPI app — wraps src/ modules as REST endpoints
│   └── requirements.txt
│
├── src/
│   ├── health/                    # bmi.py · bmr.py · tdee.py · nutrition.py
│   └── recommendation/            # recommendation.py · food_filter.py · nutrition_match.py
│                                   # ranking.py · meal_planner.py · recommendation_utils.py
│
├── trained_models/                # 5 trained regression models (.pkl)
├── datasets/
│   ├── raw/
│   └── processed/                 # cleaned food, body-fat, and lifestyle datasets
│
├── notebooks/                     # EDA + preprocessing notebooks
├── assets/images/eda/bodyfat/     # EDA visualizations
├── docs/images/                   # Architecture diagrams
│
├── roadmap.md
├── LICENSE
└── README.md
```

> A `frontend/` directory is planned but not yet committed to this repository.

---

## 🤖 Machine Learning Models

Five regression models were trained on the food dataset to predict **Nutrition Density** from nutritional features:

| Model | Purpose | Status |
|---|---|---|
| Linear Regression | Baseline model | ✅ Trained |
| Decision Tree Regressor | Non-linear prediction | ✅ Trained |
| Random Forest Regressor | Ensemble learning | ✅ Trained |
| Gradient Boosting Regressor | Boosted regression | ✅ Trained |
| Extra Trees Regressor | Randomized ensemble | ✅ Trained |

All five are saved in `trained_models/`. **Current limitation:** `/api/recommend` uses rule-based filtering and ranking, not these models directly. Wiring the best-performing model into that live path is the top item in the [roadmap](#-future-improvements).

### Exploratory Data Analysis

<p align="center">
  <img src="assets/images/eda/bodyfat/bodyfat_distribution.png" alt="Body fat distribution" width="270">
  <img src="assets/images/eda/bodyfat/age_distribution.png" alt="Age distribution" width="270">
  <img src="assets/images/eda/bodyfat/correlation_matrix.png" alt="Feature correlation matrix" width="270">
</p>

---

## 📊 Datasets Used

| Dataset | Size | Contents |
|---|---|---|
| 🍎 Food Nutrition | 551 items | Calories, protein, fat, carbs, fiber, sugar, vitamins, minerals, Nutrition Density |
| 💪 Body Fat | 252 records | Age, height, weight, body fat %, body measurements |
| ❤️ Healthy Lifestyle | 4,197 records | Age, gender, height, weight, BMI, smoking, exercise, diet quality, alcohol use |

---

## ⚙ Technologies Used

| Category | Tools |
|---|---|
| Language | Python 3.10+ |
| Backend | FastAPI, Uvicorn, Pydantic |
| Machine Learning | scikit-learn, Pandas, Joblib |
| Frontend *(planned)* | HTML5, CSS3, JavaScript |
| Tooling | Git, GitHub, Jupyter |

---

## 🚀 Installation

```bash
# 1. Clone the repository
git clone https://github.com/hemnath-kandasamyk/Calorie-Tracker.git
cd Calorie-Tracker

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r backend/requirements.txt
```

---

## ▶ Running the API

```bash
uvicorn backend.app:app --reload
```

| Resource | URL |
|---|---|
| API base | `http://127.0.0.1:8000` |
| Interactive docs (Swagger) | `http://127.0.0.1:8000/docs` |
| Health check | `http://127.0.0.1:8000/health` |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check / dataset load status |
| `POST` | `/api/bmi` | BMI + category from weight & height |
| `POST` | `/api/bmr` | BMR from age, gender, weight, height |
| `GET` | `/api/activity-levels` | Valid activity levels for TDEE |
| `POST` | `/api/tdee` | TDEE from BMR + activity level |
| `POST` | `/api/nutrition` | Daily macronutrient targets from TDEE |
| `POST` | `/api/recommend` | Ranked food recommendations for given macro targets |
| `POST` | `/api/profile` | Full pipeline in one call: BMI → BMR → TDEE → Nutrition → Recommendations |

<details>
<summary>Example: <code>POST /api/profile</code></summary>

```bash
curl -X POST http://127.0.0.1:8000/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "age": 22,
    "gender": "male",
    "weight_kg": 70,
    "height_cm": 175,
    "activity_level": "moderately active",
    "top_n": 5
  }'
```

```json
{
  "bmi": { "value": 22.86, "category": "Normal" },
  "bmr": 1680.0,
  "tdee": 2604.0,
  "nutrition": { "Calories": 2604.0, "Protein (g)": 130.2, "Fat (g)": 86.8, "Carbohydrates (g)": 325.5 },
  "recommendations": { "count": 5, "results": [ "..." ] }
}
```
</details>

---

## 🎯 Future Improvements

**Near-term**
- [ ] Load a trained regression model into `/api/recommend` so ML predictions actually drive recommendations
- [ ] Build and connect the `frontend/` to this API
- [ ] Add automated tests (pytest) for health and recommendation modules
- [ ] Deploy backend (Render/Railway) + frontend (GitHub Pages) with a live demo link

**Longer-term**
- [ ] User authentication & saved profiles
- [ ] Progress tracking dashboard
- [ ] Weekly meal planner (`meal_planner.py` → API)
- [ ] Mobile application
- [ ] Wearable device integration

---

## 📌 Project Status

| Phase | Status |
|---|---|
| Data Collection & Preprocessing | ✅ Completed |
| ML Models (trained, offline) | ✅ Completed |
| Health Modules (BMI/BMR/TDEE/Nutrition) | ✅ Completed |
| Recommendation Engine (rule-based) | ✅ Completed |
| Backend API | ✅ Completed |
| ML Integrated Into Recommendations | 🚧 In Progress |
| Frontend | 🚧 In Progress |
| Deployment | ⏳ Planned |

---

## 🤝 Contributing

Contributions, issues, and suggestions are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---


<div align="center">

If you found this project useful, consider giving it a ⭐ on GitHub.

</div>
