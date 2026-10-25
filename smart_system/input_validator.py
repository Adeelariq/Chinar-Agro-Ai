"""
Input Validation Gate for Plant Disease Pipeline — Chinar Agro AI
==================================================================
Rejects non-plant and junk images (people, faces, animals, rooms, food,
screenshots, documents, blank/blurry/dark/bright images) before they reach
the 52-class disease classification models.

Layers (cheapest first):
  1. Basic checks:
     - Image decodes as a valid PIL image
     - Shorter side >= 100px (reason: "too_small")
     - Variance of Laplacian blur score >= threshold (reason: "too_blurry")
     - Mean brightness within [18, 242] (reasons: "too_dark", "too_bright")
  2. CLIP Zero-Shot Classification Gate (Primary):
     - Single softmax over positive plant prompts vs negative non-plant prompts
     - plant_score = total probability mass on positive prompts
     - Accepted if plant_score >= PLANT_GATE_THRESHOLD (default: 0.60)
  3. Heuristic Fallback (when CLIP is unavailable or disabled):
     - HSV vegetation pixel ratio (green/yellow-green/brown leaf) >= 15%
     - OpenCV Haar frontal face cascade: no face covering > 3% of image
  4. Global Gate Bypass:
     - ENABLE_LEAF_GATE env var (default: true) can disable the gate if needed.
"""

from __future__ import annotations

import os
import logging
from typing import Dict, Any, Optional, Tuple
import numpy as np
from PIL import Image
import cv2

logger = logging.getLogger("smart_system.input_validator")

# ═══════════════════════════════════════════════════════════════
# CONFIGURATION & THRESHOLDS (Controlled via Environment Variables)
# ═══════════════════════════════════════════════════════════════

def _get_bool_env(name: str, default: bool = True) -> bool:
    val = os.getenv(name, str(default)).strip().lower()
    return val in ("true", "1", "yes", "on")

def _get_float_env(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, str(default)))
    except (ValueError, TypeError):
        return default

# Basic thresholds
MIN_SHORTER_SIDE: int = 100
BLUR_THRESHOLD: float = 25.0        # Variance of Laplacian below this is blurry/flat
MIN_BRIGHTNESS: float = 18.0        # Mean grayscale brightness [0, 255]
MAX_BRIGHTNESS: float = 242.0

# CLIP Gate settings
PLANT_GATE_THRESHOLD: float = _get_float_env("PLANT_GATE_THRESHOLD", 0.60)

# Prompts for zero-shot gate
POSITIVE_PROMPTS = [
    "plant leaf close-up",
    "diseased leaf",
    "crop plant",
    "fruit on a tree",
    "plant with soil",
]

NEGATIVE_PROMPTS = [
    "person",
    "face/selfie",
    "hand",
    "animal",
    "building",
    "room interior",
    "food",
    "vehicle",
    "text document",
    "screenshot",
    "pesticide bottle or label",
    "sky",
    "blank wall",
]

ALL_PROMPTS = POSITIVE_PROMPTS + NEGATIVE_PROMPTS

# ═══════════════════════════════════════════════════════════════
# SINGLETON CLIP MODEL & TEXT EMBEDDINGS CACHE
# ═══════════════════════════════════════════════════════════════

_clip_model = None
_clip_preprocess = None
_clip_text_features = None
_clip_load_attempted = False
_clip_available = False
_haar_cascade = None


def get_haar_cascade():
    """Lazy-load OpenCV Haar frontal face cascade detector."""
    global _haar_cascade
    if _haar_cascade is None:
        cascade_path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
        if os.path.isfile(cascade_path):
            _haar_cascade = cv2.CascadeClassifier(cascade_path)
        else:
            logger.warning(f"Haar cascade XML not found at {cascade_path}")
    return _haar_cascade


def get_clip_gate_model() -> Tuple[Optional[Any], Optional[Any], Optional[Any]]:
    """
    Lazy-load CLIP model on CPU once (singleton).
    Returns (model, preprocess, cached_normalized_text_features) or (None, None, None).
    """
    global _clip_model, _clip_preprocess, _clip_text_features
    global _clip_load_attempted, _clip_available

    if _clip_load_attempted:
        if _clip_available:
            return _clip_model, _clip_preprocess, _clip_text_features
        return None, None, None

    _clip_load_attempted = True

    if not _get_bool_env("ENABLE_LEAF_GATE_CLIP", True):
        logger.info("CLIP leaf gate disabled via ENABLE_LEAF_GATE_CLIP=false")
        return None, None, None

    try:
        import torch
        import clip

        logger.info("Loading CLIP model (ViT-B/32) on CPU for zero-shot plant gate...")
        model, preprocess = clip.load("ViT-B/32", device="cpu")
        model.eval()

        with torch.no_grad():
            text_tokens = clip.tokenize(ALL_PROMPTS).to("cpu")
            text_features = model.encode_text(text_tokens)
            text_features = text_features / text_features.norm(dim=-1, keepdim=True)

        _clip_model = model
        _clip_preprocess = preprocess
        _clip_text_features = text_features
        _clip_available = True
        logger.info(f"CLIP zero-shot leaf gate initialized successfully ({len(ALL_PROMPTS)} prompts cached).")
        return _clip_model, _clip_preprocess, _clip_text_features

    except Exception as exc:
        logger.warning(
            f"CLIP gate could not be loaded ({exc}). Falling back to heuristic validation (HSV + Haar face)."
        )
        _clip_available = False
        return None, None, None


# ═══════════════════════════════════════════════════════════════
# HEURISTIC FALLBACK (HSV Vegetation Ratio + Haar Face Cascade)
# ═══════════════════════════════════════════════════════════════

def _run_heuristic_fallback(
    pil_image: Image.Image,
    gray_np: np.ndarray
) -> Dict[str, Any]:
    """
    Heuristic validation when CLIP is unavailable or disabled:
      - Vegetation pixel ratio (green, yellow-green, brown leaf tones) must be >= 15% (0.15).
      - OpenCV Haar frontal face cascade: no face covering > 3% of the image area.
    """
    rgb_np = np.array(pil_image.convert("RGB"))
    hsv = cv2.cvtColor(rgb_np, cv2.COLOR_RGB2HSV)
    h_img, w_img = hsv.shape[:2]
    total_pixels = float(h_img * w_img)

    # 1. Vegetation color masks in HSV space:
    # Green and yellow-green leaves
    mask_green = cv2.inRange(hsv, np.array([25, 25, 20]), np.array([88, 255, 255]))
    # Brown / dry / necrotic leaf tissue
    mask_brown = cv2.inRange(hsv, np.array([10, 30, 20]), np.array([25, 255, 230]))
    # Dark olive tones
    mask_olive = cv2.inRange(hsv, np.array([20, 20, 15]), np.array([95, 255, 120]))

    combined_veg_mask = cv2.bitwise_or(mask_green, cv2.bitwise_or(mask_brown, mask_olive))
    veg_pixel_count = int(np.count_nonzero(combined_veg_mask))
    veg_ratio = veg_pixel_count / total_pixels if total_pixels > 0 else 0.0

    # 2. Haar Frontal Face Detection
    max_face_area_ratio = 0.0
    cascade = get_haar_cascade()
    face_detected = False

    if cascade is not None:
        try:
            faces = cascade.detectMultiScale(
                gray_np,
                scaleFactor=1.1,
                minNeighbors=4,
                minSize=(30, 30)
            )
            for (x, y, w, h) in faces:
                face_area_ratio = (w * h) / total_pixels
                if face_area_ratio > max_face_area_ratio:
                    max_face_area_ratio = face_area_ratio
            if max_face_area_ratio > 0.03:
                face_detected = True
        except Exception as e:
            logger.warning(f"Haar face detection error: {e}")

    # Fallback decision
    checks = {
        "heuristic_fallback": True,
        "veg_ratio": round(veg_ratio, 4),
        "veg_threshold": 0.15,
        "max_face_area_ratio": round(max_face_area_ratio, 4),
        "face_detected": face_detected,
    }

    if face_detected:
        return {
            "ok": False,
            "reason": "not_a_plant",
            "plant_score": round(veg_ratio, 4),
            "checks": checks,
        }

    if veg_ratio < 0.15:
        return {
            "ok": False,
            "reason": "not_a_plant",
            "plant_score": round(veg_ratio, 4),
            "checks": checks,
        }

    return {
        "ok": True,
        "reason": "ok",
        "plant_score": round(veg_ratio, 4),
        "checks": checks,
    }


# ═══════════════════════════════════════════════════════════════
# PRIMARY VALIDATION ENTRY POINT
# ═══════════════════════════════════════════════════════════════

def validate_plant_image(pil_image: Image.Image) -> Dict[str, Any]:
    """
    Validates that an image depicts a plant / crop leaf and is of sufficient
    photographic quality for disease diagnosis.

    Returns
    -------
    dict:
        ok : bool
            True if image passes all gates, False if rejected.
        reason : str
            "ok", "too_small", "too_blurry", "too_dark", "too_bright",
            "not_a_plant", or "gate_disabled".
        plant_score : float
            Estimated probability or vegetation score (0.0 - 1.0).
        checks : dict
            Detailed diagnostics from each inspection layer.
    """
    # ── Check 0: Global bypass switch ─────────────────────────
    if not _get_bool_env("ENABLE_LEAF_GATE", True):
        return {
            "ok": True,
            "reason": "gate_disabled",
            "plant_score": 1.0,
            "checks": {"gate_enabled": False},
        }

    # ── Check 1: Basic validation ─────────────────────────────
    if not isinstance(pil_image, Image.Image):
        return {
            "ok": False,
            "reason": "invalid_image",
            "plant_score": 0.0,
            "checks": {"error": "Input is not a valid PIL Image"},
        }

    width, height = pil_image.size
    shorter_side = min(width, height)

    if shorter_side < MIN_SHORTER_SIDE:
        return {
            "ok": False,
            "reason": "too_small",
            "plant_score": 0.0,
            "checks": {
                "width": width,
                "height": height,
                "min_dimension": shorter_side,
                "required_min": MIN_SHORTER_SIDE,
            },
        }

    # Grayscale conversion for blur and brightness inspection
    try:
        rgb_img = pil_image.convert("RGB")
        gray_np = cv2.cvtColor(np.array(rgb_img), cv2.COLOR_RGB2GRAY)
    except Exception as e:
        return {
            "ok": False,
            "reason": "invalid_image",
            "plant_score": 0.0,
            "checks": {"error": f"Failed to convert image: {e}"},
        }

    # Mean brightness inspection
    mean_brightness = float(np.mean(gray_np))
    if mean_brightness < MIN_BRIGHTNESS:
        return {
            "ok": False,
            "reason": "too_dark",
            "plant_score": 0.0,
            "checks": {
                "mean_brightness": round(mean_brightness, 2),
                "min_brightness": MIN_BRIGHTNESS,
            },
        }

    if mean_brightness > MAX_BRIGHTNESS:
        return {
            "ok": False,
            "reason": "too_bright",
            "plant_score": 0.0,
            "checks": {
                "mean_brightness": round(mean_brightness, 2),
                "max_brightness": MAX_BRIGHTNESS,
            },
        }

    # Variance-of-Laplacian blur inspection
    blur_score = float(cv2.Laplacian(gray_np, cv2.CV_64F).var())
    if blur_score < BLUR_THRESHOLD:
        return {
            "ok": False,
            "reason": "too_blurry",
            "plant_score": 0.0,
            "checks": {
                "blur_score": round(blur_score, 2),
                "blur_threshold": BLUR_THRESHOLD,
            },
        }

    # ── Check 2: CLIP Zero-Shot Classification Gate ───────────
    threshold = _get_float_env("PLANT_GATE_THRESHOLD", PLANT_GATE_THRESHOLD)
    clip_model, preprocess, text_features = get_clip_gate_model()

    if clip_model is not None and preprocess is not None and text_features is not None:
        try:
            import torch
            image_tensor = preprocess(rgb_img).unsqueeze(0).to("cpu")

            with torch.no_grad():
                image_features = clip_model.encode_image(image_tensor)
                image_features = image_features / image_features.norm(dim=-1, keepdim=True)
                similarity = (100.0 * image_features @ text_features.T).softmax(dim=-1)[0]

            pos_count = len(POSITIVE_PROMPTS)
            plant_score = float(similarity[:pos_count].sum().item())
            top_prompt_idx = int(similarity.argmax().item())
            top_prompt = ALL_PROMPTS[top_prompt_idx]

            checks = {
                "clip_used": True,
                "plant_score": round(plant_score, 4),
                "threshold": threshold,
                "top_prompt": top_prompt,
                "blur_score": round(blur_score, 2),
                "mean_brightness": round(mean_brightness, 2),
            }

            if plant_score < threshold:
                return {
                    "ok": False,
                    "reason": "not_a_plant",
                    "plant_score": round(plant_score, 4),
                    "checks": checks,
                }

            return {
                "ok": True,
                "reason": "ok",
                "plant_score": round(plant_score, 4),
                "checks": checks,
            }

        except Exception as e:
            logger.warning(f"CLIP zero-shot inference failed: {e}. Reverting to heuristic fallback.")

    # ── Check 3: Heuristic Fallback (Vegetation + Face) ────────
    fallback_res = _run_heuristic_fallback(pil_image, gray_np)
    fallback_res["checks"]["blur_score"] = round(blur_score, 2)
    fallback_res["checks"]["mean_brightness"] = round(mean_brightness, 2)
    return fallback_res


def get_rejection_payload(reason: str) -> Dict[str, str]:
    """
    Standard HTTP 422 JSON payload for rejected uploads.
    """
    messages = {
        "too_small": "The uploaded photo resolution is too small. Please use an image with at least 100 pixels on both sides.",
        "too_blurry": "The image is too blurry or out of focus to clearly inspect leaf features.",
        "too_dark": "The photo is too dark. Please take a picture with adequate natural lighting.",
        "too_bright": "The photo is overexposed or has excessive glare.",
        "not_a_plant": "The uploaded image does not appear to be a crop leaf or plant.",
        "invalid_image": "Unable to decode the uploaded image file.",
    }
    return {
        "error": "not_a_plant",
        "reason": reason,
        "message": messages.get(reason, "The image could not be verified as a valid leaf photo."),
        "hint": "Take a clear, close photo of a single leaf in daylight.",
    }
