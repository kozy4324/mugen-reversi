"use strict";
// Entry point for the mugen-reversi game
// 石の種類を定義
var Player;
(function (Player) {
    Player[Player["EMPTY"] = 0] = "EMPTY";
    Player[Player["BLACK"] = 1] = "BLACK";
    Player[Player["WHITE"] = 2] = "WHITE";
})(Player || (Player = {}));
// ゲームの状態を管理するクラス
class ReversiGame {
    constructor() {
        this.board = [];
        this.currentPlayer = Player.BLACK;
        this.gameOver = false;
        this.initializeBoard();
    }
    // 盤面の初期化
    initializeBoard() {
        // 8x8の盤面を初期化
        this.board = Array(8).fill(null).map(() => Array(8).fill(Player.EMPTY));
        // 初期配置
        this.board[3][3] = Player.WHITE;
        this.board[3][4] = Player.BLACK;
        this.board[4][3] = Player.BLACK;
        this.board[4][4] = Player.WHITE;
    }
    // 有効な手があるかチェック
    hasValidMoves(player) {
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
    isValidMove(row, col, player) {
        if (this.board[row][col] !== Player.EMPTY) {
            return false;
        }
        // 8方向をチェック
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        for (const [dr, dc] of directions) {
            if (this.canFlipInDirection(row, col, dr, dc, player)) {
                return true;
            }
        }
        return false;
    }
    // 指定方向に石をひっくり返せるかチェック
    canFlipInDirection(row, col, dr, dc, player) {
        const opponent = player === Player.BLACK ? Player.WHITE : Player.BLACK;
        let r = row + dr;
        let c = col + dc;
        let hasOpponentPiece = false;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (this.board[r][c] === Player.EMPTY) {
                return false;
            }
            else if (this.board[r][c] === opponent) {
                hasOpponentPiece = true;
            }
            else if (this.board[r][c] === player) {
                return hasOpponentPiece;
            }
            r += dr;
            c += dc;
        }
        return false;
    }
    // 石を置く
    makeMove(row, col) {
        if (this.gameOver || !this.isValidMove(row, col, this.currentPlayer)) {
            return false;
        }
        // 石を置く
        this.board[row][col] = this.currentPlayer;
        // 石をひっくり返す
        const flippedPieces = this.flipPieces(row, col, this.currentPlayer);
        // ターンを交代
        this.switchPlayer();
        // ゲーム終了チェック
        this.checkGameOver();
        return flippedPieces;
    }
    // 石をひっくり返す
    flipPieces(row, col, player) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        const flippedPieces = [];
        for (const [dr, dc] of directions) {
            if (this.canFlipInDirection(row, col, dr, dc, player)) {
                const flipped = this.flipInDirection(row, col, dr, dc, player);
                flippedPieces.push(...flipped);
            }
        }
        return flippedPieces;
    }
    // 指定方向の石をひっくり返す
    flipInDirection(row, col, dr, dc, player) {
        const opponent = player === Player.BLACK ? Player.WHITE : Player.BLACK;
        let r = row + dr;
        let c = col + dc;
        const flippedPieces = [];
        while (r >= 0 && r < 8 && c >= 0 && c < 8 && this.board[r][c] === opponent) {
            this.board[r][c] = player;
            flippedPieces.push({ row: r, col: c });
            r += dr;
            c += dc;
        }
        return flippedPieces;
    }
    // プレイヤーを交代
    switchPlayer() {
        const nextPlayer = this.currentPlayer === Player.BLACK ? Player.WHITE : Player.BLACK;
        // 次のプレイヤーが打てる手があるかチェック
        if (this.hasValidMoves(nextPlayer)) {
            this.currentPlayer = nextPlayer;
        }
        else if (!this.hasValidMoves(this.currentPlayer)) {
            // 両方のプレイヤーが打てない場合、ゲーム終了
            this.gameOver = true;
        }
        // 現在のプレイヤーが続行可能な場合はそのまま
    }
    // ゲーム終了チェック
    checkGameOver() {
        if (!this.hasValidMoves(Player.BLACK) && !this.hasValidMoves(Player.WHITE)) {
            this.gameOver = true;
        }
    }
    // スコアを計算
    getScore() {
        let black = 0;
        let white = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === Player.BLACK) {
                    black++;
                }
                else if (this.board[row][col] === Player.WHITE) {
                    white++;
                }
            }
        }
        return { black, white };
    }
    // 勝者を取得
    getWinner() {
        if (!this.gameOver) {
            return null;
        }
        const score = this.getScore();
        if (score.black > score.white) {
            return Player.BLACK;
        }
        else if (score.white > score.black) {
            return Player.WHITE;
        }
        else {
            return Player.EMPTY; // 引き分け
        }
    }
    // 有効な手をすべて取得
    getValidMoves() {
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
    getBoard() {
        return this.board;
    }
    getCurrentPlayer() {
        return this.currentPlayer;
    }
    isGameOver() {
        return this.gameOver;
    }
    // ゲームリセット
    reset() {
        this.gameOver = false;
        this.currentPlayer = Player.BLACK;
        this.initializeBoard();
    }
}
// UI管理クラス
class GameUI {
    constructor() {
        this.game = new ReversiGame();
        this.initializeElements();
        this.setupEventListeners();
    }
    initializeElements() {
        this.boardElement = document.getElementById('game-board');
        this.blackScoreElement = document.getElementById('black-score');
        this.whiteScoreElement = document.getElementById('white-score');
        this.currentPlayerElement = document.getElementById('current-player-color');
        this.gameOverElement = document.getElementById('game-over');
        this.winnerElement = document.getElementById('winner');
        this.restartButton = document.getElementById('restart-btn');
    }
    setupEventListeners() {
        this.restartButton.addEventListener('click', () => {
            this.restartGame();
        });
    }
    start() {
        this.renderBoard();
        this.updateUI();
    }
    renderBoard() {
        this.boardElement.innerHTML = '';
        // 動的にグリッドサイズを設定
        const boardSize = 8; // 現在は8x8固定だが、将来的に動的に変更可能
        this.boardElement.style.gridTemplateColumns = `repeat(${boardSize}, minmax(0, 1fr))`;
        this.boardElement.style.gridTemplateRows = `repeat(${boardSize}, minmax(0, 1fr))`;
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'bg-green-600 border border-green-700 rounded cursor-pointer flex items-center justify-center transition-colors duration-200 ease-in-out hover:bg-green-500';
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
    updateBoardDisplay(flippedPieces = []) {
        const board = this.game.getBoard();
        const validMoves = this.game.getValidMoves();
        const cells = this.boardElement.children;
        Array.from(cells).forEach((cell, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const piece = board[row][col];
            // 既存のpiece要素を削除
            const existingPiece = cell.querySelector('div');
            if (existingPiece) {
                existingPiece.remove();
            }
            // 石がある場合は表示
            if (piece !== Player.EMPTY) {
                const pieceElement = document.createElement('div');
                const baseClasses = 'w-4/5 h-4/5 rounded-full transition-all duration-300 ease-in-out shadow-md';
                const colorClasses = piece === Player.BLACK
                    ? 'bg-gray-800 border-2 border-gray-600'
                    : 'bg-gray-50 border-2 border-gray-300';
                pieceElement.className = `${baseClasses} ${colorClasses}`;
                cell.appendChild(pieceElement);
                // ひっくり返った石にアニメーションを適用
                const wasFlipped = flippedPieces.some(flipped => flipped.row === row && flipped.col === col);
                if (wasFlipped) {
                    this.applyFlipAnimation(pieceElement);
                }
            }
            // 有効な手をハイライト
            const isValidMove = validMoves.some(move => move.row === row && move.col === col);
            const cellElement = cell;
            if (isValidMove) {
                cellElement.classList.add('bg-lime-500', 'valid-move-highlight');
                cellElement.classList.remove('bg-green-600', 'hover:bg-green-500');
            }
            else {
                cellElement.classList.remove('bg-lime-500', 'valid-move-highlight');
                cellElement.classList.add('bg-green-600', 'hover:bg-green-500');
            }
        });
    }
    // 石にフリップアニメーションを適用
    applyFlipAnimation(pieceElement) {
        pieceElement.classList.add('piece-flip');
        // アニメーション終了後にクラスを削除
        setTimeout(() => {
            pieceElement.classList.remove('piece-flip');
        }, 600);
    }
    handleCellClick(row, col) {
        const flippedPieces = this.game.makeMove(row, col);
        if (flippedPieces !== false) {
            this.updateBoardDisplay(flippedPieces);
            this.updateUI();
            if (this.game.isGameOver()) {
                this.showGameOver();
            }
        }
    }
    updateUI() {
        const score = this.game.getScore();
        this.blackScoreElement.textContent = score.black.toString();
        this.whiteScoreElement.textContent = score.white.toString();
        const currentPlayer = this.game.getCurrentPlayer();
        this.currentPlayerElement.textContent = currentPlayer === Player.BLACK ? '黒' : '白';
    }
    showGameOver() {
        const winner = this.game.getWinner();
        let winnerText = '';
        if (winner === Player.BLACK) {
            winnerText = '黒の勝利！';
        }
        else if (winner === Player.WHITE) {
            winnerText = '白の勝利！';
        }
        else {
            winnerText = '引き分け！';
        }
        this.winnerElement.textContent = winnerText;
        this.gameOverElement.classList.remove('hidden');
    }
    restartGame() {
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
