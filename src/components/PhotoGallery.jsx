import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import '../styles/PhotoGallery.css';

const PhotoGallery = () => {
  const galleryRef = useRef(null);
  const loopRef = useRef(null);
  const loopHeadRef = useRef(null);
  const scrubRef = useRef(null);
  const triggerRef = useRef(null);
  const playheadRef = useRef({ position: 0 });
  const iterationRef = useRef(0);

  // Brand brand images - replace these with actual Brand product/brand images
  const COVERS = [
    "https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Pictures/Orange_jack_1754117120607_6og7yp0.png",
    "https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Pictures/SHOP_BANNER_2f58ad04-18a3-4e1b-8d2a-acd93acef73d.webp",
    "https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/logos/Kushie_White_logo_1753092351582_38ok1bd.png",
    "https://images.unsplash.com/photo-1587049352846-4a222e784804?w=500",
    "https://images.unsplash.com/photo-1536819114556-1e10f967fb61?w=500",
    "https://images.unsplash.com/photo-1588154506351-9c2c7c5f9c77?w=500",
    "https://images.unsplash.com/photo-1612198790700-3a176a5be14e?w=500",
    "https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=500",
    "https://images.unsplash.com/photo-1606767041233-d303a8d61e21?w=500",
    "https://images.unsplash.com/photo-1597096690293-fe3f95d7bb5c?w=500"
  ];

  useEffect(() => {
    // Dynamically load GSAP scripts
    const loadGSAP = async () => {
      try {
        const gsapScript = document.createElement('script');
        gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
        document.head.appendChild(gsapScript);

        const scrollTriggerScript = document.createElement('script');
        scrollTriggerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
        document.head.appendChild(scrollTriggerScript);

        const draggableScript = document.createElement('script');
        draggableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Draggable.min.js';
        document.head.appendChild(draggableScript);

        // Wait for scripts to load
        await new Promise(resolve => {
          let loadCount = 0;
          const checkLoaded = () => {
            loadCount++;
            if (loadCount === 3) resolve();
          };
          gsapScript.onload = checkLoaded;
          scrollTriggerScript.onload = checkLoaded;
          draggableScript.onload = checkLoaded;
        });

        initializeGallery();
      } catch (error) {
        console.error('Error loading GSAP:', error);
      }
    };

    const initializeGallery = () => {
      if (!window.gsap) return;
      
      const { gsap } = window;
      gsap.registerPlugin(window.ScrollTrigger, window.Draggable);

      const BOXES = gsap.utils.toArray('.gallery-box');
      if (BOXES.length === 0) return;

      gsap.set('.gallery-box', {
        yPercent: -50,
        display: 'block'
      });

      const STAGGER = 0.1;
      const DURATION = 1;
      const OFFSET = 0;

      const LOOP = gsap.timeline({
        paused: true,
        repeat: -1,
        ease: 'none',
      });
      loopRef.current = LOOP;

      const SHIFTS = [...BOXES, ...BOXES, ...BOXES];

      SHIFTS.forEach((BOX, index) => {
        const BOX_TL = gsap
          .timeline()
          .set(BOX, {
            xPercent: 250,
            rotateY: -50,
            opacity: 0,
            scale: 0.5,
          })
          .to(BOX, { opacity: 1, scale: 1, duration: 0.1 }, 0)
          .to(BOX, { opacity: 0, scale: 0.5, duration: 0.1 }, 0.9)
          .fromTo(BOX, { xPercent: 250 }, { xPercent: -350, duration: 1, immediateRender: false, ease: 'power1.inOut' }, 0)
          .fromTo(BOX, { rotateY: -50 }, { rotateY: 50, immediateRender: false, duration: 1, ease: 'power4.inOut' }, 0)
          .to(BOX, { z: 100, scale: 1.25, duration: 0.1, repeat: 1, yoyo: true }, 0.4)
          .fromTo(BOX, { zIndex: 1 }, { zIndex: BOXES.length, repeat: 1, yoyo: true, ease: 'none', duration: 0.5, immediateRender: false }, 0);
        
        LOOP.add(BOX_TL, index * STAGGER);
      });

      const CYCLE_DURATION = STAGGER * BOXES.length;
      const START_TIME = CYCLE_DURATION + DURATION * 0.5 + OFFSET;

      const LOOP_HEAD = gsap.fromTo(
        LOOP,
        { totalTime: START_TIME },
        { totalTime: `+=${CYCLE_DURATION}`, duration: 1, ease: 'none', repeat: -1, paused: true }
      );
      loopHeadRef.current = LOOP_HEAD;

      const POSITION_WRAP = gsap.utils.wrap(0, LOOP_HEAD.duration());

      const SCRUB = gsap.to(playheadRef.current, {
        position: 0,
        onUpdate: () => {
          LOOP_HEAD.totalTime(POSITION_WRAP(playheadRef.current.position));
        },
        paused: true,
        duration: 0.25,
        ease: 'power3',
      });
      scrubRef.current = SCRUB;

      const TRIGGER = window.ScrollTrigger.create({
        start: 0,
        end: '+=2000',
        horizontal: false,
        pin: '.gallery-boxes',
        onUpdate: self => {
          const SCROLL = self.scroll();
          if (SCROLL > self.end - 1) {
            WRAP(1, 1);
          } else if (SCROLL < 1 && self.direction < 0) {
            WRAP(-1, self.end - 1);
          } else {
            const NEW_POS = (iterationRef.current + self.progress) * LOOP_HEAD.duration();
            SCRUB.vars.position = NEW_POS;
            SCRUB.invalidate().restart();
          }
        },
      });
      triggerRef.current = TRIGGER;

      const WRAP = (iterationDelta, scrollTo) => {
        iterationRef.current += iterationDelta;
        TRIGGER.scroll(scrollTo);
        TRIGGER.update();
      };

      const SNAP = gsap.utils.snap(1 / BOXES.length);

      const progressToScroll = progress =>
        gsap.utils.clamp(1, TRIGGER.end - 1, gsap.utils.wrap(0, 1, progress) * TRIGGER.end);

      const scrollToPosition = position => {
        const SNAP_POS = SNAP(position);
        const PROGRESS = (SNAP_POS - LOOP_HEAD.duration() * iterationRef.current) / LOOP_HEAD.duration();
        const SCROLL = progressToScroll(PROGRESS);
        if (PROGRESS >= 1 || PROGRESS < 0) return WRAP(Math.floor(PROGRESS), SCROLL);
        TRIGGER.scroll(SCROLL);
      };

      window.ScrollTrigger.addEventListener('scrollEnd', () =>
        scrollToPosition(SCRUB.vars.position)
      );

      const NEXT = () => scrollToPosition(SCRUB.vars.position - 1 / BOXES.length);
      const PREV = () => scrollToPosition(SCRUB.vars.position + 1 / BOXES.length);

      // Event listeners
      const handleKeydown = event => {
        if (event.code === 'ArrowLeft' || event.code === 'KeyA') NEXT();
        if (event.code === 'ArrowRight' || event.code === 'KeyD') PREV();
      };

      const handleBoxClick = e => {
        const BOX = e.target.closest('.gallery-box');
        if (BOX) {
          let TARGET = BOXES.indexOf(BOX);
          let CURRENT = gsap.utils.wrap(0, BOXES.length, Math.floor(BOXES.length * SCRUB.vars.position));
          let BUMP = TARGET - CURRENT;
          if (TARGET > CURRENT && TARGET - CURRENT > BOXES.length * 0.5) {
            BUMP = (BOXES.length - BUMP) * -1;
          }
          if (CURRENT > TARGET && CURRENT - TARGET > BOXES.length * 0.5) {
            BUMP = BOXES.length + BUMP;
          }
          scrollToPosition(SCRUB.vars.position + BUMP * (1 / BOXES.length));
        }
      };

      document.addEventListener('keydown', handleKeydown);
      document.querySelector('.gallery-boxes')?.addEventListener('click', handleBoxClick);
      document.querySelector('.gallery-next')?.addEventListener('click', NEXT);
      document.querySelector('.gallery-prev')?.addEventListener('click', PREV);

      // Draggable
      window.Draggable.create('.gallery-drag-proxy', {
        type: 'x',
        trigger: '.gallery-box',
        onPress() {
          this.startOffset = SCRUB.vars.position;
        },
        onDrag() {
          SCRUB.vars.position = this.startOffset + (this.startX - this.x) * 0.001;
          SCRUB.invalidate().restart();
        },
        onDragEnd() {
          scrollToPosition(SCRUB.vars.position);
        },
      });

      gsap.set('button', { z: 200 });

      // Cleanup
      return () => {
        document.removeEventListener('keydown', handleKeydown);
        if (triggerRef.current) triggerRef.current.kill();
        if (loopRef.current) loopRef.current.kill();
        if (loopHeadRef.current) loopHeadRef.current.kill();
        if (scrubRef.current) scrubRef.current.kill();
      };
    };

    loadGSAP();
  }, []);

  return (
    <div className="photo-gallery-container" ref={galleryRef}>
      <div className="gallery-header">
        <h2>Gallery</h2>
        <p>Explore the Brand Experience</p>
      </div>
      
      <div className="gallery-boxes">
        {COVERS.map((cover, index) => (
          <div 
            key={index} 
            className="gallery-box" 
            style={{ '--src': `url(${cover})` }}
          >
            <span>{index + 1}</span>
            <MediaPlaceholder kind="image" />
          </div>
        ))}
        
        <div className="gallery-controls">
          <button className="gallery-next">
            <span>Previous</span>
            <ChevronLeft size={24} />
          </button>
          <button className="gallery-prev">
            <span>Next</span>
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
      
      <div className="gallery-scroll-icon">
        <Layers size={24} />
      </div>
      
      <div className="gallery-drag-proxy"></div>
    </div>
  );
};

export default PhotoGallery;