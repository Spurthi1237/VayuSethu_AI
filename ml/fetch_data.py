"""
Vayu Sethu - Machine Learning Pipeline
Module: Historical Air Quality Data Collection
Location: Bengaluru, India (Lat: 12.9716, Lon: 77.5946, Timezone: Asia/Kolkata)

DATA PROVENANCE & SCIENTIFIC NOTICE:
This dataset is collected from the Open-Meteo Air Quality API, powered by
the Copernicus Atmosphere Monitoring Service (CAMS) regional and global
atmospheric chemistry numerical simulations (ECMWF). It represents
modelled atmospheric simulations and satellite optical depth assimilations,
NOT physical CPCB/KSPCB ground-station regulatory monitor measurements.
"""

import argparse
import csv
import email.utils
import json
import os
import sys
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

# Ensure stdout handles UTF-8 on Windows environments (e.g. Greek mu symbol)
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Optional dependency imports with standard-library fallback
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

try:
    import urllib.error
    import urllib.parse
    import urllib.request
except ImportError:
    pass

API_ENDPOINT = "https://air-quality-api.open-meteo.com/v1/air-quality"

DEFAULT_CONFIG = {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "timezone": "Asia/Kolkata",
    "past_days": 92,
    "pollutants": [
        "pm2_5",
        "pm10",
        "nitrogen_dioxide",
        "sulphur_dioxide",
        "ozone",
        "carbon_monoxide",
    ],
}

DEFAULT_USER_AGENT = "VayuSethu-ML-Collector/1.0 (contact: airquality@vayusethu.org)"


def parse_retry_after(retry_after_str: Optional[str], default_delay: float) -> float:
    """
    Parse HTTP Retry-After header.
    Can be integer seconds (e.g. '30') or an HTTP-date (RFC 2822 / RFC 7231).
    Returns delay in seconds, bounded between 1.0s and 300.0s.
    """
    if not retry_after_str:
        return default_delay

    cleaned = retry_after_str.strip()

    # 1. Try parsing as integer or float seconds
    try:
        seconds = float(cleaned)
        return max(1.0, min(seconds, 300.0))
    except ValueError:
        pass

    # 2. Try parsing as HTTP-date string
    try:
        target_dt = email.utils.parsedate_to_datetime(cleaned)
        now_dt = datetime.now(timezone.utc)
        delay = (target_dt - now_dt).total_seconds()
        return max(1.0, min(delay, 300.0))
    except Exception:
        return default_delay


def _perform_http_get(
    url: str,
    params: Dict[str, Any],
    timeout_seconds: int = 30,
) -> Tuple[int, Dict[str, str], Optional[Dict[str, Any]], str]:
    """
    Executes a single HTTP GET request using requests (if available) or urllib.
    Returns:
        (status_code, response_headers_dict, parsed_json_or_none, raw_body_text)
    """
    headers = {
        "User-Agent": DEFAULT_USER_AGENT,
        "Accept": "application/json",
    }

    if HAS_REQUESTS:
        try:
            resp = requests.get(url, params=params, headers=headers, timeout=timeout_seconds)
            status_code = resp.status_code
            resp_headers = {k.lower(): v for k, v in resp.headers.items()}
            body_text = resp.text
            parsed_json = None
            try:
                parsed_json = resp.json()
            except Exception:
                pass
            return status_code, resp_headers, parsed_json, body_text
        except requests.exceptions.Timeout:
            raise TimeoutError(f"Request timed out after {timeout_seconds} seconds.")
        except requests.exceptions.ConnectionError as ce:
            raise ConnectionError(f"Network connection failed: {ce}")
        except Exception as e:
            raise RuntimeError(f"Unexpected network error: {e}")
    else:
        # Standard library urllib fallback
        query_string = urllib.parse.urlencode(params)
        full_url = f"{url}?{query_string}"
        req = urllib.request.Request(full_url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=timeout_seconds) as resp:
                status_code = resp.getcode()
                resp_headers = {k.lower(): v for k, v in resp.headers.items()}
                body_bytes = resp.read()
                body_text = body_bytes.decode("utf-8", errors="replace")
                parsed_json = None
                try:
                    parsed_json = json.loads(body_text)
                except Exception:
                    pass
                return status_code, resp_headers, parsed_json, body_text
        except urllib.error.HTTPError as he:
            status_code = he.code
            resp_headers = {k.lower(): v for k, v in he.headers.items()}
            try:
                body_bytes = he.read()
                body_text = body_bytes.decode("utf-8", errors="replace")
            except Exception:
                body_text = str(he.reason)
            parsed_json = None
            try:
                parsed_json = json.loads(body_text)
            except Exception:
                pass
            return status_code, resp_headers, parsed_json, body_text
        except urllib.error.URLError as ue:
            raise ConnectionError(f"Network URL error: {ue.reason}")
        except Exception as e:
            raise RuntimeError(f"Error during HTTP retrieval: {e}")


def fetch_open_meteo_data(
    latitude: float,
    longitude: float,
    timezone_name: str,
    past_days: int,
    pollutants: List[str],
    forecast_days: Optional[int] = None,
    timeout_seconds: int = 30,
    max_retries: int = 3,
    base_delay_seconds: float = 3.0,
    backoff_factor: float = 2.0,
) -> Dict[str, Any]:
    """
    Fetch historical hourly air quality data from the Open-Meteo Air Quality API.
    
    Robust Rate-Limiting & Error Handling:
    - Identifies HTTP 429 (Too Many Requests).
    - Checks and honors the 'Retry-After' header if provided by the API.
    - Otherwise applies exponential backoff across up to 3 retries (e.g. 3s, 6s, 12s).
    - Prints the complete API error response body and relevant status information.
    - Never generates mock data or empty datasets.
    """
    params: Dict[str, Any] = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": ",".join(pollutants),
        "timezone": timezone_name,
        "past_days": past_days,
    }

    if forecast_days is not None:
        params["forecast_days"] = forecast_days

    print(f"[*] Requesting atmospheric model data from Open-Meteo API...")
    print(f"    - Endpoint: {API_ENDPOINT}")
    print(f"    - Coordinates: {latitude}°N, {longitude}°E (Bengaluru)")
    print(f"    - Horizon: Past {past_days} days (hourly)")
    print(f"    - Timezone: {timezone_name}")
    print(f"    - Target Pollutants: {', '.join(pollutants)}")
    if forecast_days is not None:
        print(f"    - Forecast Days: {forecast_days}")

    total_attempts = 1 + max_retries

    for attempt in range(1, total_attempts + 1):
        try:
            status_code, resp_headers, parsed_json, body_text = _perform_http_get(
                url=API_ENDPOINT,
                params=params,
                timeout_seconds=timeout_seconds,
            )
        except (TimeoutError, ConnectionError, RuntimeError) as net_err:
            print(f"[!] Network error on attempt {attempt}/{total_attempts}: {net_err}", file=sys.stderr)
            if attempt <= max_retries:
                delay = base_delay_seconds * (backoff_factor ** (attempt - 1))
                print(f"[*] Retrying in {delay:.1f}s (Attempt {attempt + 1}/{total_attempts})...", file=sys.stderr)
                time.sleep(delay)
                continue
            else:
                print(f"[!] Error: Exceeded maximum {max_retries} retries due to network failure.", file=sys.stderr)
                sys.exit(1)

        # -------------------------------------------------------------
        # 1. Success Case (HTTP 200)
        # -------------------------------------------------------------
        if status_code == 200:
            if not isinstance(parsed_json, dict):
                print("[!] Error: Malformed API response (expected JSON object).", file=sys.stderr)
                sys.exit(1)

            if "hourly" not in parsed_json or "time" not in parsed_json.get("hourly", {}):
                print(f"[!] Error: API response missing 'hourly' payload: {list(parsed_json.keys())}", file=sys.stderr)
                sys.exit(1)

            if attempt > 1:
                print(f"[+] Successfully retrieved data on attempt {attempt} after backoff.")
            return parsed_json

        # -------------------------------------------------------------
        # 2. Rate Limit Exceeded (HTTP 429)
        # -------------------------------------------------------------
        if status_code == 429:
            retry_after_hdr = resp_headers.get("retry-after")

            # Extract exact reason from parsed JSON or raw response body
            api_reason = ""
            if parsed_json and isinstance(parsed_json, dict) and "reason" in parsed_json:
                api_reason = str(parsed_json["reason"])
            elif body_text.strip():
                api_reason = body_text.strip()
            else:
                api_reason = "Too Many Requests (429)"

            # Format error body nicely for user visibility
            formatted_body = body_text.strip()
            if parsed_json and isinstance(parsed_json, dict):
                formatted_body = json.dumps(parsed_json, indent=2)

            # Check if this is a DAILY rate limit error
            body_check = (api_reason + " " + body_text).lower()
            is_daily_limit = (
                "daily api request limit exceeded" in body_check
                or ("daily" in body_check and "limit" in body_check and ("exceeded" in body_check or "reached" in body_check))
            )

            # Daily rate limit: stop immediately, do not retry, do not overwrite CSV
            if is_daily_limit:
                print("\n" + "!" * 72, file=sys.stderr)
                print("[!] Open-Meteo Daily API Request Limit Exceeded", file=sys.stderr)
                print(f"    - Endpoint    : {API_ENDPOINT}", file=sys.stderr)
                print(f"    - HTTP Status : 429 Too Many Requests", file=sys.stderr)
                print(f"    - API Reason  : {api_reason}", file=sys.stderr)
                print("!" * 72, file=sys.stderr)
                print("\n[!] The daily API request quota has been reached for your IP address.", file=sys.stderr)
                print("[!] Action Required: Please try again tomorrow (after daily quota resets at 00:00 UTC).", file=sys.stderr)
                print("[!] Notice: No retries will be attempted, and no CSV files will be created or overwritten.", file=sys.stderr)
                sys.exit(1)

            # Temporary rate limit (minutely burst, hourly limit): proceed with retry logic
            print("\n" + "!" * 72, file=sys.stderr)
            print(f"[!] HTTP Error 429: Too Many Requests encountered on attempt {attempt}/{total_attempts}.", file=sys.stderr)
            print(f"    - Endpoint           : {API_ENDPOINT}", file=sys.stderr)
            print(f"    - HTTP Status        : 429 Too Many Requests", file=sys.stderr)
            print(f"    - Retry-After Header : {retry_after_hdr if retry_after_hdr else 'None (not provided by server)'}", file=sys.stderr)
            print(f"    - API Reason         : {api_reason}", file=sys.stderr)
            print("    - API Response Body  :", file=sys.stderr)
            for line in formatted_body.splitlines():
                print(f"        {line}", file=sys.stderr)
            print("!" * 72 + "\n", file=sys.stderr)

            if attempt <= max_retries:
                # Compute delay: honor Retry-After if present, otherwise exponential backoff
                if retry_after_hdr:
                    delay = parse_retry_after(retry_after_hdr, default_delay=base_delay_seconds * (backoff_factor ** (attempt - 1)))
                    print(f"[*] Honoring server 'Retry-After' header: waiting {delay:.1f} seconds before retry {attempt}/{max_retries}...", file=sys.stderr)
                else:
                    delay = base_delay_seconds * (backoff_factor ** (attempt - 1))
                    print(f"[*] Applying exponential backoff: waiting {delay:.1f} seconds before retry {attempt}/{max_retries}...", file=sys.stderr)

                time.sleep(delay)
                continue
            else:
                print(f"[!] Error: Exceeded maximum {max_retries} retries for HTTP 429 (Too Many Requests).", file=sys.stderr)
                print(f"[!] The Open-Meteo API rate limit has been reached for your IP address.", file=sys.stderr)
                print(f"[!] Please wait before triggering additional requests, or check your IP's daily/hourly quota.", file=sys.stderr)
                print(f"[!] Policy Notice: In compliance with data integrity principles, mock data is NOT silently generated.", file=sys.stderr)
                sys.exit(1)

        # -------------------------------------------------------------
        # 3. Server Errors (HTTP 500, 502, 503, 504)
        # -------------------------------------------------------------
        if status_code in (500, 502, 503, 504):
            print(f"[!] Server error HTTP {status_code} received on attempt {attempt}/{total_attempts}.", file=sys.stderr)
            print(f"    API Response: {body_text.strip()}", file=sys.stderr)
            if attempt <= max_retries:
                delay = base_delay_seconds * (backoff_factor ** (attempt - 1))
                print(f"[*] Retrying in {delay:.1f}s...", file=sys.stderr)
                time.sleep(delay)
                continue
            else:
                print(f"[!] Error: Server error {status_code} persisted after {max_retries} retries.", file=sys.stderr)
                sys.exit(1)

        # -------------------------------------------------------------
        # 4. Client Errors (HTTP 400, 403, 404, etc.) - No retry
        # -------------------------------------------------------------
        print(f"[!] Error: HTTP request failed with status {status_code}.", file=sys.stderr)
        print(f"    API Response: {body_text.strip()}", file=sys.stderr)
        sys.exit(1)

    print(f"[!] Error: Unable to retrieve data after {total_attempts} attempts.", file=sys.stderr)
    sys.exit(1)


def audit_and_structure_data(
    raw_api_data: Dict[str, Any],
    pollutants: List[str],
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Validates data integrity:
    1. Checks for duplicate timestamps
    2. Counts missing (null/None) values per variable (WITHOUT silently filling them)
    3. Checks for physically invalid negative concentration values (< 0)
    4. Formats rows preserving timestamp and units in column headers
    """
    hourly = raw_api_data["hourly"]
    units = raw_api_data.get("hourly_units", {})
    timestamps: List[str] = hourly.get("time", [])
    total_rows = len(timestamps)

    if total_rows == 0:
        print("[!] Error: API returned 0 hourly records.", file=sys.stderr)
        sys.exit(1)

    # 1. Duplicate Timestamps Check
    seen_timestamps = set()
    duplicate_timestamps = []
    for ts in timestamps:
        if ts in seen_timestamps:
            duplicate_timestamps.append(ts)
        seen_timestamps.add(ts)

    # 2. Missing & Invalid Values Check (Per Column)
    missing_counts = {p: 0 for p in pollutants}
    negative_counts = {p: 0 for p in pollutants}
    structured_rows = []

    # Unit mapping: e.g. pm2_5 -> pm2_5_ugm3
    column_headers = ["timestamp"]
    for p in pollutants:
        unit = units.get(p, "ugm3").replace("μg/m³", "ugm3").replace("µg/m³", "ugm3").strip()
        column_headers.append(f"{p}_{unit}")

    for idx, ts in enumerate(timestamps):
        row = {"timestamp": ts}
        for p in pollutants:
            col_name = f"{p}_{units.get(p, 'ugm3').replace('μg/m³', 'ugm3').replace('µg/m³', 'ugm3').strip()}"
            series = hourly.get(p, [])
            val = series[idx] if idx < len(series) else None

            if val is None or val == "":
                missing_counts[p] += 1
                row[col_name] = ""
            else:
                try:
                    num_val = float(val)
                    if num_val < 0:
                        negative_counts[p] += 1
                    row[col_name] = num_val
                except (ValueError, TypeError):
                    missing_counts[p] += 1
                    row[col_name] = ""

        structured_rows.append(row)

    # Compile audit summary metadata
    summary = {
        "dataset_name": "Bengaluru Hourly Air Quality Dataset",
        "data_provenance": "Open-Meteo / Copernicus Atmosphere Monitoring Service (CAMS) atmospheric model data",
        "station_type": "Modelled Grid Simulation (NOT physical ground-station sensor measurements)",
        "coordinates": {
            "latitude": raw_api_data.get("latitude", 12.9716),
            "longitude": raw_api_data.get("longitude", 77.5946),
            "elevation_m": raw_api_data.get("elevation", None),
            "timezone": raw_api_data.get("timezone", "Asia/Kolkata"),
        },
        "total_rows": total_rows,
        "date_range": {
            "start": timestamps[0] if timestamps else None,
            "end": timestamps[-1] if timestamps else None,
        },
        "columns": column_headers,
        "units": units,
        "duplicate_timestamps_found": len(duplicate_timestamps),
        "duplicate_timestamps": duplicate_timestamps,
        "missing_values": missing_counts,
        "invalid_negative_values": negative_counts,
        "missing_values_silently_filled": False,
        "collection_timestamp_utc": datetime.now(timezone.utc).isoformat(),
    }

    return structured_rows, summary


def save_dataset_and_metadata(
    rows: List[Dict[str, Any]],
    summary: Dict[str, Any],
    output_csv_path: str,
) -> None:
    """
    Saves structured rows into CSV format, and metadata to JSON sidecar.
    Preserves raw data without synthetic imputation.
    """
    os.makedirs(os.path.dirname(os.path.abspath(output_csv_path)), exist_ok=True)

    columns = summary["columns"]

    # Write CSV with UTF-8 encoding
    with open(output_csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        for r in rows:
            writer.writerow(r)

    # Write companion metadata JSON
    metadata_path = os.path.splitext(output_csv_path)[0] + "_metadata.json"
    with open(metadata_path, mode="w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)


def print_data_summary(summary: Dict[str, Any], output_csv_path: str) -> None:
    """
    Prints a clear, structured terminal summary of the collected dataset.
    """
    sep = "=" * 72
    subsep = "-" * 72

    print("\n" + sep)
    print(" VAYU SETHU - AIR QUALITY DATA INGESTION SUMMARY")
    print(sep)
    print(f" Nature of Data    : {summary['data_provenance']}")
    print(f" Warning / Note    : {summary['station_type']}")
    print(f" Target Location   : Bengaluru, India")
    print(f" Coordinates       : {summary['coordinates']['latitude']}°N, {summary['coordinates']['longitude']}°E")
    print(f" Timezone          : {summary['coordinates']['timezone']}")
    print(subsep)
    print(f" Total Rows        : {summary['total_rows']:,} hourly observations")
    print(f" Date Range        : {summary['date_range']['start']} --> {summary['date_range']['end']}")
    print(subsep)
    print(" Columns & Measured Units:")
    for col in summary["columns"]:
        print(f"   - {col}")
    print(subsep)
    print(" Integrity & Validation Checks:")
    print(f"   - Duplicate Timestamps : {summary['duplicate_timestamps_found']}")
    
    total_missing = sum(summary['missing_values'].values())
    print(f"   - Total Missing Values : {total_missing} (Missing values preserved as empty; NOT silently filled)")
    print("   - Missing Values Breakdown:")
    for pollutant, cnt in summary["missing_values"].items():
        pct = (cnt / summary['total_rows']) * 100 if summary['total_rows'] else 0
        status = "None" if cnt == 0 else f"{cnt} ({pct:.2f}%)"
        print(f"       * {pollutant:<18}: {status}")

    total_negatives = sum(summary['invalid_negative_values'].values())
    print(f"   - Invalid Negative Values : {total_negatives}")
    if total_negatives > 0:
        for pollutant, cnt in summary["invalid_negative_values"].items():
            if cnt > 0:
                print(f"       * {pollutant:<18}: {cnt} invalid negative values")

    print(subsep)
    print(f" Output CSV Saved   : {os.path.abspath(output_csv_path)}")
    meta_path = os.path.splitext(output_csv_path)[0] + "_metadata.json"
    print(f" Metadata JSON Saved: {os.path.abspath(meta_path)}")
    print(sep + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fetch historical air quality dataset for Bengaluru from Open-Meteo CAMS model API."
    )
    parser.add_argument(
        "--output",
        default="ml/data/bengaluru_air_quality.csv",
        help="Path where output CSV will be saved (default: ml/data/bengaluru_air_quality.csv)",
    )
    parser.add_argument(
        "--past-days",
        type=int,
        default=DEFAULT_CONFIG["past_days"],
        help="Number of past days to query (default: 92)",
    )
    parser.add_argument(
        "--lat",
        type=float,
        default=DEFAULT_CONFIG["latitude"],
        help="Target latitude (default: 12.9716)",
    )
    parser.add_argument(
        "--lon",
        type=float,
        default=DEFAULT_CONFIG["longitude"],
        help="Target longitude (default: 77.5946)",
    )
    parser.add_argument(
        "--timezone",
        default=DEFAULT_CONFIG["timezone"],
        help="Target timezone (default: Asia/Kolkata)",
    )
    parser.add_argument(
        "--forecast-days",
        type=int,
        default=None,
        help="Optional number of forecast days (e.g. 0 for strictly historical past days)",
    )
    parser.add_argument(
        "--max-retries",
        type=int,
        default=3,
        help="Maximum retries upon encountering HTTP 429 / 5xx (default: 3)",
    )

    args = parser.parse_args()

    # Step 1: Fetch data from API with retry handling
    raw_data = fetch_open_meteo_data(
        latitude=args.lat,
        longitude=args.lon,
        timezone_name=args.timezone,
        past_days=args.past_days,
        pollutants=DEFAULT_CONFIG["pollutants"],
        forecast_days=args.forecast_days,
        max_retries=args.max_retries,
    )

    # Step 2: Audit and structure data
    rows, summary = audit_and_structure_data(
        raw_api_data=raw_data,
        pollutants=DEFAULT_CONFIG["pollutants"],
    )

    # Step 3: Save to CSV and metadata sidecar
    save_dataset_and_metadata(
        rows=rows,
        summary=summary,
        output_csv_path=args.output,
    )

    # Step 4: Print simple data summary to terminal
    print_data_summary(summary, args.output)


if __name__ == "__main__":
    main()
