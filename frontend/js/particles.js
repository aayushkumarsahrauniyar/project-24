/* ================================================================
   SHARED FLOATING PARTICLE BACKGROUND
   Usage:  Particles.init('particleCanvas', { particleCount: 70 });
   Options:
     particleCount  - fixed particle count (default: adaptive by screen area)
     maxParticles   - upper bound for the adaptive count (default 70)
     minParticles   - lower bound for the adaptive count (default 20)
     areaPerParticle- px² per particle when adaptive (default 22000)
     sizeMin/sizeMax- particle radius range
     speed          - max velocity magnitude
     opacityMin/opacityMax - alpha range
     glow           - boolean, add a soft shadow on larger particles
     glowColor      - rgba() color used for the glow
   ================================================================ */
(function (global) {
    'use strict';

    class Particle {
        constructor(canvas, opts) {
            this.canvas = canvas;
            this.size = Math.random() * (opts.sizeMax - opts.sizeMin) + opts.sizeMin;
            this.speedX = (Math.random() - 0.5) * opts.speed;
            this.speedY = (Math.random() - 0.5) * opts.speed;
            this.opacity = Math.random() * (opts.opacityMax - opts.opacityMin) + opts.opacityMin;
            const hue = Math.random() > 0.5 ? 145 : 190;
            this.color = `hsla(${hue}, 80%, 60%, ${this.opacity})`;
            this.reset(true);
        }

        reset(randomisePosition) {
            const w = this.canvas.width;
            const h = this.canvas.height;
            if (randomisePosition) {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
            } else {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
            }
        }

        update() {
            const w = this.canvas.width;
            const h = this.canvas.height;
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0) this.x = w;
            if (this.x > w) this.x = 0;
            if (this.y < 0) this.y = h;
            if (this.y > h) this.y = 0;
        }

        draw(ctx, opts) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            if (opts.glow && this.size > 1.5) {
                ctx.shadowColor = opts.glowColor;
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }

    function init(canvasOrId, options) {
        const canvas = typeof canvasOrId === 'string'
            ? document.getElementById(canvasOrId)
            : canvasOrId;
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const opts = Object.assign({
            particleCount: null,
            maxParticles: 70,
            minParticles: 20,
            areaPerParticle: 22000,
            sizeMin: 0.5,
            sizeMax: 2.2,
            speed: 0.25,
            opacityMin: 0.08,
            opacityMax: 0.4,
            glow: false,
            glowColor: 'rgba(0,230,118,0.04)'
        }, options || {});

        let particles = [];
        let animFrameId = null;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function initParticles() {
            let count = opts.particleCount;
            if (!count) {
                const area = canvas.width * canvas.height;
                count = Math.min(
                    opts.maxParticles,
                    Math.max(opts.minParticles, Math.floor(area / opts.areaPerParticle))
                );
            }
            particles = [];
            for (let i = 0; i < count; i++) particles.push(new Particle(canvas, opts));
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw(ctx, opts);
            });
            animFrameId = requestAnimationFrame(animateParticles);
        }

        function start() {
            if (animFrameId) return;
            animateParticles();
        }

        function stop() {
            if (animFrameId) {
                cancelAnimationFrame(animFrameId);
                animFrameId = null;
            }
        }

        window.addEventListener('resize', () => {
            resizeCanvas();
            initParticles();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stop();
            else start();
        });

        resizeCanvas();
        initParticles();
        start();

        return { canvas: canvas, ctx: ctx, start: start, stop: stop };
    }

    global.Particles = { init: init };
})(window);
