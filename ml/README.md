# Vayu Sethu – Machine Learning Workspace

This directory contains the machine learning workspace for **Vayu Sethu**, initially focused on air-quality modeling for Bengaluru, India (`12.9716°N, 77.5946°E`).

---

## ⚠️ Data Provenance & Scientific Disclosure

> **Important**: The datasets collected here originate from the **Open-Meteo Air Quality API**, which ingests and serves numerical simulations from the **Copernicus Atmosphere Monitoring Service (CAMS)** operated by the European Centre for Medium-Range Weather Forecasts (**ECMWF**).
>
> This data represents **regional atmospheric chemistry model simulations and satellite optical depth assimilations**, **NOT physical ground-station sensor measurements** (such as CPCB / KSPCB continuous ambient air quality monitoring stations).

---

## Workspace Structure

```
ml/
├── data/
│   ├── bengaluru_air_quality.csv          # Structured 92-day hourly pollutant dataset
│   └── bengaluru_air_quality_metadata.json # Companion data-provenance and unit metadata
├── fetch_data.py                          # Historical data ingestion and validation script
├── requirements.txt                       # Python dependencies (requests, pandas)
└── README.md                              # Documentation and execution guide
```

---

## Tracked Atmospheric Pollutants

All pollutant measurements are preserved in their native atmospheric concentration units:

| Variable | Column Name in CSV | Measured Unit | Description |
| :--- | :--- | :--- | :--- |
| **Timestamp** | `timestamp` | ISO-8601 string | Local hour in `Asia/Kolkata` (`YYYY-MM-DDTHH:MM`) |
| **PM2.5** | `pm2_5_ugm3` | $\mu\text{g/m}^3$ | Fine particulate matter ($\le 2.5\ \mu\text{m}$) |
| **PM10** | `pm10_ugm3` | $\mu\text{g/m}^3$ | Coarse particulate matter ($\le 10\ \mu\text{m}$) |
| **Nitrogen Dioxide** | `nitrogen_dioxide_ugm3` | $\mu\text{g/m}^3$ | Nitrogen dioxide ($\text{NO}_2$) |
| **Sulphur Dioxide** | `sulphur_dioxide_ugm3` | $\mu\text{g/m}^3$ | Sulphur dioxide ($\text{SO}_2$) |
| **Ozone** | `ozone_ugm3` | $\mu\text{g/m}^3$ | Ground-level Ozone ($\text{O}_3$) |
| **Carbon Monoxide** | `carbon_monoxide_ugm3` | $\mu\text{g/m}^3$ | Carbon monoxide ($\text{CO}$) |

---

## Setup & Prerequisites

### 1. Python Environment
Python 3.10, 3.11, or 3.12 is recommended.

From the project root directory, create and activate a Python virtual environment:

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment in PowerShell
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies

Install the required packages specified in `ml/requirements.txt`:

```powershell
pip install -r ml/requirements.txt
```

*(Note: `fetch_data.py` also features built-in fallbacks to Python's standard library `urllib` and `csv`, enabling execution even before installing third-party packages).*

---

## Running the Data Collection Script

Run the ingestion script from the project root:

```powershell
python ml/fetch_data.py
```

### Optional Command-Line Arguments

The script provides configuration flags:

```powershell
# Collect with custom past horizon (e.g., 60 days)
python ml/fetch_data.py --past-days 60

# Specify custom output path
python ml/fetch_data.py --output ml/data/custom_output.csv

# Query strictly past historical days (forecast_days=0)
python ml/fetch_data.py --past-days 92 --forecast-days 0

# Configure maximum retries for rate limits (default: 3)
python ml/fetch_data.py --max-retries 3
```

---

## Rate-Limiting & HTTP 429 Handling

The script includes resilient rate-limiting protections for the Open-Meteo API:
1. **Daily Rate Limit Handling**: If the API returns HTTP 429 with `"Daily API request limit exceeded"`, the script **stops immediately without retrying**, prints the exact API reason, instructs the user to try again tomorrow, and ensures no CSV files are created or overwritten.
2. **Temporary Rate Limits (Exponential Backoff)**: For temporary burst or minutely/hourly limits, the script honors the `Retry-After` header if provided, or applies exponential backoff ($3.0\text{s}$, $6.0\text{s}$, $12.0\text{s}$) across a maximum of 3 retries (4 total attempts).
3. **Transparent Error Logging**: Prints the HTTP status, server headers, and full JSON error response body.
4. **Data Integrity Guarantee**: If retries are exhausted or daily quota is reached, the script halts cleanly with exit code 1. It **never silently generates mock data or empty datasets**.
