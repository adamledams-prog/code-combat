// Code Combat - Niveau 8
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
        
        // Allié bloqué derrière des murs de bois
        this.ally = {
            x: 2,
            y: 6,
            symbol: '👨',
            freed: false,
            health: 2,
            maxHealth: 2
        };
        
        // 1 monstre à vaincre
        this.enemies = [
            {
                x: 4,
                y: 3,
                symbol: '👹',
                health: 2,
                maxHealth: 2,
                alive: true,
                damage: 2,
                isAlien: false
            }
        ];
        
        // Murs en pierre (indestructibles)
        this.walls = [
            // Cadre extérieur
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}, {x: 11, y: 0},
            {x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}, {x: 0, y: 4}, {x: 0, y: 5}, {x: 0, y: 6}, {x: 0, y: 7},
            {x: 11, y: 1}, {x: 11, y: 2}, {x: 11, y: 3}, {x: 11, y: 4}, {x: 11, y: 5}, {x: 11, y: 6}, {x: 11, y: 7},
            {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}, {x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7},
            
            // Quelques obstacles
            {x: 3, y: 1}, {x: 3, y: 2}
        ];
        
        // Murs de bois (destructibles) - bloquent l'allié
        this.woodenWalls = [
            {x: 1, y: 5}, {x: 2, y: 5}, {x: 3, y: 5},
            {x: 1, y: 6}, {x: 3, y: 6}
        ];
        
        // Rivière (cases d'eau infranchissables)
        this.river = [
            {x: 6, y: 1}, {x: 6, y: 2}, {x: 6, y: 3}, {x: 6, y: 4}, {x: 6, y: 5}, {x: 6, y: 6}
        ];
        
        // Ponts construits par l'allié
        this.bridges = [];
        
        // Gemme de l'autre côté de la rivière
        this.gem = {
            x: 10,
            y: 3,
            symbol: '💎'
        };
        
        this.gameOver = false;
        this.enemyAttackInterval = null;
        this.startEnemyAttacks();
        
        this.draw();
        this.updateHealthBars();
    }
    
    startEnemyAttacks() {
        this.enemyAttackInterval = setInterval(() => {
            if (!this.gameOver) {
                this.monstersAttack();
            }
        }, 1000);
    }
    
    monstersAttack() {
        this.enemies.forEach(enemy => {
            if (enemy.alive && !enemy.isAlien) {
                const dx = Math.abs(this.hero.x - enemy.x);
                const dy = Math.abs(this.hero.y - enemy.y);
                
                if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                    this.hero.health -= enemy.damage;
                    this.updateHealthBars();
                    this.draw();
                    
                    if (this.hero.health <= 0) {
                        this.gameOver = true;
                        clearInterval(this.enemyAttackInterval);
                        alert('💀 Game Over! Le monstre t\'a vaincu!');
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    }
                }
            }
        });
    }
    
    updateHealthBars() {
        // Barre de vie du héros
        const heroHealthFill = document.getElementById('hero-health');
        const heroHealthValue = document.getElementById('hero-health-value');
        const heroPercentage = (this.hero.health / this.hero.maxHealth) * 100;
        
        heroHealthFill.style.width = heroPercentage + '%';
        heroHealthValue.textContent = this.hero.health;
        
        heroHealthFill.className = 'health-fill';
        if (heroPercentage <= 33) {
            heroHealthFill.classList.add('low');
        } else if (heroPercentage <= 66) {
            heroHealthFill.classList.add('medium');
        }
        
        // Barre de vie de l'allié
        if (this.ally.freed && this.ally.health > 0) {
            const allyHealthFill = document.getElementById('ally-health');
            const allyHealthValue = document.getElementById('ally-health-value');
            const allyPercentage = (this.ally.health / this.ally.maxHealth) * 100;
            
            allyHealthFill.style.width = allyPercentage + '%';
            allyHealthValue.textContent = this.ally.health;
            
            allyHealthFill.className = 'health-fill';
            if (allyPercentage <= 33) {
                allyHealthFill.classList.add('low');
            } else if (allyPercentage <= 66) {
                allyHealthFill.classList.add('medium');
            }
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
        
        // Dessiner les murs de bois
        this.woodenWalls.forEach(wall => {
            this.drawWoodenWall(wall.x, wall.y);
        });
        
        // Dessiner la rivière
        this.river.forEach(water => {
            // Ne pas dessiner l'eau s'il y a un pont
            if (!this.bridges.some(bridge => bridge.x === water.x && bridge.y === water.y)) {
                this.drawWater(water.x, water.y);
            }
        });
        
        // Dessiner les ponts
        this.bridges.forEach(bridge => {
            this.drawBridge(bridge.x, bridge.y);
        });
        
        // Dessiner la gemme
        this.drawCharacter(this.gem.x, this.gem.y, this.gem.symbol);
        
        // Dessiner les ennemis vivants
        this.enemies.forEach(enemy => {
            if (enemy.alive || enemy.symbol === '⚔️') {
                this.drawCharacter(enemy.x, enemy.y, enemy.symbol === '⚔️' ? '⚔️' : enemy.symbol);
                if (enemy.alive) {
                    this.drawHealthBar(enemy.x, enemy.y, enemy.health, enemy.maxHealth);
                }
            }
        });
        
        // Dessiner l'allié
        if (this.ally.health > 0) {
            this.drawCharacter(this.ally.x, this.ally.y, this.ally.symbol);
            if (this.ally.freed) {
                this.drawHealthBar(this.ally.x, this.ally.y, this.ally.health, this.ally.maxHealth);
            }
        }
        
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
    
    drawWoodenWall(x, y) {
        const posX = x * this.gridSize;
        const posY = y * this.gridSize;
        
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(posX, posY, this.gridSize, this.gridSize);
        
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(posX, posY + 10 + i * 15);
            this.ctx.lineTo(posX + this.gridSize, posY + 10 + i * 15);
            this.ctx.stroke();
        }
        
        this.ctx.strokeStyle = '#5D4E37';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(posX, posY, this.gridSize, this.gridSize);
    }
    
    drawWater(x, y) {
        const posX = x * this.gridSize;
        const posY = y * this.gridSize;
        
        // Eau bleue
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.fillRect(posX, posY, this.gridSize, this.gridSize);
        
        // Effet de vagues
        this.ctx.fillStyle = '#60a5fa';
        this.ctx.fillRect(posX + 5, posY + 10, 15, 8);
        this.ctx.fillRect(posX + 30, posY + 25, 12, 6);
        
        this.ctx.strokeStyle = '#2563eb';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(posX, posY, this.gridSize, this.gridSize);
    }
    
    drawBridge(x, y) {
        const posX = x * this.gridSize;
        const posY = y * this.gridSize;
        
        // Planche de bois sur l'eau
        this.ctx.fillStyle = '#92400e';
        this.ctx.fillRect(posX + 5, posY + 5, this.gridSize - 10, this.gridSize - 10);
        
        // Lignes horizontales pour simuler les planches
        this.ctx.strokeStyle = '#78350f';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(posX + 5, posY + 10 + i * 10);
            this.ctx.lineTo(posX + this.gridSize - 5, posY + 10 + i * 10);
            this.ctx.stroke();
        }
        
        this.ctx.strokeStyle = '#451a03';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(posX + 5, posY + 5, this.gridSize - 10, this.gridSize - 10);
    }
    
    isWall(x, y) {
        return this.walls.some(wall => wall.x === x && wall.y === y);
    }
    
    isWoodenWall(x, y) {
        return this.woodenWalls.some(wall => wall.x === x && wall.y === y);
    }
    
    isRiver(x, y) {
        // Vérifier si c'est une case d'eau sans pont
        return this.river.some(water => water.x === x && water.y === y) &&
               !this.bridges.some(bridge => bridge.x === x && bridge.y === y);
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
    
    if (direction === 'casser') {
        breakWood();
        return;
    }
    
    if (direction === 'alliePoserBloc') {
        allyBuildBridge();
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
        !game.isWall(newX, newY) && !game.isWoodenWall(newX, newY) && !game.isRiver(newX, newY)) {
        
        game.hero.x = newX;
        game.hero.y = newY;
        
        // Vérifier si on a atteint la gemme
        if (game.hero.x === game.gem.x && game.hero.y === game.gem.y) {
            if (!game.areAllEnemiesDead()) {
                alert('⚠️ Tu dois vaincre le monstre avant de prendre la gemme!');
            } else {
                game.score += 500;
                document.getElementById('score').textContent = game.score;
                
                clearInterval(game.enemyAttackInterval);
                game.gameOver = true;
                
                // Sauvegarder la progression
                localStorage.setItem('codecombat_level', '9');
                localStorage.setItem('codecombat_score', game.score);
                
                let completed = JSON.parse(localStorage.getItem('codecombat_completed')) || [];
                if (!completed.includes(8)) {
                    completed.push(8);
                    localStorage.setItem('codecombat_completed', JSON.stringify(completed));
                }
                
                setTimeout(() => {
                    window.location.href = 'victoire.html?score=' + game.score + '&level=8';
                }, 500);
            }
        }
    }
    
    game.draw();
}

function performAttack() {
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
        alert('⚠️ Il n\'y a pas de monstre à portée!');
        return;
    }
    
    attackedEnemy.health--;
    
    if (attackedEnemy.health <= 0) {
        attackedEnemy.alive = false;
        game.score += 100;
        document.getElementById('score').textContent = game.score;
        
        const enemyX = attackedEnemy.x;
        const enemyY = attackedEnemy.y;
        attackedEnemy.symbol = '⚔️';
        
        game.draw();
        
        setTimeout(() => {
            const enemy = game.enemies.find(e => e.x === enemyX && e.y === enemyY);
            if (enemy) {
                enemy.symbol = '';
            }
            game.draw();
            
            if (game.areAllEnemiesDead()) {
                clearInterval(game.enemyAttackInterval);
                game.score += 200;
                document.getElementById('score').textContent = game.score;
                alert('🎉 Monstre vaincu! +200 points bonus!');
            }
        }, 500);
    } else {
        game.draw();
    }
}

function breakWood() {
    // Chercher un mur de bois adjacent
    let brokenWall = null;
    let wallIndex = -1;
    
    game.woodenWalls.forEach((wall, index) => {
        const dx = Math.abs(game.hero.x - wall.x);
        const dy = Math.abs(game.hero.y - wall.y);
        
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            brokenWall = wall;
            wallIndex = index;
        }
    });
    
    if (!brokenWall) {
        alert('⚠️ Il n\'y a pas de mur de bois à portée!');
        return;
    }
    
    // Casser le mur
    game.woodenWalls.splice(wallIndex, 1);
    game.score += 20;
    document.getElementById('score').textContent = game.score;
    
    // Vérifier si l'allié est maintenant libre (peut sortir de sa cage)
    if (!game.ally.freed) {
        // Vérifier s'il existe un chemin de sortie (au moins une direction libre de murs de bois)
        const directions = [
            {x: game.ally.x - 1, y: game.ally.y},
            {x: game.ally.x + 1, y: game.ally.y},
            {x: game.ally.x, y: game.ally.y - 1},
            {x: game.ally.x, y: game.ally.y + 1}
        ];
        
        const hasExit = directions.some(dir => {
            // Vérifier si cette direction n'a pas de mur de bois ET n'est pas un mur en pierre
            const hasWoodenWall = game.woodenWalls.some(wall => wall.x === dir.x && wall.y === dir.y);
            const hasStoneWall = game.walls.some(wall => wall.x === dir.x && wall.y === dir.y);
            return !hasWoodenWall && !hasStoneWall && dir.x >= 0 && dir.x < game.cols && dir.y >= 0 && dir.y < game.rows;
        });
        
        if (hasExit) {
            game.ally.freed = true;
            document.getElementById('ally-health-container').style.display = 'block';
            document.getElementById('ally-build-btn').style.display = 'block';
            game.score += 100;
            document.getElementById('score').textContent = game.score;
            alert('🎉 Allié libéré! +100 points! Il peut maintenant construire des ponts sur la rivière!');
        }
    }
    
    game.draw();
}

function allyBuildBridge() {
    if (!game.ally.freed) {
        alert('⚠️ L\'allié n\'est pas encore libéré!');
        return;
    }
    
    // Chercher une case de rivière à côté du héros
    let waterTile = null;
    
    game.river.forEach(water => {
        const dx = Math.abs(game.hero.x - water.x);
        const dy = Math.abs(game.hero.y - water.y);
        
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            // Vérifier qu'il n'y a pas déjà un pont ici
            if (!game.bridges.some(bridge => bridge.x === water.x && bridge.y === water.y)) {
                waterTile = water;
            }
        }
    });
    
    if (!waterTile) {
        alert('⚠️ Tu dois être à côté d\'une case de rivière (sans pont) pour construire!');
        return;
    }
    
    // Construire le pont
    game.bridges.push({x: waterTile.x, y: waterTile.y});
    game.score += 50;
    document.getElementById('score').textContent = game.score;
    alert('🪵 Pont construit! +50 points! Tu peux maintenant traverser!');
    
    game.draw();
}
