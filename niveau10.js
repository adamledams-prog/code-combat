// Code Combat - Niveau 10 - Libération de l'Allié
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
        
        // Allié enfermé en bas à gauche
        this.ally = {
            x: 2,
            y: 5,
            symbol: '👨',
            freed: false
        };
        
        // Ennemi avant la rivière
        this.enemy = {
            x: 5,
            y: 5,
            symbol: '👹',
            health: 1,
            maxHealth: 1,
            alive: true
        };
        
        // Blocs de bois (prison de l'allié) - 4 blocs autour
        this.woodWalls = [
            {x: 1, y: 5, destroyed: false},
            {x: 2, y: 4, destroyed: false},
            {x: 2, y: 6, destroyed: false},
            {x: 3, y: 5, destroyed: false}
        ];
        
        // Blocs de construction
        this.blocks = [];
        
        // Murs fixes
        this.walls = [
            // Cadre extérieur
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}, {x: 11, y: 0},
            {x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}, {x: 0, y: 4}, {x: 0, y: 5}, {x: 0, y: 6}, {x: 0, y: 7},
            {x: 11, y: 1}, {x: 11, y: 2}, {x: 11, y: 3}, {x: 11, y: 4}, {x: 11, y: 5}, {x: 11, y: 6}, {x: 11, y: 7},
            {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}, {x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7}
        ];
        
        // Rivière (toute la hauteur)
        this.water = [];
        for (let y = 1; y <= 6; y++) {
            this.water.push({x: 7, y: y});
        }
        
        // Gemme à atteindre
        this.gem = {
            x: 10,
            y: 3,
            symbol: '💎'
        };
        
        this.gameOver = false;
        this.allyCanShoot = false;
        this.canPlaceBlock = false;
        this.placedBlocks = [];
        
        this.draw();
        this.updateHealthBar();
        this.updateButtons();
    }
    
    updateButtons() {
        const btnCasser = document.getElementById('btn-casser');
        const btnFleche = document.getElementById('btn-fleche');
        const btnPoser = document.getElementById('btn-poser');
        
        // Bouton Casser Bois visible au début
        if (this.woodWalls.some(w => !w.destroyed)) {
            btnCasser.style.display = 'block';
        } else {
            btnCasser.style.display = 'none';
        }
        
        // Bouton Lancer Flèche visible après libération de l'allié
        if (this.ally.freed && this.enemy.alive) {
            btnFleche.style.display = 'block';
        } else {
            btnFleche.style.display = 'none';
        }
        
        // Bouton Poser Bloc visible après avoir tué l'ennemi
        if (this.ally.freed && !this.enemy.alive) {
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
        
        // Dessiner les murs fixes
        this.walls.forEach(wall => {
            this.drawWall(wall.x, wall.y);
        });
        
        // Dessiner les murs de bois
        this.woodWalls.forEach(wall => {
            if (!wall.destroyed) {
                this.drawWoodWall(wall.x, wall.y);
            }
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
        
        // Dessiner la gemme
        this.drawCharacter(this.gem.x, this.gem.y, this.gem.symbol);
        
        // Dessiner l'ennemi
        if (this.enemy.alive) {
            this.drawCharacter(this.enemy.x, this.enemy.y, this.enemy.symbol);
            this.drawHealthBar(this.enemy.x, this.enemy.y, this.enemy.health, this.enemy.maxHealth);
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
    
    drawWoodWall(x, y) {
        const posX = x * this.gridSize;
        const posY = y * this.gridSize;
        
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(posX, posY, this.gridSize, this.gridSize);
        
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(posX, posY, this.gridSize, this.gridSize);
        
        // Texture bois
        this.ctx.fillStyle = '#a0522d';
        this.ctx.fillRect(posX + 5, posY + 5, this.gridSize - 10, this.gridSize - 10);
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
    
    isWall(x, y) {
        if (this.walls.some(wall => wall.x === x && wall.y === y)) {
            return true;
        }
        // Vérifier les murs de bois non détruits
        return this.woodWalls.some(wall => !wall.destroyed && wall.x === x && wall.y === y);
    }
    
    isWater(x, y) {
        // Vérifier si un bloc a été placé ici
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
    
    if (direction === 'casser') {
        breakWood();
        return;
    }
    
    if (direction === 'fleche') {
        allyShootArrow();
        return;
    }
    
    if (direction === 'poser') {
        placeBlock();
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
                alert('🧱 Bloc ramassé!');
            }
        });
        
        // Vérifier si on atteint la gemme
        if (game.hero.x === game.gem.x && game.hero.y === game.gem.y) {
            if (!game.enemy.alive) {
                game.score += 1000;
                document.getElementById('score').textContent = game.score;
                
                game.gameOver = true;
                
                // Sauvegarder la progression
                localStorage.setItem('codecombat_level', '11');
                localStorage.setItem('codecombat_score', game.score);
                
                let completed = JSON.parse(localStorage.getItem('codecombat_completed')) || [];
                if (!completed.includes(10)) {
                    completed.push(10);
                    localStorage.setItem('codecombat_completed', JSON.stringify(completed));
                }
                
                setTimeout(() => {
                    window.location.href = 'victoire.html?score=' + game.score + '&level=10';
                }, 500);
            } else {
                alert('⚠️ L\'ennemi doit être mort!');
            }
        }
    }
    
    game.draw();
}

function breakWood() {
    // Trouver le mur de bois adjacent au héros
    const positions = [
        {x: game.hero.x + 1, y: game.hero.y},
        {x: game.hero.x - 1, y: game.hero.y},
        {x: game.hero.x, y: game.hero.y + 1},
        {x: game.hero.x, y: game.hero.y - 1}
    ];
    
    let broken = false;
    for (let pos of positions) {
        const wall = game.woodWalls.find(w => !w.destroyed && w.x === pos.x && w.y === pos.y);
        if (wall) {
            wall.destroyed = true;
            game.score += 50;
            document.getElementById('score').textContent = game.score;
            broken = true;
            
            // Un seul mur cassé suffit pour libérer l'allié
            game.ally.freed = true;
            alert('🪵 Mur cassé! 👨 Allié libéré! +50 points! Utilise le bouton "Lancer Flèche" pour que ton allié tire!');
            game.updateButtons();
            break;
        }
    }
    
    if (!broken) {
        alert('⚠️ Aucun mur de bois adjacent à casser!');
    }
    
    game.updateButtons();
    game.draw();
}

function allyShootArrow() {
    if (!game.ally.freed || !game.enemy.alive) {
        alert('⚠️ L\'allié ne peut pas tirer ou l\'ennemi est mort!');
        return;
    }
    
    // Animation de la flèche
    drawArrowAnimation(game.ally.x, game.ally.y, game.enemy.x, game.enemy.y, () => {
        // L'allié tue l'ennemi
        game.enemy.health = 0;
        game.enemy.alive = false;
        game.score += 100;
        document.getElementById('score').textContent = game.score;
        alert('🏹 L\'allié a tué l\'ennemi! +100 points! Ramasse le bloc et traverse la rivière!');
        
        game.updateButtons();
        game.draw();
    });
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
            alert('🧱 Bloc posé sur l\'eau! +30 points!');
            placed = true;
            break;
        }
    }
    
    if (!placed) {
        alert('⚠️ Aucune eau adjacente pour poser un bloc!');
    }
    
    game.draw();
}
