const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
const mainWord = document.getElementById('main-word');

// Responsivo
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => {
    resizeCanvas();
    setupColumns();
    moveMainWordRandom();
});

// Tamaños adaptables
function getSizes() {
    if (window.innerWidth < 600 || window.innerHeight < 600) {
        return { myLove: 17, main: 26 };
    }
    return { myLove: 14, main: 22 };
}

// Solo 5 columnas SIEMPRE, más lento
const word = "I LOVE YOU";
let columns = [];
function setupColumns() {
    const sizes = getSizes();
    const colCount = 5; // SIEMPRE 5 columnas

    // Espacio horizontal entre columnas para ocupar todo el ancho
    const gap = canvas.width / colCount;

    // 20% menos palabras por columna
    const dropsCount = Math.floor(canvas.height / (sizes.myLove * 1.2) * 0.8);

    columns = [];
    for (let i = 0; i < colCount; i++) {
        columns[i] = {
            x: gap * i + gap / 2,
            drops: Array.from({ length: dropsCount }, () => ({
                y: -Math.random() * canvas.height,
                speed: 0.7 + Math.random() * 0.4, // MUCHO más lento
            }))
        };
    }
}
setupColumns();
window.addEventListener('resize', setupColumns);

// Fuegos artificiales
let fireworks = [];
function triggerFirework(x, y) {
    let particles = [];
    let colors = ['#ff69b4', '#fff', '#ffc0cb', '#ff1493', '#ffb6c1', '#ff007f', '#ffa07a'];
    for (let i = 0; i < 38; i++) {
        let angle = (Math.PI * 2 * i) / 38;
        let speed = 3 + Math.random() * 4;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            radius: 2 + Math.random() * 3
        });
    }
    fireworks.push({particles});
}

function drawFireworks() {
    for (let firework of fireworks) {
        for (let p of firework.particles) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 18;
            ctx.fill();
            ctx.restore();

            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.radius *= 0.98;
            p.alpha -= 0.012 + Math.random() * 0.01;
        }
    }
    fireworks = fireworks.filter(fw => fw.particles.some(p => p.alpha > 0.05 && p.radius > 0.5));
}

// Animación
function drawMatrix() {
    ctx.fillStyle = "rgba(0,0,0,0.12)"; // Más suave la estela
    ctx.fillRect(0,0,canvas.width,canvas.height);

    const sizes = getSizes();
    ctx.font = `bold ${sizes.myLove}px 'Courier New', Courier, monospace`;
    ctx.textAlign = "center";

    // Dibuja 5 columnas ajustadas
    for (let col of columns) {
        for (let drop of col.drops) {
            ctx.fillStyle = "#b30d60";
            ctx.shadowColor = "#e2e2e2";
            ctx.shadowBlur = 4;
            ctx.fillText(word, col.x, drop.y);

            drop.y += drop.speed;
            if (drop.y > canvas.height + sizes.myLove) {
                drop.y = -Math.random() * 140;
                drop.speed = 0.7 + Math.random() * 0.4; // Mantiene velocidad lenta
            }
        }
    }
    ctx.shadowBlur = 0;

    drawFireworks();

    requestAnimationFrame(drawMatrix);
}

// Posición aleatoria de "I LOVE YOU"
function moveMainWordRandom() {
    const sizes = getSizes();
    mainWord.style.fontSize = sizes.main + "px";
    mainWord.style.visibility = "hidden";
    mainWord.style.display = "block";
    mainWord.style.left = "0px";
    mainWord.style.top = "0px";
    setTimeout(() => {
        const width = mainWord.offsetWidth;
        const height = mainWord.offsetHeight;
        const pad = 10;
        const maxLeft = window.innerWidth - width - pad;
        const maxTop = window.innerHeight - height - pad;
        const left = Math.random() * maxLeft + pad;
        const top = Math.random() * maxTop + pad;
        mainWord.style.left = left + "px";
        mainWord.style.top = top + "px";
        mainWord.style.visibility = "visible";
    }, 10);
}
moveMainWordRandom();
let moveInterval = setInterval(moveMainWordRandom, 5000);

function getMainWordPosition() {
    const rect = mainWord.getBoundingClientRect();
    return {
        x: rect.left + rect.width/2,
        y: rect.top + rect.height/2
    };
}

function explodeAndMove(e) {
    let pos = getMainWordPosition();
    triggerFirework(pos.x, pos.y);
    mainWord.style.filter = "brightness(1.2) drop-shadow(0 0 12px #fff)";
    setTimeout(() => mainWord.style.filter = "", 320);
    moveMainWordRandom();
}

mainWord.addEventListener('click', explodeAndMove);
mainWord.addEventListener('touchstart', explodeAndMove);

drawMatrix();