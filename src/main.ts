// Entry point for the mugen-reversi game

import { NPCManager } from './strategies/NPCManager.js';
import { Player } from './strategies/base/NPCStrategy.js';

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
    public makeMove(row: number, col: number): Array<{row: number, col: number}> | false {
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
    private flipPieces(row: number, col: number, player: Player): Array<{row: number, col: number}> {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        const flippedPieces: Array<{row: number, col: number}> = [];
        
        for (const [dr, dc] of directions) {
            if (this.canFlipInDirection(row, col, dr, dc, player)) {
                const flipped = this.flipInDirection(row, col, dr, dc, player);
                flippedPieces.push(...flipped);
            }
        }
        
        return flippedPieces;
    }
    
    // 指定方向の石をひっくり返す
    private flipInDirection(row: number, col: number, dr: number, dc: number, player: Player): Array<{row: number, col: number}> {
        const opponent = player === Player.BLACK ? Player.WHITE : Player.BLACK;
        let r = row + dr;
        let c = col + dc;
        const flippedPieces: Array<{row: number, col: number}> = [];
        
        while (r >= 0 && r < 8 && c >= 0 && c < 8 && this.board[r][c] === opponent) {
            this.board[r][c] = player;
            flippedPieces.push({row: r, col: c});
            r += dr;
            c += dc;
        }
        
        return flippedPieces;
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
    private npcManager: NPCManager;
    private isNPCEnabled: boolean;
    private isNPCTurn: boolean;
    private boardElement!: HTMLElement;
    private blackScoreElement!: HTMLElement;
    private whiteScoreElement!: HTMLElement;
    private currentPlayerElement!: HTMLElement;
    private gameOverElement!: HTMLElement;
    private winnerElement!: HTMLElement;
    private restartButton!: HTMLElement;
    
    constructor() {
        this.game = new ReversiGame();
        this.npcManager = new NPCManager();
        this.isNPCEnabled = true; // デフォルトでNPCを有効にする
        this.isNPCTurn = false;
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
        this.updateNPCTurnState();
        this.updateUI();
        
        // ゲーム開始時にNPCの情報を表示
        if (this.isNPCEnabled) {
            const npcInfo = this.npcManager.getCurrentStrategyInfo();
            console.log(`NPC戦略: ${npcInfo.name} (${npcInfo.difficulty}) - ${npcInfo.description}`);
        }
    }
     private renderBoard(): void {
        this.boardElement.innerHTML = '';
        
        // 動的にグリッドサイズを設定
        const boardSize = 8; // 現在は8x8固定だが、将来的に動的に変更可能
        this.boardElement.style.gridTemplateColumns = `repeat(${boardSize}, minmax(0, 1fr))`;
        this.boardElement.style.gridTemplateRows = `repeat(${boardSize}, minmax(0, 1fr))`;
        
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'bg-green-600 border border-green-700 rounded flex items-center justify-center transition-colors duration-200 ease-in-out';
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
    
    private updateBoardDisplay(flippedPieces: Array<{row: number, col: number}> = [], newPiecePosition?: {row: number, col: number}, isNPCMove: boolean = false, preMoveBoard?: Player[][], onAnimationComplete?: () => void): void {
        const board = this.game.getBoard();
        const validMoves = this.game.getValidMoves();
        const cells = this.boardElement.children;
        
        // フリップされる石の位置を記録（アニメーション前の色を保持するため）
        const flippedPositions = new Set(flippedPieces.map(p => `${p.row},${p.col}`));
        
        Array.from(cells).forEach((cell, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const piece = board[row][col];
            const positionKey = `${row},${col}`;
            
            // 既存のpiece要素を削除
            const existingPiece = cell.querySelector('div');
            if (existingPiece) {
                existingPiece.remove();
            }
            
            // 石がある場合は表示
            if (piece !== Player.EMPTY) {
                const pieceElement = document.createElement('div');
                const baseClasses = 'w-4/5 h-4/5 rounded-full transition-all duration-300 ease-in-out shadow-md';
                
                // フリップされる石の場合は、フリップ前の色（preMoveBoard の情報を使用）を表示
                let colorClasses;
                if (flippedPositions.has(positionKey) && preMoveBoard) {
                    // フリップされる石は元の色（preMoveBoard の情報）で表示
                    const originalPiece = preMoveBoard[row][col];
                    colorClasses = originalPiece === Player.BLACK 
                        ? 'bg-gray-800 border-2 border-gray-600' 
                        : 'bg-gray-50 border-2 border-gray-300';
                } else {
                    // 通常の石は現在の色で表示
                    colorClasses = piece === Player.BLACK 
                        ? 'bg-gray-800 border-2 border-gray-600' 
                        : 'bg-gray-50 border-2 border-gray-300';
                }
                
                pieceElement.className = `${baseClasses} ${colorClasses}`;
                cell.appendChild(pieceElement);
            }
            
            // NPCのターンでない場合のみ有効な手をハイライト
            const isValidMove = !this.isNPCTurn && validMoves.some(move => move.row === row && move.col === col);
            const cellElement = cell as HTMLElement;
            if (isValidMove) {
                cellElement.classList.add('bg-lime-500', 'valid-move-highlight');
                cellElement.classList.remove('bg-green-600', 'hover:bg-green-500', 'cursor-not-allowed');
                cellElement.classList.add('cursor-pointer');
            } else {
                cellElement.classList.remove('bg-lime-500', 'valid-move-highlight');
                cellElement.classList.add('bg-green-600');
                // NPCのターン時はhoverエフェクトも無効化し、カーソルを変更
                if (!this.isNPCTurn) {
                    cellElement.classList.add('hover:bg-green-500', 'cursor-pointer');
                    cellElement.classList.remove('cursor-not-allowed');
                } else {
                    cellElement.classList.remove('hover:bg-green-500', 'cursor-pointer');
                    cellElement.classList.add('cursor-not-allowed');
                }
            }
        });
        
        // 新しく置かれた石にアニメーションを適用（DOM更新後に実行）
        if (newPiecePosition) {
            const cellIndex = newPiecePosition.row * 8 + newPiecePosition.col;
            const targetCell = cells[cellIndex] as HTMLElement;
            const pieceElement = targetCell.querySelector('div') as HTMLElement;
            
            if (pieceElement) {
                // 次のフレームでアニメーションを適用
                requestAnimationFrame(() => {
                    console.log(`Applying animation to piece at (${newPiecePosition.row}, ${newPiecePosition.col}), isNPC: ${isNPCMove}`);
                    if (isNPCMove) {
                        this.applyNPCPlaceAnimation(pieceElement, targetCell, () => {
                            // NPC配置アニメーション完了後にフリップアニメーションを適用
                            this.applyFlipAnimationsToMultiplePieces(flippedPieces, cells, onAnimationComplete);
                        });
                    } else {
                        this.applyPlaceAnimation(pieceElement, () => {
                            // プレイヤー配置アニメーション完了後にフリップアニメーションを適用
                            this.applyFlipAnimationsToMultiplePieces(flippedPieces, cells, onAnimationComplete);
                        });
                    }
                });
            }
        } else if (flippedPieces.length > 0) {
            // 新しく置かれた石がない場合（初期表示など）は即座にフリップアニメーションを適用
            this.applyFlipAnimationsToMultiplePieces(flippedPieces, cells, onAnimationComplete);
        } else if (onAnimationComplete) {
            // フリップもない場合は即座にコールバックを実行
            onAnimationComplete();
        }
    }
    
    // 複数の石にフリップアニメーションを適用
    private applyFlipAnimationsToMultiplePieces(flippedPieces: Array<{row: number, col: number}>, cells: HTMLCollection, onAllComplete?: () => void): void {
        const board = this.game.getBoard();
        
        if (flippedPieces.length === 0) {
            // フリップする石がない場合は即座にコールバックを実行
            if (onAllComplete) {
                onAllComplete();
            }
            return;
        }
        
        let completedCount = 0;
        
        flippedPieces.forEach((flipped, index) => {
            const cellIndex = flipped.row * 8 + flipped.col;
            const cell = cells[cellIndex] as HTMLElement;
            const pieceElement = cell.querySelector('div') as HTMLElement;
            
            if (pieceElement) {
                // 少しずつ遅延させて自然な順序でフリップ
                setTimeout(() => {
                    // フリップ後の色（現在のboard状態）を取得
                    const newPiece = board[flipped.row][flipped.col];
                    const newColorClasses = newPiece === Player.BLACK 
                        ? 'bg-gray-800 border-2 border-gray-600' 
                        : 'bg-gray-50 border-2 border-gray-300';
                    
                    this.applyFlipAnimation(pieceElement, newColorClasses, () => {
                        completedCount++;
                        // 全てのフリップアニメーションが完了したらコールバックを実行
                        if (completedCount === flippedPieces.length && onAllComplete) {
                            onAllComplete();
                        }
                    });
                }, index * 50); // 50msずつ遅延
            } else {
                completedCount++;
                // 要素が見つからない場合もカウントを進める
                if (completedCount === flippedPieces.length && onAllComplete) {
                    onAllComplete();
                }
            }
        });
    }
    
    // 石にフリップアニメーションを適用
    private applyFlipAnimation(pieceElement: HTMLElement, newColorClasses?: string, onComplete?: () => void): void {
        if (newColorClasses) {
            // フリップアニメーション中に色を変更する場合
            console.log('Starting flip animation with color change:', {
                currentClasses: pieceElement.className,
                newColorClasses: newColorClasses
            });
            
            pieceElement.classList.add('piece-flip');
            
            // アニメーションの正確な中間点（300ms、90度回転の瞬間）で色を変更
            // ease-in-outの場合、実際の90度回転は約300msで発生する
            setTimeout(() => {
                console.log('Changing color during flip animation at 300ms');
                // 既存の色クラスを削除
                pieceElement.classList.remove('bg-gray-800', 'border-gray-600', 'bg-gray-50', 'border-gray-300');
                // 新しい色クラスを適用
                const colorClassArray = newColorClasses.split(' ');
                pieceElement.classList.add(...colorClassArray);
            }, 300); // 600msアニメーションの50%時点（300ms）
            
            // アニメーション終了後にクラスを削除
            setTimeout(() => {
                console.log('Flip animation completed');
                pieceElement.classList.remove('piece-flip');
                if (onComplete) {
                    onComplete();
                }
            }, 600);
        } else {
            // 通常のフリップアニメーション（色変更なし）
            pieceElement.classList.add('piece-flip');
            setTimeout(() => {
                pieceElement.classList.remove('piece-flip');
                if (onComplete) {
                    onComplete();
                }
            }, 600);
        }
    }

    // 石の配置アニメーションを適用（プレイヤー用）
    private applyPlaceAnimation(pieceElement: HTMLElement, onComplete?: () => void): void {
        console.log('Applying player place animation');
        
        // Web Animations APIを使用してアニメーションを確実に実行
        const animation = pieceElement.animate([
            { 
                transform: 'scale(0) rotate(180deg)', 
                opacity: '0' 
            },
            { 
                transform: 'scale(1.3) rotate(90deg)', 
                opacity: '0.8',
                offset: 0.5
            },
            { 
                transform: 'scale(1) rotate(0deg)', 
                opacity: '1' 
            }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            fill: 'both'
        });
        
        animation.onfinish = () => {
            console.log('Player animation finished');
            if (onComplete) {
                onComplete();
            }
        };
    }

    // 石の配置アニメーションを適用（NPC用）
    private applyNPCPlaceAnimation(pieceElement: HTMLElement, cellElement: HTMLElement, onComplete?: () => void): void {
        console.log('Applying NPC place animation');
        
        // 石のアニメーション
        const pieceAnimation = pieceElement.animate([
            { 
                transform: 'scale(0) rotate(-180deg)', 
                opacity: '0',
                boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)'
            },
            { 
                transform: 'scale(1.5) rotate(-90deg)', 
                opacity: '0.9',
                boxShadow: '0 0 20px 10px rgba(59, 130, 246, 0.4)',
                offset: 0.3
            },
            { 
                transform: 'scale(1.1) rotate(-20deg)', 
                opacity: '1',
                boxShadow: '0 0 15px 5px rgba(59, 130, 246, 0.3)',
                offset: 0.6
            },
            { 
                transform: 'scale(1) rotate(0deg)', 
                opacity: '1',
                boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)'
            }
        ], {
            duration: 1000,
            easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            fill: 'both'
        });
        
        // セルのハイライトアニメーション
        const cellAnimation = cellElement.animate([
            { 
                boxShadow: 'inset 0 0 0 0 rgba(59, 130, 246, 0)',
                backgroundColor: 'rgb(22, 163, 74)'
            },
            { 
                boxShadow: 'inset 0 0 30px 10px rgba(59, 130, 246, 0.6)',
                backgroundColor: 'rgb(59, 130, 246)',
                offset: 0.5
            },
            { 
                boxShadow: 'inset 0 0 0 0 rgba(59, 130, 246, 0)',
                backgroundColor: 'rgb(22, 163, 74)'
            }
        ], {
            duration: 1200,
            easing: 'ease-out',
            fill: 'both'
        });
        
        pieceAnimation.onfinish = () => {
            console.log('NPC piece animation finished');
            if (onComplete) {
                onComplete();
            }
        };
        
        cellAnimation.onfinish = () => {
            console.log('NPC cell animation finished');
        };
    }

    private handleCellClick(row: number, col: number): void {
        // NPCのターン時はユーザー入力を受け付けない
        if (this.isNPCTurn) {
            return;
        }
        
        // makeMove前の盤面状態を保存
        const preMoveBoard = this.game.getBoard().map(row => [...row]);
        
        const flippedPieces = this.game.makeMove(row, col);
        if (flippedPieces !== false) {
            this.updateNPCTurnState();
            
            // アニメーション完了後にNPCの手を実行するコールバック
            const onAnimationComplete = () => {
                if (this.game.isGameOver()) {
                    this.showGameOver();
                } else if (this.isNPCEnabled && this.game.getCurrentPlayer() === Player.WHITE) {
                    // プレイヤーのアニメーション完了後、少し間を置いてからNPCの手を実行
                    setTimeout(() => {
                        this.makeNPCMove();
                    }, 300);
                }
            };
            
            this.updateBoardDisplay(flippedPieces, {row, col}, false, preMoveBoard, onAnimationComplete);
            this.updateUI();
        }
    }

    /**
     * NPCの手を実行
     */
    private makeNPCMove(): void {
        if (this.game.isGameOver() || this.game.getCurrentPlayer() !== Player.WHITE) {
            return;
        }

        // NPCターン開始
        this.isNPCTurn = true;
        this.updateBoardDisplay(); // ユーザー入力無効化の表示更新

        try {
            const validMoves = this.game.getValidMoves();
            if (validMoves.length === 0) {
                return;
            }

            const npcMove = this.npcManager.makeMove(
                this.game.getBoard(), 
                validMoves, 
                this.game.getCurrentPlayer()
            );

            // makeMove前の盤面状態を保存
            const preMoveBoard = this.game.getBoard().map(row => [...row]);

            const flippedPieces = this.game.makeMove(npcMove.row, npcMove.col);
            if (flippedPieces !== false) {
                this.updateNPCTurnState();
                this.updateBoardDisplay(flippedPieces, {row: npcMove.row, col: npcMove.col}, true, preMoveBoard);
                this.updateUI();
                
                if (this.game.isGameOver()) {
                    this.showGameOver();
                }
            }
        } catch (error) {
            console.error('NPCの手の実行中にエラーが発生しました:', error);
            // エラーが発生した場合もNPCターンを終了
            this.updateNPCTurnState();
            this.updateBoardDisplay();
        }
    }
    
    /**
     * NPCのターンかどうかを判定
     */
    private isCurrentlyNPCTurn(): boolean {
        return this.isNPCEnabled && this.game.getCurrentPlayer() === Player.WHITE && !this.game.isGameOver();
    }

    /**
     * NPCターンの状態を更新
     */
    private updateNPCTurnState(): void {
        this.isNPCTurn = this.isCurrentlyNPCTurn();
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
        this.isNPCTurn = false;
        this.gameOverElement.classList.add('hidden');
        this.renderBoard();
        this.updateNPCTurnState();
        this.updateUI();
        
        // 新しいゲーム開始時にNPCの情報を再表示
        if (this.isNPCEnabled) {
            const npcInfo = this.npcManager.getCurrentStrategyInfo();
            console.log(`新しいゲーム開始 - NPC戦略: ${npcInfo.name} (${npcInfo.difficulty})`);
        }
    }
}

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    console.log('mugen-reversi initialized');
    const gameUI = new GameUI();
    gameUI.start();
});
