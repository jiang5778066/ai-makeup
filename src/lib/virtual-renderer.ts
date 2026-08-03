import {
  MAKEUP_LAYER_ORDER,
  type MakeupConfig,
  type MakeupLayer,
  type MakeupPart
} from "./makeup";

export type FaceLandmark = { x: number; y: number; z?: number };
export type MakeupDrawLayer = { part: MakeupPart; layer: MakeupLayer };

const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
  400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
  54, 103, 67, 109
];
const LEFT_EYE = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE = [362, 385, 387, 263, 373, 380];
const LEFT_SHADOW = [33, 246, 161, 160, 159, 158, 157, 173, 133, 153, 145, 144];
const RIGHT_SHADOW = [362, 398, 384, 385, 386, 387, 388, 466, 263, 373, 374, 380];
const LEFT_BROW = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46];
const RIGHT_BROW = [336, 296, 334, 293, 300, 285, 295, 282, 283, 276];
const OUTER_LIPS = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37,
  39, 40, 185
];
const INNER_LIPS = [
  78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82,
  81, 80, 191
];

export function buildMakeupDrawPlan(config: MakeupConfig): MakeupDrawLayer[] {
  return MAKEUP_LAYER_ORDER.flatMap((part) => {
    const layer = config[part];
    return layer?.enabled ? [{ part, layer }] : [];
  });
}

function point(
  landmarks: readonly FaceLandmark[],
  index: number,
  width: number,
  height: number
) {
  const landmark = landmarks[index];
  return landmark ? { x: landmark.x * width, y: landmark.y * height } : null;
}

function addPolygon(
  context: CanvasRenderingContext2D,
  landmarks: readonly FaceLandmark[],
  indices: readonly number[],
  width: number,
  height: number
) {
  indices.forEach((index, position) => {
    const current = point(landmarks, index, width, height);
    if (!current) return;
    if (position === 0) context.moveTo(current.x, current.y);
    else context.lineTo(current.x, current.y);
  });
  context.closePath();
}

function fillRegions(
  context: CanvasRenderingContext2D,
  landmarks: readonly FaceLandmark[],
  regions: readonly (readonly number[])[],
  width: number,
  height: number,
  color: string,
  alpha: number,
  composite: GlobalCompositeOperation = "source-over"
) {
  context.save();
  context.beginPath();
  regions.forEach((region) => addPolygon(context, landmarks, region, width, height));
  context.fillStyle = color;
  context.globalAlpha = alpha;
  context.globalCompositeOperation = composite;
  context.fill();
  context.restore();
}

function strokePath(
  context: CanvasRenderingContext2D,
  landmarks: readonly FaceLandmark[],
  indices: readonly number[],
  width: number,
  height: number,
  color: string,
  alpha: number,
  lineWidth: number
) {
  context.save();
  context.beginPath();
  indices.forEach((index, position) => {
    const current = point(landmarks, index, width, height);
    if (!current) return;
    if (position === 0) context.moveTo(current.x, current.y);
    else context.lineTo(current.x, current.y);
  });
  context.strokeStyle = color;
  context.globalAlpha = alpha;
  context.lineWidth = lineWidth;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.stroke();
  context.restore();
}

function renderFoundation(
  context: CanvasRenderingContext2D,
  landmarks: readonly FaceLandmark[],
  layer: MakeupLayer,
  width: number,
  height: number
) {
  context.save();
  context.beginPath();
  addPolygon(context, landmarks, FACE_OVAL, width, height);
  addPolygon(context, landmarks, LEFT_EYE, width, height);
  addPolygon(context, landmarks, RIGHT_EYE, width, height);
  addPolygon(context, landmarks, OUTER_LIPS, width, height);
  context.fillStyle = layer.color;
  context.globalAlpha = 0.05 + layer.intensity * 0.0012;
  context.globalCompositeOperation = "soft-light";
  context.fill("evenodd");
  context.restore();
}

function renderBlush(
  context: CanvasRenderingContext2D,
  landmarks: readonly FaceLandmark[],
  layer: MakeupLayer,
  width: number,
  height: number
) {
  const faceWidth = Math.abs((point(landmarks, 454, width, height)?.x ?? width) - (point(landmarks, 234, width, height)?.x ?? 0));
  for (const index of [50, 280]) {
    const center = point(landmarks, index, width, height);
    if (!center) continue;
    const radius = Math.max(12, faceWidth * 0.115);
    const gradient = context.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius);
    gradient.addColorStop(0, layer.color);
    gradient.addColorStop(1, "transparent");
    context.save();
    context.globalAlpha = 0.12 + layer.intensity * 0.003;
    context.globalCompositeOperation = "multiply";
    context.fillStyle = gradient;
    context.fillRect(center.x - radius, center.y - radius, radius * 2, radius * 2);
    context.restore();
  }
}

function renderHighlight(
  context: CanvasRenderingContext2D,
  landmarks: readonly FaceLandmark[],
  layer: MakeupLayer,
  width: number,
  height: number
) {
  const lineWidth = Math.max(2, width * 0.006);
  const alpha = 0.12 + layer.intensity * 0.0032;
  strokePath(context, landmarks, [168, 6, 197, 195], width, height, layer.color, alpha, lineWidth);
  strokePath(context, landmarks, [116, 123, 147], width, height, layer.color, alpha, lineWidth * 1.2);
  strokePath(context, landmarks, [345, 352, 376], width, height, layer.color, alpha, lineWidth * 1.2);
}

function renderContour(
  context: CanvasRenderingContext2D,
  landmarks: readonly FaceLandmark[],
  layer: MakeupLayer,
  width: number,
  height: number
) {
  const lineWidth = Math.max(4, width * 0.018);
  const alpha = 0.08 + layer.intensity * 0.0024;
  strokePath(context, landmarks, [234, 93, 132, 58], width, height, layer.color, alpha, lineWidth);
  strokePath(context, landmarks, [454, 323, 361, 288], width, height, layer.color, alpha, lineWidth);
  strokePath(context, landmarks, [127, 162, 21], width, height, layer.color, alpha * 0.7, lineWidth * 0.7);
  strokePath(context, landmarks, [356, 389, 251], width, height, layer.color, alpha * 0.7, lineWidth * 0.7);
}

function renderEyeliner(
  context: CanvasRenderingContext2D,
  landmarks: readonly FaceLandmark[],
  layer: MakeupLayer,
  width: number,
  height: number
) {
  const thickness = Math.max(1.4, width * (0.002 + layer.intensity * 0.000015));
  strokePath(context, landmarks, [33, 160, 158, 133], width, height, layer.color, 0.8, thickness);
  strokePath(context, landmarks, [362, 385, 387, 263], width, height, layer.color, 0.8, thickness);
  if (layer.presetId === "winged") {
    strokePath(context, landmarks, [33, 130], width, height, layer.color, 0.85, thickness);
    strokePath(context, landmarks, [263, 359], width, height, layer.color, 0.85, thickness);
  }
}

function renderMascara(
  context: CanvasRenderingContext2D,
  landmarks: readonly FaceLandmark[],
  layer: MakeupLayer,
  width: number,
  height: number
) {
  const length = Math.max(2, height * (0.004 + layer.intensity * 0.00004));
  context.save();
  context.strokeStyle = layer.color;
  context.globalAlpha = 0.55 + layer.intensity * 0.003;
  context.lineWidth = Math.max(1, width * 0.0015);
  context.lineCap = "round";
  for (const index of [160, 159, 158, 385, 386, 387]) {
    const start = point(landmarks, index, width, height);
    if (!start) continue;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(start.x, start.y - length);
    context.stroke();
  }
  context.restore();
}

function renderLips(
  context: CanvasRenderingContext2D,
  landmarks: readonly FaceLandmark[],
  layer: MakeupLayer,
  width: number,
  height: number
) {
  context.save();
  context.beginPath();
  addPolygon(context, landmarks, OUTER_LIPS, width, height);
  addPolygon(context, landmarks, INNER_LIPS, width, height);
  context.fillStyle = layer.color;
  context.globalAlpha = 0.18 + layer.intensity * 0.0065;
  context.globalCompositeOperation = "multiply";
  context.fill("evenodd");
  context.restore();
}

export function renderMakeup(
  context: CanvasRenderingContext2D,
  landmarks: readonly FaceLandmark[],
  config: MakeupConfig,
  width: number,
  height: number
) {
  for (const { part, layer } of buildMakeupDrawPlan(config)) {
    switch (part) {
      case "foundation":
        renderFoundation(context, landmarks, layer, width, height);
        break;
      case "contour":
        renderContour(context, landmarks, layer, width, height);
        break;
      case "blush":
        renderBlush(context, landmarks, layer, width, height);
        break;
      case "highlight":
        renderHighlight(context, landmarks, layer, width, height);
        break;
      case "eyeshadow":
        fillRegions(context, landmarks, [LEFT_SHADOW, RIGHT_SHADOW], width, height, layer.color, 0.1 + layer.intensity * 0.0045, "multiply");
        break;
      case "eyeliner":
        renderEyeliner(context, landmarks, layer, width, height);
        break;
      case "mascara":
        renderMascara(context, landmarks, layer, width, height);
        break;
      case "brows":
        fillRegions(context, landmarks, [LEFT_BROW, RIGHT_BROW], width, height, layer.color, 0.12 + layer.intensity * 0.005, "multiply");
        break;
      case "lipstick":
        renderLips(context, landmarks, layer, width, height);
        break;
    }
  }
}
