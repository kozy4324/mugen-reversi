// Entry point for the mugen-reversi game

// 石の種類を定義
enum Player {
    EMPTY = 0,
    BLACK = 1,
    WHITE = 2
}

// ゲームの状態を管理するクラス
class ReversiGame {
    private board: Player[][];
    private currentPlayer: Player;
    private gameOver: boolean;
    
    constructor() {
        this.board = [];
        this.currentPlayer = Player.BLACK;
        this.gameOver = false;
        this.initializeBoard();
    }
    
    // 盤面の初期化
    private initializeBoard(): void {
        // 8x8の盤面を初期化
        this.board = Array(8).fill(null).map(() => Array(8).fill(Player.EMPTY));
        
        // 初期配置
        this.board[3][3] = Player.WHITE;
        this.board[3][4] = Player.BLACK;
        this.board[4][3] = Player.BLACK;
        this.board[4][4] = Player.WHITE;
    }
    
    // 有効な手があるかチェック
    private hasValidMoves(player: Player): boolean {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.isValidMove(row, col, player)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // 指定した位置に石を置けるかチェック
    private isValidMove(row: number, col: number, player: Player): boolean {
        if (this.board[row][col] !== Player.EMPTY) {
            return false;
        }
        
        // 8方向をチェック
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [dr, dc] of directions) {
            if (this.canFlipInDirection(row, col, dr, dc, player)) {
                return true;
            }
        }
        
        return false;
    }
    
    // 指定方向に石をひっくり返せるかチェック
    private canFlipInDirection(row: number, col: number, dr: number, dc: number, player: Player): boolean {
        const opponent = player === Player.BLACK ? Player.WHITE : Player.BLACK;
        let r = row + dr;
        let c = col + dc;
        let hasOpponentPiece = false;
        
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (this.board[r][c] === Player.EMPTY) {
                return false;
            } else if (this.board[r][c] === opponent) {
                hasOpponentPiece = true;
            } else if (this.board[r][c] === player) {
                return hasOpponentPiece;
            }
            
            r += dr;
            c += dc;
        }
        
        return false;
    }
    
    // 石を置く
    public makeMove(row: number, col: number): boolean {
        if (this.gameOver || !this.isValidMove(row, col, this.currentPlayer)) {
            return false;
        }
        
        // 石を置く
        this.board[row][col] = this.currentPlayer;
        
        // 石をひっくり返す
        this.flipPieces(row, col, this.currentPlayer);
        
        // ターンを交代
        this.switchPlayer();
        
        // ゲーム終了チェック
        this.checkGameOver();
        
        return true;
    }
    
    // 石をひっくり返す
    private flipPieces(row: number, col: number, player: Player): void {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [dr, dc] of directions) {
            if (this.canFlipInDirection(row, col, dr, dc, player)) {
                this.flipInDirection(row, col, dr, dc, player);
            }
        }
    }
    
    // 指定方向の石をひっくり返す
    private flipInDirection(row: number, col: number, dr: number, dc: number, player: Player): void {
        const opponent = player === Player.BLACK ? Player.WHITE : Player.BLACK;
        let r = row + dr;
        let c = col + dc;
        
        while (r >= 0 && r < 8 && c >= 0 && c < 8 && this.board[r][c] === opponent) {
            this.board[r][c] = player;
            r += dr;
            c += dc;
        }
    }
    
    // プレイヤーを交代
    private switchPlayer(): void {
        const nextPlayer = this.currentPlayer === Player.BLACK ? Player.WHITE : Player.BLACK;
        
        // 次のプレイヤーが打てる手があるかチェック
        if (this.hasValidMoves(nextPlayer)) {
            this.currentPlayer = nextPlayer;
        } else if (!this.hasValidMoves(this.currentPlayer)) {
            // 両方のプレイヤーが打てない場合、ゲーム終了
            this.gameOver = true;
        }
        // 現在のプレイヤーが続行可能な場合はそのまま
    }
    
    // ゲーム終了チェック
    private checkGameOver(): void {
        if (!this.hasValidMoves(Player.BLACK) && !this.hasValidMoves(Player.WHITE)) {
            this.gameOver = true;
        }
    }
    
    // スコアを計算
    public getScore(): { black: number; white: number } {
        let black = 0;
        let white = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === Player.BLACK) {
                    black++;
                } else if (this.board[row][col] === Player.WHITE) {
                    white++;
                }
            }
        }
        
        return { black, white };
    }
    
    // 勝者を取得
    public getWinner(): Player | null {
        if (!this.gameOver) {
            return null;
        }
        
        const score = this.getScore();
        if (score.black > score.white) {
            return Player.BLACK;
        } else if (score.white > score.black) {
            return Player.WHITE;
        } else {
            return Player.EMPTY; // 引き分け
        }
    }
    
    // 有効な手をすべて取得
    public getValidMoves(): Array<{row: number, col: number}> {
        const validMoves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.isValidMove(row, col, this.currentPlayer)) {
                    validMoves.push({ row, col });
                }
            }
        }
        return validMoves;
    }
    
    // ゲッター
    public getBoard(): Player[][] {
        return this.board;
    }
    
    public getCurrentPlayer(): Player {
        return this.currentPlayer;
    }
    
    public isGameOver(): boolean {
        return this.gameOver;
    }
    
    // ゲームリセット
    public reset(): void {
        this.gameOver = false;
        this.currentPlayer = Player.BLACK;
        this.initializeBoard();
    }
}

// UI管理クラス
class GameUI {
    private game: ReversiGame;
    private boardElement!: HTMLElement;
    private blackScoreElement!: HTMLElement;
    private whiteScoreElement!: HTMLElement;
    private currentPlayerElement!: HTMLElement;
    private gameOverElement!: HTMLElement;
    private winnerElement!: HTMLElement;
    private restartButton!: HTMLElement;
    
    constructor() {
        this.game = new ReversiGame();
        this.initializeElements();
        this.setupEventListeners();
    }
    
    private initializeElements(): void {
        this.boardElement = document.getElementById('game-board')!;
        this.blackScoreElement = document.getElementById('black-score')!;
        this.whiteScoreElement = document.getElementById('white-score')!;
        this.currentPlayerElement = document.getElementById('current-player-color')!;
        this.gameOverElement = document.getElementById('game-over')!;
        this.winnerElement = document.getElementById('winner')!;
        this.restartButton = document.getElementById('restart-btn')!;
    }
    
    private setupEventListeners(): void {
        this.restartButton.addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    public start(): void {
        this.renderBoard();
        this.updateUI();
    }
    
    private renderBoard(): void {
        this.boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row.toString();
                cell.dataset.col = col.toString();
                
                cell.addEventListener('click', () => {
                    this.handleCellClick(row, col);
                });
                
                this.boardElement.appendChild(cell);
            }
        }
        
        this.updateBoardDisplay();
    }
    
    private updateBoardDisplay(): void {
        const board = this.game.getBoard();
        const validMoves = this.game.getValidMoves();
        const cells = this.boardElement.querySelectorAll('.cell');
        
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const piece = board[row][col];
            
            // 既存のpiece要素を削除
            const existingPiece = cell.querySelector('.piece');
            if (existingPiece) {
                existingPiece.remove();
            }
            
            // 石がある場合は表示
            if (piece !== Player.EMPTY) {
                const pieceElement = document.createElement('div');
                pieceElement.className = `piece ${piece === Player.BLACK ? 'black' : 'white'}`;
                cell.appendChild(pieceElement);
            }
            
            // 有効な手をハイライト
            const isValidMove = validMoves.some(move => move.row === row && move.col === col);
            cell.classList.toggle('valid-move', isValidMove);
        });
    }
    
    private handleCellClick(row: number, col: number): void {
        if (this.game.makeMove(row, col)) {
            this.updateBoardDisplay();
            this.updateUI();
            
            if (this.game.isGameOver()) {
                this.showGameOver();
            }
        }
    }
    
    private updateUI(): void {
        const score = this.game.getScore();
        this.blackScoreElement.textContent = score.black.toString();
        this.whiteScoreElement.textContent = score.white.toString();
        
        const currentPlayer = this.game.getCurrentPlayer();
        this.currentPlayerElement.textContent = currentPlayer === Player.BLACK ? '黒' : '白';
    }
    
    private showGameOver(): void {
        const winner = this.game.getWinner();
        let winnerText = '';
        
        if (winner === Player.BLACK) {
            winnerText = '黒の勝利！';
        } else if (winner === Player.WHITE) {
            winnerText = '白の勝利！';
        } else {
            winnerText = '引き分け！';
        }
        
        this.winnerElement.textContent = winnerText;
        this.gameOverElement.classList.remove('hidden');
    }
    
    private restartGame(): void {
        this.game.reset();
        this.gameOverElement.classList.add('hidden');
        this.renderBoard();
        this.updateUI();
    }
}

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    console.log('mugen-reversi initialized');
    const gameUI = new GameUI();
    gameUI.start();
});
