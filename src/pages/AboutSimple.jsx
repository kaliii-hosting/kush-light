import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import '../styles/about-animation.css';

const AboutSimple = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    precision highp float;
    uniform float iTime;
    uniform vec2 iResolution;
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
      vec3 col = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0, 2, 4));
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    console.log("Initializing simple Three.js test");

    // Initialize Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create shader material
    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      }
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(mesh);

    // Animation loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      
      time += 0.01;
      shaderMaterial.uniforms.iTime.value = time;
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      shaderMaterial.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      shaderMaterial.dispose();
    };
  }, []);

  return (
    <div className="bg-black">
      {/* Hero Section with Animation */}
      <div ref={containerRef} className="relative min-h-screen overflow-hidden">
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full"
          style={{ display: 'block' }}
        />
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 md:mb-6 font-serif italic opacity-90 px-4 text-white">
              Cultivating Consciousness
            </div>
            <MediaPlaceholder kind="image" />
            <div className="text-lg sm:text-xl md:text-2xl mt-4 md:mt-6 px-4 text-center text-white">
              Established by those who dared to dream in green
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSimple;