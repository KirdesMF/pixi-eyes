// Eye configuration and constants

import type {
  EyeFieldConfig,
  LayoutShapeName,
  FocusEaseName,
} from "./eye-types";

export type { EyeFieldConfig };

// Layout constants
export const DEFAULT_PACK_ATTEMPTS = 96;
export const DEFAULT_SPIRAL_STEP_DEGREES = 137.5;
export const DEFAULT_RADIAL_EXPONENT = 0.5;
export const DEFAULT_EYE_SPIRAL_OFFSET = 0.73;
export const DEFAULT_CLUSTER_RADIUS = 200;
export const DEFAULT_LAYOUT_SHAPE: LayoutShapeName = "circle";
export const DEFAULT_LAYOUT_TRANSITION_DURATION = 0.5;
export const DEFAULT_LAYOUT_TRANSITION_EASE: FocusEaseName = "linear";
export const DEFAULT_MIN_EYE_SIZE = 10;
export const DEFAULT_MAX_EYE_SIZE = 50;
export const DEFAULT_LAYOUT_JITTER = 1; // 100% organic disorder
export const DEFAULT_STAGGER_SECONDS = 0.005;
export const DEFAULT_RANDOMIZE_STAGGER = false;

// Scale in constants
export const SCALE_IN_DURATION = 0.28;

// Parallax and repulsion constants
export const DEFAULT_PARALLAX_STRENGTH = 12;
export const DEFAULT_REPULSION_RADIUS = 80;
export const DEFAULT_REPULSION_STRENGTH = 1;
export const DEFAULT_REPULSION_PUSH_SPEED = 10;
export const DEFAULT_REPULSION_RETURN_SPEED = 1.5;
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
export const SCROLL_FALL_DELAY_MAX = 0.46;
export const SCROLL_FALL_BOTTOM_PADDING = 1;
export const SCROLL_FALL_GRAVITY = 2600;
export const SCROLL_FALL_INITIAL_DRIFT = 84;
export const SCROLL_FALL_INITIAL_SPIN_DEGREES = 110;
export const SCROLL_FALL_AIR_DAMPING = 1.9;
export const SCROLL_FALL_SMALL_EYE_BOUNCE_RESTITUTION = 0.56;
export const SCROLL_FALL_LARGE_EYE_BOUNCE_RESTITUTION = 0.18;
export const SCROLL_FALL_SMALL_EYE_BOUNCE_CUTOFF = 52;
export const SCROLL_FALL_LARGE_EYE_BOUNCE_CUTOFF = 168;
export const SCROLL_FALL_GROUND_DAMPING = 10;
export const SCROLL_FALL_RETURN_POSITION_SPEED = 7.4;
export const SCROLL_FALL_RETURN_ROTATION_SPEED = 9.2;
export const SCROLL_FALL_RETURN_VELOCITY_SPEED = 6.2;
export const SCROLL_FALL_RETURN_DELAY_MAX = 0.24;
export const SCROLL_FALL_SQUASH_MAX = 0.22;
export const SCROLL_FALL_STRETCH_MAX = 0.12;
export const SCROLL_FALL_SQUASH_IMPACT_SPEED = 900;
export const SCROLL_FALL_SQUASH_RETURN_SPEED = 12;
export const DEFAULT_SCROLL_FALL_EXIT_TOP_FACTOR = 0.18;
export const DEFAULT_SCROLL_FALL_ENTER_TOP_FACTOR = 0.02;

// Appearance constants
export const DEFAULT_LOW_DETAIL_SCALE_THRESHOLD = 0.4;
export const DEFAULT_CLICK_REPULSE_RADIUS = 0; // Disabled
export const DEFAULT_CLICK_REPULSE_STRENGTH = 0; // Disabled

// Shadow and appearance constants
export const DEFAULT_SHADOW_OPACITY = 0.4;
export const DEFAULT_DROP_SHADOW_COLOR = 0x4a4545;
export const DEFAULT_DROP_SHADOW_OPACITY = 0.4;
export const DEFAULT_DROP_SHADOW_BLUR = 1.2;
export const DEFAULT_DROP_SHADOW_SPREAD = 0.7;
export const DEFAULT_ROUND_INNER_SHADOW_COLOR = 0xa8abad;
export const DEFAULT_IRIS_COLOR = 0x808080; // Gray iris
export const DEFAULT_MOUSE_IRIS_COLOR = 0xff6b6b; // Coral red when mouse is close
export const DEFAULT_MOUSE_IRIS_RADIUS = 100; // Radius of mouse proximity effect (px)
export const DEFAULT_MOUSE_IRIS_BLEND = 0.5; // Blend factor for smooth transition
export const DEFAULT_EYE_SHAPE_COLOR = 0xffffff;
export const DEFAULT_BACKGROUND_COLOR = 0xffffff;
export const DEFAULT_ROUND_TRANSLATE_STRENGTH = 1;
export const DEFAULT_ROUND_GLOBE_HIGHLIGHT_SCALE = 0.5;
export const DEFAULT_ROUND_GLOBE_HIGHLIGHT_OFFSET_X = 10;
export const DEFAULT_ROUND_GLOBE_HIGHLIGHT_OFFSET_Y = -12.5;
export const DEFAULT_ROUND_GLOBE_HIGHLIGHT_ROTATION_DEGREES = 40;
export const DEFAULT_ROUND_GLOBE_HIGHLIGHT_OPACITY = 0.4;
export const DEFAULT_ROUND_GLOBE_HIGHLIGHT_COLOR = 0xffffff;
export const HIGHLIGHT_ELLIPSE_RX = 12.5; // Ellipse semi-major axis (X)
export const HIGHLIGHT_ELLIPSE_RY = 7.64; // Ellipse semi-minor axis (Y)

// Eye geometry constants
export const SCLERA_RADIUS = 24;
export const IRIS_RADIUS = 16;
export const PUPIL_RADIUS = 11;
export const MAX_LOOK = 12;
export const PUPIL_CLIP_MARGIN = 0.2;
export const MAX_SQUASH = 0.2;
export const SQUEEZE_SPEED = 12;
export const PUPIL_INNER_TRAVEL = 6.5;
export const CIRCLE_KAPPA = 0.5522847498307936;

// Micro-saccade constants for natural eye movement
export const MICRO_SACCADE_AMPLITUDE = 0.15;
export const MICRO_SACCADE_FREQUENCY = 0.8;
export const MICRO_SACCADE_DURATION = 0.08;

// Re-export from eye-assets for convenience
export {
  HIGHLIGHT_RADIUS,
} from "./eye-assets";
