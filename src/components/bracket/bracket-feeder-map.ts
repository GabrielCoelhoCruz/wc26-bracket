/** Maps each knockout match to its feeder matches (winners advance into target). */
export const BRACKET_FEEDER_MAP: Record<string, string[]> = {
  "r16-1": ["r32-1", "r32-2"],
  "r16-2": ["r32-3", "r32-4"],
  "r16-3": ["r32-5", "r32-6"],
  "r16-4": ["r32-7", "r32-8"],
  "r16-5": ["r32-9", "r32-10"],
  "r16-6": ["r32-11", "r32-12"],
  "r16-7": ["r32-13", "r32-14"],
  "r16-8": ["r32-15", "r32-16"],
  "qf-1": ["r16-1", "r16-2"],
  "qf-2": ["r16-3", "r16-4"],
  "qf-3": ["r16-5", "r16-6"],
  "qf-4": ["r16-7", "r16-8"],
  "sf-1": ["qf-1", "qf-2"],
  "sf-2": ["qf-3", "qf-4"],
  final: ["sf-1", "sf-2"],
  "third-place": ["sf-1", "sf-2"],
}
