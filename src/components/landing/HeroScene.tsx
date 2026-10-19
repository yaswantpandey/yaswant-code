import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Ashima Arts 3D simplex noise (MIT) — drives the organic core displacement
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

const coreVertex = /* glsl */ `
uniform float uTime;
uniform float uPointer;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
${NOISE_GLSL}
void main(){
  float n = snoise(normal * 1.4 + uTime * 0.35);
  float n2 = snoise(normal * 3.2 - uTime * 0.2) * 0.35;
  float d = (n + n2) * (0.22 + uPointer * 0.12);
  vNoise = n;
  vec3 displaced = position + normal * d;
  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const coreFragment = /* glsl */ `
uniform vec3 uSand;
uniform vec3 uMint;
uniform vec3 uAmber;
uniform vec3 uDeep;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
void main(){
  float fresnel = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.4);
  vec3 base = mix(uDeep, uMint, smoothstep(-0.6, 0.9, vNoise) * 0.55);
  base = mix(base, uAmber, smoothstep(0.35, 1.0, vNoise) * 0.45);
  vec3 col = base + uSand * fresnel * 1.1;
  gl_FragColor = vec4(col, 0.55 + fresnel * 0.45);
}
`;

const SAND = new THREE.Color('#FFF9FA');
const MINT = new THREE.Color('#FD1843');
const AMBER = new THREE.Color('#FF6B35');
const DEEP = new THREE.Color('#C5102E');

export const HeroScene: React.FC<{ className?: string }> = ({ className }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return; // WebGL unavailable — the CSS gradient fallback behind the canvas stays visible
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 7);

    const rig = new THREE.Group();
    scene.add(rig);

    // ── Core: noise-displaced icosphere with fresnel rim ──────────────────
    const coreUniforms = {
      uTime: { value: 0 },
      uPointer: { value: 0 },
      uSand: { value: SAND },
      uMint: { value: MINT },
      uAmber: { value: AMBER },
      uDeep: { value: DEEP },
    };
    const coreGeo = new THREE.IcosahedronGeometry(1.45, 48);
    const coreMat = new THREE.ShaderMaterial({
      vertexShader: coreVertex,
      fragmentShader: coreFragment,
      uniforms: coreUniforms,
      transparent: true,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    rig.add(core);

    // Wireframe shell for the "engineered" look
    const shellGeo = new THREE.IcosahedronGeometry(2.05, 2);
    const shellMat = new THREE.MeshBasicMaterial({ color: SAND, wireframe: true, transparent: true, opacity: 0.08 });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    rig.add(shell);

    // Vertex nodes on the shell
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', shellGeo.getAttribute('position').clone());
    const nodeMat = new THREE.PointsMaterial({ color: AMBER, size: 0.05, transparent: true, opacity: 0.85, depthWrite: false });
    const nodes = new THREE.Points(nodeGeo, nodeMat);
    rig.add(nodes);

    // ── Orbit rings ───────────────────────────────────────────────────────
    const rings: THREE.Mesh[] = [];
    [
      { r: 2.6, tilt: [1.2, 0.2], color: MINT, opacity: 0.35 },
      { r: 3.0, tilt: [0.4, 0.9], color: SAND, opacity: 0.18 },
      { r: 3.35, tilt: [1.7, -0.5], color: AMBER, opacity: 0.22 },
    ].forEach(({ r, tilt, color, opacity }) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.006, 8, 180),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity })
      );
      ring.rotation.set(tilt[0], tilt[1], 0);
      rig.add(ring);
      rings.push(ring);
    });

    // ── Particle field ────────────────────────────────────────────────────
    const isSmall = window.innerWidth < 768;
    const COUNT = isSmall ? 700 : 1600;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const palette = [SAND, MINT, AMBER];
    for (let i = 0; i < COUNT; i++) {
      const radius = 3.5 + Math.random() * 7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = radius * Math.cos(phi) - 2;
      const c = palette[i % 7 === 0 ? 2 : i % 3 === 0 ? 1 : 0];
      colors.set([c.r, c.g, c.b], i * 3);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ── Sizing: core sits right on desktop, centered (and smaller) on mobile
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const desktop = w >= 1024;
      rig.position.set(desktop ? 2.3 : 0, desktop ? 0 : 0.6, 0);
      rig.scale.setScalar(desktop ? 1 : 0.72);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // ── Pointer parallax ──────────────────────────────────────────────────
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, energy: 0 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
      pointer.energy = Math.min(pointer.energy + 0.06, 1);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // ── Loop (paused while off-screen or tab hidden) ──────────────────────
    const clock = new THREE.Clock();
    let elapsed = 0;
    let raf = 0;
    let visible = true;

    const renderFrame = () => {
      elapsed += Math.min(clock.getDelta(), 0.1);
      const t = elapsed;
      coreUniforms.uTime.value = t;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      pointer.energy *= 0.97;
      coreUniforms.uPointer.value = pointer.energy;

      core.rotation.y = t * 0.12;
      shell.rotation.y = -t * 0.06;
      shell.rotation.x = t * 0.03;
      nodes.rotation.copy(shell.rotation);
      rings.forEach((ring, i) => { ring.rotation.z = t * (0.08 + i * 0.04) * (i % 2 ? -1 : 1); });
      stars.rotation.y = t * 0.01;

      rig.rotation.x = pointer.y * 0.25;
      rig.rotation.y = pointer.x * 0.35;
      camera.position.x = pointer.x * 0.4;
      camera.position.y = -pointer.y * 0.25;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    const loop = () => {
      renderFrame();
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!raf && visible && !document.hidden && !reduceMotion) { clock.getDelta(); raf = requestAnimationFrame(loop); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? start() : stop();
    });
    io.observe(mount);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    if (reduceMotion) renderFrame();
    else start();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
};

export default HeroScene;
