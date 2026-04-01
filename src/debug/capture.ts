type CapturePoseName =
  | "round-eye-rest"
  | "round-eye-track"
  | "dense-scene"
  | "dense-scene-track";

export const CAPTURE_POSE_NAMES: CapturePoseName[] = [
  "round-eye-rest",
  "round-eye-track",
  "dense-scene",
  "dense-scene-track",
];

export type CapturePoseConfig = {
  name: CapturePoseName;
  minEyeSize: number;
  maxEyeSize: number;
  pointerActive: boolean;
  trackingBlend: number;
  mouseX: number;
  mouseY: number;
};

export function getCapturePoseConfigs(): CapturePoseConfig[] {
  return [
    {
      name: "round-eye-rest",
      minEyeSize: 60,
      maxEyeSize: 60,
      pointerActive: false,
      trackingBlend: 0,
      mouseX: 0,
      mouseY: 0,
    },
    {
      name: "round-eye-track",
      minEyeSize: 60,
      maxEyeSize: 60,
      pointerActive: true,
      trackingBlend: 1,
      mouseX: 8,
      mouseY: 4,
    },
    {
      name: "dense-scene",
      minEyeSize: 10,
      maxEyeSize: 90,
      pointerActive: false,
      trackingBlend: 0,
      mouseX: 0,
      mouseY: 0,
    },
    {
      name: "dense-scene-track",
      minEyeSize: 10,
      maxEyeSize: 90,
      pointerActive: true,
      trackingBlend: 1,
      mouseX: 50,
      mouseY: -30,
    },
  ];
}

export function downloadBase64(base64: string, filename: string): void {
  const link = document.createElement("a");
  link.href = base64;
  link.download = filename;
  link.click();
}

export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
