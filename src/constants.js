// Site content
export const TITLE = "ben duong";
export const SUBTITLE = "sde @ prime air";

// Koi settings
export const KOI_COLORS = ["#E02D28", "#FFB990", "#0093B2"];
export const KOI_COUNT = 9;

// Canvas settings
export const SHADOW_COLOR = "rgba(0,0,0,0.05)";
export const BACKGROUND_COLOR = 230;
export const CANVAS_HEIGHT_RATIO = 0.55;

// Flock parameters
export class FlockParams {
  constructor() {
    this.maxForce = 0.08;
    this.maxSpeed = 3.5;
    this.perceptionRadius = 130;
    this.alignAmp = 1;
    this.cohesionAmp = 1;
    this.separationAmp = 1;
  }
}
