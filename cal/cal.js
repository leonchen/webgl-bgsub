var CAM_CAL = {
  "cam_dimensions": [
      1600,
      1200
    ],
  "name": "camera",
  "cam_distortion": 0.936879,
  "cam_fovy": 16.0587,
  "cam_principal_point": [
      831.911,
      626.541
    ],
  "cam_position": [
      -83.3178,
      110.205,
      -112.903
    ],
  "cam_rotation": [
      2.31381,
      -0.226268,
      -2.85012
    ]
};

var vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

var fragmentShader = `
varying vec2 vUv;
uniform sampler2D bg;

void main() {
  vec4 bc = texture2D(bg, vUv);
  gl_FragColor = vec4(bc.rgb, 1.0);
}
`;

var container = document.getElementById("result");

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(16, 4/3, 1, 5000);
camera.position.z = 4482;

// var camera = new THREE.PerspectiveCamera(CAM_CAL.cam_fovy, 4/3, 0.1, 5000);
// var camP = CAM_CAL.cam_position;
// camera.position.set([-camP[0], -camP[1], -camP[2]]);
// var camR = CAM_CAL.cam_rotation;
// camera.rotation.x = camR[0];
// camera.rotation.y = camR[1];
// camera.rotation.z = camR[2];
// var camPP = CAM_CAL.cam_principal_point;
// camera.lookAt(camPP);

scene.add(camera);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(1600, 1200);

var courtTexture;
new THREE.TextureLoader().load('./bg.png', function (texture) {
  courtTexture = texture;
  courtTexture.minFilter = THREE.LinearFilter;
  courtTexture.magFilter = THREE.LinearFilter;
  run();
});

function run() {
  var meshed = mesh();
  scene.add(meshed);

  container.appendChild(renderer.domElement);
  render();
}

function mesh() {
  var m = new THREE.ShaderMaterial({
    uniforms: {
      bg: {
        value: courtTexture
      }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });


  var geometry = new THREE.PlaneBufferGeometry(1600, 1200);
  var meshed = new THREE.Mesh(geometry, m);
  return meshed;
}

function render() {
  renderer.clear();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
