// Code Combat - Niveau 5
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
            health: 3,
            maxHealth: 3
        };
        
        // Allié bloqué derrière les murs de bois
        this.ally = {
            x: 3,
            y: 6,
            symbol: '👨',
            freed: false,
            health: 2,
            maxHealth: 2
        };
        
        // Ennemi qui ne peut être attaqué que par l'allié
        this.enemy = {
            x: 9,
            y: 3,
            symbol: '👾',
            health: 1,
            maxHealth: 1,
            alive: true
        };
        
        // Murs en pierre (indestructibles)
        this.walls = [
            // Cadre extérieur
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}, {x: 11, y: 0},
            {x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}, {x: 0, y: 4}, {x: 0, y: 5}, {x: 0, y: 6}, {x: 0, y: 7},
            {x: 11, y: 1}, {x: 11, y: 2}, {x: 11, y: 3}, {x: 11, y: 4}, {x: 11, y: 5}, {x: 11, y: 6}, {x: 11, y: 7},
            {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}, {x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7},
            
            // Murs intérieurs
            {x: 6, y: 2}, {x: 6, y: 3}, {x: 6, y: 4}
        ];
        
        // Murs de bois (destructibles) - bloquent l'allié
        this.woodenWalls = [
            {x: 2, y: 5}, {x: 3, y: 5}, {x: 4, y: 5},
            {x: 2, y: 6}, {x: 4, y: 6}
        ];
        
        // Gemme à atteindre
        this.gem = {
            x: 10,
            y: 1,
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
            if (this.enemy.alive && !this.gameOver) {
                this.enemyAttack();
            }
        }, 1500);
    }
    
    enemyAttack() {
        // L'ennemi attaque le héros s'il est adjacent
        const dxHero = Math.abs(this.hero.x - this.enemy.x);
        const dyHero = Math.abs(this.hero.y - this.enemy.y);
        
        if ((dxHero === 1 && dyHero === 0) || (dxHero === 0 && dyHero === 1)) {
            this.hero.health--;
            this.updateHealthBars();
            this.draw();
            
            if (this.hero.health <= 0) {
                this.gameOver = true;
                clearInterval(this.enemyAttackInterval);
                alert('💀 Game Over! L\'ennemi t\'a vaincu!');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                return;
            }
        }
        
        // L'ennemi attaque l'allié s'il est adjacent et libéré
        if (this.ally.freed) {
            const dxAlly = Math.abs(this.ally.x - this.enemy.x);
            const dyAlly = Math.abs(this.ally.y - this.enemy.y);
            
            if ((dxAlly === 1 && dyAlly === 0) || (dxAlly === 0 && dyAlly === 1)) {
                this.ally.health--;
                this.updateHealthBars();
                this.draw();
                
                if (this.ally.health <= 0) {
                    alert('💀 Ton allié est tombé au combat!');
                    this.ally.symbol = '💀';
                    this.ally.freed = false;
                    document.getElementById('ally-attack-btn').style.display = 'none';
                }
            }
        }
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
        
        // Dessiner les murs en pierre
        this.walls.forEach(wall => {
            this.drawWall(wall.x, wall.y);
        });
        
        // Dessiner les murs de bois
        this.woodenWalls.forEach(wall => {
            this.drawWoodenWall(wall.x, wall.y);
        });
        
        // Dessiner la gemme
        this.drawCharacter(this.gem.x, this.gem.y, this.gem.symbol);
        
        // Dessiner l'ennemi vivant ou avec épée
        if (this.enemy.alive || this.enemy.symbol === '⚔️') {
            this.drawCharacter(this.enemy.x, this.enemy.y, this.enemy.symbol);
            if (this.enemy.alive) {
                this.drawHealthBar(this.enemy.x, this.enemy.y, this.enemy.health, this.enemy.maxHealth);
            }
        }
        
        // Dessiner l'allié
        this.drawCharacter(this.ally.x, this.ally.y, this.ally.symbol);
        if (this.ally.health > 0) {
            this.drawHealthBar(this.ally.x, this.ally.y, this.ally.health, this.ally.maxHealth);
        }
        
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
    
    drawWoodenWall(x, y) {
        const posX = x * this.gridSize;
        const posY = y * this.gridSize;
        
        // Couleur marron pour le bois
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(posX, posY, this.gridSize, this.gridSize);
        
        // Texture bois - lignes
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(posX, posY + (i + 1) * 12);
            this.ctx.lineTo(posX + this.gridSize, posY + (i + 1) * 12);
            this.ctx.stroke();
        }
        
        // Bordure du mur de bois
        this.ctx.strokeStyle = '#5D4E37';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(posX, posY, this.gridSize, this.gridSize);
    }
    
    isWall(x, y) {
        return this.walls.some(wall => wall.x === x && wall.y === y);
    }
    
    isWoodenWall(x, y) {
        return this.woodenWalls.some(wall => wall.x === x && wall.y === y);
    }
    
    breakWood(x, y) {
        const index = this.woodenWalls.findIndex(wall => wall.x === x && wall.y === y);
        if (index !== -1) {
            this.woodenWalls.splice(index, 1);
            this.score += 25;
            document.getElementById('score').textContent = this.score;
            return true;
        }
        return false;
    }
    
    moveAllyToEnemy() {
        if (!this.ally.freed || this.ally.health <= 0 || !this.enemy.alive) {
            return;
        }
        
        // Utiliser A* pour trouver le meilleur chemin vers l'ennemi
        const path = this.findPath(this.ally.x, this.ally.y, this.enemy.x, this.enemy.y);
        
        if (path && path.length > 1) {
            // Le premier élément est la position actuelle, le deuxième est la prochaine étape
            this.ally.x = path[1].x;
            this.ally.y = path[1].y;
        }
        
        this.draw();
        
        // Continuer le mouvement jusqu'à être adjacent à l'ennemi
        const dx = Math.abs(this.ally.x - this.enemy.x);
        const dy = Math.abs(this.ally.y - this.enemy.y);
        
        if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) {
            setTimeout(() => this.moveAllyToEnemy(), 300);
        }
    }
    
    findPath(startX, startY, endX, endY) {
        // Implémentation simple de A*
        const openSet = [{x: startX, y: startY, g: 0, h: 0, f: 0, parent: null}];
        const closedSet = new Set();
        
        while (openSet.length > 0) {
            // Trouver le nœud avec le plus petit f
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            
            // Si on est adjacent à la destination, on s'arrête
            const dx = Math.abs(current.x - endX);
            const dy = Math.abs(current.y - endY);
            if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                // Reconstruire le chemin
                const path = [];
                let node = current;
                while (node) {
                    path.unshift({x: node.x, y: node.y});
                    node = node.parent;
                }
                return path;
            }
            
            closedSet.add(`${current.x},${current.y}`);
            
            // Vérifier les 4 directions
            const neighbors = [
                {x: current.x + 1, y: current.y},
                {x: current.x - 1, y: current.y},
                {x: current.x, y: current.y + 1},
                {x: current.x, y: current.y - 1}
            ];
            
            for (let neighbor of neighbors) {
                // Ne pas aller sur la position de l'ennemi
                if (neighbor.x === endX && neighbor.y === endY) {
                    continue;
                }
                
                if (neighbor.x < 0 || neighbor.x >= this.cols || 
                    neighbor.y < 0 || neighbor.y >= this.rows ||
                    this.isWall(neighbor.x, neighbor.y) || 
                    this.isWoodenWall(neighbor.x, neighbor.y) ||
                    closedSet.has(`${neighbor.x},${neighbor.y}`)) {
                    continue;
                }
                
                const g = current.g + 1;
                const h = Math.abs(neighbor.x - endX) + Math.abs(neighbor.y - endY);
                const f = g + h;
                
                // Vérifier si ce voisin est déjà dans openSet
                const existingNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
                
                if (!existingNode) {
                    openSet.push({
                        x: neighbor.x,
                        y: neighbor.y,
                        g: g,
                        h: h,
                        f: f,
                        parent: current
                    });
                } else if (g < existingNode.g) {
                    existingNode.g = g;
                    existingNode.f = g + existingNode.h;
                    existingNode.parent = current;
                }
            }
        }
        
        return null; // Pas de chemin trouvé
    }
    
    canReachPosition(startX, startY, endX, endY) {
        // Vérifier s'il existe un chemin
        const path = this.findPath(startX, startY, endX, endY);
        return path !== null;
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
    
    if (direction === 'allieAttaque') {
        allyAttack();
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
        !game.isWall(newX, newY) && !game.isWoodenWall(newX, newY)) {
        
        // Ne pas traverser l'ennemi vivant
        if (game.enemy.alive && newX === game.enemy.x && newY === game.enemy.y) {
            alert('⚠️ L\'ennemi bloque le passage! Seul ton allié peut l\'attaquer!');
            return;
        }
        
        game.hero.x = newX;
        game.hero.y = newY;
        
        // Vérifier si on a atteint la gemme
        if (game.hero.x === game.gem.x && game.hero.y === game.gem.y) {
            if (game.enemy.alive) {
                alert('⚠️ Tu dois vaincre l\'ennemi avec ton allié avant de prendre la gemme!');
            } else {
                game.score += 300;
                document.getElementById('score').textContent = game.score;
                
                clearInterval(game.enemyAttackInterval);
                game.gameOver = true;
                
                // Sauvegarder la progression
                localStorage.setItem('codecombat_level', '6');
                localStorage.setItem('codecombat_score', game.score);
                
                // Marquer le niveau 5 comme complété
                let completed = JSON.parse(localStorage.getItem('codecombat_completed')) || [];
                if (!completed.includes(5)) {
                    completed.push(5);
                    localStorage.setItem('codecombat_completed', JSON.stringify(completed));
                }
                
                // Rediriger vers la page de victoire
                setTimeout(() => {
                    window.location.href = 'victoire.html?score=' + game.score + '&level=5';
                }, 500);
            }
        }
    }
    
    // Redessiner le jeu
    game.draw();
}

function breakWood() {
    // Chercher un mur de bois adjacent
    const directions = [
        {x: 0, y: -1}, // haut
        {x: 0, y: 1},  // bas
        {x: -1, y: 0}, // gauche
        {x: 1, y: 0}   // droite
    ];
    
    let woodBroken = false;
    
    for (let dir of directions) {
        const checkX = game.hero.x + dir.x;
        const checkY = game.hero.y + dir.y;
        
        if (game.isWoodenWall(checkX, checkY)) {
            game.breakWood(checkX, checkY);
            woodBroken = true;
            
            // Vérifier si l'allié peut se déplacer (même partiellement)
            if (!game.ally.freed) {
                // Vérifier s'il existe un chemin vers l'ennemi
                const canReachEnemy = game.canReachPosition(game.ally.x, game.ally.y, game.enemy.x, game.enemy.y);
                
                if (canReachEnemy) {
                    game.ally.freed = true;
                    game.score += 100;
                    document.getElementById('score').textContent = game.score;
                    
                    // Afficher la barre de vie de l'allié et le bouton d'attaque
                    document.getElementById('ally-health-container').style.display = 'block';
                    document.getElementById('ally-attack-btn').style.display = 'block';
                    
                    alert('🎉 Allié libéré! +100 points! Il se dirige vers l\'ennemi!');
                    
                    // Démarrer le mouvement de l'allié vers l'ennemi
                    setTimeout(() => game.moveAllyToEnemy(), 500);
                }
            }
            
            break;
        }
    }
    
    if (!woodBroken) {
        alert('⚠️ Il n\'y a pas de mur de bois à proximité! Rapproche-toi d\'un mur de bois pour le casser.');
    }
    
    game.draw();
}

function allyAttack() {
    if (!game.ally.freed || game.ally.health <= 0) {
        alert('⚠️ Ton allié n\'est pas disponible pour attaquer!');
        return;
    }
    
    if (!game.enemy.alive) {
        alert('⚠️ Il n\'y a plus d\'ennemi à attaquer!');
        return;
    }
    
    // Vérifier si l'allié est adjacent à l'ennemi
    const dx = Math.abs(game.ally.x - game.enemy.x);
    const dy = Math.abs(game.ally.y - game.enemy.y);
    
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        game.enemy.health--;
        
        if (game.enemy.health <= 0) {
            game.enemy.alive = false;
            clearInterval(game.enemyAttackInterval);
            game.score += 150;
            document.getElementById('score').textContent = game.score;
            
            // Afficher l'épée qui tranche
            const enemyX = game.enemy.x;
            const enemyY = game.enemy.y;
            game.enemy.symbol = '⚔️';
            
            game.draw();
            
            // Faire disparaître l'épée après 500ms
            setTimeout(() => {
                game.enemy.symbol = '';
                game.draw();
                alert('🎉 Ennemi vaincu par ton allié! +150 points! Va chercher la gemme!');
            }, 500);
        } else {
            game.draw();
        }
    } else {
        alert('⚠️ Ton allié est trop loin de l\'ennemi! Rapproche-le d\'abord!');
    }
}
