var container = document.getElementById("result");

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, 4/3, 1, 1000);
camera.position.z = 782;

scene.add(camera);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(1600, 1200);

var bgTexture;
var bgLoaded = false;
var sampleTexture;
var sampleLoaded = false;

new THREE.TextureLoader().load('../static/bg.png', function (texture) {
  bgTexture = texture;
  bgTexture.minFilter = THREE.LinearFilter;
  bgTexture.magFilter = THREE.LinearFilter;
  bgLoaded = true;
  run();
});
// new THREE.TextureLoader().load('../static/sample.png', function (texture) {
//   sampleTexture = texture;
//   sampleTexture.minFilter = THREE.NearestFilter;
//   sampleTexture.magFilter = THREE.NearestFilter;
//   sampleLoaded = true;
//   run();
// });
//

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
  float threshold = 0.25;
  vec4 sc = texture2D(sp, vUv);
  vec4 bc = texture2D(bg, vUv);
  vec4 diff = abs(sc - bc);

  if (diff.x >= threshold || diff.y >= threshold || diff.z >= threshold) {
    gl_FragColor = vec4(sc.rgb, 1.0);
  } else {
    gl_FragColor = vec4(bc.rgb, 1.0);
  }
}
`;


function run() {
  if (!bgLoaded || !sampleLoaded) return;

  var meshed = mesh();
  scene.add(meshed);

  container.appendChild(renderer.domElement);
  render();
}

function mesh() {
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
    transparent: true,
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
