// Code Combat - Niveau 4
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
            symbol: '🦸'
        };
        
        // Allié bloqué derrière les murs de bois en bas
        this.ally = {
            x: 9,
            y: 6,
            symbol: '👨',
            freed: false,
            moving: false,
            targetX: null,
            targetY: null
        };
        
        // Murs en pierre (indestructibles)
        this.walls = [
            // Cadre extérieur
            {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}, {x: 11, y: 0},
            {x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}, {x: 0, y: 4}, {x: 0, y: 5}, {x: 0, y: 6}, {x: 0, y: 7},
            {x: 11, y: 1}, {x: 11, y: 2}, {x: 11, y: 3}, {x: 11, y: 4}, {x: 11, y: 5}, {x: 11, y: 6}, {x: 11, y: 7},
            {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}, {x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7},
            
            // Mur horizontal qui bloque le passage vers la gemme
            {x: 5, y: 3}, {x: 6, y: 3}, {x: 7, y: 3}, {x: 8, y: 3}, {x: 9, y: 3}, {x: 10, y: 3},
            
            // Quelques obstacles
            {x: 3, y: 1}, {x: 3, y: 2}
        ];
        
        // Murs de bois (destructibles) - bloquent l'allié en bas
        this.woodenWalls = [
            // Mur autour de l'allié
            {x: 8, y: 4},
            {x: 6, y: 5}, {x: 7, y: 5}, {x: 8, y: 5}, {x: 9, y: 5}, {x: 10, y: 5},
            {x: 6, y: 6}, {x: 7, y: 6}, {x: 8, y: 6}, {x: 10, y: 6}
        ];
        
        // Gemme à atteindre - en haut à droite
        this.gem = {
            x: 10,
            y: 1,
            symbol: '💎'
        };
        
        this.gameOver = false;
        
        this.draw();
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
        
        // Dessiner l'allié
        this.drawCharacter(this.ally.x, this.ally.y, this.ally.symbol);
        
        // Dessiner le héros
        this.drawCharacter(this.hero.x, this.hero.y, this.hero.symbol);
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
    
    canAllyReachGem() {
        // Vérifier s'il existe un chemin de l'allié vers la gemme
        const visited = new Set();
        const queue = [{x: this.ally.x, y: this.ally.y}];
        
        while (queue.length > 0) {
            const pos = queue.shift();
            const key = `${pos.x},${pos.y}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            // Si on a atteint la gemme
            if (pos.x === this.gem.x && pos.y === this.gem.y) {
                return true;
            }
            
            // Vérifier les 4 directions
            const directions = [
                {x: pos.x + 1, y: pos.y},
                {x: pos.x - 1, y: pos.y},
                {x: pos.x, y: pos.y + 1},
                {x: pos.x, y: pos.y - 1}
            ];
            
            for (let dir of directions) {
                if (dir.x >= 0 && dir.x < this.cols && 
                    dir.y >= 0 && dir.y < this.rows &&
                    !this.isWall(dir.x, dir.y) && 
                    !this.isWoodenWall(dir.x, dir.y) &&
                    !visited.has(`${dir.x},${dir.y}`)) {
                    queue.push(dir);
                }
            }
        }
        
        return false;
    }
    
    moveAllyToGem() {
        if (!this.ally.moving || (this.ally.x === this.gem.x && this.ally.y === this.gem.y)) {
            return;
        }
        
        // Utiliser A* pour trouver le meilleur chemin
        const path = this.findPath(this.ally.x, this.ally.y, this.gem.x, this.gem.y);
        
        if (path && path.length > 1) {
            // Le premier élément est la position actuelle, le deuxième est la prochaine étape
            this.ally.x = path[1].x;
            this.ally.y = path[1].y;
        }
        
        this.draw();
        
        // Continuer le mouvement
        if (this.ally.x !== this.gem.x || this.ally.y !== this.gem.y) {
            setTimeout(() => this.moveAllyToGem(), 300);
        } else {
            // L'allié a atteint la gemme
            this.ally.moving = false;
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
            
            // Si on a atteint la destination
            if (current.x === endX && current.y === endY) {
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
        
        game.hero.x = newX;
        game.hero.y = newY;
        
        // Vérifier si on a atteint la gemme
        if (game.hero.x === game.gem.x && game.hero.y === game.gem.y) {
            if (!game.ally.freed) {
                alert('⚠️ Tu dois d\'abord libérer ton allié en cassant les murs de bois en bas!');
            } else {
                game.score += 250;
                document.getElementById('score').textContent = game.score;
                
                game.gameOver = true;
                
                // Sauvegarder la progression
                localStorage.setItem('codecombat_level', '5');
                localStorage.setItem('codecombat_score', game.score);
                
                // Marquer le niveau 4 comme complété
                let completed = JSON.parse(localStorage.getItem('codecombat_completed')) || [];
                if (!completed.includes(4)) {
                    completed.push(4);
                    localStorage.setItem('codecombat_completed', JSON.stringify(completed));
                }
                
                // Rediriger vers la page de victoire
                setTimeout(() => {
                    window.location.href = 'victoire.html?score=' + game.score + '&level=4';
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
            
            // Vérifier si l'allié peut atteindre la sortie
            const canReachGem = game.canAllyReachGem();
            
            if (canReachGem && !game.ally.freed) {
                game.ally.freed = true;
                game.ally.moving = true;
                game.score += 100;
                document.getElementById('score').textContent = game.score;
                alert('🎉 Allié libéré! +100 points! Il se dirige vers la gemme!');
                
                // Démarrer le mouvement de l'allié
                setTimeout(() => game.moveAllyToGem(), 500);
            } else if (!canReachGem && !game.ally.freed) {
                // L'allié n'est pas encore libre de sortir
                console.log('L\'allié ne peut pas encore atteindre la gemme');
            }
            
            break;
        }
    }
    
    if (!woodBroken) {
        alert('⚠️ Il n\'y a pas de mur de bois à proximité! Rapproche-toi d\'un mur de bois pour le casser.');
    }
    
    game.draw();
}
