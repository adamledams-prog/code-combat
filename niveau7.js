// Code Combat - Niveau 7
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
        
        // Vérifier si l'armure est débloquée (niveau 6 complété)
        const completedLevels = JSON.parse(localStorage.getItem('codecombat_completed')) || [];
        const hasArmor = completedLevels.includes(6);
        const maxHealth = hasArmor ? 4 : 3;
        
        this.hero = {
            x: 1,
            y: 1,
            symbol: '🦸',
            health: maxHealth,
            maxHealth: maxHealth
        };
        
        // 2 monstres puissants (infligent 2 dégâts) + 1 alien mortel (tue en 1 coup)
        this.enemies = [
            {
                x: 5,
                y: 3,
                symbol: '👹',
                health: 2,
                maxHealth: 2,
                alive: true,
                damage: 2,
                isAlien: false
            },
            {
                x: 5,
                y: 1,
                symbol: '👽',
                health: 1,
                maxHealth: 1,
                alive: true,
                damage: 999, // Tue en 1 coup
                isAlien: true
            },
            {
                x: 8,
                y: 5,
                symbol: '👹',
                health: 2,
                maxHealth: 2,
                alive: true,
                damage: 2,
                isAlien: false
            }
        ];
        
        // Champignon qui restaure la vie (à droite de l'alien)
        this.mushroom = {
            x: 6,
            y: 1,
            symbol: '🍄',
            consumed: false
        };
        
        // Murs - Labyrinthe complexe
        this.walls = [
            // Cadre extérieur
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}, {x: 11, y: 0},
            {x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}, {x: 0, y: 4}, {x: 0, y: 5}, {x: 0, y: 6}, {x: 0, y: 7},
            {x: 11, y: 1}, {x: 11, y: 2}, {x: 11, y: 3}, {x: 11, y: 4}, {x: 11, y: 5}, {x: 11, y: 6}, {x: 11, y: 7},
            {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}, {x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7},
            
            // Obstacles intérieurs
            {x: 3, y: 1}, {x: 3, y: 2}, {x: 3, y: 3},
            {x: 7, y: 2}, {x: 7, y: 3}, {x: 7, y: 4},
            {x: 5, y: 5}, {x: 5, y: 6},
            {x: 9, y: 1}, {x: 9, y: 2}
        ];
        
        // Gemme à atteindre
        this.gem = {
            x: 10,
            y: 6,
            symbol: '💎'
        };
        
        this.gameOver = false;
        this.enemyAttackInterval = null;
        this.alienAttackInterval = null;
        this.startEnemyAttacks();
        
        // Mettre à jour l'affichage de la vie max dans l'UI
        document.getElementById('max-health-value').textContent = this.hero.maxHealth;
        
        this.draw();
        this.updateHealthBar();
    }
    
    startEnemyAttacks() {
        // Attaques des monstres (toutes les 1 seconde)
        this.enemyAttackInterval = setInterval(() => {
            if (!this.gameOver) {
                this.monstersAttack();
            }
        }, 1000);
        
        // Attaques de l'alien (toutes les 2 secondes)
        this.alienAttackInterval = setInterval(() => {
            if (!this.gameOver) {
                this.alienAttack();
            }
        }, 2000);
    }
    
    monstersAttack() {
        // Seulement les monstres (pas l'alien) attaquent
        this.enemies.forEach(enemy => {
            if (enemy.alive && !enemy.isAlien) {
                const dx = Math.abs(this.hero.x - enemy.x);
                const dy = Math.abs(this.hero.y - enemy.y);
                
                if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                    this.hero.health -= enemy.damage;
                    this.updateHealthBar();
                    this.draw();
                    
                    if (this.hero.health <= 0) {
                        this.gameOver = true;
                        clearInterval(this.enemyAttackInterval);
                        clearInterval(this.alienAttackInterval);
                        alert('💀 Game Over! Les monstres t\'ont vaincu!');
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    }
                }
            }
        });
    }
    
    alienAttack() {
        // L'alien attaque (tue en 1 coup)
        const alien = this.enemies.find(enemy => enemy.alive && enemy.isAlien);
        if (alien) {
            const dx = Math.abs(this.hero.x - alien.x);
            const dy = Math.abs(this.hero.y - alien.y);
            
            if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                this.hero.health = 0;
                this.updateHealthBar();
                this.draw();
                
                this.gameOver = true;
                clearInterval(this.enemyAttackInterval);
                clearInterval(this.alienAttackInterval);
                alert('💀 Game Over! L\'alien t\'a tué!');
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
        
        // Dessiner le champignon s'il n'est pas consommé
        if (!this.mushroom.consumed) {
            this.drawCharacter(this.mushroom.x, this.mushroom.y, this.mushroom.symbol);
        }
        
        // Dessiner les ennemis vivants et morts avec épée
        this.enemies.forEach(enemy => {
            if (enemy.alive || enemy.symbol === '⚔️') {
                this.drawCharacter(enemy.x, enemy.y, enemy.symbol === '⚔️' ? '⚔️' : enemy.symbol);
                if (enemy.alive) {
                    this.drawHealthBar(enemy.x, enemy.y, enemy.health, enemy.maxHealth);
                }
            }
        });
        
        // Dessiner le héros
        this.drawCharacter(this.hero.x, this.hero.y, this.hero.symbol);
        this.drawHealthBar(this.hero.x, this.hero.y, this.hero.health, this.hero.maxHealth);
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
    
    areAllEnemiesDead() {
        return this.enemies.every(enemy => !enemy.alive);
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
    
    // Vérifier si la nouvelle position est valide
    if (newX >= 0 && newX < game.cols && newY >= 0 && newY < game.rows && !game.isWall(newX, newY)) {
        // Ne pas traverser un ennemi vivant
        const enemyAtPosition = game.enemies.find(enemy => 
            enemy.alive && enemy.x === newX && enemy.y === newY
        );
        
        // Déplacer le héros
        game.hero.x = newX;
        game.hero.y = newY;
        
        // Vérifier si on a pris le champignon
        checkMushroomConsumption();
        
        // Vérifier si on a atteint la gemme
        // Déplacer le héros
        game.hero.x = newX;
        game.hero.y = newY;
        
        // Vérifier si on a atteint la gemme
        if (game.hero.x === game.gem.x && game.hero.y === game.gem.y) {
            if (!game.areAllEnemiesDead()) {
                alert('⚠️ Tu dois vaincre les 2 monstres avant de prendre la gemme!');
            } else {
                game.score += 500;
                document.getElementById('score').textContent = game.score;
                
                clearInterval(game.enemyAttackInterval);
                clearInterval(game.alienAttackInterval);
                game.gameOver = true;
                
                // Sauvegarder la progression
                localStorage.setItem('codecombat_level', '8');
                localStorage.setItem('codecombat_score', game.score);
                
                // Marquer le niveau 7 comme complété
                let completed = JSON.parse(localStorage.getItem('codecombat_completed')) || [];
                if (!completed.includes(7)) {
                    completed.push(7);
                    localStorage.setItem('codecombat_completed', JSON.stringify(completed));
                }
                
                // Rediriger vers la page de victoire
                setTimeout(() => {
                    window.location.href = 'victoire.html?score=' + game.score + '&level=7';
                }, 500);
            }
        }
    }
    
    // Redessiner le jeu
    game.draw();
}

function performAttack() {
    // Chercher un ennemi vivant adjacent
    let attackedEnemy = null;
    
    game.enemies.forEach(enemy => {
        if (enemy.alive) {
            const dx = Math.abs(game.hero.x - enemy.x);
            const dy = Math.abs(game.hero.y - enemy.y);
            
            if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                attackedEnemy = enemy;
            }
        }
    });
    
    if (!attackedEnemy) {
        alert('⚠️ Il n\'y a pas de monstre à portée! Rapproche-toi d\'un monstre pour l\'attaquer!');
        return;
    }
    
    attackedEnemy.health--;
    
    if (attackedEnemy.health <= 0) {
        attackedEnemy.alive = false;
        game.score += 150;
        document.getElementById('score').textContent = game.score;
        
        // Afficher l'épée qui tranche à la position de l'ennemi
        const enemyX = attackedEnemy.x;
        const enemyY = attackedEnemy.y;
        const originalSymbol = attackedEnemy.symbol;
        attackedEnemy.symbol = '⚔️';
        
        game.draw();
        
        // Attendre un peu puis faire disparaître l'ennemi
        setTimeout(() => {
            // Trouver l'ennemi et le faire disparaître
            const enemy = game.enemies.find(e => e.x === enemyX && e.y === enemyY);
            if (enemy) {
                enemy.symbol = '';
            }
            game.draw();
            
            if (game.areAllEnemiesDead()) {
                clearInterval(game.enemyAttackInterval);
                clearInterval(game.alienAttackInterval);
                game.score += 250;
                document.getElementById('score').textContent = game.score;
                alert('🎉 Tous les monstres sont vaincus! +250 points bonus! Va chercher la gemme!');
            }
        }, 500);
    } else {
        game.draw();
    }
}

function checkMushroomConsumption() {
    if (!game.mushroom.consumed && 
        game.hero.x === game.mushroom.x && 
        game.hero.y === game.mushroom.y) {
        
        // Restaurer 1 point de vie (max selon armure)
        if (game.hero.health < game.hero.maxHealth) {
            game.hero.health++;
            game.updateHealthBar();
            game.mushroom.consumed = true;
            game.score += 50;
            document.getElementById('score').textContent = game.score;
            alert('🍄 Champignon consommé! +1 vie restaurée! +50 points!');
        } else {
            alert('🍄 Tu as déjà la santé maximale!');
        }
    }
}
