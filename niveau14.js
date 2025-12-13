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
        
        // Héros enfermé en bas à gauche
        this.hero = {
            x: 2,
            y: 5,
            symbol: '🦸',
            health: 5,
            maxHealth: 5
        };
        
        // Premier ennemi à 2 blocs du héros (enfermé avec lui)
        this.firstEnemy = {
            x: 4,
            y: 5,
            symbol: '👹',
            health: 4,
            maxHealth: 4,
            alive: true,
            damage: 1
        };
        
        // Allié (apparaît après le portail)
        this.ally = {
            x: 8,
            y: 2,
            symbol: '👨',
            visible: false,
            canShoot: true
        };
        
        // Ennemi que l'allié va tuer avec la flèche
        this.targetEnemy = {
            x: 8,
            y: 5,
            symbol: '👾',
            health: 1,
            maxHealth: 1,
            alive: true,
            visible: false
        };
        // 3 monstres finaux
        this.finalEnemies = [
            {x: 9, y: 2, symbol: '👹', health: 2, maxHealth: 2, alive: true, visible: false, damage: 2},
            {x: 10, y: 4, symbol: '👹', health: 2, maxHealth: 2, alive: true, visible: false, damage: 2},
            {x: 9, y: 6, symbol: '👹', health: 2, maxHealth: 2, alive: true, visible: false, damage: 2}
        ];
        
        // Champignon de vie
        this.mushroom = {
            x: 10,
            y: 2,
            symbol: '🍄',
            collected: false,
            visible: false
        };
        
        // Portail (apparaît après avoir tué le premier ennemi)
        this.portal = {
            x: 3,
            y: 3,
            symbol: '🔴',
            visible: false
        };
        
        // Gemme finale
        this.gem = {
            x: 10,
            y: 6,
            symbol: '💎',
            visible: false
        };
        
        // Murs - Prison initiale
        this.walls = [
            // Cadre extérieur
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}, {x: 11, y: 0},
            {x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}, {x: 0, y: 4}, {x: 0, y: 5}, {x: 0, y: 6}, {x: 0, y: 7},
            {x: 11, y: 1}, {x: 11, y: 2}, {x: 11, y: 3}, {x: 11, y: 4}, {x: 11, y: 5}, {x: 11, y: 6}, {x: 11, y: 7},
            {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}, {x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7},
            
            // Prison initiale - enferme le héros et le premier ennemi
            {x: 1, y: 3}, {x: 2, y: 3}, {x: 3, y: 3}, {x: 4, y: 3}, {x: 5, y: 3},
            {x: 1, y: 4}, {x: 5, y: 4},
            {x: 1, y: 5}, {x: 5, y: 5},
            {x: 1, y: 6}, {x: 2, y: 6}, {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6},
            
            // Murs de séparation pour la zone finale
            {x: 7, y: 1}, {x: 7, y: 2}, {x: 7, y: 3}, {x: 7, y: 4}, {x: 7, y: 5}, {x: 7, y: 6}
        ];
        
        this.gameOver = false;
        this.enemyAttackInterval = null;
        
        // Démarrer les attaques des ennemis
        this.startEnemyAttacks();
        
        this.draw();
        this.updateHealthBar();
        this.updatePhaseUI();
    }
    
    startEnemyAttacks() {
        // Les ennemis attaquent toutes les secondes
        this.enemyAttackInterval = setInterval(() => {
            if (this.gameOver) return;
            
            // Phase 1: Premier ennemi attaque
            if (this.currentPhase === 1 && this.firstEnemy.alive) {
                const dx = Math.abs(this.hero.x - this.firstEnemy.x);
                const dy = Math.abs(this.hero.y - this.firstEnemy.y);
                
                if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                    this.hero.health -= this.firstEnemy.damage;
                    this.updateHealthBar();
                    this.draw();
                    
                    console.log('Premier ennemi attaque ! HP:', this.hero.health);
                    
                    if (this.hero.health <= 0) {
                        this.endGame();
                    }
                }
            }
            
            // Phase 4: Les 3 ennemis finaux attaquent toutes les secondes
            if (this.currentPhase >= 4) {
                this.finalEnemies.forEach(enemy => {
                    if (enemy.visible && enemy.alive) {
                        const dx = Math.abs(this.hero.x - enemy.x);
                        const dy = Math.abs(this.hero.y - enemy.y);
                        
                        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                            this.hero.health -= enemy.damage;
                            this.updateHealthBar();
                            this.draw();
                            
                            console.log('Ennemi final attaque ! Dégâts:', enemy.damage, 'HP restants:', this.hero.health);
                            
                            if (this.hero.health <= 0) {
                                this.endGame();
                            }
                        }
                    }
                });
            }
        }, 1000);
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
        
        // Vérifier les limites
        if (newX < 0 || newX >= this.cols || newY < 0 || newY >= this.rows) return;
        
        // Vérifier collision avec murs
        const hitWall = this.walls.some(wall => wall.x === newX && wall.y === newY);
        if (hitWall) return;
        
        // Vérifier collision avec le premier ennemi (phase 1)
        if (this.currentPhase === 1 && this.firstEnemy.alive && 
            newX === this.firstEnemy.x && newY === this.firstEnemy.y) return;
        
        // Vérifier collision avec l'ennemi cible (phase 3)
        if (this.targetEnemy.visible && this.targetEnemy.alive && 
            newX === this.targetEnemy.x && newY === this.targetEnemy.y) return;
        
        // Vérifier collision avec les ennemis finaux (phase 4+)
        const hitFinalEnemy = this.finalEnemies.some(enemy => 
            enemy.visible && enemy.alive && enemy.x === newX && enemy.y === newY
        );
        if (hitFinalEnemy) return;
        
        // Déplacer le héros
        this.hero.x = newX;
        this.hero.y = newY;
        
        // Vérifier si on ramasse le champignon (phase 4)
        if (this.mushroom.visible && !this.mushroom.collected && 
            this.hero.x === this.mushroom.x && this.hero.y === this.mushroom.y) {
            this.mushroom.collected = true;
            this.hero.health = Math.min(this.hero.health + 2, this.hero.maxHealth);
            this.updateHealthBar();
            this.score += 100;
            document.getElementById('score').textContent = this.score;
            alert('🍄 Champignon récupéré ! +2 PV !');
        }
        
        // Vérifier si on atteint la gemme finale (phase 5)
        if (this.gem.visible && this.hero.x === this.gem.x && this.hero.y === this.gem.y) {
            this.winGame();
        }
        
        this.draw();
    }
    
    endGame() {
        this.gameOver = true;
        clearInterval(this.enemyAttackInterval);
        
        this.draw();
        
        setTimeout(() => {
            alert('💀 Game Over ! Les ennemis t\'ont vaincu !');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }, 500);
    }
    
    updatePhaseUI() {
        const phaseTitle = document.getElementById('phase-title');
        const info = document.getElementById('info-text');
        
        if (!phaseTitle || !info) return;
        
        switch(this.currentPhase) {
            case 1:
                phaseTitle.textContent = 'Phase 1/5 - Premier Combat';
                info.textContent = 'Tu es enfermé avec un ennemi à 2 blocs ! Rapproche-toi et attaque-le pour débloquer le portail !';
                break;
            case 2:
                phaseTitle.textContent = 'Phase 2/5 - Téléportation';
                info.textContent = 'Le portail est apparu ! Clique sur "Utiliser Portail" pour te téléporter !';
                break;
            case 3:
                phaseTitle.textContent = 'Phase 3/5 - Flèche de l\'Allié';
                info.textContent = 'Ton allié peut tirer une flèche pour tuer un monstre ! Clique sur "Lancer Flèche" !';
                break;
            case 4:
                phaseTitle.textContent = 'Phase 4/5 - Combat Final';
                info.textContent = 'Il reste 3 monstres ! Récupère le champignon 🍄 pour te soigner puis attaque tous les ennemis !';
                break;
            case 5:
                phaseTitle.textContent = 'Phase 5/5 - Victoire !';
                info.textContent = 'Tous les ennemis sont vaincus ! Va chercher la gemme pour terminer le jeu ! 💎';
                break;
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        
        // Dessiner les murs
        this.walls.forEach(wall => this.drawWall(wall.x, wall.y));
        
        // Dessiner le portail (phase 2+)
        if (this.portal.visible) {
            this.drawPortal(this.portal.x, this.portal.y, this.portal.symbol);
        }
        
        // Dessiner le premier ennemi (phase 1)
        if (this.firstEnemy.alive) {
            this.drawCharacter(this.firstEnemy.x, this.firstEnemy.y, this.firstEnemy.symbol);
            this.drawHealthBar(this.firstEnemy);
        }
        
        // Dessiner l'allié (phase 3+)
        if (this.ally.visible) {
            this.drawCharacter(this.ally.x, this.ally.y, this.ally.symbol);
        }
        
        // Dessiner l'ennemi cible de la flèche (phase 3)
        if (this.targetEnemy.visible && this.targetEnemy.alive) {
            this.drawCharacter(this.targetEnemy.x, this.targetEnemy.y, this.targetEnemy.symbol);
            this.drawHealthBar(this.targetEnemy);
        }
        
        // Dessiner les 3 ennemis finaux (phase 4+)
        this.finalEnemies.forEach(enemy => {
            if (enemy.visible && enemy.alive) {
                this.drawCharacter(enemy.x, enemy.y, enemy.symbol);
                this.drawHealthBar(enemy);
            }
        });
        
        // Dessiner le champignon (phase 4+)
        if (this.mushroom.visible && !this.mushroom.collected) {
            this.drawCharacter(this.mushroom.x, this.mushroom.y, this.mushroom.symbol);
        }
        
        // Dessiner la gemme (phase 5)
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
    
    drawPortal(x, y, symbol) {
        const centerX = x * this.gridSize + this.gridSize / 2;
        const centerY = y * this.gridSize + this.gridSize / 2;
        
        // Aura du portail
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 20);
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.5)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
        
        // Symbole du portail
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(symbol, centerX, centerY);
    }
    
    updateHealthBar() {
        const healthFill = document.getElementById('hero-health');
        const healthValue = document.getElementById('health-value');
        const percentage = (this.hero.health / this.hero.maxHealth) * 100;
        
        healthFill.style.width = percentage + '%';
        healthValue.textContent = this.hero.health;
        
        console.log('Update HP bar:', this.hero.health, '/', this.hero.maxHealth, '=', percentage + '%');
        
        healthFill.className = 'health-fill';
    }
    
    attackEnemy() {
        if (this.gameOver) return;
        
        // Phase 1: Attaquer le premier ennemi
        if (this.currentPhase === 1 && this.firstEnemy.alive) {
            const dx = Math.abs(this.hero.x - this.firstEnemy.x);
            const dy = Math.abs(this.hero.y - this.firstEnemy.y);
            
            if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) {
                alert('⚠️ Tu es trop loin ! Rapproche-toi à 1 case de l\'ennemi !');
                return;
            }
            
            // Infliger 1 dégât à l'ennemi
            this.firstEnemy.health--;
            this.score += 50;
            document.getElementById('score').textContent = this.score;
            
            this.draw();
            
            // Vérifier si l'ennemi est mort
            if (this.firstEnemy.health <= 0) {
                this.firstEnemy.alive = false;
                clearInterval(this.enemyAttackInterval);
                this.score += 50;
                document.getElementById('score').textContent = this.score;
                
                // Passer à la phase 2 - Faire apparaître le portail
                setTimeout(() => {
                    this.portal.visible = true;
                    this.currentPhase = 2;
                    this.updatePhaseUI();
                    
                    // Cacher le bouton attaque et montrer le bouton portail
                    document.getElementById('btn-attaque').style.display = 'none';
                    document.getElementById('btn-portail').style.display = 'inline-block';
                    
                    this.draw();
                    alert('🎉 Ennemi vaincu ! Un portail est apparu ! Utilise-le pour te téléporter !');
                }, 500);
            }
            return;
        }
        
        // Phase 4: Attaquer les 3 ennemis finaux
        if (this.currentPhase >= 4) {
            let attackedEnemy = null;
            
            this.finalEnemies.forEach(enemy => {
                if (enemy.visible && enemy.alive) {
                    const dx = Math.abs(this.hero.x - enemy.x);
                    const dy = Math.abs(this.hero.y - enemy.y);
                    
                    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                        attackedEnemy = enemy;
                    }
                }
            });
            
            if (!attackedEnemy) {
                alert('⚠️ Aucun ennemi à portée ! Rapproche-toi à 1 case d\'un ennemi !');
                return;
            }
            
            // Infliger 1 dégât à l'ennemi
            attackedEnemy.health--;
            this.score += 75;
            document.getElementById('score').textContent = this.score;
            
            // Vérifier si l'ennemi est mort
            if (attackedEnemy.health <= 0) {
                attackedEnemy.alive = false;
                this.score += 75;
                document.getElementById('score').textContent = this.score;
            }
            
            this.draw();
            
            // Vérifier si tous les ennemis sont morts
            const allDead = this.finalEnemies.every(enemy => !enemy.alive);
            
            if (allDead) {
                setTimeout(() => {
                    this.currentPhase = 5;
                    this.updatePhaseUI();
                    this.gem.visible = true;
                    this.draw();
                    alert('🎉 Tous les ennemis sont vaincus ! La gemme est apparue ! Va la chercher ! 💎');
                }, 500);
            }
        }
    }
    
    usePortal() {
        if (this.gameOver || this.currentPhase !== 2) return;
        
        // Téléporter le héros de l'autre côté du mur
        this.hero.x = 8;
        this.hero.y = 3;
        
        this.score += 100;
        document.getElementById('score').textContent = this.score;
        
        this.draw();
        
        // Passer à la phase 3
        setTimeout(() => {
            this.currentPhase = 3;
            this.updatePhaseUI();
            
            // Faire apparaître l'allié et l'ennemi cible
            this.ally.visible = true;
            this.targetEnemy.visible = true;
            
            // Cacher le bouton portail et montrer le bouton flèche
            document.getElementById('btn-portail').style.display = 'none';
            document.getElementById('btn-fleche').style.display = 'inline-block';
            
            this.draw();
            alert('🧝 Un allié apparaît ! Il peut tirer une flèche pour tuer l\'ennemi cible ! 🏹');
        }, 500);
    }
    
    shootArrow() {
        if (this.gameOver || this.currentPhase !== 3) return;
        
        if (!this.ally.canShoot) {
            alert('⚠️ L\'allié a déjà tiré sa flèche !');
            return;
        }
        
        // Animation de la flèche
        this.drawArrowAnimation(this.ally.x, this.ally.y, this.targetEnemy.x, this.targetEnemy.y, () => {
            // Tuer l'ennemi cible
            this.targetEnemy.alive = false;
            this.ally.canShoot = false;
            
            this.score += 150;
            document.getElementById('score').textContent = this.score;
            
            this.draw();
            
            // Passer à la phase 4 - Combat final
            setTimeout(() => {
                this.currentPhase = 4;
                this.updatePhaseUI();
                
                // Faire apparaître les 3 ennemis finaux et le champignon
                this.finalEnemies.forEach(enemy => enemy.visible = true);
                this.mushroom.visible = true;
                
                // Cacher le bouton flèche et montrer le bouton attaque
                document.getElementById('btn-fleche').style.display = 'none';
                document.getElementById('btn-attaque').style.display = 'inline-block';
                
                this.draw();
                alert('🏹 Flèche tirée ! Il reste 3 monstres ! Récupère le champignon 🍄 puis bats-les tous !');
            }, 500);
        });
    }
    
    drawArrowAnimation(startX, startY, endX, endY, callback) {
        const steps = 20;
        let currentStep = 0;
        
        const intervalId = setInterval(() => {
            this.draw();
            
            // Calculer la position actuelle de la flèche
            const progress = currentStep / steps;
            const arrowX = startX + (endX - startX) * progress;
            const arrowY = startY + (endY - startY) * progress;
            
            // Dessiner la flèche qui vole
            const centerX = arrowX * this.gridSize + this.gridSize / 2;
            const centerY = arrowY * this.gridSize + this.gridSize / 2;
            
            this.ctx.font = '25px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('➤', centerX, centerY);
            
            currentStep++;
            
            if (currentStep > steps) {
                clearInterval(intervalId);
                callback();
            }
        }, 30);
    }
    
    winGame() {
        this.gameOver = true;
        
        this.score += 500;
        document.getElementById('score').textContent = this.score;
        
        // Sauvegarder la progression
        localStorage.setItem('codecombat_level', 15);
        localStorage.setItem('codecombat_score', this.score);
        
        let completed = JSON.parse(localStorage.getItem('codecombat_completed')) || [];
        if (!completed.includes(14)) {
            completed.push(14);
            localStorage.setItem('codecombat_completed', JSON.stringify(completed));
        }
        
        setTimeout(() => {
            alert('🎉🎉🎉 FÉLICITATIONS ! 🎉🎉🎉\n\nTu as vaincu le BOSS FINAL !\nTu as terminé Code Combat ! 👑');
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

function attackEnemy() {
    if (game) game.attackEnemy();
}

function usePortal() {
    if (game) game.usePortal();
}

function allyShoot() {
    if (game) game.shootArrow();
}

// Initialiser le jeu
window.onload = () => {
    game = new Game();
};
