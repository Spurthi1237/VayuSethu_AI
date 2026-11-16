# Vayu Sethu – AI 🍃
> **AI-Powered Urban Air Quality Monitoring & Environmental Intelligence Platform (Bengaluru, India)**

**Vayu Sethu** is a next-generation environmental intelligence platform engineered for real-time air quality tracking, predictive atmospheric modeling, and personalized respiratory health guidance for Bengaluru, India. 

Bridging the gap between physical IoT monitoring and actionable citizen intelligence, Vayu Sethu combines official ground-station telemetry with the cognitive power of **Google Gemini AI**.

---

## 🌟 Key Platform Modules

1. **Executive Overview**:
   - City-wide aggregated National Air Quality Index (NAQI) with CPCB classification.
   - Hotspot vs. Haven comparisons (e.g. Silk Board Junction vs. Lalbagh Botanical Gardens).
   - Core telemetry indicators ($\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$, $\text{O}_3$, temperature, humidity) benchmarked against WHO 24h limits.
   - International multi-scale comparison (US EPA AQI & European EAQI).

2. **Spatial Grid & Hotspots**:
   - High-performance Leaflet geospatial map displaying real-time CPCB / KSPCB physical ground stations across Bengaluru corridors (Silk Board, Peenya, Hebbal, BTM, Jayanagar).
   - Real-time station search, filtering, and instant sensor breakdown.

3. **Smart Clean-Air Route Optimizer**:
   - Micro-corridor navigation planner for **walking / jogging** and **cycling commutes**.
   - Compares standard high-exposure arterial routes against tree-canopied eco-routes.
   - Calculates exact $\mu\text{g}$ particulate inhalation dose savings (typically **48% to 54% less pollution inhalation**).
   - Interactive dual-polyline route map with Gemini AI Commute Briefing.

4. **Crowdsourced Visual Sky & Haze Map**:
   - Citizen science portal allowing users to upload or capture photos of the Bengaluru skyline.
   - **Gemini Multimodal Computer Vision** analyzes optical contrast loss, Rayleigh vs. Mie aerosol scattering, and horizon obscurity to estimate visual AQI and $\text{PM}_{2.5}$ loading.
   - Fused interactive community observation heatmap across Bengaluru.

5. **Public Health & Respiratory Advisory**:
   - Dynamic clinical exposure precautions tailored to current particulate indices.
   - Targeted advice profiles for:
     - General Public
     - Sensitive Respiratory Patients (Asthma, COPD)
     - Children & Seniors
     - Outdoor Athletes & Commuters
   - Mask protocols (N95 / FFP2) and optimal ventilation time windows.
   - Real-time **Gemini AI clinical health advisory** generator.

6. **Source Apportionment & Pollution Drivers**:
   - Interactive source attribution donut chart isolating vehicular emissions, construction dust, industrial activity, biomass burning, and winter temperature inversion.
   - Grounded in official IISc, TERI, and CPCB urban source apportionment benchmarks.

7. **Vayu-AI Copilot**:
   - Real-time conversational AI copilot embedded in the dashboard, answering natural-language commute, health, and atmospheric questions grounded in live Bengaluru telemetry.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Mapping**: Leaflet, OpenStreetMap (OSM)
- **Data Visualization**: Recharts (diurnal trends, source apportionment)
- **AI Intelligence**: Google Gemini API (`@google/genai` / REST) — Vision & Language
- **Sensor Ingestion**: Central Pollution Control Board (CPCB / KSPCB) CAAQMS via WAQI API
- **Offline ML Workspace**: Python 3, Pandas, Requests (CAMS atmospheric training sets)

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Spurthi1237/VayuSethu_AI.git
cd VayuSethu_AI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your free API keys in `.env.local`:
```env
# Free key from Google AI Studio: https://aistudio.google.com/
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Free token from WAQI: https://aqicn.org/data-platform/token/
VITE_WAQI_TOKEN=your_waqi_token_here
```

### 4. Run Development Server
```bash
npm run dev -- --open
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

### 5. Build for Production
```bash
npm run build
```

---

## 📜 License
MIT License. Open-source for environmental intelligence and public health.
