from __future__ import annotations

import math
from dataclasses import dataclass

import cv2
import mediapipe as mp
import numpy as np


@dataclass(frozen=True)
class PoseLandmarkIndex:
    nose: int = 0
    left_shoulder: int = 11
    right_shoulder: int = 12
    left_hip: int = 23
    right_hip: int = 24
    left_ear: int = 7
    right_ear: int = 8


POSE_IDX = PoseLandmarkIndex()


def _decode_image(image_bytes: bytes) -> np.ndarray:
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Could not decode uploaded image.")
    return image


def _angle_degrees(a: tuple[float, float], b: tuple[float, float]) -> float:
    dx = b[0] - a[0]
    dy = b[1] - a[1]
    return math.degrees(math.atan2(dy, dx))


def _distance(a: tuple[float, float], b: tuple[float, float]) -> float:
    return math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)


def _round2(value: float) -> float:
    return round(float(value), 2)


def _to_xy(landmarks: list[mp.framework.formats.landmark_pb2.NormalizedLandmark], idx: int) -> tuple[float, float]:
    lm = landmarks[idx]
    return (lm.x, lm.y)


def extract_landmarks_and_angles(image_bytes: bytes) -> dict[str, object]:
    image = _decode_image(image_bytes)
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    pose = mp.solutions.pose.Pose(
        static_image_mode=True,
        model_complexity=1,
        smooth_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )
    try:
        result = pose.process(rgb)
    finally:
        pose.close()

    if not result.pose_landmarks:
        raise ValueError("No human posture landmarks were detected in the image.")

    landmarks_2d = result.pose_landmarks.landmark
    landmarks_3d = result.pose_world_landmarks.landmark if result.pose_world_landmarks else []

    left_shoulder = _to_xy(landmarks_2d, POSE_IDX.left_shoulder)
    right_shoulder = _to_xy(landmarks_2d, POSE_IDX.right_shoulder)
    left_hip = _to_xy(landmarks_2d, POSE_IDX.left_hip)
    right_hip = _to_xy(landmarks_2d, POSE_IDX.right_hip)
    nose = _to_xy(landmarks_2d, POSE_IDX.nose)
    left_ear = _to_xy(landmarks_2d, POSE_IDX.left_ear)
    right_ear = _to_xy(landmarks_2d, POSE_IDX.right_ear)

    shoulder_mid = ((left_shoulder[0] + right_shoulder[0]) / 2.0, (left_shoulder[1] + right_shoulder[1]) / 2.0)
    hip_mid = ((left_hip[0] + right_hip[0]) / 2.0, (left_hip[1] + right_hip[1]) / 2.0)
    ear_mid = ((left_ear[0] + right_ear[0]) / 2.0, (left_ear[1] + right_ear[1]) / 2.0)

    shoulder_line_angle = _angle_degrees(left_shoulder, right_shoulder)
    pelvis_line_angle = _angle_degrees(left_hip, right_hip)
    trunk_angle = _angle_degrees(hip_mid, shoulder_mid) + 90.0

    shoulder_width = max(_distance(left_shoulder, right_shoulder), 1e-6)
    head_forward_ratio = (ear_mid[0] - shoulder_mid[0]) / shoulder_width
    head_protraction_deg = math.degrees(math.atan(head_forward_ratio))
    head_tilt_angle = _angle_degrees(shoulder_mid, nose) + 90.0

    angles = {
        "shoulder_tilt_deg": _round2(shoulder_line_angle),
        "pelvic_tilt_deg": _round2(pelvis_line_angle),
        "head_protraction_deg": _round2(head_protraction_deg),
        "head_tilt_deg": _round2(head_tilt_angle),
        "trunk_inclination_deg": _round2(trunk_angle),
    }

    landmarks2d_payload = [
        {"id": idx, "x": _round2(lm.x), "y": _round2(lm.y), "visibility": _round2(lm.visibility)}
        for idx, lm in enumerate(landmarks_2d)
    ]
    landmarks3d_payload = [
        {"id": idx, "x": _round2(lm.x), "y": _round2(lm.y), "z": _round2(lm.z), "visibility": _round2(lm.visibility)}
        for idx, lm in enumerate(landmarks_3d)
    ]

    return {
        "angles": angles,
        "landmarks_2d": landmarks2d_payload,
        "landmarks_3d": landmarks3d_payload,
    }
