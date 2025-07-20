import random
import csv
import json
from datetime import date, timedelta
from pathlib import Path

TOTAL = 1_000_000
START_DATE = date(2025, 7, 1)
SEED = 123456
EXCLUDE = {
    11982, 146692, 186216, 455889, 495505, 512118, 517776, 781948
}

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "db-init"
OUTPUT_DIR.mkdir(exist_ok=True)

def main():
    seeds = [i for i in range(TOTAL) if i not in EXCLUDE]
    random.seed(SEED)
    random.shuffle(seeds)

    date_tag = date.today().strftime("%Y%m%d")
    csv_path = OUTPUT_DIR / f"freecell_deals_shuffled_{date_tag}.csv"
    meta_path = OUTPUT_DIR / f"freecell_deals_shuffled_{date_tag}.json"

    # Write CSV
    with open(csv_path, "w", newline="") as f:
        writer = csv.writer(f)
        for i, seed in enumerate(seeds):
            date_str = (START_DATE + timedelta(days=i)).isoformat()
            writer.writerow([seed, date_str])

    # Write metadata
    metadata = {
        "shuffle_seed": SEED,
        "excluded_seeds": sorted(EXCLUDE),
        "total_deals": TOTAL,
        "start_date": START_DATE.isoformat(),
        "generator": "random.shuffle",
        "generator_language": "Python 3.10.12",
    }
    with open(meta_path, "w") as meta_file:
        json.dump(metadata, meta_file, indent=2)

    print(f"Generated:\n- {csv_path}\n- {meta_path}")

if __name__ == "__main__":
    main()
