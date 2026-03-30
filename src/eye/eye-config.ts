// Eye configuration constants

import type { FocusEaseName, ClickRepulseEaseName, LayoutShapeName } from "./eye-types";

// Layout constants
export const DEFAULT_PACK_ATTEMPTS = 96;
export const DEFAULT_SPIRAL_STEP_DEGREES = 137.5;
export const DEFAULT_RADIAL_EXPONENT = 0.5;
export const DEFAULT_EYE_SPIRAL_OFFSET = 0.73;
export const DEFAULT_CLUSTER_RADIUS = 200;
export const DEFAULT_LAYOUT_SHAPE: LayoutShapeName = "circle";
export const DEFAULT_LAYOUT_TRANSITION_DURATION = 0.8;
export const DEFAULT_LAYOUT_TRANSITION_EASE: FocusEaseName = "out-cubic";
export const DEFAULT_MIN_EYE_SIZE = 10;
export const DEFAULT_MAX_EYE_SIZE = 90;

// Cat eye constants
export const DEFAULT_CAT_MIX = 0.35;
export const DEFAULT_CAT_MORPH_RADIUS = 120;

// Stagger constants
export const DEFAULT_STAGGER_SECONDS = 0.002;
export const DEFAULT_RANDOMIZE_STAGGER = false;

// Parallax and repulsion constants
export const DEFAULT_PARALLAX_STRENGTH = 12;
export const DEFAULT_REPULSION_RADIUS = 90;
export const DEFAULT_REPULSION_STRENGTH = 1;
export const DEFAULT_REPULSION_RETURN_SPEED = 10;
export const DEFAULT_CLICK_REPULSE_EASE: ClickRepulseEaseName = "out-elastic";

// Look behavior constants
export const DEFAULT_SMALL_EYE_LOOK_SPEED = 16;
export const DEFAULT_LARGE_EYE_LOOK_SPEED = 8;
export const DEFAULT_TRACKING_BLEND_SPEED = 12;
export const DEFAULT_POINTER_EASE_SPEED = 10;

// Shared attention constants
export const DEFAULT_SHARED_ATTENTION_DELAY = 2.4;
export const DEFAULT_SHARED_ATTENTION_RETARGET_MIN_DELAY = 1.6;
export const DEFAULT_SHARED_ATTENTION_RETARGET_MAX_DELAY = 3.2;
export const DEFAULT_SHARED_ATTENTION_BLEND_SPEED = 3.2;

// Scroll fall constants
export const DEFAULT_SCROLL_FALL_BLEND_SPEED = 2.8;

// Appearance constants
export const DEFAULT_SMALL_EYE_APPEARANCE_FPS = 24;
export const DEFAULT_LARGE_EYE_APPEARANCE_FPS = 60;
export const DEFAULT_LOW_DETAIL_SCALE_THRESHOLD = 0.4;

// Click repulse constants
export const DEFAULT_CLICK_REPULSE_RADIUS = 400;
export const DEFAULT_CLICK_REPULSE_STRENGTH = 40;

// Focus constants
export const DEFAULT_FOCUS_MIN_DELAY = 1.4;
export const DEFAULT_FOCUS_MAX_DELAY = 3.8;
export const DEFAULT_FOCUS_UP_DURATION = 0.24;
export const DEFAULT_FOCUS_DOWN_DURATION = 0.38;
export const DEFAULT_FOCUS_SCALE = 1.35;
export const DEFAULT_FOCUS_EASE_UP: FocusEaseName = "out-cubic";
export const DEFAULT_FOCUS_EASE_DOWN: FocusEaseName = "in-out-sine";

// Cat blink constants
export const DEFAULT_CAT_BLINK_MIN_DELAY = 5;
export const DEFAULT_CAT_BLINK_MAX_DELAY = 8;
export const DEFAULT_CAT_BLINK_IN_DURATION = 0.25;
export const DEFAULT_CAT_BLINK_HOLD_DURATION = 0.06;
export const DEFAULT_CAT_BLINK_OUT_DURATION = 0.25;
export const DEFAULT_CAT_BLINK_SIDE_DELAY = 0.1;
export const DEFAULT_CAT_BLINK_EASE_IN: FocusEaseName = "out-cubic";
export const DEFAULT_CAT_BLINK_EASE_OUT: FocusEaseName = "in-out-sine";
export const DEFAULT_CAT_BLINK_SIDE_COLOR = 0x000000;
export const DEFAULT_CAT_BLINK_BOTTOM_COLOR = 0x111113;
export const DEFAULT_CAT_BLINK_SIDE_OPACITY = 1;
export const DEFAULT_CAT_BLINK_BOTTOM_OPACITY = 0.66;
export const DEFAULT_CAT_BLINK_SIDE_STROKE_COLOR = 0x66dc1a;
export const DEFAULT_CAT_BLINK_BOTTOM_STROKE_COLOR = 0x66dc1a;
export const DEFAULT_CAT_BLINK_SIDE_STROKE_OPACITY = 0.6;
export const DEFAULT_CAT_BLINK_BOTTOM_STROKE_OPACITY = 0.26;
export const DEFAULT_CAT_BLINK_SIDE_STROKE_WIDTH = 4;
export const DEFAULT_CAT_BLINK_BOTTOM_STROKE_WIDTH = 2;

// Shadow constants
export const DEFAULT_SHADOW_OPACITY = 0.4;
export const DEFAULT_DROP_SHADOW_COLOR = 0x4a4545;
export const DEFAULT_DROP_SHADOW_OPACITY = 0.4;
export const DEFAULT_DROP_SHADOW_BLUR = 1.2;
export const DEFAULT_DROP_SHADOW_SPREAD = 0.7;
export const DEFAULT_ROUND_INNER_SHADOW_COLOR = 0xa8abad;
export const DEFAULT_CAT_INNER_SHADOW_COLOR = 0x3d8a0a;

// Translation constants
export const DEFAULT_ROUND_TRANSLATE_STRENGTH = 0.9;
export const DEFAULT_CAT_TRANSLATE_STRENGTH = 0.75;

// Round highlight constants
export const DEFAULT_ROUND_GLOBE_HIGHLIGHT_SCALE = 0.45;
export const DEFAULT_ROUND_GLOBE_HIGHLIGHT_OFFSET_X = 10;
export const DEFAULT_ROUND_GLOBE_HIGHLIGHT_OFFSET_Y = -12.5;
export const DEFAULT_ROUND_GLOBE_HIGHLIGHT_ROTATION_DEGREES = 41.25;
export const DEFAULT_ROUND_GLOBE_HIGHLIGHT_OPACITY = 0.7;

// Cat highlight constants
export const DEFAULT_CAT_GLOBE_HIGHLIGHT_ROTATION_DEGREES = 34;
export const DEFAULT_CAT_GLOBE_HIGHLIGHT_SCALE = 0.47;
export const DEFAULT_CAT_GLOBE_HIGHLIGHT_OFFSET_X_FACTOR = 0.37;
export const DEFAULT_CAT_GLOBE_HIGHLIGHT_OFFSET_Y_FACTOR = -0.62;
export const DEFAULT_CAT_GLOBE_HIGHLIGHT_OPACITY = 0.7;
export const DEFAULT_CAT_PUPIL_HIGHLIGHT_MORPH_SCALE = 4;
