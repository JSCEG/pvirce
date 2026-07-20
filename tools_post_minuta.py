from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.request


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Uploads the generated minuta payload to Google Sheets in safe batches or individually."
    )
    parser.add_argument(
        "--url",
        default="https://script.google.com/macros/s/AKfycbw6PMnP56Ybn0849PzSDXvmNowhivMmUHfr5Joxntt8C2gEuZbX3uA1B2kHoGTRQvy0kA/exec",
        help="Google Apps Script Web App URL",
    )
    parser.add_argument(
        "--json-file",
        default="output/minuta_70py_payload.json",
        help="Path to the JSON file with rows",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=1,
        help="Size of upload batches. Set to 1 to upload individually (safer fallback for old Apps Script deployments)",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.05,
        help="Delay in seconds between uploads",
    )
    args = parser.parse_args()

    # 1. Fetch current votes from Google Sheet to detect duplicates
    print("Fetching current votes...")
    try:
        # Use cache buster to bypass CDN/caching
        cb_url = f"{args.url}?cb={time.time()}"
        with urllib.request.urlopen(cb_url) as response:
            rows_sheet = json.loads(response.read().decode("utf-8"))
    except Exception as e:
        print("Error fetching:", e)
        rows_sheet = []

    # Get folios voted today
    voted_today = set()
    today_str = time.strftime("%Y-%m-%d")
    for r in rows_sheet:
        if today_str in str(r.get("timestamp", "")):
            folio = r.get("folio")
            if folio:
                voted_today.add(folio)

    print(f"Already voted today ({today_str}): {len(voted_today)} projects.")

    # 2. Load generated payload
    try:
        with open(args.json_file, encoding="utf-8") as f:
            payload_all = json.load(f)
        all_rows = payload_all.get("rows", [])
    except Exception as e:
        print(f"Error loading payload file {args.json_file}: {e}")
        return 1

    # 3. Filter out already voted projects
    remaining_rows = [r for r in all_rows if r["folio"] not in voted_today]
    print(f"Remaining to upload: {len(remaining_rows)} projects.")

    if not remaining_rows:
        print("All projects are already voted and uploaded today!")
        return 0

    # 4. Upload in batches (or individually if batch-size is 1)
    class NoRedirection(urllib.request.HTTPErrorProcessor):
        def http_response(self, request, response):
            return response

        https_response = http_response

    opener = urllib.request.build_opener(NoRedirection)

    if args.batch_size == 1:
        # Upload individually (extremely reliable for standard doPost)
        for idx, row in enumerate(remaining_rows):
            print(f"[{idx+1}/{len(remaining_rows)}] Uploading {row['folio']} ({row['proyecto']})...")
            row_data = json.dumps(row, ensure_ascii=False).encode("utf-8")
            try:
                req = urllib.request.Request(args.url, data=row_data, headers={"Content-Type": "application/json"})
                res = opener.open(req)
                if res.status in (301, 302, 307, 308):
                    new_url = res.headers.get("Location")
                    req2 = urllib.request.Request(new_url)  # GET
                    with urllib.request.urlopen(req2) as res2:
                        res2.read()
                time.sleep(args.delay)
            except Exception as ex:
                print(f"Error uploading {row['folio']}: {ex}")
                time.sleep(1.0)
    else:
        # Upload in batches
        for i in range(0, len(remaining_rows), args.batch_size):
            batch = remaining_rows[i : i + args.batch_size]
            print(
                f"[{i//args.batch_size + 1}/{(len(remaining_rows)-1)//args.batch_size + 1}] Uploading batch of {len(batch)} rows..."
            )
            batch_payload = json.dumps({"rows": batch}, ensure_ascii=False).encode("utf-8")
            try:
                req = urllib.request.Request(args.url, data=batch_payload, headers={"Content-Type": "application/json"})
                res = opener.open(req)
                if res.status in (301, 302, 307, 308):
                    new_url = res.headers.get("Location")
                    req2 = urllib.request.Request(new_url)  # GET
                    with urllib.request.urlopen(req2) as res2:
                        res2.read()
                time.sleep(args.delay)
            except Exception as ex:
                print(f"Error uploading batch: {ex}")
                time.sleep(1.0)

    print("Sync complete.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
