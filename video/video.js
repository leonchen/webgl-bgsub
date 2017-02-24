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

var bgScene = new THREE.Scene();
var bgCamera = new THREE.PerspectiveCamera(75, 4/3, 1, 1000);
bgCamera.position.z = 782;
bgScene.add(bgCamera);

var pScene = new THREE.Scene();
var pCamera = new THREE.PerspectiveCamera(75, 4/3, 1, 1000);
pCamera.position.z = 782;
pScene.add(pCamera);

var renderer = new THREE.WebGLRenderer();
renderer.autoClear = false;
renderer.setSize(1600, 1200);

var bgTexture;
var bgLoaded = false;
var sampleTexture;
var sampleLoaded = false;
var frames;
var framesLoaded = false;
var front;
var fontLoaded = false;
var playerCircles = [];

new THREE.TextureLoader().load('../static/bg.png', function (texture) {
  bgTexture = texture;
  bgTexture.minFilter = THREE.LinearFilter;
  bgTexture.magFilter = THREE.LinearFilter;
  bgLoaded = true;
  run();
});

new THREE.FileLoader().load('../static/frames.json', function (data) {
  frames = JSON.parse(data);
  framesLoaded = true;
  run();
});

new THREE.FontLoader().load('../static/fonts/gentilis_regular.typeface.json', function (data) {
  font = data;
  fontLoaded = true;
  run();
})

var video = document.getElementById("video");
var sampleTexture = new THREE.VideoTexture(video);
sampleTexture.minFilter = THREE.NearestFilter;
sampleTexture.magFilter = THREE.NearestFilter;
sampleLoaded = true;

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
uniform sampler2D sp;

void main() {
  float threshold = 0.3;
  vec4 sc = texture2D(sp, vUv);
  vec4 bc = texture2D(bg, vUv);
  vec4 diff = abs(sc - bc);

  if (diff.x + diff.y + diff.z >= threshold) {
    gl_FragColor = vec4(sc.rgb, 1.0);
  } else {
    discard;
  }
}
`;

function run() {
  if (!bgLoaded || !sampleLoaded || !framesLoaded || !fontLoaded) return;

  var meshedCourt = meshCourt();
  bgScene.add(meshedCourt);

  createPlayerCricles();

  var meshedPlayers = meshPlayers();
  pScene.add(meshedPlayers);

  container.appendChild(renderer.domElement);
  render();
}

function meshCourt() {
  var m = new THREE.MeshBasicMaterial({map: bgTexture});
  var geometry = new THREE.PlaneBufferGeometry(1600, 1200);
  var meshed = new THREE.Mesh(geometry, m);
  return meshed;
}

function meshPlayers() {
  var m = new THREE.ShaderMaterial({
    uniforms: {
      bg: {
        value: bgTexture
      },
      sp: {
        value: sampleTexture
      }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });

  var geometry = new THREE.PlaneBufferGeometry(1600, 1200);
  var meshed = new THREE.Mesh(geometry, m);
  return meshed;
}

function createPlayerCricles() {
  for (var p of frames.players) {
    var gp = new THREE.Group();

    // circle
    var g = new THREE.CircleGeometry(2, 32);
    var color = p.team === "away" ? "#0000ff" : "#ff0000";
    var m = new THREE.MeshBasicMaterial({ color: color, transparent: true});
    m.opacity = 0.5;
    var mg = new THREE.Mesh(g, m);
    mg.rotation.x = -Math.PI/2;

    var j = new THREE.TextGeometry(p.jersey_number, { font: font, size: 1, height: 0.1 });
    var jg = new THREE.Mesh(j, m);
    jg.position.set(-2, 0, 1);
    jg.rotation.y = -Math.PI;

    gp.add(mg);
    gp.add(jg);
    playerCircles.push(gp);

    scene.add(gp);
  }
}

function render() {
  renderer.clear();
  renderer.render(bgScene, bgCamera);

  var frameIdx = parseInt(video.currentTime * 25, 10);
  for (var idx in playerCircles) {
    var frame = frames.players[idx].frames[frameIdx]
    if (frame) {
      playerCircles[idx].position.x = frame.position[0];
      playerCircles[idx].position.y = frame.position[1];
    }
  }
  renderer.render(scene, camera);

  renderer.clearDepth();
  renderer.render(pScene, pCamera);

  requestAnimationFrame(render);
}
