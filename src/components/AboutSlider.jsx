import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/AboutSlider.css';

gsap.registerPlugin(ScrollTrigger);

const AboutSlider = () => {
  useEffect(() => {
    // Set initial CSS variables
    const config = {
      start: 0,
      end: 360,
      theme: 'dark'
    };

    document.documentElement.style.setProperty('--start', config.start);
    document.documentElement.style.setProperty('--end', config.end);
    document.documentElement.style.setProperty('--hue', config.start);

    // Only initialize GSAP if browser doesn't support native CSS scroll animations
    const supportsScrollAnimation = CSS.supports('animation-timeline: scroll()');
    
    if (!supportsScrollAnimation) {
      const items = gsap.utils.toArray('.about-slider-wrapper li');
      
      if (items.length > 0) {
        // Set initial state
        gsap.set(items, { 
          opacity: (i) => i === 0 ? 1 : 0.2 
        });

        // Create staggered fade animation
        items.forEach((item, index) => {
          ScrollTrigger.create({
            trigger: item,
            start: 'top center+=100',
            end: 'bottom center-=100',
            scrub: true,
            onUpdate: (self) => {
              const progress = self.progress;
              const opacity = 0.2 + (0.8 * Math.sin(progress * Math.PI));
              gsap.set(item, { opacity });
            }
          });
        });

        // Color hue animation
        ScrollTrigger.create({
          trigger: '.about-slider-wrapper ul',
          start: 'top center',
          end: 'bottom center',
          scrub: true,
          onUpdate: (self) => {
            const hue = config.start + (config.end - config.start) * self.progress;
            document.documentElement.style.setProperty('--hue', hue);
          }
        });
      }
    }

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="about-slider-wrapper" data-theme="dark" data-animate="true" data-snap="true" data-sync-scrollbar="true">
      <header>
        <h1>What we<br />do</h1>
      </header>
      
      <main>
        <section className="content">
          <h2>
            <span aria-hidden="true">Products Include </span>
            <span className="sr-only">Our product range</span>
          </h2>
          
          <ul>
            <li style={{'--i': 0}}>Prerolls.</li>
            <li style={{'--i': 1}}>Flower.</li>
            <li style={{'--i': 2}}>Edibles.</li>
            <li style={{'--i': 3}}>Concentrates.</li>
            <li style={{'--i': 4}}>Pods.</li>
            <li style={{'--i': 5}}>Disposables.</li>
            <li style={{'--i': 6}}>Infused Prerolls.</li>
            <li style={{'--i': 7}}>Hemp Prerolls.</li>
            <li style={{'--i': 8}}>Hash.</li>
            <li style={{'--i': 9}}>Hash Infused Prerolls.</li>
            <li style={{'--i': 10}}>Distillate.</li>
            <li style={{'--i': 11}}>Liquid Diamonds.</li>
            <li style={{'--i': 12}}>Sample Material Diamonds.</li>
            <li style={{'--i': 13}}>Cartridges.</li>
            <li style={{'--i': 14}}>Apparel.</li>
            <li style={{'--i': 15}}>Merch.</li>
            <li style={{'--i': 16}}>Batteries.</li>
          </ul>
        </section>
        
        <section>
          <h2>info@kushiebrand.com</h2>
        </section>
      </main>
      
      <footer>© 2025 Brand. All rights reserved.</footer>
    </div>
  );
};

export default AboutSlider;