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
            freed: false
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
            {x: 7, y: 4}, {x: 7, y: 5}, {x: 7, y: 6},
            {x: 8, y: 5}, {x: 8, y: 6},
            {x: 9, y: 5}
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
            
            // Vérifier si l'allié est libéré (aucun mur de bois ne le bloque)
            const allyBlocked = game.woodenWalls.some(wall => 
                (Math.abs(wall.x - game.ally.x) <= 1 && wall.y === game.ally.y) ||
                (Math.abs(wall.y - game.ally.y) <= 1 && wall.x === game.ally.x)
            );
            
            if (!allyBlocked && !game.ally.freed) {
                game.ally.freed = true;
                game.score += 100;
                document.getElementById('score').textContent = game.score;
                alert('🎉 Allié libéré! +100 points! Tu peux maintenant aller chercher la gemme!');
            }
            
            break;
        }
    }
    
    if (!woodBroken) {
        alert('⚠️ Il n\'y a pas de mur de bois à proximité! Rapproche-toi d\'un mur de bois pour le casser.');
    }
    
    game.draw();
}
