// Code Combat - Niveau 2
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
            y: 6,
            symbol: '🦸',
            health: 3,
            maxHealth: 3
        };
        
        this.enemy = {
            x: 5,
            y: 3,
            symbol: '👾',
            health: 1,
            maxHealth: 1,
            alive: true,
            lastAttackTime: 0
        };
        
        // Murs - Une seule entrée étroite
        this.walls = [
            // Mur du haut
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}, {x: 11, y: 0},
            // Mur gauche
            {x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}, {x: 0, y: 4}, {x: 0, y: 5}, {x: 0, y: 6}, {x: 0, y: 7},
            // Mur droite
            {x: 11, y: 1}, {x: 11, y: 2}, {x: 11, y: 3}, {x: 11, y: 4}, {x: 11, y: 5}, {x: 11, y: 6}, {x: 11, y: 7},
            // Mur du bas
            {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}, {x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7},
            // Mur central avec passage étroit
            {x: 3, y: 1}, {x: 3, y: 2}, {x: 3, y: 4}, {x: 3, y: 5}, {x: 3, y: 6},
            {x: 7, y: 1}, {x: 7, y: 2}, {x: 7, y: 4}, {x: 7, y: 5}, {x: 7, y: 6}
        ];
        
        // Gemme à atteindre
        this.gem = {
            x: 9,
            y: 3,
            symbol: '💎'
        };
        
        this.gameOver = false;
        this.enemyAttackInterval = null;
        this.startEnemyAttacks();
        
        this.draw();
        this.updateHealthBar();
    }
    
    startEnemyAttacks() {
        this.enemyAttackInterval = setInterval(() => {
            if (this.enemy.alive && !this.gameOver) {
                this.enemyAttack();
            }
        }, 1000);
    }
    
    enemyAttack() {
        // L'ennemi attaque si le héros est adjacent
        const dx = Math.abs(this.hero.x - this.enemy.x);
        const dy = Math.abs(this.hero.y - this.enemy.y);
        
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            this.hero.health--;
            this.updateHealthBar();
            this.draw();
            
            if (this.hero.health <= 0) {
                this.gameOver = true;
                clearInterval(this.enemyAttackInterval);
                alert('💀 Game Over! L\'ennemi t\'a vaincu!');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        }
    }
    
    updateHealthBar() {
        const healthFill = document.getElementById('hero-health');
        const healthValue = document.getElementById('health-value');
        const percentage = (this.hero.health / this.hero.maxHealth) * 100;
        
        healthFill.style.width = percentage + '%';
        healthValue.textContent = this.hero.health;
        
        // Changer la couleur selon la santé
        healthFill.className = 'health-fill';
        if (percentage <= 33) {
            healthFill.classList.add('low');
        } else if (percentage <= 66) {
            healthFill.classList.add('medium');
        }
    }
    
    draw() {
        // Effacer le canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessiner la grille
        this.drawGrid();
        
        // Dessiner les murs
        this.walls.forEach(wall => {
            this.drawWall(wall.x, wall.y);
        });
        
        // Dessiner la gemme
        this.drawCharacter(this.gem.x, this.gem.y, this.gem.symbol);
        
        // Dessiner l'ennemi si vivant
        if (this.enemy.alive) {
            this.drawCharacter(this.enemy.x, this.enemy.y, this.enemy.symbol);
            this.drawEnemyHealth();
        }
        
        // Dessiner le héros
        this.drawCharacter(this.hero.x, this.hero.y, this.hero.symbol);
        this.drawHeroHealth();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#1a3a1a';
        this.ctx.lineWidth = 1;
        
        // Lignes verticales
        for (let i = 0; i <= this.cols; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Lignes horizontales
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
        
        // Fond de la barre
        this.ctx.fillStyle = '#2d3748';
        this.ctx.fillRect(posX + 5, posY, barWidth, barHeight);
        
        // Barre de vie avec couleur selon la santé
        if (healthPercentage > 0.66) {
            this.ctx.fillStyle = '#48bb78';
        } else if (healthPercentage > 0.33) {
            this.ctx.fillStyle = '#ed8936';
        } else {
            this.ctx.fillStyle = '#f56565';
        }
        this.ctx.fillRect(posX + 5, posY, barWidth * healthPercentage, barHeight);
    }
    
    drawHeroHealth() {
        this.drawHealthBar(this.hero.x, this.hero.y, this.hero.health, this.hero.maxHealth);
    }
    
    drawEnemyHealth() {
        this.drawHealthBar(this.enemy.x, this.enemy.y, this.enemy.health, this.enemy.maxHealth);
    }
    
    drawWall(x, y) {
        const posX = x * this.gridSize;
        const posY = y * this.gridSize;
        
        this.ctx.fillStyle = '#4a5568';
        this.ctx.fillRect(posX, posY, this.gridSize, this.gridSize);
        
        // Bordure du mur
        this.ctx.strokeStyle = '#2d3748';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(posX, posY, this.gridSize, this.gridSize);
    }
    
    isWall(x, y) {
        return this.walls.some(wall => wall.x === x && wall.y === y);
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
    
    // Vérifier si la nouvelle position est valide (pas de mur et dans les limites)
    if (newX >= 0 && newX < game.cols && newY >= 0 && newY < game.rows && !game.isWall(newX, newY)) {
        // Ne pas permettre de passer si l'ennemi est vivant et bloque le passage
        if (game.enemy.alive && newX === game.enemy.x && newY === game.enemy.y) {
            alert('⚠️ L\'ennemi bloque le passage! Tu dois le vaincre d\'abord!');
            return;
        }
        
        game.hero.x = newX;
        game.hero.y = newY;
        
        // Vérifier si le héros a atteint la gemme (seulement si l'ennemi est vaincu)
        if (game.hero.x === game.gem.x && game.hero.y === game.gem.y) {
            if (game.enemy.alive) {
                alert('⚠️ Tu dois vaincre l\'ennemi avant de prendre la gemme!');
            } else {
                game.score += 200;
                document.getElementById('score').textContent = game.score;
                
                clearInterval(game.enemyAttackInterval);
                
                // Sauvegarder la progression
                localStorage.setItem('codecombat_level', '3');
                localStorage.setItem('codecombat_score', game.score);
                
                // Marquer le niveau 2 comme complété
                let completed = JSON.parse(localStorage.getItem('codecombat_completed')) || [];
                if (!completed.includes(2)) {
                    completed.push(2);
                    localStorage.setItem('codecombat_completed', JSON.stringify(completed));
                }
                
                // Rediriger vers la page de victoire avec le score
                setTimeout(() => {
                    window.location.href = 'victoire.html?score=' + game.score + '&level=2';
                }, 500);
            }
        }
    }
    
    // Redessiner le jeu
    game.draw();
}

function performAttack() {
    if (!game.enemy.alive) {
        alert('⚠️ Il n\'y a pas d\'ennemi à attaquer!');
        return;
    }
    
    // Vérifier si l'ennemi est adjacent au héros
    const dx = Math.abs(game.hero.x - game.enemy.x);
    const dy = Math.abs(game.hero.y - game.enemy.y);
    
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        game.enemy.health--;
        
        if (game.enemy.health <= 0) {
            game.enemy.alive = false;
            clearInterval(game.enemyAttackInterval);
            game.score += 50;
            document.getElementById('score').textContent = game.score;
            alert('🎉 Ennemi vaincu en 1 coup! +50 points! Maintenant tu peux aller chercher la gemme!');
        }
        
        game.draw();
    } else {
        alert('⚠️ Tu es trop loin! Rapproche-toi de l\'ennemi pour l\'attaquer!');
    }
}
