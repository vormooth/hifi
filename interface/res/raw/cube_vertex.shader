/*
 * Copyright 2017 Google Inc. All Rights Reserved.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

uniform mat4 u_Model;
uniform mat4 u_MVP;
uniform mat4 u_MVMatrix;

attribute vec2 a_TexCoordinate; // Per-vertex texture coordinate information we will pass in.
attribute vec4 a_Position;
attribute vec4 a_Color;

varying vec4 v_Color;
varying vec2 v_TexCoordinate;


void main() {
//   v_Color = vec4(1.0, 0.0, 0.0, 1.0);

   gl_Position = u_MVP * u_MVMatrix * a_Position;
   v_TexCoordinate = a_TexCoordinate;
}
