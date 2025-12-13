// Code Combat - Niveau 11 - Labyrinthe des Portails
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
            health: 5,
            maxHealth: 5
        };
        
        // Mega Alien qui tue instantanément
        this.megaAlien = {
            x: 10,
            y: 6,
            symbol: '👽',
            health: 2,
            maxHealth: 2,
            alive: true,
            attackRadius: 2,
            killTimer: null
        };
        
        // Portails (couleurs trompeuses)
        this.portals = [
            // Rouge (🔴) téléporte vers Vert
            {x: 3, y: 2, color: 'red', symbol: '🔴', targetColor: 'green'},
            {x: 8, y: 1, color: 'red', symbol: '🔴', targetColor: 'green'},
            
            // Vert (🟢) téléporte vers Bleu
            {x: 2, y: 5, color: 'green', symbol: '🟢', targetColor: 'blue'},
            {x: 9, y: 4, color: 'green', symbol: '🟢', targetColor: 'blue'},
            
            // Bleu (🔵) téléporte vers Jaune
            {x: 5, y: 1, color: 'blue', symbol: '🔵', targetColor: 'yellow'},
            {x: 4, y: 6, color: 'blue', symbol: '🔵', targetColor: 'yellow'},
            
            // Jaune (🟡) téléporte vers Rouge
            {x: 7, y: 3, color: 'yellow', symbol: '🟡', targetColor: 'red'},
            {x: 1, y: 4, color: 'yellow', symbol: '🟡', targetColor: 'red'},
            
            // Portail spécial violet (🟣) qui téléporte près de l'alien
            {x: 5, y: 3, color: 'purple', symbol: '🟣', targetColor: 'alien'},
            {x: 7, y: 6, color: 'alien', symbol: '🟣', targetColor: 'purple'}
        ];
        
        // Murs du labyrinthe
        this.walls = [
            // Cadre extérieur
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}, {x: 11, y: 0},
            {x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}, {x: 0, y: 4}, {x: 0, y: 5}, {x: 0, y: 6}, {x: 0, y: 7},
            {x: 11, y: 1}, {x: 11, y: 2}, {x: 11, y: 3}, {x: 11, y: 4}, {x: 11, y: 5}, {x: 11, y: 6}, {x: 11, y: 7},
            {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}, {x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7},
            
            // Murs du labyrinthe
            {x: 3, y: 1}, {x: 3, y: 3}, {x: 3, y: 4},
            {x: 6, y: 2}, {x: 6, y: 4}, {x: 6, y: 5}, {x: 6, y: 6},
            {x: 1, y: 3}, {x: 2, y: 3},
            {x: 4, y: 3},
            {x: 7, y: 5}, {x: 8, y: 5},
            {x: 5, y: 5}, {x: 5, y: 6},
            // Murs au-dessus de l'alien
            {x: 9, y: 5}, {x: 10, y: 5},
            // Mur en dessous du portail violet d'entrée (position 5, 4 sous le portail en 5, 3)
            {x: 5, y: 4}
        ];
        
        // Pas de blocs destructibles dans ce niveau
        this.blocks = [];
        
        // Gemme entourée de blocs
        this.gem = {
            x: 10,
            y: 6,
            symbol: '💎'
        };
        
        this.gameOver = false;
        this.checkMegaAlienProximity();
        
        this.draw();
        this.updateHealthBar();
    }
    
    checkMegaAlienProximity() {
        if (this.gameOver || !this.megaAlien.alive) return;
        
        setInterval(() => {
            if (this.gameOver || !this.megaAlien.alive) return;
            
            const dx = Math.abs(this.hero.x - this.megaAlien.x);
            const dy = Math.abs(this.hero.y - this.megaAlien.y);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Vérifier si le héros est à 1 case (adjacent ou diagonal)
            const isInRange = (dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (dx === 1 && dy === 1);
            
            if (isInRange) {
                if (!this.megaAlien.killTimer) {
                    // Démarrer le compte à rebours de 1,7 secondes
                    this.megaAlien.killTimer = setTimeout(() => {
                        this.killHero();
                    }, 1700);
                    
                    // Alerte visuelle
                    this.showWarning();
                }
            } else {
                // Si le héros s'éloigne, annuler le timer
                if (this.megaAlien.killTimer) {
                    clearTimeout(this.megaAlien.killTimer);
                    this.megaAlien.killTimer = null;
                }
            }
        }, 100);
    }
    
    showWarning() {
        const originalSymbol = this.hero.symbol;
        let flashCount = 0;
        
        const flashInterval = setInterval(() => {
            this.hero.symbol = flashCount % 2 === 0 ? '⚠️' : originalSymbol;
            this.draw();
            flashCount++;
            
            if (flashCount >= 6) {
                clearInterval(flashInterval);
                this.hero.symbol = originalSymbol;
                this.draw();
            }
        }, 250);
    }
    
    killHero() {
        this.hero.health = 0;
        this.gameOver = true;
        this.updateHealthBar();
        this.draw();
        
        alert('💀 Le Mega Alien t\'a vaporisé instantanément ! ☠️');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
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
        
        // Dessiner les murs
        this.walls.forEach(wall => {
            this.drawWall(wall.x, wall.y);
        });
        
        // Dessiner les blocs destructibles
        this.blocks.forEach(block => {
            if (!block.destroyed) {
                this.drawBlock(block.x, block.y);
            }
        });
        
        // Dessiner les portails
        this.portals.forEach(portal => {
            this.drawPortal(portal.x, portal.y, portal.symbol);
        });
        
        // Dessiner la gemme
        this.drawCharacter(this.gem.x, this.gem.y, this.gem.symbol);
        
        // Dessiner le Mega Alien avec aura dangereuse
        if (this.megaAlien.alive) {
            this.drawDangerZone(this.megaAlien.x, this.megaAlien.y, this.megaAlien.attackRadius);
            this.drawCharacter(this.megaAlien.x, this.megaAlien.y, this.megaAlien.symbol);
        }
        
        // Dessiner le héros
        this.drawCharacter(this.hero.x, this.hero.y, this.hero.symbol);
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
    
    drawWall(x, y) {
        const posX = x * this.gridSize;
        const posY = y * this.gridSize;
        
        this.ctx.fillStyle = '#4a5568';
        this.ctx.fillRect(posX, posY, this.gridSize, this.gridSize);
        
        this.ctx.strokeStyle = '#2d3748';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(posX, posY, this.gridSize, this.gridSize);
    }
    
    drawBlock(x, y) {
        const posX = x * this.gridSize;
        const posY = y * this.gridSize;
        
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(posX, posY, this.gridSize, this.gridSize);
        
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(posX, posY, this.gridSize, this.gridSize);
    }
    
    drawPortal(x, y, symbol) {
        const centerX = x * this.gridSize + this.gridSize / 2;
        const centerY = y * this.gridSize + this.gridSize / 2;
        
        // Aura du portail
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 20);
        gradient.addColorStop(0, 'rgba(138, 43, 226, 0.3)');
        gradient.addColorStop(1, 'rgba(138, 43, 226, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
        
        // Symbole du portail
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(symbol, centerX, centerY);
    }
    
    drawDangerZone(x, y, radius) {
        const centerX = x * this.gridSize + this.gridSize / 2;
        const centerY = y * this.gridSize + this.gridSize / 2;
        
        // Zone de danger rouge transparente
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, this.gridSize / 2,
            centerX, centerY, radius * this.gridSize
        );
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0.05)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius * this.gridSize, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    isWall(x, y) {
        return this.walls.some(wall => wall.x === x && wall.y === y);
    }
    
    isBlock(x, y) {
        return this.blocks.some(block => !block.destroyed && block.x === x && block.y === y);
    }
    
    isPortal(x, y) {
        return this.portals.find(portal => portal.x === x && portal.y === y);
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
    
    if (direction === 'entrer') {
        enterPortal();
        return;
    }
    
    if (direction === 'attaque') {
        performAttack();
        return;
    }
    
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
        !game.isWall(newX, newY) && !game.isBlock(newX, newY)) {
        
        // Ne pas marcher sur le Mega Alien
        if (newX === game.megaAlien.x && newY === game.megaAlien.y && game.megaAlien.alive) {
            alert('⚠️ Le Mega Alien est invincible ! Évite-le !');
            return;
        }
        
        game.hero.x = newX;
        game.hero.y = newY;
        
        // Vérifier si on atteint la gemme
        if (game.hero.x === game.gem.x && game.hero.y === game.gem.y) {
            game.score += 1500;
            document.getElementById('score').textContent = game.score;
            
            game.gameOver = true;
            
            // Annuler le timer du Mega Alien
            if (game.megaAlien.killTimer) {
                clearTimeout(game.megaAlien.killTimer);
            }
            
            // Sauvegarder la progression
            localStorage.setItem('codecombat_level', '12');
            localStorage.setItem('codecombat_score', game.score);
            
            let completed = JSON.parse(localStorage.getItem('codecombat_completed')) || [];
            if (!completed.includes(11)) {
                completed.push(11);
                localStorage.setItem('codecombat_completed', JSON.stringify(completed));
            }
            
            setTimeout(() => {
                window.location.href = 'victoire.html?score=' + game.score + '&level=11';
            }, 500);
        }
    }
    
    game.draw();
}

function enterPortal() {
    // Vérifier si le héros est sur un portail
    const portal = game.isPortal(game.hero.x, game.hero.y);
    
    if (!portal) {
        alert('⚠️ Tu n\'es pas sur un portail !');
        return;
    }
    
    // Trouver le portail de destination (couleur cible)
    const destinationPortals = game.portals.filter(p => 
        p.color === portal.targetColor && 
        !(p.x === portal.x && p.y === portal.y)
    );
    
    if (destinationPortals.length > 0) {
        // Téléporter vers un portail aléatoire de la couleur cible
        const destination = destinationPortals[Math.floor(Math.random() * destinationPortals.length)];
        
        game.hero.x = destination.x;
        game.hero.y = destination.y;
        
        game.score += 50;
        document.getElementById('score').textContent = game.score;
        
        game.draw();
    }
}

function performAttack() {
    if (!game.megaAlien.alive) {
        alert('⚠️ L\'alien est déjà mort !');
        return;
    }
    
    // Vérifier si l'alien est à 1 case de distance (pas forcément adjacent)
    const dx = Math.abs(game.hero.x - game.megaAlien.x);
    const dy = Math.abs(game.hero.y - game.megaAlien.y);
    
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (dx === 1 && dy === 1)) {
        // Infliger 1 dégât à l'alien
        game.megaAlien.health--;
        game.score += 100;
        document.getElementById('score').textContent = game.score;
        
        if (game.megaAlien.health <= 0) {
            // Tuer l'alien
            game.megaAlien.alive = false;
            
            // Annuler le timer de mort
            if (game.megaAlien.killTimer) {
                clearTimeout(game.megaAlien.killTimer);
                game.megaAlien.killTimer = null;
            }
            
            game.score += 400;
            document.getElementById('score').textContent = game.score;
        }
        
        game.draw();
    } else {
        alert('⚠️ Tu dois être adjacent au Mega Alien pour l\'attaquer !');
    }
}
