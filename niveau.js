// Code Combat - Niveau 1
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 50;
        this.rows = 8;
        this.cols = 12;
        
        this.score = 0;
        
        this.hero = {
            x: 1,
            y: 1,
            symbol: '🦸'
        };
        
        // Murs du niveau
        this.walls = [
            {x: 3, y: 0}, {x: 3, y: 1}, {x: 3, y: 2}, {x: 3, y: 3}, {x: 3, y: 4}, {x: 3, y: 5},
            {x: 7, y: 2}, {x: 7, y: 3}, {x: 7, y: 4}, {x: 7, y: 5}, {x: 7, y: 6}, {x: 7, y: 7},
            {x: 5, y: 2}, {x: 6, y: 2}
        ];
        
        // Gemme à atteindre
        this.gem = {
            x: 10,
            y: 1,
            symbol: '💎'
        };
        
        this.draw();
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
    console.log('Commande:', direction);
    
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
        game.hero.x = newX;
        game.hero.y = newY;
        
        // Vérifier si le héros a atteint la gemme
        if (game.hero.x === game.gem.x && game.hero.y === game.gem.y) {
            game.score += 100;
            document.getElementById('score').textContent = game.score;
            
            // Sauvegarder la progression
            localStorage.setItem('codecombat_level', '2');
            localStorage.setItem('codecombat_score', game.score);
            
            // Marquer le niveau 1 comme complété
            let completed = JSON.parse(localStorage.getItem('codecombat_completed')) || [];
            if (!completed.includes(1)) {
                completed.push(1);
                localStorage.setItem('codecombat_completed', JSON.stringify(completed));
            }
            
            // Rediriger vers la page de victoire avec le score
            setTimeout(() => {
                window.location.href = 'victoire.html?score=' + game.score + '&level=1';
            }, 500);
        }
    }
    
    // Redessiner le jeu
    game.draw();
}
