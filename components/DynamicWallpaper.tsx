"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function DynamicWallpaper() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // --- Ocean wave mesh ---
    const waveGeo = new THREE.PlaneGeometry(28, 28, 80, 80);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0x0a2a4a,
      wireframe: true,
      transparent: true,
      opacity: 0.13,
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.rotation.x = -Math.PI / 2.8;
    waveMesh.position.y = -3.5;
    scene.add(waveMesh);

    // second deeper wave layer
    const waveGeo2 = new THREE.PlaneGeometry(30, 30, 50, 50);
    const waveMat2 = new THREE.MeshBasicMaterial({
      color: 0x0d3d6e,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
    });
    const waveMesh2 = new THREE.Mesh(waveGeo2, waveMat2);
    waveMesh2.rotation.x = -Math.PI / 2.8;
    waveMesh2.position.y = -4.2;
    scene.add(waveMesh2);

    // --- Bioluminescent particles ---
    const particleCount = 1200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // ocean colour palette
    const palette = [
      new THREE.Color(0x00b4d8), // cyan
      new THREE.Color(0x0077b6), // deep blue
      new THREE.Color(0x90e0ef), // light cyan
      new THREE.Color(0xc9a84c), // gold accent
      new THREE.Color(0x48cae4), // mid blue
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 26;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color",    new THREE.BufferAttribute(colors,    3));

    const mat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // --- Floating jellyfish rings ---
    const rings: THREE.Mesh[] = [];
    for (let r = 0; r < 5; r++) {
      const rGeo = new THREE.TorusGeometry(
        0.4 + Math.random() * 0.7,
        0.025 + Math.random() * 0.04,
        8,
        40
      );
      const rMat = new THREE.MeshBasicMaterial({
        color: r % 2 === 0 ? 0x00b4d8 : 0xc9a84c,
        transparent: true,
        opacity: 0.18 + Math.random() * 0.18,
      });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 8
      );
      ring.rotation.x = Math.random() * Math.PI;
      scene.add(ring);
      rings.push(ring);
    }

    camera.position.set(0, 1.5, 9);

    let mouseX = 0;
    let mouseY = 0;
    let clock = 0;
    let frame = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 0.6;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const wavePositions = waveGeo.attributes.position as THREE.BufferAttribute;
    const wavePositions2 = waveGeo2.attributes.position as THREE.BufferAttribute;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      clock += 0.009;

      // animate wave vertices
      for (let i = 0; i < wavePositions.count; i++) {
        const x = wavePositions.getX(i);
        const y = wavePositions.getY(i);
        wavePositions.setZ(i,
          Math.sin(x * 0.5 + clock) * 0.45 +
          Math.cos(y * 0.4 + clock * 0.7) * 0.3
        );
      }
      wavePositions.needsUpdate = true;

      for (let i = 0; i < wavePositions2.count; i++) {
        const x = wavePositions2.getX(i);
        const y = wavePositions2.getY(i);
        wavePositions2.setZ(i,
          Math.sin(x * 0.35 + clock * 0.6) * 0.6 +
          Math.cos(y * 0.55 + clock * 0.9) * 0.35
        );
      }
      wavePositions2.needsUpdate = true;

      // drift particles gently like they're underwater
      particles.rotation.y += 0.0004 + mouseX * 0.0015;
      particles.rotation.x += 0.0002 + mouseY * 0.0008;

      // bob jellyfish rings
      rings.forEach((ring, idx) => {
        ring.position.y += Math.sin(clock * 0.8 + idx * 1.3) * 0.003;
        ring.rotation.z += 0.003 + idx * 0.001;
        ring.rotation.x += 0.001;
      });

      // subtle camera drift
      camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 0.5 + 1.5 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
      waveGeo.dispose(); waveMat.dispose();
      waveGeo2.dispose(); waveMat2.dispose();
      geo.dispose(); mat.dispose();
      rings.forEach((r) => { r.geometry.dispose(); (r.material as THREE.Material).dispose(); });
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="pointer-events-none fixed inset-0 -z-10" />;
}
