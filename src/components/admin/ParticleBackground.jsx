import { useEffect, useRef } from 'react';

// Math shortcuts
const math = Math;

// Fast array utilities
const fast = {
  indexOf: (arr, item) => arr.indexOf(item)
};

// Calc utilities
const Calc = {
  rand: (min, max) => math.random() * (max - min) + min,
  clamp: (val, min, max) => math.max(min, math.min(max, val))
};

class SpatialHash {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.reset();
  }

  reset() {
    this.cells = {};
  }

  key(point) {
    let x = math.floor(point.x / this.cellSize);
    let y = math.floor(point.y / this.cellSize);
    return `${x}-${y}`;
  }

  insert(point) {
    let key = this.key(point);
    let cell = this.cells[key];
    if (!cell) {
      cell = this.cells[key] = {};
      cell.x = math.floor(point.x / this.cellSize);
      cell.y = math.floor(point.y / this.cellSize);
      cell.alpha = 0;
      cell.alphaTarget = 0;
      cell.items = [];
    }
    cell.items.push(point);
  }

  remove(point, last) {
    let cell = null;
    if (last) {
      cell = this.cells[last];
    } else {
      let key = this.key(point);
      cell = this.cells[key];
    }
    if (cell) {
      let index = fast.indexOf(cell.items, point);
      if (index !== -1) {
        cell.items.splice(index, 1);
      }
    }
  }
}

class Point {
  constructor(demo) {
    this.guid = demo.guid++;
    this.demo = demo;
    this.x = Calc.rand(0, this.demo.width);
    this.y = Calc.rand(0, this.demo.height);
    this.vx = Calc.rand(-1, 1);
    this.vy = Calc.rand(-1, 1);
    this.radius = 1;
    this.demo.sh.insert(this);
    this.hash = this.demo.sh.key(this);
    this.lastHash = this.hash;
    this.thresh = math.pow(this.demo.sh.cellSize, 2);
    this.compareList = [];
    this.scale = 1;
    this.scaleTarget = 1;
  }

  compareOther(other) {
    if (fast.indexOf(this.compareList, other.guid) > -1 || fast.indexOf(other.compareList, this.guid) > -1) {
      return false;
    }
    let dx = other.x - this.x;
    let dy = other.y - this.y;
    let dist = dx * dx + dy * dy;
    if (dist < this.thresh) {
      let angle = math.atan2(dy, dx);
      let cos = math.cos(angle);
      let sin = math.sin(angle);
      let mag = (this.thresh - dist) * 0.0001;
      this.vx -= cos * mag;
      this.vy -= sin * mag;
      other.vx += cos * mag;
      other.vy += sin * mag;
    }
    this.compareList.push(other.guid);
    other.compareList.push(this.guid);
  }

  compareMouse() {
    let dx = this.demo.mouse.x - this.x;
    let dy = this.demo.mouse.y - this.y;
    let dist = dx * dx + dy * dy;
    let thresh = this.thresh * 3;
    this.scaleTarget = 1;
    if (dist < thresh) {
      let angle = math.atan2(dy, dx);
      let mag = (thresh - dist) * 0.0003;
      this.vx -= math.cos(angle) * mag;
      this.vy -= math.sin(angle) * mag;
      this.scaleTarget = 1 + (thresh - dist) * 0.009;
    }
  }

  preupdate() {
    this.compareList.length = 0;
  }

  update() {
    this.hash = this.demo.sh.key(this);
    if (this.hash !== this.lastHash) {
      this.demo.sh.remove(this, this.lastHash);
      this.demo.sh.insert(this);
    }

    this.vx += (this.demo.mouse.x - this.demo.width / 2) * 0.0009;
    this.vy += (this.demo.mouse.y - this.demo.height / 2) * 0.0009;

    this.compareMouse();

    if (this.vx > 0.5) this.vx *= 0.95;
    if (this.vx < -0.5) this.vx *= 0.95;
    if (this.vy > 0.5) this.vy *= 0.95;
    if (this.vy < -0.5) this.vy *= 0.95;

    this.x += this.vx * this.demo.dt;
    this.y += this.vy * this.demo.dt;

    if (this.x >= this.demo.width - this.radius) {
      this.x = this.demo.width - this.radius;
      this.vx -= 1;
    }
    if (this.x <= this.radius) {
      this.x = this.radius;
      this.vx += 1;
    }
    if (this.y >= this.demo.height - this.radius) {
      this.y = this.demo.height - this.radius;
      this.vy -= 1;
    }
    if (this.y <= this.radius) {
      this.y = this.radius;
      this.vy += 1;
    }

    this.lastHash = this.hash;
    this.scale += (this.scaleTarget - this.scale) * 0.1;
  }

  render() {
    this.demo.ctx.fillStyle = `hsla(${this.demo.hue + this.y * 0.15 + this.x * 0.15}, 80%, 50%, 1)`;
    this.demo.ctx.beginPath();
    this.demo.ctx.arc(this.x, this.y, this.radius * this.scale, 0, Math.PI * 2);
    this.demo.ctx.fill();
  }
}

class ParticleDemo {
  constructor(canvas, initialHue = 160) {
    this.guid = 0;
    this.currTime = Date.now();
    this.lastTime = this.currTime;
    this.dt = 1;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sh = new SpatialHash(15);
    this.points = [];
    this.combined = [];
    this.mouse = { x: 0, y: 0 };
    this.hue = initialHue;
    this.animationId = null;
    this.isRunning = false;
  }

  reset() {
    this.points = [];
    this.sh.reset();
    this.onResize();

    const pointCount = Math.min(150, Math.floor((this.width * this.height) / 400));
    for (let i = 0; i < pointCount; i++) {
      let point = new Point(this);
      this.points.push(point);
    }
  }

  onResize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.dpr = window.devicePixelRatio || 1;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(this.dpr, this.dpr);

    this.bcr = this.canvas.getBoundingClientRect();
    this.mouse.x = this.width / 2;
    this.mouse.y = this.height / 2;
  }

  onMousemove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = Calc.clamp(e.clientX - rect.left, 0, this.width - 1);
    this.mouse.y = Calc.clamp(e.clientY - rect.top, 0, this.height - 1);
  }

  preupdate() {
    let i = this.points.length;
    while (i--) {
      this.points[i].preupdate();
    }
  }

  update() {
    this.hue += 0.5;

    for (let key in this.sh.cells) {
      this.combined.length = 0;
      let cell = this.sh.cells[key];
      cell && this.combined.push(...cell.items);

      const neighbors = [
        `${cell.x - 1}-${cell.y - 1}`, `${cell.x}-${cell.y - 1}`, `${cell.x + 1}-${cell.y - 1}`,
        `${cell.x - 1}-${cell.y}`, `${cell.x + 1}-${cell.y}`,
        `${cell.x - 1}-${cell.y + 1}`, `${cell.x}-${cell.y + 1}`, `${cell.x + 1}-${cell.y + 1}`
      ];

      neighbors.forEach(n => {
        const neighborCell = this.sh.cells[n];
        neighborCell && this.combined.push(...neighborCell.items);
      });

      let j = this.combined.length;
      while (j--) {
        let item = this.combined[j];
        let k = j;
        while (k--) {
          item.compareOther(this.combined[k]);
        }
      }
    }

    let i = this.points.length;
    while (i--) {
      this.points[i].update();
    }
  }

  render() {
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = 'hsla(0, 0%, 5%, 1)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw points only (no grid or cell highlights)
    let i = this.points.length;
    while (i--) {
      this.points[i].render();
    }
  }

  loop() {
    if (!this.isRunning) return;

    this.currTime = Date.now();
    if (this.oldTime) {
      this.dt = (this.currTime - this.oldTime) / (1000 / 60);
    }
    this.oldTime = this.currTime;
    this.preupdate();
    this.update();
    this.render();
    this.animationId = window.requestAnimationFrame(() => this.loop());
  }

  start() {
    this.isRunning = true;
    this.reset();
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      window.cancelAnimationFrame(this.animationId);
    }
  }
}

const ParticleBackground = ({ hue = 160, className = '' }) => {
  const canvasRef = useRef(null);
  const demoRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const demo = new ParticleDemo(canvasRef.current, hue);
    demoRef.current = demo;
    demo.start();

    const handleResize = () => {
      demo.reset();
    };

    const handleMouseMove = (e) => {
      demo.onMousemove(e);
    };

    window.addEventListener('resize', handleResize);
    canvasRef.current.addEventListener('mousemove', handleMouseMove);

    return () => {
      demo.stop();
      window.removeEventListener('resize', handleResize);
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [hue]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ borderRadius: 'inherit' }}
    />
  );
};

export default ParticleBackground;
