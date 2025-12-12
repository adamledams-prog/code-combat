// Code Combat - Jeu d'apprentissage de la programmation
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 50;
        this.rows = 8;
        this.cols = 12;
        
        this.level = 1;
        this.score = 0;
        
        this.hero = {
            x: 1,
            y: 1,
            color: '#3b82f6',
            symbol: '🦸'
        };
        
        this.enemy = {
            x: 10,
            y: 6,
            color: '#ef4444',
            symbol: '👾',
            alive: true
        };
        
        this.goal = {
            x: 10,
            y: 6,
            symbol: '🏆'
        };
        
        this.commands = [];
        this.isRunning = false;
        
        this.setupEventListeners();
        this.draw();
    }
    
    setupEventListeners() {
        document.getElementById('run-code').addEventListener('click', () => this.runCode());
        document.getElementById('reset').addEventListener('click', () => this.reset());
    }
    
    draw() {
        // Effacer le canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessiner la grille
        this.drawGrid();
        
        // Dessiner l'ennemi (si vivant)
        if (this.enemy.alive) {
            this.drawCharacter(this.enemy.x, this.enemy.y, this.enemy.symbol);
        } else {
            this.drawCharacter(this.goal.x, this.goal.y, this.goal.symbol);
        }
        
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
    
    async runCode() {
        if (this.isRunning) return;
        
        const code = document.getElementById('code-editor').value;
        const output = document.getElementById('output');
        
        output.textContent = '⏳ Exécution en cours...';
        output.className = 'output';
        
        this.isRunning = true;
        this.commands = [];
        
        // Créer un objet hero avec les méthodes disponibles
        const hero = {
            moveRight: () => this.commands.push('moveRight'),
            moveLeft: () => this.commands.push('moveLeft'),
            moveUp: () => this.commands.push('moveUp'),
            moveDown: () => this.commands.push('moveDown'),
            attack: () => this.commands.push('attack')
        };
        
        try {
            // Exécuter le code de l'utilisateur
            eval(code);
            
            // Exécuter les commandes une par une
            for (let command of this.commands) {
                await this.executeCommand(command);
                await this.sleep(500);
            }
            
            // Vérifier si la mission est accomplie
            this.checkWinCondition(output);
            
        } catch (error) {
            output.textContent = '❌ Erreur: ' + error.message;
            output.className = 'output error';
        }
        
        this.isRunning = false;
    }
    
    async executeCommand(command) {
        const oldX = this.hero.x;
        const oldY = this.hero.y;
        
        switch(command) {
            case 'moveRight':
                if (this.hero.x < this.cols - 1) this.hero.x++;
                break;
            case 'moveLeft':
                if (this.hero.x > 0) this.hero.x--;
                break;
            case 'moveUp':
                if (this.hero.y > 0) this.hero.y--;
                break;
            case 'moveDown':
                if (this.hero.y < this.rows - 1) this.hero.y++;
                break;
            case 'attack':
                this.performAttack();
                break;
        }
        
        this.draw();
    }
    
    performAttack() {
        // Vérifier si l'ennemi est adjacent au héros
        const dx = Math.abs(this.hero.x - this.enemy.x);
        const dy = Math.abs(this.hero.y - this.enemy.y);
        
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            this.enemy.alive = false;
            this.score += 100;
            document.getElementById('score').textContent = this.score;
        }
    }
    
    checkWinCondition(output) {
        if (!this.enemy.alive && this.hero.x === this.goal.x && this.hero.y === this.goal.y) {
            output.textContent = '🎉 Félicitations! Mission accomplie! Tu as vaincu l\'ennemi!';
            output.className = 'output success';
            this.level++;
            document.getElementById('current-level').textContent = this.level;
        } else if (!this.enemy.alive) {
            output.textContent = '⚠️ Ennemi vaincu! Maintenant, va jusqu\'au trésor!';
            output.className = 'output';
        } else if (this.hero.x === this.enemy.x && this.hero.y === this.enemy.y) {
            output.textContent = '⚠️ Tu es à côté de l\'ennemi! Utilise hero.attack() pour l\'attaquer!';
            output.className = 'output';
        } else {
            output.textContent = '❌ Mission incomplète. Rapproche-toi de l\'ennemi et attaque-le!';
            output.className = 'output error';
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    reset() {
        this.hero.x = 1;
        this.hero.y = 1;
        this.enemy.alive = true;
        this.commands = [];
        document.getElementById('output').textContent = '';
        document.getElementById('output').className = 'output';
        this.draw();
    }
}

// Initialiser le jeu quand la page est chargée
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new Game();
});
