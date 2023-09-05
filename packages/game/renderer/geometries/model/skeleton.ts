import { mat4, quat, vec3 } from "gl-matrix";
import { gizmos } from "../../materials/gizmos";

export const N_ENTITY = 1;

export const N_BONES = 1 + 3 + 2 + 2 * 4;

export const bonesMatrices = new Float32Array(16 * N_BONES * N_ENTITY);

export const bindPose: mat4[] = [];

const bindPoseInv: mat4[] = [];

const a = vec3.create();
const q = quat.create();
const m = mat4.create();

const createSkeleton = (_: unknown, i: number) => {
  const origin = [0, 0.6, 0] as vec3;

  const direction = quat.create();

  const tail_direction = quat.create();
  const head_direction = quat.create();

  const feet = [0, 0, 0, 0];

  const bones = Array.from({ length: N_BONES }, mat4.create);

  const ms = bones.map(
    (_, j) =>
      new Float32Array(bonesMatrices.buffer, (i * N_BONES + j) * 16 * 4, 16)
  );

  const update = () => {
    const [
      main,
      tail1,
      tail2,
      tail3,
      head1,
      head2,
      leg0,
      foot0,
      leg1,
      foot1,
      leg2,
      foot2,
      leg3,
      foot3,
    ] = bones;

    // main
    mat4.fromRotationTranslation(main, direction, origin);

    // // tail
    vec3.set(a, -0.3, -0.02, 0);
    mat4.fromTranslation(tail1, a);
    mat4.fromQuat(m, tail_direction);
    mat4.multiply(tail1, tail1, m);
    mat4.multiply(tail1, tail1, main);

    vec3.set(a, -0.3, -0.1, 0);
    mat4.fromRotationTranslation(tail2, tail_direction, a);
    mat4.multiply(tail2, tail2, tail1);

    vec3.set(a, -0.34, -0.05, 0);
    mat4.fromRotationTranslation(tail3, tail_direction, a);
    mat4.multiply(tail3, tail3, tail2);

    // head
    vec3.set(a, 0.43, -0.04, 0);
    mat4.fromRotationTranslation(head1, head_direction, a);
    mat4.multiply(head1, head1, main);

    vec3.set(a, 0.4, -0.14, 0);
    mat4.fromRotationTranslation(head2, head_direction, a);
    mat4.multiply(head2, head2, head1);

    // feet

    // 0
    vec3.set(a, -0.12, -0.18, 0.2);
    quat.fromEuler(q, 0, feet[0] * 13, feet[0] * 20);
    vec3.transformQuat(a, a, q);
    mat4.fromRotationTranslation(leg0, q, a);
    mat4.multiply(leg0, head1, leg0);

    vec3.set(a, 0.05, -0.34, 0.02);
    quat.fromEuler(q, 0, 0, feet[0] * 45);
    vec3.transformQuat(a, a, q);
    quat.fromEuler(q, 0, 0, feet[0] * 40);
    mat4.fromRotationTranslation(foot0, q, a);
    mat4.multiply(foot0, leg0, foot0);

    // 1
    vec3.set(a, -0.12, -0.18, -0.2);
    quat.fromEuler(q, 0, feet[1] * 13, feet[1] * 20);
    vec3.transformQuat(a, a, q);
    mat4.fromRotationTranslation(leg1, q, a);
    mat4.multiply(leg1, head1, leg1);

    vec3.set(a, 0.05, -0.34, -0.02);
    quat.fromEuler(q, 0, 0, feet[1] * 45);
    vec3.transformQuat(a, a, q);
    quat.fromEuler(q, 0, 0, feet[1] * 40);
    mat4.fromRotationTranslation(foot1, q, a);
    mat4.multiply(foot1, leg1, foot1);

    // 2
    vec3.set(a, 0, 0, 0.2);
    quat.fromEuler(q, 0, feet[2] * 13, feet[2] * 23);
    vec3.transformQuat(a, a, q);
    a[0] += 0.06;
    a[1] -= 0.2;
    mat4.fromRotationTranslation(leg2, q, a);
    mat4.multiply(leg2, tail1, leg2);

    vec3.set(a, -0.02, -0.38, 0.06);
    quat.fromEuler(q, 0, 0, feet[2] * 40);
    vec3.transformQuat(a, a, q);
    quat.fromEuler(q, 0, 0, feet[2] * 35);
    mat4.fromRotationTranslation(foot2, q, a);
    mat4.multiply(foot2, leg2, foot2);

    // // 3
    vec3.set(a, 0, 0, -0.2);
    quat.fromEuler(q, 0, feet[3] * 13, feet[3] * 23);
    vec3.transformQuat(a, a, q);
    a[0] += 0.06;
    a[1] -= 0.2;
    mat4.fromRotationTranslation(leg3, q, a);
    mat4.multiply(leg3, tail1, leg3);

    vec3.set(a, -0.02, -0.38, -0.07);
    quat.fromEuler(q, 0, 0, feet[3] * 40);
    vec3.transformQuat(a, a, q);
    quat.fromEuler(q, 0, 0, feet[3] * 35);
    mat4.fromRotationTranslation(foot3, q, a);
    mat4.multiply(foot3, leg3, foot3);

    //
    //
    //

    if (bindPose.length === 0) {
      gizmos.push(...bones);

      for (let i = 0; i < bones.length; i++) {
        bindPoseInv.push(mat4.invert(mat4.create(), bones[i]));
        bindPose.push(mat4.copy(mat4.create(), bones[i]));
      }
    }

    for (let i = 0; i < bones.length; i++)
      mat4.multiply(ms[i], bones[i], bindPoseInv[i]);
  };

  return { update, origin, direction, tail_direction, head_direction, feet };
};

export const entities = Array.from({ length: N_ENTITY }, createSkeleton);

export const update = () => {
  for (const { update } of entities) update();
};

entities[0].update();
