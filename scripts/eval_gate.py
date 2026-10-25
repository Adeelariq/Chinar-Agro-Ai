"""
Evaluation and Threshold Calibration for Plant Input Gate — Chinar Agro AI
=============================================================================
Evaluates validate_plant_image across tests/gate_samples/plants/ and
tests/gate_samples/non_plants/.

Outputs:
  - Plant accept rate (True Positive Rate)
  - Non-plant reject rate (True Negative Rate)
  - Sorted plant_score distribution
  - Optimal PLANT_GATE_THRESHOLD maximizing balanced accuracy
"""

import os
import sys
from typing import List, Tuple
import numpy as np
from PIL import Image

# Ensure project root is on sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from smart_system.input_validator import validate_plant_image, PLANT_GATE_THRESHOLD

PLANTS_DIR = os.path.join(PROJECT_ROOT, "tests", "gate_samples", "plants")
NON_PLANTS_DIR = os.path.join(PROJECT_ROOT, "tests", "gate_samples", "non_plants")
VALID_EXTENSIONS = (".jpg", ".jpeg", ".png", ".bmp", ".webp")


def generate_synthetic_samples() -> Tuple[List[Tuple[str, Image.Image]], List[Tuple[str, Image.Image]]]:
    """Generates synthetic plants and negatives to allow evaluation before user adds real photos."""
    synthetic_plants = []
    synthetic_non_plants = []

    # 1. Synthetic Plants: High green/yellow textures
    rng = np.random.RandomState(42)
    for i in range(5):
        h, w = 224, 224
        # Create green/leaf pattern
        arr = rng.randint(20, 60, (h, w, 3), dtype=np.uint8)
        arr[:, :, 1] = rng.randint(110, 230, (h, w), dtype=np.uint8)  # Dominant green
        arr[:, :, 0] = rng.randint(20, 80, (h, w), dtype=np.uint8)   # Low red
        arr[:, :, 2] = rng.randint(10, 50, (h, w), dtype=np.uint8)   # Low blue
        synthetic_plants.append((f"synthetic_leaf_{i+1}", Image.fromarray(arr)))

    # 2. Synthetic Negatives: Solid colors, noise, gradients, high brightness/darkness
    # Solid blue
    synthetic_non_plants.append(("synth_solid_blue", Image.new("RGB", (200, 200), (30, 80, 220))))
    # Solid red
    synthetic_non_plants.append(("synth_solid_red", Image.new("RGB", (200, 200), (220, 40, 40))))
    # Pure white / overexposed
    synthetic_non_plants.append(("synth_solid_white", Image.new("RGB", (200, 200), (250, 250, 250))))
    # Pure dark / underexposed
    synthetic_non_plants.append(("synth_solid_black", Image.new("RGB", (200, 200), (5, 5, 5))))
    # Uniform gray (flat / blurry)
    synthetic_non_plants.append(("synth_solid_gray", Image.new("RGB", (200, 200), (128, 128, 128))))
    # Random RGB noise
    noise_arr = rng.randint(0, 256, (200, 200, 3), dtype=np.uint8)
    synthetic_non_plants.append(("synth_random_noise", Image.fromarray(noise_arr)))
    # Gradient (sky/sunset)
    grad = np.tile(np.linspace(50, 220, 200, dtype=np.uint8), (200, 1))
    grad_rgb = np.stack([grad, np.full_like(grad, 120), np.full_like(grad, 230)], axis=-1)
    synthetic_non_plants.append(("synth_blue_gradient", Image.fromarray(grad_rgb)))

    return synthetic_plants, synthetic_non_plants


def load_images_from_dir(directory: str) -> List[Tuple[str, Image.Image]]:
    images = []
    if not os.path.isdir(directory):
        return images
    for fname in sorted(os.listdir(directory)):
        if fname.lower().endswith(VALID_EXTENSIONS):
            fpath = os.path.join(directory, fname)
            try:
                img = Image.open(fpath)
                images.append((fname, img))
            except Exception as e:
                print(f"[Warning] Failed to open {fname}: {e}")
    return images


def evaluate():
    print("=" * 70)
    print("Chinar Agro AI — Plant Input Gate Evaluation & Calibration")
    print("=" * 70)

    plant_images = load_images_from_dir(PLANTS_DIR)
    non_plant_images = load_images_from_dir(NON_PLANTS_DIR)

    use_synthetic_plants = len(plant_images) == 0
    use_synthetic_non_plants = len(non_plant_images) == 0

    if use_synthetic_plants or use_synthetic_non_plants:
        print("[Notice] Real samples not yet present in gate_samples/. Using synthetic evaluation data.")
        synth_plants, synth_negatives = generate_synthetic_samples()
        if use_synthetic_plants:
            plant_images.extend(synth_plants)
        if use_synthetic_non_plants:
            non_plant_images.extend(synth_negatives)

    print(f"Total Plant samples to evaluate: {len(plant_images)}")
    print(f"Total Non-Plant samples to evaluate: {len(non_plant_images)}")
    print("-" * 70)

    # Evaluate plants
    plant_results = []
    for name, img in plant_images:
        res = validate_plant_image(img)
        plant_results.append({
            "name": name,
            "label": 1,
            "ok": res["ok"],
            "reason": res["reason"],
            "score": res["plant_score"],
            "checks": res.get("checks", {}),
        })

    # Evaluate non-plants
    non_plant_results = []
    for name, img in non_plant_images:
        res = validate_plant_image(img)
        non_plant_results.append({
            "name": name,
            "label": 0,
            "ok": res["ok"],
            "reason": res["reason"],
            "score": res["plant_score"],
            "checks": res.get("checks", {}),
        })

    all_results = plant_results + non_plant_results

    # Summary metrics under current threshold
    accepted_plants = sum(1 for r in plant_results if r["ok"])
    plant_accept_rate = (accepted_plants / len(plant_results)) * 100 if plant_results else 0.0

    rejected_non_plants = sum(1 for r in non_plant_results if not r["ok"])
    non_plant_reject_rate = (rejected_non_plants / len(non_plant_results)) * 100 if non_plant_results else 0.0

    print(f"\nRESULTS AT CURRENT CONFIG (Threshold = {PLANT_GATE_THRESHOLD:.2f}):")
    print(f"  Plant Accept Rate (TPR)    : {accepted_plants}/{len(plant_results)} ({plant_accept_rate:.1f}%)")
    print(f"  Non-Plant Reject Rate (TNR): {rejected_non_plants}/{len(non_plant_results)} ({non_plant_reject_rate:.1f}%)")

    # Sorted Scores Table
    print("\n" + "=" * 70)
    print(f"{'Sample Name':<28} | {'Type':<10} | {'Score':<7} | {'Gate Decision':<13} | {'Reason':<15}")
    print("-" * 70)
    for r in sorted(all_results, key=lambda x: x["score"], reverse=True):
        stype = "Plant" if r["label"] == 1 else "Non-Plant"
        decision = "ACCEPTED" if r["ok"] else "REJECTED"
        print(f"{r['name'][:28]:<28} | {stype:<10} | {r['score']:<7.3f} | {decision:<13} | {r['reason']:<15}")

    # Threshold optimization for balanced accuracy
    scores_labels = [(r["score"], r["label"]) for r in all_results]
    unique_scores = sorted(list(set(s[0] for s in scores_labels)))

    best_thresh = PLANT_GATE_THRESHOLD
    best_bal_acc = 0.0

    candidate_thresholds = np.linspace(0.1, 0.9, 81)
    for t in candidate_thresholds:
        # TPR: plant passed with score >= t
        # (Assuming sample passed basic checks)
        tp = sum(1 for r in plant_results if r["ok"] and r["score"] >= t)
        fn = len(plant_results) - tp
        tpr = tp / len(plant_results) if len(plant_results) else 0.0

        # TNR: non-plant rejected (either failed basic check or score < t)
        tn = sum(1 for r in non_plant_results if (not r["ok"]) or r["score"] < t)
        fp = len(non_plant_results) - tn
        tnr = tn / len(non_plant_results) if len(non_plant_results) else 0.0

        bal_acc = (tpr + tnr) / 2.0
        if bal_acc > best_bal_acc:
            best_bal_acc = bal_acc
            best_thresh = float(t)

    print("\n" + "=" * 70)
    print(f"OPTIMAL THRESHOLD CALIBRATION:")
    print(f"  Suggested PLANT_GATE_THRESHOLD: {best_thresh:.2f}")
    print(f"  Estimated Balanced Accuracy    : {best_bal_acc * 100:.1f}%")
    print("=" * 70)
    print("Next step: Populate tests/gate_samples/plants and non_plants with real photos,")
    print("then re-run this script to calibrate PLANT_GATE_THRESHOLD for production.")


if __name__ == "__main__":
    evaluate()
