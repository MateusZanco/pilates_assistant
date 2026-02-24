from __future__ import annotations

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


def _decode_image(image_bytes: bytes, max_size: int = 800) -> np.ndarray:
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Could not decode uploaded image.")

    height, width = image.shape[:2]
    longest_edge = max(height, width)

    if longest_edge > max_size:
        scale = max_size / float(longest_edge)
        new_width = max(1, int(width * scale))
        new_height = max(1, int(height * scale))
        image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)

    return image


def _calculate_3d_angle(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
    ba = a - b
    bc = c - b

    ba_norm = np.linalg.norm(ba)
    bc_norm = np.linalg.norm(bc)
    if ba_norm < 1e-9 or bc_norm < 1e-9:
        return 0.0

    cosine_angle = np.dot(ba, bc) / (ba_norm * bc_norm)
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    angle_rad = np.arccos(cosine_angle)
    return float(np.degrees(angle_rad))


def _round2(value: float | int) -> float:
    return round(float(value), 2)


def _to_xy(landmarks: list[mp.framework.formats.landmark_pb2.NormalizedLandmark], idx: int) -> tuple[float, float]:
    lm = landmarks[idx]
    return (lm.x, lm.y)


def _to_xyz(landmarks: list[mp.framework.formats.landmark_pb2.Landmark], idx: int) -> np.ndarray:
    lm = landmarks[idx]
    return np.array([lm.x, lm.y, lm.z], dtype=np.float64)


def _acute_angle(angle_deg: float) -> float:
    return min(angle_deg, 180.0 - angle_deg)


def extract_landmarks_and_angles(image_bytes: bytes) -> dict[str, object]:
    image = _decode_image(image_bytes)
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    pose = mp.solutions.pose.Pose(
        static_image_mode=True,
        model_complexity=2,
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
    if not result.pose_world_landmarks:
        raise ValueError("No 3D posture landmarks were detected in the image.")

    landmarks_2d = result.pose_landmarks.landmark
    landmarks_3d = result.pose_world_landmarks.landmark

    left_shoulder_3d = _to_xyz(landmarks_3d, POSE_IDX.left_shoulder)
    right_shoulder_3d = _to_xyz(landmarks_3d, POSE_IDX.right_shoulder)
    left_hip_3d = _to_xyz(landmarks_3d, POSE_IDX.left_hip)
    right_hip_3d = _to_xyz(landmarks_3d, POSE_IDX.right_hip)
    nose_3d = _to_xyz(landmarks_3d, POSE_IDX.nose)
    left_ear_3d = _to_xyz(landmarks_3d, POSE_IDX.left_ear)
    right_ear_3d = _to_xyz(landmarks_3d, POSE_IDX.right_ear)

    shoulder_mid_3d = (left_shoulder_3d + right_shoulder_3d) / 2.0
    hip_mid_3d = (left_hip_3d + right_hip_3d) / 2.0
    ear_mid_3d = (left_ear_3d + right_ear_3d) / 2.0

    x_axis = np.array([1.0, 0.0, 0.0], dtype=np.float64)
    y_axis = np.array([0.0, 1.0, 0.0], dtype=np.float64)
    z_axis = np.array([0.0, 0.0, 1.0], dtype=np.float64)

    shoulder_tilt_raw = _calculate_3d_angle(
        left_shoulder_3d,
        right_shoulder_3d,
        right_shoulder_3d + x_axis,
    )
    pelvic_tilt_raw = _calculate_3d_angle(
        left_hip_3d,
        right_hip_3d,
        right_hip_3d + x_axis,
    )
    trunk_inclination_raw = _calculate_3d_angle(
        shoulder_mid_3d,
        hip_mid_3d,
        hip_mid_3d + y_axis,
    )
    head_protraction_raw = _calculate_3d_angle(
        nose_3d,
        shoulder_mid_3d,
        shoulder_mid_3d + z_axis,
    )
    head_tilt_raw = _calculate_3d_angle(
        nose_3d,
        shoulder_mid_3d,
        shoulder_mid_3d + y_axis,
    )

    shoulder_rotation_cm = abs(left_shoulder_3d[2] - right_shoulder_3d[2]) * 100.0
    pelvic_rotation_cm = abs(left_hip_3d[2] - right_hip_3d[2]) * 100.0

    angles = {
        "shoulder_tilt_deg": _round2(_acute_angle(shoulder_tilt_raw)),
        "pelvic_tilt_deg": _round2(_acute_angle(pelvic_tilt_raw)),
        "shoulder_rotation_cm": _round2(shoulder_rotation_cm),
        "pelvic_rotation_cm": _round2(pelvic_rotation_cm),
        "head_protraction_deg": _round2(_acute_angle(head_protraction_raw)),
        "head_tilt_deg": _round2(_acute_angle(head_tilt_raw)),
        "trunk_inclination_deg": _round2(_acute_angle(trunk_inclination_raw)),
        "shoulder_mid_z_cm": _round2(shoulder_mid_3d[2] * 100.0),
        "ear_mid_z_cm": _round2(ear_mid_3d[2] * 100.0),
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
