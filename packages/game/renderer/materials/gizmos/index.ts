import { gl } from "../../canvas";
import { worldMatrix } from "../../../entities/camera";
import { createProgram } from "../../utils/program";
import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";
import { mat4, vec3 } from "gl-matrix";

const program = createProgram(gl, codeVert, codeFrag);

//
// uniforms
//
const u_matrix = gl.getUniformLocation(program, "u_matrix");

//
// attributes
//

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

//
// position
//

var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const a_position = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

//
// color
//
var colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
const a_color = gl.getAttribLocation(program, "a_color");
gl.enableVertexAttribArray(a_color);
gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0);

gl.bindVertexArray(null);

//
//

const lll = 1;

const kernel = [
  [0.0, lll, 0.0],
  [0.0, 0.0, lll],
  [0.0, 0.0, 0.0],

  [0.0, lll, 0.0],
  [lll, 0.0, 0.0],
  [0.0, 0.0, 0.0],

  [0.0, 0.0, lll],
  [lll, 0.0, 0.0],
  [0.0, 0.0, 0.0],
] as vec3[];

const c = [
  [0.9, 0.1, 0.0],
  [0.0, 0.9, 0.1],
  [0.0, 0.1, 0.9],
];
const kernel_colors = [c[0], c[0], c[0], c[1], c[1], c[1], c[2], c[2], c[2]];

//
//

export const draw = () => {
  gl.useProgram(program);

  gl.bindVertexArray(vao);

  gl.uniformMatrix4fv(u_matrix, false, worldMatrix);

  gl.disable(gl.CULL_FACE);

  const positions = [];
  const colors = [];

  const a = [0, 0, 0] as vec3;
  for (const m of gizmos) {
    for (let i = 0; i < kernel.length; i++) {
      vec3.transformMat4(a, kernel[i], m);
      positions.push(...a);
      colors.push(...kernel_colors[i]);
    }
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);

  gl.drawArrays(gl.TRIANGLES, 0, positions.length);

  gl.bindVertexArray(null);
};

/**
 * add mat4 in this array to display gizmo at the position
 */
export const gizmos: mat4[] = [];