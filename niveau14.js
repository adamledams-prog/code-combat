// Code Combat - Niveau 14 - BOSS FINAL
let game = null;

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
        
        this.currentPhase = 1;
        
        // Héros coincé en bas à gauche
        this.hero = {
            x: 2,
            y: 5,
            symbol: '🦸',
            health: 6,
            maxHealth: 6
        };
        
        // Allié
        this.ally = {
            x: 2,
            y: 2,
            symbol: '👨',
            canShoot: true
        };
        
        // Portail (phase 1)
        this.portal = {
            x: 2,
            y: 1,
            symbol: '🔴',
            active: true
        };
        
        // Blocs de bois qui enferment le héros (phase 1)
        this.woodWalls = [
            {x: 1, y: 5, destroyed: false},
            {x: 2, y: 4, destroyed: false},
            {x: 2, y: 6, destroyed: false},
            {x: 3, y: 5, destroyed: false}
        ];
        
        // Ennemi 1 que l'allié doit tuer (phase 2)
        this.enemy1 = {
            x: 5,
            y: 2,
            symbol: '👹',
            health: 1,
            maxHealth: 1,
            alive: true
        };
        
        // Ennemi 2 qui attaque le héros (phase 3)
        this.enemy2 = {
            x: 5,
            y: 5,
            symbol: '🧟',
            health: 1,
            maxHealth: 1,
            alive: true
        };
        
        // Rivière (phase 4)
        this.water = [];
        for (let y = 1; y <= 6; y++) {
            this.water.push({x: 7, y: y});
        }
        
        // Blocs pour traverser
        this.blocks = [];
        
        // Alien (phase 5)
        this.alien = {
            x: 9,
            y: 3,
            symbol: '👽',
            health: 1,
            maxHealth: 1,
            alive: true
        };
        
        // Champignon de vie (phase 5)
        this.mushroom = {
            x: 10,
            y: 5,
            symbol: '🍄',
            collected: false
        };
        
        // Ennemis finaux (phase 5)
        this.finalEnemies = [
            {x: 10, y: 2, symbol: '👾', health: 1, maxHealth: 1, alive: true},
            {x: 10, y: 4, symbol: '👾', health: 1, maxHealth: 1, alive: true}
        ];
        
        // Gemme finale
        this.gem = {
            x: 10,
            y: 6,
            symbol: '💎',
            visible: false
        };
        
        // Murs fixes
        this.walls = [
            // Cadre extérieur
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}, {x: 11, y: 0},
            {x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}, {x: 0, y: 4}, {x: 0, y: 5}, {x: 0, y: 6}, {x: 0, y: 7},
            {x: 11, y: 1}, {x: 11, y: 2}, {x: 11, y: 3}, {x: 11, y: 4}, {x: 11, y: 5}, {x: 11, y: 6}, {x: 11, y: 7},
            {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}, {x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7}
        ];
        
        this.gameOver = false;
        this.placedBlocks = [];
        this.enemy2AttackInterval = null;
        this.alienAttackInterval = null;
        
        this.draw();
        this.updateHealthBar();
        this.updatePhaseUI();
    }
    
    updatePhaseUI() {
        const phaseTitle = document.getElementById('phase-title');
        const info = document.getElementById('info-text');
        
        if (!phaseTitle || !info) return;
        
        switch(this.currentPhase) {
            case 1:
                phaseTitle.textContent = 'Phase 1/5 - Évasion';
                info.textContent = 'Tu es coincé par des blocs de bois ! Utilise le portail pour t\'échapper !';
                break;
            case 2:
                phaseTitle.textContent = 'Phase 2/5 - Premier Ennemi';
                info.textContent = 'Un ennemi bloque le chemin ! Ton allié peut le tuer avec une flèche !';
                break;
            case 3:
                phaseTitle.textContent = 'Phase 3/5 - Combat Dangereux';
                info.textContent = 'Un ennemi attaque et enlève 2 PV par seconde ! Rapproche-toi et attaque-le vite !';
                break;
            case 4:
                phaseTitle.textContent = 'Phase 4/5 - Traversée';
                info.textContent = 'Une rivière bloque le passage ! Pose un bloc pour traverser puis avance !';
                break;
            case 5:
                phaseTitle.textContent = 'Phase 5/5 - BOSS FINAL';
                info.textContent = 'Un alien te tue en 1,7s ! Récupère le champignon 🍄 puis tue tous les ennemis !';
                break;
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        
        // Dessiner les murs
        this.walls.forEach(wall => this.drawWall(wall.x, wall.y));
        
        // Dessiner les blocs de bois (phase 1)
        if (this.currentPhase === 1) {
            this.woodWalls.forEach(wall => {
                if (!wall.destroyed) {
                    this.drawWoodWall(wall.x, wall.y);
                }
            });
        }
        
        // Dessiner le portail (phase 1)
        if (this.currentPhase === 1 && this.portal.active) {
            this.drawCharacter(this.portal.x, this.portal.y, this.portal.symbol);
        }
        
        // Dessiner l'allié
        this.drawCharacter(this.ally.x, this.ally.y, this.ally.symbol);
        
        // Dessiner enemy1 (phase 2+) - visible dès le début
        if (this.enemy1.alive) {
            this.drawCharacter(this.enemy1.x, this.enemy1.y, this.enemy1.symbol);
            this.drawHealthBar(this.enemy1);
        }
        
        // Dessiner enemy2 (phase 3+)
        if (this.currentPhase >= 3 && this.enemy2.alive) {
            this.drawCharacter(this.enemy2.x, this.enemy2.y, this.enemy2.symbol);
            this.drawHealthBar(this.enemy2);
        }
        
        // Dessiner la rivière (phase 4+)
        if (this.currentPhase >= 4) {
            this.water.forEach(w => this.drawWater(w.x, w.y));
        }
        
        // Dessiner les blocs posés
        this.placedBlocks.forEach(block => {
            this.drawBlock(block.x, block.y);
        });
        
        // Dessiner l'alien (phase 5)
        if (this.currentPhase >= 5 && this.alien.alive) {
            this.drawCharacter(this.alien.x, this.alien.y, this.alien.symbol);
            this.drawHealthBar(this.alien);
        }
        
        // Dessiner le champignon (phase 5)
        if (this.currentPhase >= 5 && !this.mushroom.collected) {
            this.drawCharacter(this.mushroom.x, this.mushroom.y, this.mushroom.symbol);
        }
        
        // Dessiner les ennemis finaux (phase 5)
        if (this.currentPhase >= 5) {
            this.finalEnemies.forEach(enemy => {
                if (enemy.alive) {
                    this.drawCharacter(enemy.x, enemy.y, enemy.symbol);
                    this.drawHealthBar(enemy);
                }
            });
        }
        
        // Dessiner la gemme
        if (this.gem.visible) {
            this.drawCharacter(this.gem.x, this.gem.y, this.gem.symbol);
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
    
    drawCharacter(x, y, symbol) {
        const centerX = x * this.gridSize + this.gridSize / 2;
        const centerY = y * this.gridSize + this.gridSize / 2;
        
        this.ctx.font = '35px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(symbol, centerX, centerY);
    }
    
    drawHealthBar(entity) {
        const posX = entity.x * this.gridSize;
        const posY = entity.y * this.gridSize - 10;
        const barWidth = 40;
        const barHeight = 6;
        const healthPercentage = entity.health / entity.maxHealth;
        
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
    
    // PHASE 1: Portail
    usePortal() {
        if (this.gameOver) return;
        
        if (this.currentPhase !== 1) {
            alert('⚠️ Le portail n\'est plus disponible !');
            return;
        }
        
        if (!this.portal.active) {
            alert('⚠️ Le portail a déjà été utilisé !');
            return;
        }
        
        // Téléporter le héros
        this.hero.x = 4;
        this.hero.y = 2;
        this.portal.active = false;
        this.score += 100;
        document.getElementById('score').textContent = this.score;
        
        this.draw();
        
        setTimeout(() => {
            this.currentPhase = 2;
            this.updatePhaseUI();
            this.updateButtonsPhase2();
        }, 500);
    }
    
    // PHASE 2: Allié tire une flèche
    updateButtonsPhase2() {
        document.getElementById('btn-portail').style.display = 'none';
        document.getElementById('btn-fleche').style.display = 'inline-block';
    }
    
    allyShoot() {
        if (this.currentPhase !== 2 || !this.enemy1.alive) return;
        
        this.enemy1.alive = false;
        this.score += 150;
        document.getElementById('score').textContent = this.score;
        
        this.draw();
        
        setTimeout(() => {
            this.currentPhase = 3;
            this.updatePhaseUI();
            this.startEnemy2Attacks();
            this.updateButtonsPhase3();
        }, 500);
    }
    
    // PHASE 3: Combat avec enemy2 qui attaque
    startEnemy2Attacks() {
        this.enemy2AttackInterval = setInterval(() => {
            if (this.enemy2.alive && !this.gameOver && this.currentPhase === 3) {
                this.hero.health -= 2;
                this.updateHealthBar();
                
                if (this.hero.health <= 0) {
                    this.endGame();
                }
            }
        }, 1000);
    }
    
    updateButtonsPhase3() {
        document.getElementById('btn-fleche').style.display = 'none';
        document.getElementById('btn-attaque').style.display = 'inline-block';
    }
    
    moveHero(direction) {
        if (this.gameOver) return;
        
        let newX = this.hero.x;
        let newY = this.hero.y;
        
        switch(direction) {
            case 'haut': newY--; break;
            case 'bas': newY++; break;
            case 'gauche': newX--; break;
            case 'droite': newX++; break;
        }
        
        if (newX < 0 || newX >= this.cols || newY < 0 || newY >= this.rows) return;
        
        const hitWall = this.walls.some(wall => wall.x === newX && wall.y === newY);
        if (hitWall) return;
        
        const hitWood = this.woodWalls.some(wall => wall.x === newX && wall.y === newY && !wall.destroyed);
        if (hitWood) return;
        
        if (this.enemy2.alive && newX === this.enemy2.x && newY === this.enemy2.y) return;
        if (this.alien.alive && newX === this.alien.x && newY === this.alien.y) return;
        
        const hitFinalEnemy = this.finalEnemies.some(enemy => enemy.alive && enemy.x === newX && enemy.y === newY);
        if (hitFinalEnemy) return;
        
        const hitWater = this.water.some(w => w.x === newX && w.y === newY);
        const hasBlock = this.placedBlocks.some(b => b.x === newX && b.y === newY);
        if (hitWater && !hasBlock) return;
        
        this.hero.x = newX;
        this.hero.y = newY;
        
        // Vérifier le champignon
        if (!this.mushroom.collected && this.hero.x === this.mushroom.x && this.hero.y === this.mushroom.y) {
            this.mushroom.collected = true;
            this.hero.health = Math.min(this.hero.maxHealth, this.hero.health + 3);
            this.updateHealthBar();
            this.score += 100;
            document.getElementById('score').textContent = this.score;
        }
        
        // Vérifier la gemme
        if (this.gem.visible && this.hero.x === this.gem.x && this.hero.y === this.gem.y) {
            this.winGame();
        }
        
        this.draw();
    }
    
    attackEnemy() {
        if (this.gameOver) return;
        
        // Phase 3: Attaquer enemy2
        if (this.currentPhase === 3 && this.enemy2.alive) {
            const dx = Math.abs(this.hero.x - this.enemy2.x);
            const dy = Math.abs(this.hero.y - this.enemy2.y);
            
            if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) {
                alert('⚠️ Tu es trop loin ! Rapproche-toi (1 carreau) !');
                return;
            }
            
            this.enemy2.alive = false;
            clearInterval(this.enemy2AttackInterval);
            this.score += 200;
            document.getElementById('score').textContent = this.score;
            
            this.draw();
            
            setTimeout(() => {
                this.currentPhase = 4;
                this.updatePhaseUI();
                this.updateButtonsPhase4();
            }, 500);
        }
        
        // Phase 5: Attaquer alien ou ennemis finaux
        if (this.currentPhase === 5) {
            // Attaquer l'alien
            if (this.alien.alive) {
                const dx = Math.abs(this.hero.x - this.alien.x);
                const dy = Math.abs(this.hero.y - this.alien.y);
                
                if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                    this.alien.alive = false;
                    clearInterval(this.alienAttackInterval);
                    this.score += 250;
                    document.getElementById('score').textContent = this.score;
                    this.draw();
                    return;
                }
            }
            
            // Attaquer les ennemis finaux
            for (let enemy of this.finalEnemies) {
                if (enemy.alive) {
                    const dx = Math.abs(this.hero.x - enemy.x);
                    const dy = Math.abs(this.hero.y - enemy.y);
                    
                    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                        enemy.alive = false;
                        this.score += 200;
                        document.getElementById('score').textContent = this.score;
                        this.draw();
                        
                        // Vérifier si tous les ennemis sont morts
                        const allDead = !this.alien.alive && this.finalEnemies.every(e => !e.alive);
                        if (allDead) {
                            this.gem.visible = true;
                            this.draw();
                        }
                        return;
                    }
                }
            }
            
            alert('⚠️ Aucun ennemi à portée !');
        }
    }
    
    // PHASE 4: Poser un bloc
    updateButtonsPhase4() {
        document.getElementById('btn-attaque').style.display = 'none';
        document.getElementById('btn-poser').style.display = 'inline-block';
    }
    
    placeBlock() {
        if (this.currentPhase !== 4) return;
        
        // Trouver une case d'eau adjacente
        const directions = [
            {x: this.hero.x, y: this.hero.y - 1},
            {x: this.hero.x, y: this.hero.y + 1},
            {x: this.hero.x - 1, y: this.hero.y},
            {x: this.hero.x + 1, y: this.hero.y}
        ];
        
        for (let dir of directions) {
            const isWater = this.water.some(w => w.x === dir.x && w.y === dir.y);
            const hasBlock = this.placedBlocks.some(b => b.x === dir.x && b.y === dir.y);
            
            if (isWater && !hasBlock) {
                this.placedBlocks.push({x: dir.x, y: dir.y});
                this.score += 50;
                document.getElementById('score').textContent = this.score;
                this.draw();
                
                setTimeout(() => {
                    this.currentPhase = 5;
                    this.updatePhaseUI();
                    this.startAlienAttacks();
                    this.updateButtonsPhase5();
                }, 500);
                return;
            }
        }
        
        alert('⚠️ Aucune case d\'eau adjacente !');
    }
    
    // PHASE 5: Boss final
    startAlienAttacks() {
        this.alienAttackInterval = setInterval(() => {
            if (this.alien.alive && !this.gameOver && this.currentPhase === 5) {
                const dx = Math.abs(this.hero.x - this.alien.x);
                const dy = Math.abs(this.hero.y - this.alien.y);
                
                if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (dx === 0 && dy === 0)) {
                    this.hero.health = 0;
                    this.updateHealthBar();
                    this.endGame();
                }
            }
        }, 1700);
    }
    
    updateButtonsPhase5() {
        document.getElementById('btn-poser').style.display = 'none';
        document.getElementById('btn-attaque').style.display = 'inline-block';
    }
    
    endGame() {
        this.gameOver = true;
        clearInterval(this.enemy2AttackInterval);
        clearInterval(this.alienAttackInterval);
        
        setTimeout(() => {
            alert('💀 Game Over ! Le boss t\'a vaincu !');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }, 500);
    }
    
    winGame() {
        this.gameOver = true;
        clearInterval(this.enemy2AttackInterval);
        clearInterval(this.alienAttackInterval);
        
        this.score += 500;
        document.getElementById('score').textContent = this.score;
        
        localStorage.setItem('codecombat_level', 15);
        localStorage.setItem('codecombat_score', this.score);
        
        let completed = JSON.parse(localStorage.getItem('codecombat_completed')) || [];
        if (!completed.includes(14)) {
            completed.push(14);
            localStorage.setItem('codecombat_completed', JSON.stringify(completed));
        }
        
        setTimeout(() => {
            alert('🎉 VICTOIRE ! Tu as vaincu le BOSS FINAL ! 👑');
            setTimeout(() => {
                window.location.href = 'victoire.html?score=' + this.score + '&level=14';
            }, 1000);
        }, 500);
    }
}

// Fonctions globales
function moveHero(direction) {
    if (game) game.moveHero(direction);
}

function usePortal() {
    if (game) game.usePortal();
}

function allyShoot() {
    if (game) game.allyShoot();
}

function placeBlock() {
    if (game) game.placeBlock();
}

function attackEnemy() {
    if (game) game.attackEnemy();
}

// Initialiser le jeu
window.onload = () => {
    game = new Game();
};
