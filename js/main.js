/* ============================================
   PLATINUM VENTURE LABS - MAIN JS
   Neural Network Canvas + Animations + Interactions
   ============================================ */

// ─── Neural Network Particle Canvas ─────────────────────────
class NeuralCanvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 200 };
        this.particleCount = this.getParticleCount();
        this.connectionDistance = 150;
        this.animationId = null;

        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }

    getParticleCount() {
        const w = window.innerWidth;
        if (w < 480) return 40;
        if (w < 768) return 60;
        if (w < 1200) return 90;
        return 120;
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = this.canvas.offsetWidth * dpr;
        this.canvas.height = this.canvas.offsetHeight * dpr;
        this.ctx.scale(dpr, dpr);
        this.width = this.canvas.offsetWidth;
        this.height = this.canvas.offsetHeight;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 0.5,
                baseRadius: Math.random() * 2 + 0.5,
                pulseSpeed: Math.random() * 0.02 + 0.005,
                pulseOffset: Math.random() * Math.PI * 2,
                opacity: Math.random() * 0.5 + 0.2,
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.particleCount = this.getParticleCount();
            // Adjust particle array
            while (this.particles.length < this.particleCount) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 2 + 0.5,
                    baseRadius: Math.random() * 2 + 0.5,
                    pulseSpeed: Math.random() * 0.02 + 0.005,
                    pulseOffset: Math.random() * Math.PI * 2,
                    opacity: Math.random() * 0.5 + 0.2,
                });
            }
            this.particles.length = this.particleCount;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    drawParticle(p, time) {
        const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset);
        p.radius = p.baseRadius + pulse * 0.5;

        // Particle glow
        const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
        gradient.addColorStop(0, `rgba(0, 212, 255, ${p.opacity * 0.8})`);
        gradient.addColorStop(0.5, `rgba(0, 212, 255, ${p.opacity * 0.2})`);
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Particle core
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity})`;
        this.ctx.fill();
    }

    drawConnections(time) {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.connectionDistance) {
                    const opacity = (1 - dist / this.connectionDistance) * 0.15;
                    const pulse = (Math.sin(time * 0.001 + i + j) + 1) * 0.5;
                    const finalOpacity = opacity * (0.5 + pulse * 0.5);

                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(0, 212, 255, ${finalOpacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
    }

    drawMouseConnections() {
        if (this.mouse.x === null) return;
        for (const p of this.particles) {
            const dx = p.x - this.mouse.x;
            const dy = p.y - this.mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.mouse.radius) {
                const opacity = (1 - dist / this.mouse.radius) * 0.3;
                this.ctx.beginPath();
                this.ctx.moveTo(this.mouse.x, this.mouse.y);
                this.ctx.lineTo(p.x, p.y);
                this.ctx.strokeStyle = `rgba(0, 255, 136, ${opacity})`;
                this.ctx.lineWidth = 0.8;
                this.ctx.stroke();

                // Attract particles slightly toward mouse
                p.vx += dx * 0.00005;
                p.vy += dy * 0.00005;
            }
        }
    }

    update() {
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;

            // Dampen velocity
            p.vx *= 0.999;
            p.vy *= 0.999;

            // Add slight random drift
            p.vx += (Math.random() - 0.5) * 0.02;
            p.vy += (Math.random() - 0.5) * 0.02;

            // Boundary wrap
            if (p.x < -10) p.x = this.width + 10;
            if (p.x > this.width + 10) p.x = -10;
            if (p.y < -10) p.y = this.height + 10;
            if (p.y > this.height + 10) p.y = -10;
        }
    }

    animate() {
        const time = performance.now();
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.drawConnections(time);
        this.drawMouseConnections();

        for (const p of this.particles) {
            this.drawParticle(p, time);
        }

        this.update();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        cancelAnimationFrame(this.animationId);
    }
}


// ─── Focus Card Background Patterns ─────────────────────────
class FocusPattern {
    constructor(canvas, pattern) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.pattern = pattern;
        this.time = 0;
        this.resize();
        this.animate();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
        this.width = rect.width;
        this.height = rect.height;
    }

    drawNeural() {
        const nodes = [];
        const cols = 8;
        const rows = 6;
        const spacingX = this.width / cols;
        const spacingY = this.height / rows;

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const jitter = Math.sin(this.time * 0.5 + i * j) * 8;
                nodes.push({
                    x: spacingX * i + spacingX / 2 + jitter,
                    y: spacingY * j + spacingY / 2 + jitter,
                });
            }
        }

        // Draw connections
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const opacity = (1 - dist / 120) * 0.3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(nodes[i].x, nodes[i].y);
                    this.ctx.lineTo(nodes[j].x, nodes[j].y);
                    this.ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }

        // Draw nodes
        for (const node of nodes) {
            const pulse = Math.sin(this.time + node.x * 0.01) * 0.3 + 0.5;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 212, 255, ${pulse})`;
            this.ctx.fill();
        }
    }

    drawGrid() {
        const spacing = 30;
        const offset = (this.time * 10) % spacing;

        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
        this.ctx.lineWidth = 0.5;

        for (let x = offset; x < this.width; x += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        for (let y = offset; y < this.height; y += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        // Glowing intersections
        for (let x = offset; x < this.width; x += spacing) {
            for (let y = offset; y < this.height; y += spacing) {
                const pulse = Math.sin(this.time * 2 + x * 0.01 + y * 0.01) * 0.3 + 0.3;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(0, 255, 136, ${pulse})`;
                this.ctx.fill();
            }
        }
    }

    drawMatrix() {
        const chars = '01';
        this.ctx.font = '10px JetBrains Mono, monospace';
        const cols = Math.floor(this.width / 14);
        const rows = Math.floor(this.height / 16);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const opacity = Math.sin(this.time * 0.8 + i * 0.5 + j * 0.7) * 0.15 + 0.1;
                if (opacity > 0.05) {
                    const char = chars[Math.floor(Math.random() * chars.length)];
                    this.ctx.fillStyle = `rgba(124, 58, 237, ${opacity})`;
                    this.ctx.fillText(char, i * 14 + 4, j * 16 + 12);
                }
            }
        }
    }

    animate() {
        this.time += 0.016;
        this.ctx.clearRect(0, 0, this.width, this.height);

        switch (this.pattern) {
            case 'neural': this.drawNeural(); break;
            case 'grid': this.drawGrid(); break;
            case 'matrix': this.drawMatrix(); break;
        }

        requestAnimationFrame(() => this.animate());
    }
}


// ─── Typewriter Effect ──────────────────────────────────────
class Typewriter {
    constructor(element, strings, opts = {}) {
        this.el = element;
        this.strings = strings;
        this.typeSpeed = opts.typeSpeed || 40;
        this.deleteSpeed = opts.deleteSpeed || 25;
        this.pauseTime = opts.pauseTime || 2500;
        this.currentString = 0;
        this.currentChar = 0;
        this.isDeleting = false;

        // Add cursor
        this.cursor = document.createElement('span');
        this.cursor.className = 'cursor';
        this.el.appendChild(this.cursor);

        this.textNode = document.createTextNode('');
        this.el.insertBefore(this.textNode, this.cursor);

        this.type();
    }

    type() {
        const str = this.strings[this.currentString];

        if (!this.isDeleting) {
            this.currentChar++;
            this.textNode.textContent = str.substring(0, this.currentChar);

            if (this.currentChar === str.length) {
                setTimeout(() => {
                    this.isDeleting = true;
                    this.type();
                }, this.pauseTime);
                return;
            }
            setTimeout(() => this.type(), this.typeSpeed);
        } else {
            this.currentChar--;
            this.textNode.textContent = str.substring(0, this.currentChar);

            if (this.currentChar === 0) {
                this.isDeleting = false;
                this.currentString = (this.currentString + 1) % this.strings.length;
                setTimeout(() => this.type(), 500);
                return;
            }
            setTimeout(() => this.type(), this.deleteSpeed);
        }
    }
}


// ─── Cursor Glow ────────────────────────────────────────────
function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow || window.innerWidth < 768) return;

    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function updateGlow() {
        currentX += (mouseX - currentX) * 0.08;
        currentY += (mouseY - currentY) * 0.08;
        glow.style.left = currentX + 'px';
        glow.style.top = currentY + 'px';
        requestAnimationFrame(updateGlow);
    }
    updateGlow();
}


// ─── Navbar ─────────────────────────────────────────────────
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        if (currentScroll > lastScroll && currentScroll > 400) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }

        lastScroll = currentScroll;
    });

    // Mobile toggle
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        links.classList.toggle('open');
    });

    // Close mobile menu on link click
    links.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            links.classList.remove('open');
        });
    });
}


// ─── Scroll Reveal ──────────────────────────────────────────
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    document.querySelectorAll('[data-reveal]').forEach(el => {
        observer.observe(el);
    });
}


// ─── Counter Animation ──────────────────────────────────────
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals) || 0;
    const duration = 2000;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quart
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = target * eased;

        el.textContent = decimals > 0
            ? current.toFixed(decimals)
            : Math.floor(current);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = decimals > 0 ? target.toFixed(decimals) : target;
        }
    }

    requestAnimationFrame(update);
}


// ─── Card Tilt Effect ───────────────────────────────────────
function initTiltEffects() {
    document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -3;
            const rotateY = (x - centerX) / centerX * 3;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;

            // Update glow position for focus cards
            const glow = card.querySelector('.focus-card-glow');
            if (glow) {
                const percentX = (x / rect.width) * 100;
                const percentY = (y / rect.height) * 100;
                card.style.setProperty('--mouse-x', percentX + '%');
                card.style.setProperty('--mouse-y', percentY + '%');
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}


// ─── Smooth Scroll ──────────────────────────────────────────
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const target = document.querySelector(href);
            if (target) {
                // Hero should scroll to absolute top so GSAP fully resets
                const offset = href === '#hero' ? 0 : 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
            }
        });
    });
}


// ─── Hero Entrance Animation ────────────────────────────────
function initHeroEntrance() {
    if (typeof gsap === 'undefined') return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Set initial hidden state, then animate in
    gsap.set(['.hero-badge', '.title-line', '.hero-cta', '.scroll-indicator'], {
        opacity: 0, y: 30
    });

    tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.8 }, 0.2)
      .to('.title-line:first-child', { opacity: 1, y: 0, duration: 0.9 }, 0.4)
      .to('.title-line:last-child', { opacity: 1, y: 0, duration: 0.9 }, 0.6)
      .to('.hero-cta', { opacity: 1, y: 0, duration: 0.8 }, 1.0)
      .to('.scroll-indicator', { opacity: 1, y: 0, duration: 0.6 }, 1.4);
}


// ─── GSAP Scroll Animations (progressive enhancement) ──────
function initGSAPAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance animation first
    initHeroEntrance();

    // Parallax on hero — only use transform, no opacity
    // Opacity is handled by the hero entrance timeline and stays at 1
    gsap.to('.hero-content', {
        yPercent: 30,
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
        }
    });

    // Scroll indicator fade — separate from hero content
    ScrollTrigger.create({
        trigger: '.hero',
        start: '10% top',
        end: '25% top',
        scrub: true,
        animation: gsap.to('.scroll-indicator', { opacity: 0 }),
    });

}


// ─── Active Nav Link Highlight ──────────────────────────────
function initActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-80px 0px -50% 0px',
    });

    sections.forEach(section => observer.observe(section));
}


// ─── Initialize Everything ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Neural network canvas
    const canvas = document.getElementById('neuralCanvas');
    if (canvas) new NeuralCanvas(canvas);

    // Focus card canvases
    document.querySelectorAll('.focus-canvas').forEach(c => {
        new FocusPattern(c, c.dataset.pattern);
    });

    // Typewriter
    const typewriterEl = document.getElementById('typewriter');
    if (typewriterEl) {
        new Typewriter(typewriterEl, [
            'Incubating breakthrough ventures in AI & deep tech.',
            'Backing the next generation of founders.',
            'From neuromorphic computing to autonomous systems.',
            'Where frontier technology meets venture capital.',
        ], { typeSpeed: 35, deleteSpeed: 20, pauseTime: 3000 });
    }

    // Init all modules
    initCursorGlow();
    initNavbar();
    initScrollReveal();
    initCounters();
    initTiltEffects();
    initSmoothScroll();
    initActiveNavLink();

    // GSAP — small delay to ensure CDN scripts are parsed
    if (typeof gsap !== 'undefined') {
        initGSAPAnimations();
    } else {
        // CDN might still be loading; retry once then give up (content stays visible)
        setTimeout(() => {
            if (typeof gsap !== 'undefined') {
                initGSAPAnimations();
            }
        }, 500);
    }
});
