// ---------------------------------------------------------------------------
// WC26 – Draft Formations
// ---------------------------------------------------------------------------

import type { Player } from "@/types/wc26";

export type FormationId = "4-3-3" | "4-4-2" | "3-5-2" | "4-2-3-1";

export interface FormationDef {
  id: FormationId;
  label: string;
  description: string;
  slots: readonly Player["position"][];
}

export interface PitchSlot {
  position: Player["position"];
  row: number;
  col: number;
}

/** Absolute pitch coords (%) in formation slot order — matches draft rounds */
export interface PitchCoord {
  position: Player["position"];
  x: number;
  y: number;
}

/** 7a0 equilibrado coordinates, one entry per `FORMATIONS[id].slots` index */
export const PITCH_COORDS: Record<FormationId, PitchCoord[]> = {
  "4-3-3": [
    { position: "GK", x: 50, y: 90 },
    { position: "RB", x: 80, y: 74 },
    { position: "CB", x: 63, y: 76 },
    { position: "CB", x: 37, y: 76 },
    { position: "LB", x: 20, y: 74 },
    { position: "DM", x: 50, y: 60 },
    { position: "CM", x: 65, y: 50 },
    { position: "CM", x: 35, y: 50 },
    { position: "RW", x: 82, y: 22 },
    { position: "ST", x: 50, y: 17 },
    { position: "LW", x: 18, y: 22 },
  ],
  "4-4-2": [
    { position: "GK", x: 50, y: 90 },
    { position: "RB", x: 82, y: 75 },
    { position: "CB", x: 63, y: 77 },
    { position: "CB", x: 37, y: 77 },
    { position: "LB", x: 18, y: 75 },
    { position: "DM", x: 50, y: 58 },
    { position: "CM", x: 40, y: 53 },
    { position: "RW", x: 80, y: 57 },
    { position: "LW", x: 20, y: 57 },
    { position: "ST", x: 40, y: 20 },
    { position: "ST", x: 60, y: 20 },
  ],
  "3-5-2": [
    { position: "GK", x: 50, y: 90 },
    { position: "CB", x: 68, y: 77 },
    { position: "CB", x: 50, y: 78 },
    { position: "CB", x: 32, y: 77 },
    { position: "LB", x: 10, y: 48 },
    { position: "RB", x: 90, y: 48 },
    { position: "DM", x: 50, y: 53 },
    { position: "CM", x: 35, y: 58 },
    { position: "CM", x: 65, y: 58 },
    { position: "ST", x: 38, y: 22 },
    { position: "ST", x: 62, y: 22 },
  ],
  "4-2-3-1": [
    { position: "GK", x: 50, y: 90 },
    { position: "RB", x: 82, y: 75 },
    { position: "CB", x: 63, y: 77 },
    { position: "CB", x: 37, y: 77 },
    { position: "LB", x: 18, y: 75 },
    { position: "DM", x: 38, y: 60 },
    { position: "DM", x: 62, y: 60 },
    { position: "RW", x: 82, y: 45 },
    { position: "AM", x: 50, y: 43 },
    { position: "LW", x: 18, y: 45 },
    { position: "ST", x: 50, y: 22 },
  ],
};

export const FORMATIONS: Record<FormationId, FormationDef> = {
  "4-3-3": {
    id: "4-3-3",
    label: "4-3-3",
    description: "Ataque com pontas abertos",
    slots: ["GK", "RB", "CB", "CB", "LB", "DM", "CM", "CM", "RW", "ST", "LW"],
  },
  "4-4-2": {
    id: "4-4-2",
    label: "4-4-2",
    description: "Dois atacantes e meio equilibrado",
    slots: ["GK", "RB", "CB", "CB", "LB", "DM", "CM", "RW", "LW", "ST", "ST"],
  },
  "3-5-2": {
    id: "3-5-2",
    label: "3-5-2",
    description: "Três zagueiros e alas ofensivas",
    slots: ["GK", "CB", "CB", "CB", "LB", "RB", "DM", "CM", "CM", "ST", "ST"],
  },
  "4-2-3-1": {
    id: "4-2-3-1",
    label: "4-2-3-1",
    description: "Meia armador e dois volantes",
    slots: ["GK", "RB", "CB", "CB", "LB", "DM", "DM", "RW", "AM", "LW", "ST"],
  },
};

export const FORMATION_LIST = Object.values(FORMATIONS);

/** Visual pitch layout per formation (row 0 = GK, row 3 = attack) */
export const PITCH_LAYOUTS: Record<FormationId, PitchSlot[]> = {
  "4-3-3": [
    { position: "GK", row: 0, col: 2 },
    { position: "LB", row: 1, col: 0 },
    { position: "CB", row: 1, col: 1 },
    { position: "CB", row: 1, col: 2 },
    { position: "RB", row: 1, col: 3 },
    { position: "CM", row: 2, col: 0 },
    { position: "DM", row: 2, col: 1 },
    { position: "CM", row: 2, col: 2 },
    { position: "LW", row: 3, col: 0 },
    { position: "ST", row: 3, col: 1 },
    { position: "RW", row: 3, col: 2 },
  ],
  "4-4-2": [
    { position: "GK", row: 0, col: 2 },
    { position: "LB", row: 1, col: 0 },
    { position: "CB", row: 1, col: 1 },
    { position: "CB", row: 1, col: 2 },
    { position: "RB", row: 1, col: 3 },
    { position: "LW", row: 2, col: 0 },
    { position: "CM", row: 2, col: 1 },
    { position: "DM", row: 2, col: 2 },
    { position: "RW", row: 2, col: 3 },
    { position: "ST", row: 3, col: 1 },
    { position: "ST", row: 3, col: 2 },
  ],
  "3-5-2": [
    { position: "GK", row: 0, col: 2 },
    { position: "CB", row: 1, col: 0 },
    { position: "CB", row: 1, col: 1 },
    { position: "CB", row: 1, col: 2 },
    { position: "LB", row: 2, col: 0 },
    { position: "DM", row: 2, col: 1 },
    { position: "CM", row: 2, col: 2 },
    { position: "CM", row: 2, col: 3 },
    { position: "RB", row: 2, col: 4 },
    { position: "ST", row: 3, col: 1 },
    { position: "ST", row: 3, col: 2 },
  ],
  "4-2-3-1": [
    { position: "GK", row: 0, col: 2 },
    { position: "LB", row: 1, col: 0 },
    { position: "CB", row: 1, col: 1 },
    { position: "CB", row: 1, col: 2 },
    { position: "RB", row: 1, col: 3 },
    { position: "DM", row: 2, col: 1 },
    { position: "DM", row: 2, col: 2 },
    { position: "LW", row: 3, col: 0 },
    { position: "AM", row: 3, col: 1 },
    { position: "RW", row: 3, col: 2 },
    { position: "ST", row: 3, col: 3 },
  ],
};

export function getFormationSlots(formation: FormationId): readonly Player["position"][] {
  return FORMATIONS[formation].slots;
}

export function getFormationLabel(formation: FormationId): string {
  return FORMATIONS[formation].label;
}
