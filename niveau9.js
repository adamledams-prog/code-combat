// Code Combat - Niveau 9 - Labyrinthe de Lave
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 50;
        this.rows = 8;
        this.cols = 12;
        
        // Récupérer le score du niveau précédent
        const urlParams = new URLSearchParams(window.location.search);
        this.score = parseInt(urlParams.get('score')) || 0;
        document.getElementById('score').textContent = this.score;
        
        this.hero = {
            x: 1,
            y: 1,
            symbol: '🦸',
            health: 4,
            maxHealth: 4
        };
        
        // Murs fixes (indestructibles)
        this.walls = [
            // Cadre extérieur
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}, {x: 11, y: 0},
            {x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}, {x: 0, y: 4}, {x: 0, y: 5}, {x: 0, y: 6}, {x: 0, y: 7},
            {x: 11, y: 1}, {x: 11, y: 2}, {x: 11, y: 3}, {x: 11, y: 4}, {x: 11, y: 5}, {x: 11, y: 6}, {x: 11, y: 7},
            {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}, {x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7},
            
            // Quelques obstacles fixes pour créer un labyrinthe
            {x: 3, y: 1}, {x: 3, y: 2}, {x: 3, y: 3},
            {x: 5, y: 3}, {x: 5, y: 4}, {x: 5, y: 5},
            {x: 7, y: 1}, {x: 7, y: 2},
            {x: 9, y: 4}, {x: 9, y: 5}, {x: 9, y: 6}
        ];
        
        // 4 murs de lave qui se téléportent aléatoirement
        this.lavaWalls = [
            {x: 4, y: 2},
            {x: 6, y: 3},
            {x: 8, y: 5},
            {x: 2, y: 4}
        ];
        
        // Positions possibles pour la lave (cases libres du labyrinthe)
        this.possibleLavaPositions = [
            {x: 1, y: 1}, {x: 2, y: 1}, {x: 4, y: 1}, {x: 5, y: 1}, {x: 6, y: 1}, {x: 8, y: 1}, {x: 9, y: 1}, {x: 10, y: 1},
            {x: 1, y: 2}, {x: 2, y: 2}, {x: 4, y: 2}, {x: 5, y: 2}, {x: 6, y: 2}, {x: 8, y: 2}, {x: 9, y: 2}, {x: 10, y: 2},
            {x: 1, y: 3}, {x: 2, y: 3}, {x: 4, y: 3}, {x: 6, y: 3}, {x: 7, y: 3}, {x: 8, y: 3}, {x: 10, y: 3},
            {x: 1, y: 4}, {x: 2, y: 4}, {x: 3, y: 4}, {x: 4, y: 4}, {x: 6, y: 4}, {x: 7, y: 4}, {x: 8, y: 4}, {x: 10, y: 4},
            {x: 1, y: 5}, {x: 2, y: 5}, {x: 3, y: 5}, {x: 4, y: 5}, {x: 6, y: 5}, {x: 7, y: 5}, {x: 8, y: 5}, {x: 10, y: 5},
            {x: 1, y: 6}, {x: 2, y: 6}, {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6}, {x: 6, y: 6}, {x: 7, y: 6}, {x: 8, y: 6}, {x: 10, y: 6}
        ];
        
        // Gemme à atteindre
        this.gem = {
            x: 10,
            y: 6,
            symbol: '💎'
        };
        
        this.gameOver = false;
        this.lavaTeleportInterval = null;
        
        this.startLavaTeleport();
        
        this.draw();
        this.updateHealthBar();
    }
    
    startLavaTeleport() {
        // La lave se téléporte toutes les 2 secondes
        this.lavaTeleportInterval = setInterval(() => {
            if (!this.gameOver) {
                this.teleportLava();
            }
        }, 2000);
    }
    
    teleportLava() {
        // Téléporter chaque mur de lave à une position aléatoire
        this.lavaWalls.forEach(lava => {
            // Filtrer les positions disponibles (pas sur le héros, pas sur un autre mur de lave, pas sur la gemme)
            const availablePositions = this.possibleLavaPositions.filter(pos => {
                const isHero = pos.x === this.hero.x && pos.y === this.hero.y;
                const isGem = pos.x === this.gem.x && pos.y === this.gem.y;
                const isOtherLava = this.lavaWalls.some(l => l !== lava && l.x === pos.x && l.y === pos.y);
                return !isHero && !isGem && !isOtherLava;
            });
            
            if (availablePositions.length > 0) {
                const randomPos = availablePositions[Math.floor(Math.random() * availablePositions.length)];
                lava.x = randomPos.x;
                lava.y = randomPos.y;
            }
        });
        
        // Vérifier si le héros est sur une lave après téléportation
        if (this.isLava(this.hero.x, this.hero.y)) {
            this.gameOver = true;
            this.stopAllIntervals();
            alert('🌋 Game Over! Tu as été brûlé par la lave!');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
        
        this.draw();
    }
    
    stopAllIntervals() {
        clearInterval(this.lavaTeleportInterval);
    }
    
    updateHealthBar() {
        const healthFill = document.getElementById('hero-health');
        const healthValue = document.getElementById('health-value');
        const percentage = (this.hero.health / this.hero.maxHealth) * 100;
        
        healthFill.style.width = percentage + '%';
        healthValue.textContent = this.hero.health;
        
        healthFill.className = 'health-fill';
        if (percentage <= 33) {
            healthFill.classList.add('low');
        } else if (percentage <= 66) {
            healthFill.classList.add('medium');
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        
        // Dessiner les murs fixes
        this.walls.forEach(wall => {
            this.drawWall(wall.x, wall.y);
        });
        
        // Dessiner les murs de lave
        this.lavaWalls.forEach(lava => {
            this.drawLava(lava.x, lava.y);
        });
        
        // Dessiner la gemme
        this.drawCharacter(this.gem.x, this.gem.y, this.gem.symbol);
        
        // Dessiner le héros
        this.drawCharacter(this.hero.x, this.hero.y, this.hero.symbol);
        this.drawHealthBar(this.hero.x, this.hero.y, this.hero.health, this.hero.maxHealth);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#1a3a1a';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.cols; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let i = 0; i <= this.rows; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    drawCharacter(x, y, symbol) {
        const centerX = x * this.gridSize + this.gridSize / 2;
        const centerY = y * this.gridSize + this.gridSize / 2;
        
        this.ctx.font = '35px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(symbol, centerX, centerY);
    }
    
    drawHealthBar(x, y, health, maxHealth) {
        const posX = x * this.gridSize;
        const posY = y * this.gridSize - 10;
        const barWidth = 40;
        const barHeight = 6;
        const healthPercentage = health / maxHealth;
        
        this.ctx.fillStyle = '#2d3748';
        this.ctx.fillRect(posX + 5, posY, barWidth, barHeight);
        
        if (healthPercentage > 0.66) {
            this.ctx.fillStyle = '#48bb78';
        } else if (healthPercentage > 0.33) {
            this.ctx.fillStyle = '#ed8936';
        } else {
            this.ctx.fillStyle = '#f56565';
        }
        this.ctx.fillRect(posX + 5, posY, barWidth * healthPercentage, barHeight);
    }
    
    drawWall(x, y) {
        const posX = x * this.gridSize;
        const posY = y * this.gridSize;
        
        this.ctx.fillStyle = '#4a5568';
        this.ctx.fillRect(posX, posY, this.gridSize, this.gridSize);
        
        this.ctx.strokeStyle = '#2d3748';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(posX, posY, this.gridSize, this.gridSize);
    }
    
    drawLava(x, y) {
        const posX = x * this.gridSize;
        const posY = y * this.gridSize;
        
        // Lave orange/rouge
        this.ctx.fillStyle = '#ff4500';
        this.ctx.fillRect(posX, posY, this.gridSize, this.gridSize);
        
        // Effet de lave avec gradient
        const gradient = this.ctx.createRadialGradient(
            posX + this.gridSize / 2, posY + this.gridSize / 2, 5,
            posX + this.gridSize / 2, posY + this.gridSize / 2, this.gridSize / 2
        );
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(0.5, '#ff6600');
        gradient.addColorStop(1, '#cc0000');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(posX + 3, posY + 3, this.gridSize - 6, this.gridSize - 6);
        
        // Bordure ardente
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(posX, posY, this.gridSize, this.gridSize);
    }
    
    isWall(x, y) {
        return this.walls.some(wall => wall.x === x && wall.y === y);
    }
    
    isLava(x, y) {
        return this.lavaWalls.some(lava => lava.x === x && lava.y === y);
    }
}

// Initialiser le jeu
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new Game();
});

// Fonction pour ajouter une commande
function addCommand(direction) {
    if (game.gameOver) return;
    
    console.log('Commande:', direction);

    
    let newX = game.hero.x;
    let newY = game.hero.y;
    
    switch(direction) {
        case 'droite':
            newX++;
            break;
        case 'gauche':
            newX--;
            break;
        case 'haut':
            newY--;
            break;
        case 'bas':
            newY++;
            break;
    }
    
    // Vérifier si la nouvelle position est valide
    if (newX >= 0 && newX < game.cols && newY >= 0 && newY < game.rows && 
        !game.isWall(newX, newY)) {
        
        // Vérifier si le héros touche la lave
        if (game.isLava(newX, newY)) {
            game.gameOver = true;
            game.stopAllIntervals();
            alert('🌋 Game Over! Tu as touché la lave et tu es mort!');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            return;
        }
        
        game.hero.x = newX;
        game.hero.y = newY;
        
        // Vérifier si on a atteint la gemme
        if (game.hero.x === game.gem.x && game.hero.y === game.gem.y) {
            game.score += 600;
            document.getElementById('score').textContent = game.score;
            
            game.stopAllIntervals();
            game.gameOver = true;
            
            // Sauvegarder la progression
            localStorage.setItem('codecombat_level', '10');
            localStorage.setItem('codecombat_score', game.score);
            
            let completed = JSON.parse(localStorage.getItem('codecombat_completed')) || [];
            if (!completed.includes(9)) {
                completed.push(9);
                localStorage.setItem('codecombat_completed', JSON.stringify(completed));
            }
            
            setTimeout(() => {
                window.location.href = 'victoire.html?score=' + game.score + '&level=9';
            }, 500);
        }
    }
    
    game.draw();
}
