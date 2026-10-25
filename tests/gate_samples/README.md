# Gate Evaluation Samples Directory

This directory is used by `scripts/eval_gate.py` to evaluate and calibrate the input validation leaf gate (`smart_system/input_validator.py`).

## Folder Structure

- `plants/`: Place real crop/plant leaf photos here (~40 samples recommended, including field shots with soil, messy backgrounds, sunlight, and close-ups).
- `non_plants/`: Place non-plant images here (~40 samples recommended, including selfies/faces, hands holding tools, rooms, furniture, animals, vehicles, food, screenshots, documents, pesticide bottles/labels, and solid or blurry photos).

## Running Evaluation

Run:
```bash
python scripts/eval_gate.py
```

The script will:
1. Scan all images in both directories (or use synthetic samples if empty).
2. Run `validate_plant_image` on each sample.
3. Compute and display:
   - Plant Accept Rate (% True Positives)
   - Non-Plant Reject Rate (% True Negatives)
   - Sorted list of `plant_score` values for diagnostics
   - Suggested `PLANT_GATE_THRESHOLD` maximizing balanced accuracy.
