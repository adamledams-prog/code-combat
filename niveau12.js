// Code Combat - Niveau 12 - Portail et Rivière
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
        
        // Héros spawne en haut à droite, bloqué
        this.hero = {
            x: 10,
            y: 1,
            symbol: '🦸',
            health: 5,
            maxHealth: 5
        };
        
        // Allié derrière le portail
        this.ally = {
            x: 3,
            y: 1,
            symbol: '👨',
            canShoot: true
        };
        
        // Ennemi que l'allié doit tuer
        this.enemy = {
            x: 5,
            y: 3,
            symbol: '👹',
            health: 1,
            maxHealth: 1,
            alive: true
        };
        
        // Alien après la rivière
        this.alien = {
            x: 9,
            y: 5,
            symbol: '👽',
            health: 2,
            maxHealth: 2,
            alive: true
        };
        
        // Portail rouge (derrière un mur)
        this.portal = {
            x: 1,
            y: 1,
            symbol: '🔴'
        };
        
        // Blocs pour traverser la rivière
        this.blocks = [];
        
        this.placedBlocks = [];
        
        // Murs
        this.walls = [
            // Cadre extérieur
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}, {x: 11, y: 0},
            {x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}, {x: 0, y: 4}, {x: 0, y: 5}, {x: 0, y: 6}, {x: 0, y: 7},
            {x: 11, y: 1}, {x: 11, y: 2}, {x: 11, y: 3}, {x: 11, y: 4}, {x: 11, y: 5}, {x: 11, y: 6}, {x: 11, y: 7},
            {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}, {x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7},
            
            // Murs qui enferment complètement le héros en haut à droite (10, 1)
            {x: 9, y: 0},  // Déjà dans le cadre mais on le garde
            {x: 9, y: 1},  // Gauche
            {x: 9, y: 2},  // Bas-gauche
            {x: 10, y: 2}, // Bas
            {x: 11, y: 1}, // Droite (déjà dans le cadre)
            {x: 10, y: 0}, // Haut (déjà dans le cadre)
            
            // Mur qui cache le portail rouge et à gauche de l'allié
            {x: 2, y: 1},
            // Mur en dessous de l'allié
            {x: 3, y: 2},
            
            // Autres murs du labyrinthe
            {x: 4, y: 1}, {x: 4, y: 2}, {x: 4, y: 3},
            {x: 6, y: 1}, {x: 6, y: 2}
        ];
        
        // Rivière verticale
        this.water = [];
        for (let y = 1; y <= 6; y++) {
            this.water.push({x: 7, y: y});
        }
        
        // Gemme à atteindre
        this.gem = {
            x: 10,
            y: 6,
            symbol: '💎'
        };
        
        this.gameOver = false;
        this.hasUsedPortal = false;
        
        this.startAlienAttacks();
        
        this.draw();
        this.updateHealthBar();
        this.updateButtons();
    }
    
    startAlienAttacks() {
        this.alienAttackInterval = setInterval(() => {
            if (this.alien.alive && !this.gameOver) {
                this.alienAttack();
            }
        }, 1700);
    }
    
    alienAttack() {
        // L'alien attaque si le héros est adjacent
        const dx = Math.abs(this.hero.x - this.alien.x);
        const dy = Math.abs(this.hero.y - this.alien.y);
        
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            this.hero.health = 0;
            this.updateHealthBar();
            this.draw();
            
            this.gameOver = true;
            clearInterval(this.alienAttackInterval);
            alert('💀 Game Over! L\'alien t\'a tué en 1,7s!');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }
    
    updateButtons() {
        const btnPortail = document.getElementById('btn-portail');
        const btnFleche = document.getElementById('btn-fleche');
        const btnCasser = document.getElementById('btn-casser');
        const btnPoser = document.getElementById('btn-poser');
        
        // Bouton Portail visible au début
        if (!this.hasUsedPortal) {
            btnPortail.style.display = 'block';
        } else {
            btnPortail.style.display = 'none';
        }
        
        // Bouton Flèche visible après utilisation du portail et si l'allié peut encore tirer
        if (this.hasUsedPortal && this.ally.canShoot) {
            btnFleche.style.display = 'block';
        } else {
            btnFleche.style.display = 'none';
        }
        
        // Bouton Casser Block visible après que la flèche a tué l'ennemi
        if (this.hasUsedPortal && !this.ally.canShoot && !this.enemy.alive) {
            btnCasser.style.display = 'block';
        } else {
            btnCasser.style.display = 'none';
        }
        
        // Bouton Poser Bloc visible après avoir tué l'ennemi
        if (this.hasUsedPortal && !this.enemy.alive) {
            btnPoser.style.display = 'block';
        } else {
            btnPoser.style.display = 'none';
        }
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
        
        // Dessiner la rivière
        this.water.forEach(w => {
            this.drawWater(w.x, w.y);
        });
        
        // Dessiner les blocs placés
        this.placedBlocks.forEach(block => {
            this.drawBlock(block.x, block.y);
        });
        
        // Dessiner les blocs ramassables
        this.blocks.forEach(block => {
            if (!block.picked) {
                this.drawCharacter(block.x, block.y, block.symbol);
            }
        });
        
        // Dessiner le portail rouge
        this.drawPortal(this.portal.x, this.portal.y, this.portal.symbol);
        
        // Dessiner la gemme
        this.drawCharacter(this.gem.x, this.gem.y, this.gem.symbol);
        
        // Dessiner l'ennemi
        if (this.enemy.alive) {
            this.drawCharacter(this.enemy.x, this.enemy.y, this.enemy.symbol);
            this.drawHealthBar(this.enemy.x, this.enemy.y, this.enemy.health, this.enemy.maxHealth);
        }
        
        // Dessiner l'alien
        if (this.alien.alive) {
            this.drawCharacter(this.alien.x, this.alien.y, this.alien.symbol);
            this.drawHealthBar(this.alien.x, this.alien.y, this.alien.health, this.alien.maxHealth);
        }
        
        // Dessiner l'allié
        this.drawCharacter(this.ally.x, this.ally.y, this.ally.symbol);
        
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
    
    drawWater(x, y) {
        const posX = x * this.gridSize;
        const posY = y * this.gridSize;
        
        this.ctx.fillStyle = '#4299e1';
        this.ctx.fillRect(posX, posY, this.gridSize, this.gridSize);
        
        this.ctx.fillStyle = '#63b3ed';
        this.ctx.fillRect(posX + 5, posY + 5, this.gridSize - 10, this.gridSize - 10);
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
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
        
        // Symbole du portail
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(symbol, centerX, centerY);
    }
    
    isWall(x, y) {
        return this.walls.some(wall => wall.x === x && wall.y === y);
    }
    
    isWater(x, y) {
        if (this.placedBlocks.some(block => block.x === x && block.y === y)) {
            return false;
        }
        return this.water.some(w => w.x === x && w.y === y);
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
    
    if (direction === 'portail') {
        usePortal();
        return;
    }
    
    if (direction === 'fleche') {
        allyShootArrow();
        return;
    }
    
    if (direction === 'casser') {
        breakBlock();
        return;
    }
    
    if (direction === 'poser') {
        placeBlock();
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
        !game.isWall(newX, newY) && !game.isWater(newX, newY)) {
        
        game.hero.x = newX;
        game.hero.y = newY;
        
        // Vérifier si on ramasse un bloc
        game.blocks.forEach(block => {
            if (!block.picked && game.hero.x === block.x && game.hero.y === block.y) {
                block.picked = true;
                game.score += 20;
                document.getElementById('score').textContent = game.score;
            }
        });
        
        // Vérifier si on atteint la gemme
        if (game.hero.x === game.gem.x && game.hero.y === game.gem.y) {
            if (!game.alien.alive) {
                game.score += 1500;
                document.getElementById('score').textContent = game.score;
                
                game.gameOver = true;
                clearInterval(game.alienAttackInterval);
                
                // Sauvegarder la progression
                localStorage.setItem('codecombat_level', '13');
                localStorage.setItem('codecombat_score', game.score);
                
                let completed = JSON.parse(localStorage.getItem('codecombat_completed')) || [];
                if (!completed.includes(12)) {
                    completed.push(12);
                    localStorage.setItem('codecombat_completed', JSON.stringify(completed));
                }
                
                setTimeout(() => {
                    window.location.href = 'victoire.html?score=' + game.score + '&level=12';
                }, 500);
            } else {
                alert('⚠️ L\'alien doit être mort!');
            }
        }
    }
    
    game.draw();
}

function usePortal() {
    if (game.hasUsedPortal) {
        alert('⚠️ Tu as déjà utilisé le portail!');
        return;
    }
    
    // Téléporter le héros au portail rouge
    game.hero.x = game.portal.x;
    game.hero.y = game.portal.y;
    game.hasUsedPortal = true;
    game.score += 100;
    document.getElementById('score').textContent = game.score;
    
    game.updateButtons();
    game.draw();
}

function allyShootArrow() {
    if (!game.enemy.alive) {
        alert('⚠️ L\'ennemi est déjà mort!');
        return;
    }
    
    if (!game.ally.canShoot) {
        alert('⚠️ L\'allié a déjà tiré!');
        return;
    }
    
    // L'allié tire la flèche
    game.ally.canShoot = false;
    
    // Mettre à jour les boutons immédiatement
    game.updateButtons();
    
    // Animation de la flèche
    drawArrowAnimation(game.ally.x, game.ally.y, game.enemy.x, game.enemy.y, () => {
        // La flèche tue l'ennemi
        game.enemy.health = 0;
        game.enemy.alive = false;
        game.score += 200;
        document.getElementById('score').textContent = game.score;
        
        game.updateButtons();
        game.draw();
    });
}

function breakBlock() {
    // Casser les blocs autour de l'allié pour le libérer
    const blocksToRemove = [
        {x: 2, y: 1}, // Gauche
        {x: 3, y: 2}  // Bas
    ];
    
    let blocksRemoved = 0;
    blocksToRemove.forEach(pos => {
        const index = game.walls.findIndex(wall => wall.x === pos.x && wall.y === pos.y);
        if (index !== -1) {
            game.walls.splice(index, 1);
            blocksRemoved++;
        }
    });
    
    if (blocksRemoved > 0) {
        game.score += 50;
        document.getElementById('score').textContent = game.score;
        alert('🪓 Blocs cassés! L\'allié est libéré!');
    }
    
    game.updateButtons();
    game.draw();
}

function drawArrowAnimation(startX, startY, endX, endY, callback) {
    const steps = 20;
    let currentStep = 0;
    
    const intervalId = setInterval(() => {
        game.draw();
        
        // Calculer la position actuelle de la flèche
        const progress = currentStep / steps;
        const arrowX = startX + (endX - startX) * progress;
        const arrowY = startY + (endY - startY) * progress;
        
        // Dessiner la flèche qui vole
        const centerX = arrowX * game.gridSize + game.gridSize / 2;
        const centerY = arrowY * game.gridSize + game.gridSize / 2;
        
        game.ctx.font = '25px Arial';
        game.ctx.textAlign = 'center';
        game.ctx.textBaseline = 'middle';
        game.ctx.fillText('➤', centerX, centerY);
        
        currentStep++;
        
        if (currentStep > steps) {
            clearInterval(intervalId);
            callback();
        }
    }, 30);
}

function placeBlock() {
    // Trouver une position d'eau adjacente au héros
    const positions = [
        {x: game.hero.x + 1, y: game.hero.y},
        {x: game.hero.x - 1, y: game.hero.y},
        {x: game.hero.x, y: game.hero.y + 1},
        {x: game.hero.x, y: game.hero.y - 1}
    ];
    
    let placed = false;
    for (let pos of positions) {
        if (game.water.some(w => w.x === pos.x && w.y === pos.y) && 
            !game.placedBlocks.some(b => b.x === pos.x && b.y === pos.y)) {
            game.placedBlocks.push({x: pos.x, y: pos.y});
            game.score += 30;
            document.getElementById('score').textContent = game.score;
            placed = true;
            break;
        }
    }
    
    if (!placed) {
        alert('⚠️ Aucune eau adjacente pour poser un bloc!');
    }
    
    game.draw();
}

function performAttack() {
    if (!game.alien.alive) {
        alert('⚠️ L\'alien est déjà mort!');
        return;
    }
    
    // Vérifier si l'alien est adjacent
    const dx = Math.abs(game.hero.x - game.alien.x);
    const dy = Math.abs(game.hero.y - game.alien.y);
    
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        // Attaquer l'alien
        game.alien.health--;
        game.score += 100;
        document.getElementById('score').textContent = game.score;
        
        if (game.alien.health <= 0) {
            game.alien.alive = false;
        }
        
        game.draw();
    } else {
        alert('⚠️ Tu dois être adjacent à l\'alien pour l\'attaquer!');
    }
}
