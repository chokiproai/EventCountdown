/**
 * Lightweight Visual Effects (Fireworks & Confetti)
 * Renders to a full-screen canvas overlay.
 */

const canvasId = 'effectsCanvas';
let canvas, ctx;
let animationId = null;
let particles = [];
let type = 'none'; // 'fireworks' | 'confetti' | 'none'

function initCanvas() {
    canvas = document.getElementById(canvasId);
    if (!canvas) return false;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    return true;
}

function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ===== Fireworks Logic =====
function createFirework(x, y) {
    const count = 50 + Math.random() * 50;
    const hue = Math.floor(Math.random() * 360);
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 4;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            alpha: 1,
            color: `hsla(${hue}, 100%, 50%,`,
            decay: 0.015 + Math.random() * 0.015,
            gravity: 0.05
        });
    }
}

// ===== Confetti Logic =====
const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];

function createConfetti() {
    const count = 5; // Spawn rate
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -10,
            vx: Math.random() * 4 - 2,
            vy: Math.random() * 5 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5,
            type: 'confetti'
        });
    }
}

// ===== Animation Loop =====
function loop() {
    if (!ctx) return;

    // Clear with trails
    ctx.globalCompositeOperation = type === 'fireworks' ? 'destination-out' : 'clear';
    if (type === 'fireworks') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter';
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Auto-spawn
    if (type === 'fireworks' && Math.random() < 0.05) {
        createFirework(Math.random() * canvas.width, Math.random() * canvas.height / 2);
    }
    if (type === 'confetti') {
        createConfetti();
    }

    // Update & Draw
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        if (p.type === 'confetti') {
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.vy += 0.05; // Gravity

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();

            if (p.y > canvas.height) particles.splice(i, 1);

        } else { // Firework particle
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.alpha -= p.decay;

            ctx.fillStyle = p.color + p.alpha + ')';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();

            if (p.alpha <= 0) particles.splice(i, 1);
        }
    }

    if (particles.length > 0 || type !== 'none') {
        animationId = requestAnimationFrame(loop);
    } else {
        stopEffects();
    }
}

// ===== API =====
window.startFireworks = function () {
    if (!initCanvas()) return;
    type = 'fireworks';
    particles = [];
    if (animationId) cancelAnimationFrame(animationId);
    loop();

    // Stop automatically after 15 seconds
    setTimeout(() => { type = 'none'; }, 15000);
};

window.startConfetti = function () {
    if (!initCanvas()) return;
    type = 'confetti';
    particles = [];
    if (animationId) cancelAnimationFrame(animationId);
    loop();

    // Stop automatically after 10 seconds
    setTimeout(() => { type = 'none'; }, 10000);
};

window.stopEffects = function () {
    type = 'none';
    if (animationId) cancelAnimationFrame(animationId);
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
};
