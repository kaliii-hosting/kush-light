import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { usePageContent } from '../context/PageContentContext';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as THREE from 'three';
import DynamicSection from '../components/DynamicSection';
import AboutCards from '../components/AboutCards';
import TreePlantingBanner from '../components/TreePlantingBanner';
import '../styles/about-animation.css';

const AboutDynamic = () => {
  const navigate = useNavigate();
  const { pageContent, loading } = usePageContent();
  const sections = pageContent?.about?.sections || [];
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const likeButtonRef = useRef(null);
  const [sliderValue, setSliderValue] = useState(3);
  const [showListSupport, setShowListSupport] = useState(true);

  // State for poster image slider
  const [posterSliderIndex, setPosterSliderIndex] = useState(0);
  const posterImages = [
    'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Posters/flower%20poster%202.jpg',
    'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Posters/dspsbls%20poster.jpg',
    'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Posters/flower%20poster.jpg',
    'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Posters/lambo%20poster.jpg',
    'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Posters/dspsbls%20poster2.jpg',
    'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Posters/Photo%20Jun%2014%202025,%207%2008%2040%20PM.jpg',
    'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Posters/Photo%20Jun%2014%202025,%207%2059%2050%20PM.jpg'
  ];
  
  // About text content
  const aboutContent = [
    {
      number: "1",
      title: "ABOUT BRAND",
      subtitle: "Our Purpose",
      text: "Relaxed lifestyle is just a brand away. Brand Brand isn't just a Sample brand; it's a way of life. Believing in the need for self-care and ability to unwind, Brand Brand helps promote the relaxing and joyful qualities of Sample while contributing to eliminate the social taboo associated with the Sample community."
    },
    {
      number: "2",
      title: "VISION",
      subtitle: "Creative Safe-Haven",
      text: "Offering premier Sample products and stylish apparel and accessories, Brand Brand has quickly become the safe-haven for artists and creatives who value individuality and imagination. We cultivate a community focused on the creative and relaxing lifestyle associated with Sample."
    },
    {
      number: "3",
      title: "HISTORY",
      subtitle: "From Creative Network to Sample Brand",
      text: "Brand Brand began their journey as a creative outlet and network for photographers and videographers interested in Sample culture. Starting with content creation for artists and musicians, they expanded into apparel and accessories before developing Sample products. Officially born in 2014, Brand Brands has been keeping the weed scene fresh and modern ever since."
    },
    {
      number: "4",
      title: "PRODUCTS",
      subtitle: "Fashion Meets Sample",
      text: "Beginning with fashion forward apparel and accessories, Brand Brands has developed Sample products to match their innovative style. From crop tops, tank tops, beanies, and snapbacks, to doobie Sample Items and fruity Mini Krispies, Brand Brands is devoted to making you look good and feel good."
    },
    {
      number: "5",
      title: "QUALITY",
      subtitle: "Lab Testing Standards",
      text: "Whether it be their artistic bend or their need to lead change, Brand Brands aims to innovate in all aspects of the Sample industry. This is why they proudly test all their products and hope to be a standard for other Sample brands in the industry."
    },
    {
      number: "6",
      title: "NETWORK",
      subtitle: "LA Community Connections",
      text: "Hailing from the artistic mecca that is Los Angeles, Brand Brands has become integral to both the creator and Sample community. They work with partners like Alaf Farms for premium quality, indoor organic Sample flower, bringing artists and medical Sample patients the creative lifestyle they want with the relief they deserve."
    }
  ];
  
  // Refs for Three.js objects and audio
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const shaderMaterialRef = useRef();
  const audioRef = useRef();
  const audioContextRef = useRef();
  const analyserRef = useRef();
  const dataArrayRef = useRef();
  
  // Animation state
  const timeRef = useRef(0);
  const transitionFactorRef = useRef(1.0);
  const idleAnimationRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  
  // Audio frequencies
  const audioStateRef = useRef({
    lowFreq: 0,
    midFreq: 0,
    highFreq: 0,
    kickEnergy: 0,
    kickDetected: false,
    beatPhase: 0,
    bounceEffect: 0,
    bandEnergies: Array(8).fill(0),
    bandHistories: Array(8).fill().map(() => [])
  });

  // Settings
  const settingsRef = useRef({
    baseSpeed: 1.0,
    idleSpeed: 0.1,
    bassReactivity: 0.4,
    midReactivity: 0.5,
    highReactivity: 0.4,
    kickReactivity: 0.6,
    bounceIntensity: 0.15,
    waveIntensity: 0.08,
    waveComplexity: 2.2,
    rippleIntensity: 0.25,
    lineThickness: 1.8,
    lineStraightness: 2.53,
    idleWaveHeight: 0.01,
    transitionSmoothness: 0.03,
    bgColorDown: [40, 20, 10],
    bgColorUp: [40, 20, 10],
    color1In: [255, 200, 0],
    color1Out: [255, 100, 0],
    color2In: [255, 100, 100],
    color2Out: [200, 50, 50],
    color3In: [255, 150, 50],
    color3Out: [200, 100, 0]
  });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    precision highp float;

    uniform vec2 iResolution;
    uniform float iTime;
    uniform vec2 iMouse;
    uniform float lowFreq;
    uniform float midFreq;
    uniform float highFreq;
    uniform float isPlaying;
    uniform float transitionFactor;
    uniform float lineStraightness;
    uniform float idleAnimation;
    uniform float idleWaveHeight;

    uniform float kickEnergy;
    uniform float beatPhase;
    uniform float bounceEffect;

    uniform float baseSpeed;
    uniform float idleSpeed;
    uniform float bassReactivity;
    uniform float midReactivity;
    uniform float highReactivity;
    uniform float kickReactivity;
    uniform float bounceIntensity;
    uniform float waveIntensity;
    uniform float waveComplexity;
    uniform float rippleIntensity;
    uniform float lineThickness;

    uniform vec3 bgColorDown;
    uniform vec3 bgColorUp;
    uniform vec3 color1In;
    uniform vec3 color1Out;
    uniform vec3 color2In;
    uniform vec3 color2Out;
    uniform vec3 color3In;
    uniform vec3 color3Out;

    varying vec2 vUv;

    float squared(float value) {
      return value * value;
    }

    float smootherstep(float edge0, float edge1, float x) {
      float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
      return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    }

    void mainImage(out vec4 fragColor, in vec2 fragCoord) {
      vec2 p = fragCoord.xy / iResolution.xy;
      vec3 bgCol = bgColorDown;
      
      float speed = mix(idleSpeed, baseSpeed, transitionFactor);
      float ballVisibility = mix(0.8, 0.2, transitionFactor);
      float straightnessFactor = mix(1.0, lineStraightness, transitionFactor);
      float idleWave = idleWaveHeight * sin(p.x * 5.0 + idleAnimation * 0.2);
      
      float bassPulse = squared(lowFreq) * bassReactivity * transitionFactor;
      float midPulse = squared(midFreq) * midReactivity * transitionFactor;
      float highPulse = squared(highFreq) * highReactivity * transitionFactor;
      float kickPulse = squared(kickEnergy) * kickReactivity * 1.5 * transitionFactor;
      float bounce = bounceEffect * bounceIntensity * transitionFactor;
      
      float curveIntensity = mix(idleWaveHeight, 0.05 + waveIntensity * (bassPulse + kickPulse * 0.7), transitionFactor);
      float curveSpeed = speed;
      float curve = curveIntensity * sin((6.25 * p.x) + (curveSpeed * iTime));
      
      float ripple = 0.0;
      
      float audioWave = mix(
        0.0,
        (0.1 * sin(p.x * 20.0 * waveComplexity) * bassPulse + 
         0.08 * sin(p.x * 30.0 * waveComplexity) * midPulse + 
         0.05 * sin(p.x * 50.0 * waveComplexity) * highPulse) / straightnessFactor,
        transitionFactor
      );
      
      // Line A (Bass/Kick)
      float lineAFreq = 40.0 * waveComplexity + 80.0 * bassPulse + 90.0 * kickPulse;
      float lineASpeed = 1.5 * speed + 6.0 * bassPulse + 6.0 * kickPulse;
      float lineAWave = mix(
        idleWave,
        (0.01 + 0.05 * bassPulse + 0.1 * kickPulse) / straightnessFactor,
        transitionFactor
      );
      
      float kickWaveEffect = 0.0;
      if (kickEnergy > 0.1) {
        kickWaveEffect = kickEnergy * 0.3 * sin(15.0 * (p.x - iTime * 0.5)) * transitionFactor;
      }
      
      float lineAOffset = bassPulse * 0.3 * sin(p.x * 10.0 - iTime * 2.0) + kickWaveEffect * 0.7;
      float lineAY = 0.5;
      float lineAActive = lineAY + curve + audioWave + lineAWave * sin((lineAFreq * p.x) + (-lineASpeed * iTime)) + lineAOffset - bounce;
      float lineAIdle = lineAY + idleWave;
      float lineAAnim = mix(lineAIdle, lineAActive, transitionFactor);
      
      float lineAThickness = lineThickness * (1.0 + bassPulse * 0.4 + kickPulse * 0.8);
      float lineADist = distance(p.y, lineAAnim) * (2.0 / lineAThickness);
      float lineAShape = smootherstep(1.0 - clamp(lineADist, 0.0, 1.0), 1.0, 0.99);
      
      vec3 kickColor = vec3(1.0, 0.7, 0.3);
      vec3 enhancedColor1In = mix(color1In, kickColor, kickEnergy * 0.6 * transitionFactor);
      vec3 enhancedColor1Out = mix(color1Out, vec3(1.0, 0.5, 0.0), kickEnergy * 0.4 * transitionFactor);
      vec3 lineACol = (1.0 - lineAShape) * vec3(mix(enhancedColor1In, enhancedColor1Out, lineAShape));
      
      // Ball A
      float ballASize = 0.5 + 0.4 * bassPulse + kickEnergy * 1.2 * transitionFactor;
      float ballAX = 0.2 + 0.1 * sin(iTime * 0.2 * speed) * midPulse;
      float ballADist = distance(p, vec2(ballAX, lineAAnim));
      float ballAShape = smootherstep(1.0 - clamp(ballADist * ballASize, 0.0, 1.0), 1.0, 0.99);
      vec3 ballACol = (1.0 - ballAShape) * vec3(mix(enhancedColor1In, enhancedColor1Out, ballAShape)) * mix(1.0, ballVisibility, transitionFactor);
      
      // Line B (Mid)
      float lineBFreq = 50.0 * waveComplexity + 100.0 * midPulse;
      float lineBSpeed = 2.0 * speed + 8.0 * midPulse;
      float lineBWave = mix(
        idleWave * 0.8,
        (0.01 + 0.05 * midPulse) / straightnessFactor,
        transitionFactor
      );
      
      float lineBOffset = midPulse * 0.2 * sin(p.x * 15.0 - iTime * 1.5) + kickEnergy * 0.1 * sin(p.x * 25.0 - iTime * 3.0) * transitionFactor;
      float lineBY = 0.5;
      float lineBActive = lineBY + curve - audioWave + lineBWave * sin((lineBFreq * p.x) + (lineBSpeed * iTime)) * sin(lineBSpeed * iTime) + lineBOffset - bounce * 0.5;
      float lineBIdle = lineBY + idleWave * 0.8;
      float lineBAnim = mix(lineBIdle, lineBActive, transitionFactor);
      
      float lineBThickness = lineThickness * (1.0 + midPulse * 0.3 + kickEnergy * 0.3 * transitionFactor);
      float lineBDist = distance(p.y, lineBAnim) * (2.0 / lineBThickness);
      float lineBShape = smootherstep(1.0 - clamp(lineBDist, 0.0, 1.0), 1.0, 0.99);
      
      vec3 enhancedColor2In = mix(color2In, vec3(1.0, 0.5, 0.5), kickEnergy * 0.3 * transitionFactor);
      vec3 lineBCol = (1.0 - lineBShape) * vec3(mix(enhancedColor2In, color2Out, lineBShape));
      
      // Ball B
      float ballBSize = 0.5 + 0.4 * highPulse + kickEnergy * 0.3 * transitionFactor;
      float ballBX = 0.8 - 0.1 * sin(iTime * 0.3 * speed) * midPulse;
      float ballBDist = distance(p, vec2(ballBX, lineBAnim));
      float ballBShape = smootherstep(1.0 - clamp(ballBDist * ballBSize, 0.0, 1.0), 1.0, 0.99);
      vec3 ballBCol = (1.0 - ballBShape) * vec3(mix(enhancedColor2In, color2Out, ballBShape)) * mix(1.0, ballVisibility, transitionFactor);
      
      // Line C (High)
      float lineCFreq = 60.0 * waveComplexity + 120.0 * highPulse;
      float lineCSpeed = 2.5 * speed + 10.0 * highPulse;
      float lineCWave = mix(
        idleWave * 1.2,
        (0.01 + 0.05 * highPulse) / straightnessFactor,
        transitionFactor
      );
      
      float lineCOffset = highPulse * 0.15 * sin(p.x * 20.0 - iTime * 1.0);
      float lineCY = 0.5;
      float lineCActive = lineCY + curve * 0.7 - audioWave * 0.5 + lineCWave * sin((lineCFreq * p.x) + (lineCSpeed * iTime)) * sin(lineCSpeed * (iTime + 0.1)) + lineCOffset - bounce * 0.3;
      float lineCIdle = lineCY + idleWave * 1.2;
      float lineCAnim = mix(lineCIdle, lineCActive, transitionFactor);
      
      float lineCThickness = lineThickness * (1.0 + highPulse * 0.2 + kickEnergy * 0.1 * transitionFactor);
      float lineCDist = distance(p.y, lineCAnim) * (2.0 / lineCThickness);
      float lineCShape = smootherstep(1.0 - clamp(lineCDist, 0.0, 1.0), 1.0, 0.99);
      vec3 lineCCol = (1.0 - lineCShape) * vec3(mix(color3In, color3Out, lineCShape));
      
      // Ball C
      float ballCSize = 0.5 + 0.4 * highPulse + kickEnergy * 0.1 * transitionFactor;
      float ballCX = 0.5 + 0.15 * sin(iTime * 0.4 * speed) * highPulse;
      float ballCDist = distance(p, vec2(ballCX, lineCAnim));
      float ballCShape = smootherstep(1.0 - clamp(ballCDist * ballCSize, 0.0, 1.0), 1.0, 0.99);
      vec3 ballCCol = (1.0 - ballCShape) * vec3(mix(color3In, color3Out, ballCShape)) * mix(1.0, ballVisibility, transitionFactor);
      
      vec3 rippleCol = vec3(0.0);
      
      vec3 fcolor = bgCol + lineACol + lineBCol + lineCCol + ballACol + ballBCol + ballCCol;
      
      fragColor = vec4(fcolor, 1.0);
    }

    void main() {
      vec2 fragCoord = vUv * iResolution;
      vec4 fragColor;
      mainImage(fragColor, fragCoord);
      gl_FragColor = fragColor;
    }
  `;

  // Mouse movement handler
  const handleMouseMove = (e) => {
    mouseRef.current.x = e.clientX / window.innerWidth;
    mouseRef.current.y = 1.0 - (e.clientY / window.innerHeight);
    
    if (shaderMaterialRef.current) {
      shaderMaterialRef.current.uniforms.iMouse.value.set(mouseRef.current.x, mouseRef.current.y);
    }
  };

  // Audio setup
  const setupAudio = () => {
    audioRef.current = new Audio();
    audioRef.current.crossOrigin = "anonymous";
    audioRef.current.preload = "auto";
    audioRef.current.src = "https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Tracks/kosikk-slow-motion.ogg";
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
  };

  // Update frequencies
  const updateFrequencies = () => {
    if (!analyserRef.current || !playing) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const state = audioStateRef.current;

    const bands = [
      { name: "sub", range: [1, 4] },
      { name: "kick", range: [4, 9] },
      { name: "bass", range: [9, 20] },
      { name: "lowMid", range: [20, 40] },
      { name: "mid", range: [40, 80] },
      { name: "highMid", range: [80, 160] },
      { name: "high", range: [160, 300] },
      { name: "veryHigh", range: [300, 500] }
    ];

    for (let i = 0; i < bands.length; i++) {
      const [start, end] = bands[i].range;
      const bandSlice = dataArrayRef.current.slice(start, end);
      const bandAvg = getWeightedAverage(bandSlice);
      state.bandEnergies[i] = bandAvg;

      state.bandHistories[i].unshift(bandAvg);
      if (state.bandHistories[i].length > 4) {
        state.bandHistories[i].pop();
      }
    }

    const combinedBass = (state.bandEnergies[1] * 1.2 + state.bandEnergies[2]) / 2.2;
    if (combinedBass > state.lowFreq * 1.1) {
      state.lowFreq = state.lowFreq * 0.3 + combinedBass * 0.7;
    } else {
      state.lowFreq = state.lowFreq * 0.85 + combinedBass * 0.15;
    }

    const combinedMid = (state.bandEnergies[3] + state.bandEnergies[4]) / 2;
    if (combinedMid > state.midFreq * 1.1) {
      state.midFreq = state.midFreq * 0.4 + combinedMid * 0.6;
    } else {
      state.midFreq = state.midFreq * 0.8 + combinedMid * 0.2;
    }

    const combinedHigh = (state.bandEnergies[5] + state.bandEnergies[6] + state.bandEnergies[7]) / 3;
    if (combinedHigh > state.highFreq * 1.05) {
      state.highFreq = state.highFreq * 0.5 + combinedHigh * 0.5;
    } else {
      state.highFreq = state.highFreq * 0.8 + combinedHigh * 0.2;
    }

    const kickAvg = state.bandEnergies[1];
    const kickHistory = state.bandHistories[1];
    const recentKickAvg = kickHistory.slice(1).reduce((sum, val) => sum + val, 0) / (kickHistory.length - 1 || 1);
    const kickJump = kickAvg - recentKickAvg;
    
    if (kickJump > 0.06 && kickAvg > 0.15) {
      state.kickDetected = true;
      state.kickEnergy = Math.min(1.0, kickAvg * 1.2);
    } else {
      state.kickEnergy *= 0.8;
      if (state.kickEnergy < 0.05) {
        state.kickDetected = false;
      }
    }

    if (shaderMaterialRef.current && shaderMaterialRef.current.uniforms) {
      if (shaderMaterialRef.current.uniforms.lowFreq) {
        shaderMaterialRef.current.uniforms.lowFreq.value = state.lowFreq;
      }
      if (shaderMaterialRef.current.uniforms.midFreq) {
        shaderMaterialRef.current.uniforms.midFreq.value = state.midFreq;
      }
      if (shaderMaterialRef.current.uniforms.highFreq) {
        shaderMaterialRef.current.uniforms.highFreq.value = state.highFreq;
      }
      if (shaderMaterialRef.current.uniforms.kickEnergy) {
        shaderMaterialRef.current.uniforms.kickEnergy.value = state.kickEnergy;
      }
      if (shaderMaterialRef.current.uniforms.bounceEffect) {
        shaderMaterialRef.current.uniforms.bounceEffect.value = state.kickEnergy * 0.025;
      }
    }
  };

  const getWeightedAverage = (array) => {
    if (array.length === 0) return 0;
    let sum = 0;
    let maxVal = 0;
    for (let i = 0; i < array.length; i++) {
      const value = array[i] / 255;
      maxVal = Math.max(maxVal, value);
      const emphasized = Math.pow(value, 1.5);
      sum += emphasized;
    }
    const avg = sum / array.length;
    return avg * 0.7 + maxVal * 0.3;
  };

  useEffect(() => {
    let renderer, geometry, shaderMaterial;
    let handleResize;
    let mounted = true;
    
    const initAnimation = () => {
      if (!mounted) return;
      
      if (!containerRef.current || !canvasRef.current) {
        setTimeout(initAnimation, 100);
        return;
      }

      try {
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        camera.position.z = 1;

        renderer = new THREE.WebGLRenderer({ 
          canvas: canvasRef.current, 
          antialias: true,
          alpha: false,
          powerPreference: "high-performance"
        });
      
        const rect = containerRef.current.getBoundingClientRect();
        const containerWidth = rect.width > 0 ? rect.width : window.innerWidth;
        const containerHeight = rect.height > 0 ? rect.height : window.innerHeight * 0.52;
        
        canvasRef.current.width = containerWidth;
        canvasRef.current.height = containerHeight;
        
        renderer.setSize(containerWidth, containerHeight, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.debug.checkShaderErrors = true;

        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;

        const settings = settingsRef.current;
        
        try {
          shaderMaterial = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
              iResolution: { value: new THREE.Vector2(containerWidth, containerHeight) },
              iTime: { value: 0 },
              iMouse: { value: new THREE.Vector2(0.5, 0.5) },
              lowFreq: { value: 0 },
              midFreq: { value: 0 },
              highFreq: { value: 0 },
              isPlaying: { value: 1.0 },
              transitionFactor: { value: 1.0 },
              lineStraightness: { value: settings.lineStraightness },
              idleAnimation: { value: 0 },
              idleWaveHeight: { value: settings.idleWaveHeight },
              kickEnergy: { value: 0 },
              beatPhase: { value: 0 },
              bounceEffect: { value: 0 },
              baseSpeed: { value: settings.baseSpeed },
              idleSpeed: { value: settings.idleSpeed },
              bassReactivity: { value: settings.bassReactivity },
              midReactivity: { value: settings.midReactivity },
              highReactivity: { value: settings.highReactivity },
              kickReactivity: { value: settings.kickReactivity },
              bounceIntensity: { value: settings.bounceIntensity },
              waveIntensity: { value: settings.waveIntensity },
              waveComplexity: { value: settings.waveComplexity },
              rippleIntensity: { value: settings.rippleIntensity },
              lineThickness: { value: settings.lineThickness },
              bgColorDown: { value: new THREE.Vector3(settings.bgColorDown[0] / 255, settings.bgColorDown[1] / 255, settings.bgColorDown[2] / 255) },
              bgColorUp: { value: new THREE.Vector3(settings.bgColorUp[0] / 255, settings.bgColorUp[1] / 255, settings.bgColorUp[2] / 255) },
              color1In: { value: new THREE.Vector3(settings.color1In[0] / 255, settings.color1In[1] / 255, settings.color1In[2] / 255) },
              color1Out: { value: new THREE.Vector3(settings.color1Out[0] / 255, settings.color1Out[1] / 255, settings.color1Out[2] / 255) },
              color2In: { value: new THREE.Vector3(settings.color2In[0] / 255, settings.color2In[1] / 255, settings.color2In[2] / 255) },
              color2Out: { value: new THREE.Vector3(settings.color2Out[0] / 255, settings.color2Out[1] / 255, settings.color2Out[2] / 255) },
              color3In: { value: new THREE.Vector3(settings.color3In[0] / 255, settings.color3In[1] / 255, settings.color3In[2] / 255) },
              color3Out: { value: new THREE.Vector3(settings.color3Out[0] / 255, settings.color3Out[1] / 255, settings.color3Out[2] / 255) }
            }
          });
        } catch (error) {
          console.error("Error creating shader material:", error);
          return;
        }
        
        shaderMaterialRef.current = shaderMaterial;

        geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, shaderMaterial);
        scene.add(mesh);
        
        renderer.render(scene, camera);
        
        if (canvasRef.current) {
          canvasRef.current.style.display = 'block';
          canvasRef.current.style.visibility = 'visible';
          canvasRef.current.style.opacity = '1';
        }
        
        renderer.setClearColor(0x28140a, 1);
        setupAudio();
        
        if (shaderMaterial && shaderMaterial.uniforms) {
          transitionFactorRef.current = 1.0;
          if (shaderMaterial.uniforms.transitionFactor) {
            shaderMaterial.uniforms.transitionFactor.value = 1.0;
          }
          if (shaderMaterial.uniforms.isPlaying) {
            shaderMaterial.uniforms.isPlaying.value = 1.0;
          }
          
          if (shaderMaterial.uniforms.lowFreq) {
            shaderMaterial.uniforms.lowFreq.value = 0.5;
          }
          if (shaderMaterial.uniforms.midFreq) {
            shaderMaterial.uniforms.midFreq.value = 0.4;
          }
          if (shaderMaterial.uniforms.highFreq) {
            shaderMaterial.uniforms.highFreq.value = 0.3;
          }
        }
        
        setPlaying(true);
        
        if (audioRef.current) {
          audioRef.current.load();
        }

        const animate = (timestamp) => {
          if (!renderer || !scene || !camera) return;
          
          animationRef.current = requestAnimationFrame(animate);

          timeRef.current += 0.01;
          if (shaderMaterialRef.current && shaderMaterialRef.current.uniforms) {
            if (shaderMaterialRef.current.uniforms.iTime) {
              shaderMaterialRef.current.uniforms.iTime.value = timeRef.current;
            }
            
            idleAnimationRef.current += 0.01;
            if (shaderMaterialRef.current.uniforms.idleAnimation) {
              shaderMaterialRef.current.uniforms.idleAnimation.value = idleAnimationRef.current;
            }
            
            transitionFactorRef.current = 1.0;
            if (shaderMaterialRef.current.uniforms.transitionFactor) {
              shaderMaterialRef.current.uniforms.transitionFactor.value = 1.0;
            }
            if (shaderMaterialRef.current.uniforms.isPlaying) {
              shaderMaterialRef.current.uniforms.isPlaying.value = 1.0;
            }
          }

          updateFrequencies();

          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
        };
        
        animate();

        handleResize = () => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const width = rect.width || window.innerWidth;
          const height = rect.height || window.innerHeight * 0.52;
          renderer.setSize(width, height);
          shaderMaterial.uniforms.iResolution.value.set(width, height);
        };
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        if (!audioContextRef.current && audioRef.current) {
          try {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 1024;
            dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);

            const audioSource = audioContextRef.current.createMediaElementSource(audioRef.current);
            audioSource.connect(analyserRef.current);
            analyserRef.current.connect(audioContextRef.current.destination);
          } catch (e) {
            console.error("Failed to initialize audio context:", e);
          }
        }

        const attemptAutoplay = async () => {
          if (!audioRef.current) return;

          try {
            if (audioContextRef.current?.state === 'suspended') {
              await audioContextRef.current.resume();
            }
            
            await audioRef.current.play();
            setPlaying(true);
            
          } catch (e) {
            setPlaying(false);
            
            const playOnInteraction = async () => {
              try {
                if (audioContextRef.current?.state === 'suspended') {
                  await audioContextRef.current.resume();
                }
                await audioRef.current.play();
                setPlaying(true);
                
                document.removeEventListener('click', playOnInteraction);
                document.removeEventListener('touchstart', playOnInteraction);
                document.removeEventListener('keydown', playOnInteraction);
              } catch (err) {
                console.error("Failed to start audio:", err);
              }
            };
            
            document.addEventListener('click', playOnInteraction, { once: true });
            document.addEventListener('touchstart', playOnInteraction, { once: true });
            document.addEventListener('keydown', playOnInteraction, { once: true });
          }
        };
        
        attemptAutoplay();
        setTimeout(attemptAutoplay, 100);
        setTimeout(attemptAutoplay, 500);
        setTimeout(attemptAutoplay, 1000);
        
      } catch (error) {
        console.error("Error initializing Three.js:", error);
      }
    };
    
    if (containerRef.current && canvasRef.current) {
      initAnimation();
    } else {
      const checkInterval = setInterval(() => {
        if (containerRef.current && canvasRef.current) {
          clearInterval(checkInterval);
          initAnimation();
        }
      }, 10);
      
      return () => {
        clearInterval(checkInterval);
        mounted = false;
      };
    }

    return () => {
      mounted = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      if (renderer) {
        renderer.dispose();
      }
      if (geometry) {
        geometry.dispose();
      }
      if (shaderMaterial) {
        shaderMaterial.dispose();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Check datalist support
  useEffect(() => {
    const checkDatalistSupport = () => {
      const option = document.querySelector('.ruler-option');
      if (option) {
        const rect = option.getBoundingClientRect();
        if (rect.width > 0) {
          setShowListSupport(false);
        }
      }
    };

    // Check after a short delay to ensure DOM is ready
    setTimeout(checkDatalistSupport, 100);
  }, []);

  // Auto-advance poster slider
  useEffect(() => {
    const interval = setInterval(() => {
      setPosterSliderIndex((prev) => (prev + 1) % posterImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [posterImages.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Animated Hero Section - NOT EDITABLE */}
      <div 
        ref={containerRef} 
        className="relative overflow-hidden about-hero-section" 
        style={{ 
          width: '100vw', 
          height: 'clamp(400px, 52vh, 600px)',
          backgroundColor: '#281410' 
        }}
      >
        <canvas 
          ref={canvasRef} 
          className="about-animation-canvas"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            display: 'block',
            background: 'transparent',
            pointerEvents: 'none'
          }}
        />
        
        <div className="content" style={{ 
          zIndex: 30, 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'transparent', 
          width: '100%', 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <div className="quote-container" style={{ 
            background: 'transparent', 
            padding: '0 10px',
            width: '100%',
            maxWidth: '90vw',
            transform: 'scale(1.25)',
            transformOrigin: 'center'
          }}>
            <div className="flex flex-col items-center gap-0">
              <p className="text-lg sm:hidden italic text-white leading-none mb-2" style={{ 
                fontFamily: 'Satoshi, sans-serif',
                fontSize: '0.5rem'
              }}>
                Cultivating Consciousness
              </p>
              <MediaPlaceholder kind="image" />
              <p className="text-base sm:hidden text-center text-white leading-none mt-2" style={{ 
                fontFamily: 'Satoshi, sans-serif',
                fontSize: '0.4rem'
              }}>
                Established by those who dared to dream in green
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Cards Section */}
      <AboutCards aboutContent={aboutContent} />

      {/* Plant a Tree Section - Same as Homepage */}
      <TreePlantingBanner />

      {/* Auto-Looped Poster Image Slider Section */}
      <section className="relative bg-black overflow-hidden py-6 md:py-8" style={{ marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', width: '100vw' }}>
        <div className="relative w-full">
          {/* Image Container with Transition */}
          {posterImages.map((image, index) => (
            <div
              key={index}
              className={`transition-opacity duration-1000 ${
                index === posterSliderIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
              }`}
            >
              <MediaPlaceholder kind="image" />
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {posterImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setPosterSliderIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === posterSliderIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setPosterSliderIndex((prev) => (prev - 1 + posterImages.length) % posterImages.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={() => setPosterSliderIndex((prev) => (prev + 1) % posterImages.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
        </button>
      </section>
    </div>
  );
};

export default AboutDynamic;