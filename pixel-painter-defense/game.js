// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = 'drawing'; // 'drawing' or 'battle'
let currentColor = '#FF0000';
let brushSize = 20;
let unitDensity = 5;
let isDrawing = false;
let units = [];
let teams = new Map(); // Track teams by color
let eliminationOrder = []; // Track order of team elimination
let lastPos = null;

// Get UI elements
const colorBtns = document.querySelectorAll('.color-btn');
const brushSizeInput = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const unitDensityInput = document.getElementById('unitDensity');
const unitDensityValue = document.getElementById('unitDensityValue');
const clearBtn = document.getElementById('clearBtn');
const startBattleBtn = document.getElementById('startBattleBtn');
const resetBtn = document.getElementById('resetBtn');
const gameStatus = document.getElementById('gameStatus');
const scoreboard = document.getElementById('scoreboard');
const scoreList = document.getElementById('scoreList');

// Unit class
class Unit {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.health = 100;
        this.maxHealth = 100;
        this.radius = 3;
        this.speed = 1;
        this.attackRange = 15;
        this.attackDamage = 2;
        this.attackCooldown = 0;
        this.attackSpeed = 10; // frames between attacks
        this.target = null;
    }

    findNearestEnemy() {
        let nearest = null;
        let minDist = Infinity;

        for (let unit of units) {
            if (unit.color !== this.color && unit.health > 0) {
                const dist = Math.hypot(unit.x - this.x, unit.y - this.y);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = unit;
                }
            }
        }

        return nearest;
    }

    update() {
        if (this.health <= 0) return;

        // Find target
        if (!this.target || this.target.health <= 0) {
            this.target = this.findNearestEnemy();
        }

        if (this.target) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const dist = Math.hypot(dx, dy);

            // Move toward target if not in range
            if (dist > this.attackRange) {
                this.x += (dx / dist) * this.speed;
                this.y += (dy / dist) * this.speed;

                // Keep units within canvas bounds
                this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
                this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
            } else {
                // Attack target
                if (this.attackCooldown <= 0) {
                    this.target.health -= this.attackDamage;
                    this.attackCooldown = this.attackSpeed;

                    // Visual feedback - draw attack line
                    ctx.strokeStyle = this.color;
                    ctx.globalAlpha = 0.3;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(this.target.x, this.target.y);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        }

        // Decrease attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
    }

    draw() {
        if (this.health <= 0) return;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw health bar if damaged
        if (this.health < this.maxHealth) {
            const barWidth = 8;
            const barHeight = 2;
            const barX = this.x - barWidth / 2;
            const barY = this.y - this.radius - 4;

            // Background
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            // Health
            ctx.fillStyle = '#0f0';
            ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
        }
    }
}

// Event listeners for color selection
colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentColor = btn.dataset.color;
    });
});

// Brush size control
brushSizeInput.addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
    brushSizeValue.textContent = brushSize;
});

// Unit density control
unitDensityInput.addEventListener('input', (e) => {
    unitDensity = parseInt(e.target.value);
    unitDensityValue.textContent = unitDensity;
});

// Clear button
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    units = [];
    teams.clear();
    updateStatus('Canvas cleared. Draw your armies!');
});

// Start battle button
startBattleBtn.addEventListener('click', () => {
    if (units.length === 0) {
        updateStatus('Draw some armies first!');
        return;
    }

    const teamCount = teams.size;
    if (teamCount < 2) {
        updateStatus('You need at least 2 different color teams to battle!');
        return;
    }

    gameState = 'battle';
    canvas.classList.add('battle-mode');
    startBattleBtn.style.display = 'none';
    clearBtn.style.display = 'none';
    colorBtns.forEach(btn => btn.disabled = true);
    brushSizeInput.disabled = true;
    unitDensityInput.disabled = true;

    updateStatus(`Battle started! ${teamCount} teams are fighting!`);
    gameLoop();
});

// Reset button
resetBtn.addEventListener('click', () => {
    location.reload();
});

// Drawing on canvas
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

// Touch support
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', stopDrawing);

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    isDrawing = true;
    lastPos = { x, y };
    drawCircle(x, y);
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing || gameState !== 'drawing') return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    draw({ clientX: touch.clientX, clientY: touch.clientY });
}

function startDrawing(e) {
    if (gameState !== 'drawing') return;
    isDrawing = true;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lastPos = { x, y };

    drawCircle(x, y);
}

function draw(e) {
    if (!isDrawing || gameState !== 'drawing') return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Draw line between last position and current position
    if (lastPos) {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Create units along the line
        const dist = Math.hypot(x - lastPos.x, y - lastPos.y);
        const steps = Math.max(1, Math.floor(dist / (10 / unitDensity)));

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const px = lastPos.x + (x - lastPos.x) * t;
            const py = lastPos.y + (y - lastPos.y) * t;
            createUnitAt(px, py, currentColor);
        }
    }

    lastPos = { x, y };
}

function drawCircle(x, y) {
    ctx.fillStyle = currentColor;
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Create units in circle
    const numUnits = Math.floor((brushSize / 2) * unitDensity / 2);
    for (let i = 0; i < numUnits; i++) {
        const angle = (Math.PI * 2 * i) / numUnits;
        const radius = Math.random() * brushSize / 2;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        createUnitAt(px, py, currentColor);
    }
}

function stopDrawing() {
    isDrawing = false;
    lastPos = null;
}

function createUnitAt(x, y, color) {
    // Add some randomness to prevent exact overlap
    const jitterX = (Math.random() - 0.5) * 3;
    const jitterY = (Math.random() - 0.5) * 3;

    const unit = new Unit(x + jitterX, y + jitterY, color);
    units.push(unit);

    // Track teams
    if (!teams.has(color)) {
        teams.set(color, []);
    }
    teams.get(color).push(unit);
}

function updateStatus(message) {
    gameStatus.textContent = message;
}

// Game loop
function gameLoop() {
    if (gameState !== 'battle') return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw all units
    for (let unit of units) {
        unit.update();
        unit.draw();
    }

    // Remove dead units and check for team elimination
    units = units.filter(unit => unit.health > 0);

    // Update team counts
    const activeTeams = new Map();
    for (let unit of units) {
        if (!activeTeams.has(unit.color)) {
            activeTeams.set(unit.color, 0);
        }
        activeTeams.set(unit.color, activeTeams.get(unit.color) + 1);
    }

    // Check for eliminated teams
    for (let [color, teamUnits] of teams) {
        if (!activeTeams.has(color) && !eliminationOrder.includes(color)) {
            eliminationOrder.push(color);
            console.log(`Team ${color} eliminated! Place: ${eliminationOrder.length}`);
        }
    }

    // Update status
    const remaining = activeTeams.size;
    const totalUnits = units.length;
    updateStatus(`${remaining} team(s) remaining | ${totalUnits} units alive | ${eliminationOrder.length} eliminated`);

    // Check for winner
    if (activeTeams.size <= 1) {
        endBattle(activeTeams);
        return;
    }

    // Continue loop
    requestAnimationFrame(gameLoop);
}

function endBattle(activeTeams) {
    gameState = 'ended';

    // Add winner to the beginning of elimination order (they placed 1st)
    let winner = null;
    if (activeTeams.size === 1) {
        winner = activeTeams.keys().next().value;
    }

    // Create final standings (reverse elimination order)
    const standings = [];
    if (winner) {
        standings.push(winner);
    }

    // Add eliminated teams in reverse order (last eliminated = 2nd place)
    for (let i = eliminationOrder.length - 1; i >= 0; i--) {
        standings.push(eliminationOrder[i]);
    }

    displayScoreboard(standings);
    updateStatus('Battle complete! Check the scoreboard below.');
    resetBtn.style.display = 'block';
}

function displayScoreboard(standings) {
    scoreboard.style.display = 'block';
    scoreList.innerHTML = '';

    standings.forEach((color, index) => {
        const li = document.createElement('li');
        const place = index + 1;
        const suffix = place === 1 ? 'st' : place === 2 ? 'nd' : place === 3 ? 'rd' : 'th';

        const initialCount = teams.get(color).length;
        const survived = index === 0 ? units.filter(u => u.color === color).length : 0;

        li.innerHTML = `
            <span>${place}${suffix} Place - Started with ${initialCount} units${survived > 0 ? `, ${survived} survived` : ''}</span>
            <div class="color-indicator" style="background-color: ${color};"></div>
        `;

        scoreList.appendChild(li);
    });
}

// Initialize
updateStatus('Draw your armies with different colors, then click Start Battle!');
