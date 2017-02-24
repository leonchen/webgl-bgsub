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

var container = document.getElementById("result");
var scene = new THREE.Scene();

var axisHelper = new THREE.AxisHelper(250);
scene.add(axisHelper);

var geometry = new THREE.PlaneBufferGeometry(94, 50);
var material = new THREE.MeshBasicMaterial({color: "#ffff00", transparent: true});
material.opacity = 0.4;
var mesh = new THREE.Mesh(geometry, material);
mesh.rotation.x = -Math.PI/2;
scene.add(mesh);


var camera = new THREE.PerspectiveCamera(16, 4/3, 1, 1000);
var cp = CAM_CAL.cam_position;
camera.position.set(cp[0], cp[1], cp[2]);

var cr = CAM_CAL.cam_rotation;
camera.rotation.set(cr[0], cr[1], cr[2], 'ZYX');

var cd = CAM_CAL.cam_dimensions;
var cpp = CAM_CAL.cam_principal_point;

var w = cd[0];
var h = cd[1];
camera.setViewOffset(w, h, w/2 - cpp[0], h/2 - cpp[1], w, h);

scene.add(camera);

var circleG = new THREE.CircleGeometry(2, 32);
var circleM = new THREE.MeshBasicMaterial({ color: "#00ff00", transparent: true});
circleM.opacity = 0.5;
var cmesh = new THREE.Mesh(circleG, circleM);
cmesh.rotation.x = -Math.PI/2;
cmesh.position.y = 0.01;
cmesh.position.x = -40;
cmesh.position.z = 10;
scene.add(cmesh);


var renderer = new THREE.WebGLRenderer();
renderer.setSize(800, 600);
container.appendChild(renderer.domElement);

renderer.clear();
renderer.render(scene, camera);
