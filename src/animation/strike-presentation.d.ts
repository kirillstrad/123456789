export function strikeProgress(progress: number, contact: number): number;

export function blendEntry<Pose, Rig>(
  module: {
    sample(clip: 'breath', progress: number, time: number): Pose;
    rig(pose: Pose): Rig;
  },
  sampled: { pose: Pose; rig: Rig },
  progress: number,
  time: number,
): { pose: Pose; rig: Rig };
