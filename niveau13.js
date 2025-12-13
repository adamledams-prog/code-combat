// Code Combat - Niveau 13 - L'Énigme des Potions
let selectedPotion = null;
let game = null;

function selectPotion(color) {
    selectedPotion = color;
    
    // Cacher l'écran de sélection
    document.getElementById('potion-selection').classList.add('hidden');
    document.getElementById('game-interface').classList.remove('hidden');
    
    // Démarrer le jeu
    game = new Game(color);
}

class Game {
    constructor(potionColor) {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 50;
        this.rows = 8;
        this.cols = 12;
        
        // Récupérer le score du niveau précédent
        const urlParams = new URLSearchParams(window.location.search);
        this.score = parseInt(urlParams.get('score')) || 0;
        document.getElementById('score').textContent = this.score;
        
        // Potion choisie
        this.potionColor = potionColor;
        this.correctPotion = 'yellow'; // La bonne réponse est la potion jaune
        
        // Héros enfermé au centre-gauche
        this.hero = {
            x: 3,
            y: 4,
            symbol: '🦸',
            health: 4,
            maxHealth: 4
        };
        
        // Ennemi mystérieux au centre
        this.mysteryEnemy = {
            x: 7,
            y: 4,
            symbol: '🧟',
            health: 3,
            maxHealth: 3,
            alive: true
        };
        
        // Ennemi à combattre après l'évasion
        this.finalEnemy = {
            x: 10,
            y: 3,
            symbol: '👹',
            health: 1,
            maxHealth: 1,
            alive: true
        };
        
        // Murs qui enferment le héros et l'ennemi
        this.walls = [
            // Cadre extérieur
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}, {x: 11, y: 0},
            {x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}, {x: 0, y: 4}, {x: 0, y: 5}, {x: 0, y: 6}, {x: 0, y: 7},
            {x: 11, y: 1}, {x: 11, y: 2}, {x: 11, y: 3}, {x: 11, y: 4}, {x: 11, y: 5}, {x: 11, y: 6}, {x: 11, y: 7},
            {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}, {x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7},
            
            // Murs de la prison (enferme complètement le héros et l'ennemi)
            // Mur gauche
            {x: 2, y: 2}, {x: 2, y: 3}, {x: 2, y: 4}, {x: 2, y: 5}, {x: 2, y: 6},
            // Mur droit
            {x: 9, y: 2}, {x: 9, y: 3}, {x: 9, y: 4}, {x: 9, y: 5}, {x: 9, y: 6},
            // Mur haut
            {x: 3, y: 2}, {x: 4, y: 2}, {x: 5, y: 2}, {x: 6, y: 2}, {x: 7, y: 2}, {x: 8, y: 2},
            // Mur bas
            {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6}, {x: 6, y: 6}, {x: 7, y: 6}, {x: 8, y: 6}
        ];
        
        // Sortie (sera accessible après avoir tué l'ennemi)
        this.exit = {
            x: 10,
            y: 4,
            symbol: '🚪',
            visible: false
        };
        
        // Gemme (après avoir tué l'ennemi final)
        this.gem = {
            x: 10,
            y: 6,
            symbol: '💎',
            visible: false
        };
        
        this.gameOver = false;
        this.escaped = false;
        this.fightStarted = false;
        
        // Mettre à jour le texte du bouton selon la potion
        this.updatePotionButton();
        
        this.draw();
        this.updateHealthBar();
    }
    
    updatePotionButton() {
        const btn = document.getElementById('btn-potion');
        const potionEmojis = {
            'red': '🔴',
            'blue': '🔵',
            'green': '🟢',
            'yellow': '🟡',
            'purple': '🟣'
        };
        
        btn.textContent = `${potionEmojis[this.potionColor]} Utiliser la Potion ${this.potionColor.charAt(0).toUpperCase() + this.potionColor.slice(1)}`;
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
        
        // Dessiner la sortie si visible
        if (this.exit.visible) {
            this.drawCharacter(this.exit.x, this.exit.y, this.exit.symbol);
        }
        
        // Dessiner la gemme si visible
        if (this.gem.visible) {
            this.drawCharacter(this.gem.x, this.gem.y, this.gem.symbol);
        }
        
        // Dessiner l'ennemi mystérieux s'il est vivant
        if (this.mysteryEnemy.alive) {
            this.drawCharacter(this.mysteryEnemy.x, this.mysteryEnemy.y, this.mysteryEnemy.symbol);
            this.drawHealthBar(this.mysteryEnemy);
        }
        
        // Dessiner l'ennemi final s'il est vivant et que le héros s'est échappé
        if (this.finalEnemy.alive && this.escaped) {
            this.drawCharacter(this.finalEnemy.x, this.finalEnemy.y, this.finalEnemy.symbol);
            this.drawHealthBar(this.finalEnemy);
        }
        
        // Dessiner le héros
        this.drawCharacter(this.hero.x, this.hero.y, this.hero.symbol);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#e5e7eb';
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
        this.ctx.fillStyle = '#4b5563';
        this.ctx.fillRect(
            x * this.gridSize + 2,
            y * this.gridSize + 2,
            this.gridSize - 4,
            this.gridSize - 4
        );
    }
    
    drawCharacter(x, y, symbol) {
        this.ctx.font = '35px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            symbol,
            x * this.gridSize + this.gridSize / 2,
            y * this.gridSize + this.gridSize / 2
        );
    }
    
    drawHealthBar(entity) {
        const barWidth = 40;
        const barHeight = 5;
        const x = entity.x * this.gridSize + (this.gridSize - barWidth) / 2;
        const y = entity.y * this.gridSize - 10;
        
        // Barre de fond
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(x, y, barWidth, barHeight);
        
        // Barre de vie
        const healthWidth = (entity.health / entity.maxHealth) * barWidth;
        this.ctx.fillStyle = '#10b981';
        this.ctx.fillRect(x, y, healthWidth, barHeight);
    }
    
    updateHealthBar() {
        const healthFill = document.getElementById('health-fill');
        const percentage = (this.hero.health / this.hero.maxHealth) * 100;
        healthFill.style.width = percentage + '%';
        
        if (percentage > 60) {
            healthFill.style.background = 'linear-gradient(90deg, #10b981, #059669)';
        } else if (percentage > 30) {
            healthFill.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
        } else {
            healthFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        }
    }
    
    usePotion() {
        if (this.gameOver || this.escaped) return;
        
        // Animation de la potion
        this.showPotionAnimation();
        
        setTimeout(() => {
            if (this.potionColor === this.correctPotion) {
                // Bonne potion ! L'ennemi meurt
                this.mysteryEnemy.alive = false;
                this.score += 200;
                document.getElementById('score').textContent = this.score;
                
                this.draw();
                
                // Effet de succès
                setTimeout(() => {
                    alert('✨ Bravo ! La potion jaune était la bonne ! L\'ennemi est détruit !');
                    
                    // Téléportation automatique vers la sortie
                    this.escaped = true;
                    this.teleportToExit();
                }, 500);
                
            } else {
                // Mauvaise potion ! Le héros meurt
                this.hero.health = 0;
                this.updateHealthBar();
                this.draw();
                
                this.gameOver = true;
                
                const potionNames = {
                    'red': 'rouge',
                    'blue': 'bleue',
                    'green': 'verte',
                    'purple': 'violette'
                };
                
                setTimeout(() => {
                    alert(`💀 Game Over ! La potion ${potionNames[this.potionColor]} était mortelle !`);
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }, 500);
            }
        }, 1000);
    }
    
    showPotionAnimation() {
        // Animation visuelle de la potion utilisée
        const potionColors = {
            'red': '#ef4444',
            'blue': '#3b82f6',
            'green': '#10b981',
            'yellow': '#fbbf24',
            'purple': '#a855f7'
        };
        
        this.ctx.fillStyle = potionColors[this.potionColor];
        this.ctx.globalAlpha = 0.5;
        
        let radius = 20;
        const interval = setInterval(() => {
            this.draw();
            this.ctx.fillStyle = potionColors[this.potionColor];
            this.ctx.globalAlpha = 0.5;
            this.ctx.beginPath();
            this.ctx.arc(
                this.hero.x * this.gridSize + this.gridSize / 2,
                this.hero.y * this.gridSize + this.gridSize / 2,
                radius,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            
            radius += 10;
            
            if (radius > 100) {
                clearInterval(interval);
                this.ctx.globalAlpha = 1;
                this.draw();
            }
        }, 50);
    }
    
    teleportToExit() {
        // Retirer les murs de droite pour créer une sortie
        this.walls = this.walls.filter(wall => wall.x !== 9 || wall.y !== 4);
        
        // Téléporter le héros vers la sortie
        this.hero.x = 10;
        this.hero.y = 1;
        
        this.draw();
        
        setTimeout(() => {
            alert('🎉 Tu t\'es échappé ! Mais attention, un ennemi te bloque le passage ! Combat-le pour atteindre la gemme !');
            
            // Changer le bouton pour le combat
            this.fightStarted = true;
            this.updateCombatButtons();
        }, 500);
    }
    
    updateCombatButtons() {
        const controlsArea = document.querySelector('.controls-area');
        controlsArea.innerHTML = `
            <h2>⚔️ Combat Final</h2>
            <div class="objective-box">
                <p>Un ennemi te bloque le passage ! 👹</p>
                <p>Attention : Chaque attaque te fait perdre 2 points de vie !</p>
                <p>Rapproche-toi à 1 carreau pour l'attaquer !</p>
            </div>

            <h2>Commandes</h2>
            <div class="command-buttons">
                <button class="cmd-btn" onclick="game.moveHero('haut')" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">⬆️ Avancer</button>
                <button class="cmd-btn" onclick="game.moveHero('bas')" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">⬇️ Reculer</button>
                <button class="cmd-btn" onclick="game.moveHero('gauche')" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">⬅️ Gauche</button>
                <button class="cmd-btn" onclick="game.moveHero('droite')" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">➡️ Droite</button>
            </div>
            
            <div class="command-buttons" style="margin-top: 15px;">
                <button class="cmd-btn" onclick="game.attackEnemy()" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); font-size: 1.2em; padding: 20px 40px;">
                    ⚔️ Attaquer l'Ennemi
                </button>
            </div>
        `;
    }
    
    moveHero(direction) {
        if (this.gameOver || !this.fightStarted) return;
        
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
        
        // Vérifier collision avec l'ennemi
        if (this.finalEnemy.alive && newX === this.finalEnemy.x && newY === this.finalEnemy.y) return;
        
        // Déplacer le héros
        this.hero.x = newX;
        this.hero.y = newY;
        
        // Vérifier si on atteint la gemme
        if (this.gem.visible && this.hero.x === this.gem.x && this.hero.y === this.gem.y) {
            this.collectGem();
        }
        
        this.draw();
    }
    
    attackEnemy() {
        if (this.gameOver || !this.fightStarted || !this.finalEnemy.alive) return;
        
        // Vérifier si le héros est adjacent à l'ennemi (à 1 carreau)
        const dx = Math.abs(this.hero.x - this.finalEnemy.x);
        const dy = Math.abs(this.hero.y - this.finalEnemy.y);
        
        if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) {
            alert('⚠️ Tu es trop loin ! Rapproche-toi de l\'ennemi (1 carreau) !');
            return;
        }
        
        // Le héros perd 2 points de vie
        this.hero.health -= 2;
        this.updateHealthBar();
        
        // L'ennemi perd 1 point de vie
        this.finalEnemy.health--;
        
        if (this.hero.health <= 0) {
            this.draw();
            this.gameOver = true;
            
            setTimeout(() => {
                alert('💀 Game Over ! Tu n\'as pas survécu au combat !');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }, 500);
            return;
        }
        
        if (this.finalEnemy.health <= 0) {
            this.finalEnemy.alive = false;
            this.score += 150;
            document.getElementById('score').textContent = this.score;
            
            // Afficher la gemme
            this.gem.visible = true;
            this.draw();
            
            setTimeout(() => {
                this.showGemMessage();
            }, 300);
        } else {
            this.draw();
        }
    }
    
    showGemMessage() {
        const controlsArea = document.querySelector('.controls-area');
        controlsArea.innerHTML = `
            <h2>💎 Victoire !</h2>
            <div class="objective-box">
                <p>Tu as vaincu l'ennemi !</p>
                <p>La gemme est apparue ! Avance pour la récupérer !</p>
            </div>

            <h2>Commandes</h2>
            <div class="command-buttons">
                <button class="cmd-btn" onclick="game.moveHero('haut')" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">⬆️ Avancer</button>
                <button class="cmd-btn" onclick="game.moveHero('bas')" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">⬇️ Reculer</button>
                <button class="cmd-btn" onclick="game.moveHero('gauche')" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">⬅️ Gauche</button>
                <button class="cmd-btn" onclick="game.moveHero('droite')" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">➡️ Droite</button>
            </div>
        `;
    }
    
    collectGem() {
        if (this.gameOver) return;
        
        this.score += 200;
        document.getElementById('score').textContent = this.score;
        this.gameOver = true;
        
        // Sauvegarder la progression
        localStorage.setItem('codecombat_level', 14);
        localStorage.setItem('codecombat_score', this.score);
        
        let completed = JSON.parse(localStorage.getItem('codecombat_completed')) || [];
        if (!completed.includes(13)) {
            completed.push(13);
            localStorage.setItem('codecombat_completed', JSON.stringify(completed));
        }
        
        setTimeout(() => {
            alert('💎 Tu as récupéré la gemme ! Niveau 13 terminé ! Prépare-toi pour le BOSS FINAL ! 👑');
            setTimeout(() => {
                window.location.href = `niveau14.html?score=${this.score}`;
            }, 500);
        }, 300);
    }
}

function usePotion() {
    if (game) {
        game.usePotion();
    }
}
