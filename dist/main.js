// Entry point for the mugen-reversi game
import { NPCManager } from './strategies/NPCManager.js';
import { Player } from './strategies/base/NPCStrategy.js';
// ゲームの状態を管理するクラス
class ReversiGame {
    constructor(boardSize = 8) {
        this.boardSize = boardSize;
        this.board = [];
        this.currentPlayer = Player.BLACK;
        this.gameOver = false;
        this.initializeBoard();
    }
    // 盤面の初期化
    initializeBoard() {
        // 可変サイズの盤面を初期化
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(Player.EMPTY));
        // 初期配置（中央4マス）
        const center = Math.floor(this.boardSize / 2);
        this.board[center - 1][center - 1] = Player.WHITE;
        this.board[center - 1][center] = Player.BLACK;
        this.board[center][center - 1] = Player.BLACK;
        this.board[center][center] = Player.WHITE;
    }
    // 有効な手があるかチェック
    hasValidMoves(player) {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
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
        while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize) {
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
        while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && this.board[r][c] === opponent) {
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
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
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
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
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
    getBoardSize() {
        return this.boardSize;
    }
    // ゲームリセット
    reset() {
        this.gameOver = false;
        this.currentPlayer = Player.BLACK;
        this.initializeBoard();
    }
    // 盤面サイズを変更してリセット（将来的な機能）
    resetWithSize(newSize) {
        if (newSize < 4 || newSize % 2 !== 0) {
            throw new Error('盤面サイズは4以上の偶数である必要があります');
        }
        // 注意: このメソッドは現在の実装では制限があります
        // 完全なサイズ変更には新しいReversiGameインスタンスが必要です
        console.warn('盤面サイズの動的変更は現在の実装では制限があります。新しいゲームインスタンスを作成することをお勧めします。');
        this.gameOver = false;
        this.currentPlayer = Player.BLACK;
        this.initializeBoard();
    }
}
// UI管理クラス
class GameUI {
    constructor(boardSize = 8) {
        this.game = new ReversiGame(boardSize);
        this.npcManager = new NPCManager();
        this.isNPCEnabled = true; // デフォルトでNPCを有効にする
        this.isNPCTurn = false;
        this.targetLockElement = null;
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
        this.boardSizeSelect = document.getElementById('board-size-select');
    }
    setupEventListeners() {
        this.restartButton.addEventListener('click', () => {
            this.restartGame();
        });
        // 盤面サイズ変更のイベントリスナー
        this.boardSizeSelect.addEventListener('change', () => {
            this.handleBoardSizeChange();
        });
        // 盤面全体にイベントリスナーを追加
        this.boardElement.addEventListener('click', (event) => {
            this.handleBoardClick(event);
        });
        this.boardElement.addEventListener('mousemove', (event) => {
            this.handleBoardMouseMove(event);
        });
        this.boardElement.addEventListener('mouseleave', () => {
            this.hideTargetLock();
        });
    }
    start() {
        this.hideTargetLock(); // ターゲットロックをクリア
        this.renderBoard();
        this.updateNPCTurnState();
        this.updateUI();
        // セレクトボックスの値を現在の盤面サイズに設定
        this.boardSizeSelect.value = this.game.getBoardSize().toString();
        // ゲーム開始時にプレイヤーの有効手を表示
        if (!this.isNPCTurn) {
            this.showValidMovesWithAnimation(200); // 200ms後に表示開始（さらに短縮）
        }
        // ゲーム開始時にNPCの情報を表示
        if (this.isNPCEnabled) {
            const npcInfo = this.npcManager.getCurrentStrategyInfo();
            console.log(`NPC戦略: ${npcInfo.name} (${npcInfo.difficulty}) - ${npcInfo.description}`);
        }
    }
    renderBoard() {
        this.boardElement.innerHTML = '';
        // 動的にグリッドサイズを設定
        const boardSize = this.game.getBoardSize();
        this.boardElement.style.gridTemplateColumns = `repeat(${boardSize}, minmax(0, 1fr))`;
        this.boardElement.style.gridTemplateRows = `repeat(${boardSize}, minmax(0, 1fr))`;
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'bg-green-600 border border-green-700 rounded flex items-center justify-center transition-colors duration-200 ease-in-out';
                cell.dataset.row = row.toString();
                cell.dataset.col = col.toString();
                // 個別のセルクリックイベントは削除（盤面全体で処理するため）
                this.boardElement.appendChild(cell);
            }
        }
        this.updateBoardDisplay();
    }
    updateBoardDisplay(flippedPieces = [], newPiecePosition, isNPCMove = false, preMoveBoard, onAnimationComplete) {
        const board = this.game.getBoard();
        const boardSize = this.game.getBoardSize();
        const validMoves = this.game.getValidMoves();
        const cells = this.boardElement.children;
        // フリップされる石の位置を記録（アニメーション前の色を保持するため）
        const flippedPositions = new Set(flippedPieces.map(p => `${p.row},${p.col}`));
        Array.from(cells).forEach((cell, index) => {
            const row = Math.floor(index / boardSize);
            const col = index % boardSize;
            const piece = board[row][col];
            const positionKey = `${row},${col}`;
            // ...existing code...
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
                }
                else {
                    // 通常の石は現在の色で表示
                    colorClasses = piece === Player.BLACK
                        ? 'bg-gray-800 border-2 border-gray-600'
                        : 'bg-gray-50 border-2 border-gray-300';
                }
                pieceElement.className = `${baseClasses} ${colorClasses}`;
                cell.appendChild(pieceElement);
            }
            // セルの基本スタイルを設定（有効手の表示は別途制御）
            const cellElement = cell;
            // 既存のアニメーションクラスをクリア
            cellElement.classList.remove('valid-move-appear', 'valid-move-disappear', 'npc-turn-feedback', 'target-locked-cell');
            // 基本的なセルスタイルを設定
            cellElement.classList.remove('bg-lime-500', 'valid-move-highlight');
            cellElement.classList.add('bg-green-600');
            // NPCのターン中は操作不可能にする
            if (this.isNPCTurn) {
                cellElement.classList.remove('hover:bg-green-500', 'cursor-pointer');
                cellElement.classList.add('cursor-not-allowed', 'npc-turn-feedback');
            }
            else {
                cellElement.classList.remove('cursor-not-allowed', 'npc-turn-feedback');
                cellElement.classList.add('hover:bg-green-500', 'cursor-pointer');
            }
        });
        // 新しく置かれた石にアニメーションを適用（DOM更新後に実行）
        if (newPiecePosition) {
            const boardSize = this.game.getBoardSize();
            const cellIndex = newPiecePosition.row * boardSize + newPiecePosition.col;
            const targetCell = cells[cellIndex];
            const pieceElement = targetCell.querySelector('div');
            if (pieceElement) {
                // 次のフレームでアニメーションを適用
                requestAnimationFrame(() => {
                    console.log(`Applying animation to piece at (${newPiecePosition.row}, ${newPiecePosition.col}), isNPC: ${isNPCMove}`);
                    if (isNPCMove) {
                        this.applyNPCPlaceAnimation(pieceElement, targetCell, () => {
                            // NPC配置アニメーション完了後にフリップアニメーションを適用
                            this.applyFlipAnimationsToMultiplePieces(flippedPieces, cells, onAnimationComplete);
                        });
                    }
                    else {
                        this.applyPlaceAnimation(pieceElement, () => {
                            // プレイヤー配置アニメーション完了後にフリップアニメーションを適用
                            this.applyFlipAnimationsToMultiplePieces(flippedPieces, cells, onAnimationComplete);
                        });
                    }
                });
            }
        }
        else if (flippedPieces.length > 0) {
            // 新しく置かれた石がない場合（初期表示など）は即座にフリップアニメーションを適用
            this.applyFlipAnimationsToMultiplePieces(flippedPieces, cells, onAnimationComplete);
        }
        else if (onAnimationComplete) {
            // フリップもない場合は即座にコールバックを実行
            onAnimationComplete();
        }
    }
    // 複数の石にフリップアニメーションを適用
    applyFlipAnimationsToMultiplePieces(flippedPieces, cells, onAllComplete) {
        const board = this.game.getBoard();
        const boardSize = this.game.getBoardSize();
        if (flippedPieces.length === 0) {
            // フリップする石がない場合は即座にコールバックを実行
            if (onAllComplete) {
                onAllComplete();
            }
            return;
        }
        let completedCount = 0;
        flippedPieces.forEach((flipped, index) => {
            const cellIndex = flipped.row * boardSize + flipped.col;
            const cell = cells[cellIndex];
            const pieceElement = cell.querySelector('div');
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
                }, index * 10); // 10msずつ遅延（30msから短縮）
            }
            else {
                completedCount++;
                // 要素が見つからない場合もカウントを進める
                if (completedCount === flippedPieces.length && onAllComplete) {
                    onAllComplete();
                }
            }
        });
    }
    // 石にフリップアニメーションを適用
    applyFlipAnimation(pieceElement, newColorClasses, onComplete) {
        if (newColorClasses) {
            // フリップアニメーション中に色を変更する場合
            console.log('Starting flip animation with color change:', {
                currentClasses: pieceElement.className,
                newColorClasses: newColorClasses
            });
            pieceElement.classList.add('piece-flip');
            // アニメーションの正確な中間点（133ms、90度回転の瞬間）で色を変更
            // ease-in-outの場合、実際の90度回転は約67msで発生する（0.133sの50%）
            setTimeout(() => {
                console.log('Changing color during flip animation at 67ms');
                // 既存の色クラスを削除
                pieceElement.classList.remove('bg-gray-800', 'border-gray-600', 'bg-gray-50', 'border-gray-300');
                // 新しい色クラスを適用
                const colorClassArray = newColorClasses.split(' ');
                pieceElement.classList.add(...colorClassArray);
            }, 67); // 133msアニメーションの50%時点（67ms）
            // アニメーション終了後にクラスを削除
            setTimeout(() => {
                console.log('Flip animation completed');
                pieceElement.classList.remove('piece-flip');
                if (onComplete) {
                    onComplete();
                }
            }, 133);
        }
        else {
            // 通常のフリップアニメーション（色変更なし）
            pieceElement.classList.add('piece-flip');
            setTimeout(() => {
                pieceElement.classList.remove('piece-flip');
                if (onComplete) {
                    onComplete();
                }
            }, 133);
        }
    }
    // 石の配置アニメーションを適用（プレイヤー用）
    applyPlaceAnimation(pieceElement, onComplete) {
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
            duration: 167,
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
    applyNPCPlaceAnimation(pieceElement, cellElement, onComplete) {
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
            duration: 233,
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
            duration: 267,
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
    /**
     * 盤面クリック時の処理（どこをクリックしても最寄りのマスに石を置く）
     */
    handleBoardClick(event) {
        // NPCのターン時はユーザー入力を受け付けない
        if (this.isNPCTurn) {
            return;
        }
        const targetPosition = this.getNearestValidCell(event);
        if (targetPosition) {
            // クリック時のフィードバックエフェクト
            this.showClickFeedback(event.clientX, event.clientY);
            // ターゲットロックを一時的に強調
            this.highlightTargetLock();
            // 石を配置
            setTimeout(() => {
                this.handleCellClick(targetPosition.row, targetPosition.col);
            }, 33); // 33ms後に配置（フィードバック表示のため）
        }
    }
    /**
     * 盤面マウス移動時の処理（ターゲットロックの表示）
     */
    handleBoardMouseMove(event) {
        // NPCのターン時は表示しない
        if (this.isNPCTurn) {
            this.hideTargetLock();
            return;
        }
        const targetPosition = this.getNearestValidCell(event);
        if (targetPosition) {
            this.showTargetLock(targetPosition.row, targetPosition.col);
        }
        else {
            this.hideTargetLock();
        }
    }
    /**
     * マウス座標から最寄りの有効なマスを取得
     */
    getNearestValidCell(event) {
        const rect = this.boardElement.getBoundingClientRect();
        const boardSize = this.game.getBoardSize();
        const cellSize = rect.width / boardSize;
        // マウス座標を盤面内の相対座標に変換
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // クリック位置に最も近いセルを計算
        const targetCol = Math.max(0, Math.min(boardSize - 1, Math.floor(x / cellSize)));
        const targetRow = Math.max(0, Math.min(boardSize - 1, Math.floor(y / cellSize)));
        // 有効な手のリストを取得
        const validMoves = this.game.getValidMoves();
        // ターゲットセルが有効な手の場合はそのまま返す
        const exactMatch = validMoves.find(move => move.row === targetRow && move.col === targetCol);
        if (exactMatch) {
            return exactMatch;
        }
        // 有効な手がない場合は null を返す
        if (validMoves.length === 0) {
            return null;
        }
        // 最寄りの有効な手を計算
        let nearestMove = validMoves[0];
        let minDistance = this.calculateDistance(targetRow, targetCol, nearestMove.row, nearestMove.col);
        for (const move of validMoves) {
            const distance = this.calculateDistance(targetRow, targetCol, move.row, move.col);
            if (distance < minDistance) {
                minDistance = distance;
                nearestMove = move;
            }
        }
        return nearestMove;
    }
    /**
     * 2点間の距離を計算
     */
    calculateDistance(row1, col1, row2, col2) {
        return Math.sqrt(Math.pow(row1 - row2, 2) + Math.pow(col1 - col2, 2));
    }
    /**
     * ターゲットロックの表示
     */
    showTargetLock(row, col) {
        // 既存のターゲットロックを削除
        this.hideTargetLock();
        const boardSize = this.game.getBoardSize();
        const cellIndex = row * boardSize + col;
        const targetCell = this.boardElement.children[cellIndex];
        if (targetCell) {
            // セルに強調表示クラスを追加
            targetCell.classList.add('target-locked-cell');
            // ターゲットロック要素を作成
            this.targetLockElement = document.createElement('div');
            this.targetLockElement.className = 'absolute inset-0 pointer-events-none z-10';
            this.targetLockElement.innerHTML = `
                <div class="target-lock-outer absolute inset-0 border-4 border-red-500 rounded-lg opacity-80"></div>
                <div class="target-lock-inner absolute inset-2 border-2 border-red-300 rounded opacity-60"></div>
                <div class="target-lock-crosshair absolute inset-0 flex items-center justify-center">
                    <div class="w-1 h-6 bg-red-500 absolute"></div>
                    <div class="h-1 w-6 bg-red-500 absolute"></div>
                    <div class="w-2 h-2 bg-red-500 rounded-full border border-red-300"></div>
                </div>
            `;
            targetCell.style.position = 'relative';
            targetCell.appendChild(this.targetLockElement);
            // ロックオンアニメーションを開始
            this.targetLockElement.classList.add('target-lock-animation');
            // マウスカーソルをターゲットに変更
            this.boardElement.style.cursor = 'crosshair';
        }
    }
    /**
     * ターゲットロックの非表示
     */
    hideTargetLock() {
        if (this.targetLockElement) {
            const parentCell = this.targetLockElement.parentElement;
            if (parentCell) {
                parentCell.classList.remove('target-locked-cell');
                // 確実にスタイルをリセット
                parentCell.style.position = '';
            }
            this.targetLockElement.remove();
            this.targetLockElement = null;
        }
        // 念のため、すべてのセルから target-locked-cell クラスを削除
        const cells = this.boardElement.children;
        Array.from(cells).forEach(cell => {
            const cellElement = cell;
            cellElement.classList.remove('target-locked-cell');
        });
        // マウスカーソルを元に戻す
        this.boardElement.style.cursor = 'default';
    }
    handleCellClick(row, col) {
        // NPCのターン時はユーザー入力を受け付けない
        if (this.isNPCTurn) {
            return;
        }
        // プレイヤーが手を打つ前に有効手のアニメーションとターゲットロックを消去
        this.hideValidMovesWithAnimation();
        this.hideTargetLock();
        // makeMove前の盤面状態を保存
        const preMoveBoard = this.game.getBoard().map(row => [...row]);
        const flippedPieces = this.game.makeMove(row, col);
        if (flippedPieces !== false) {
            this.updateNPCTurnState();
            // アニメーション完了後にNPCの手を実行するコールバック
            const onAnimationComplete = () => {
                if (this.game.isGameOver()) {
                    this.showGameOver();
                }
                else if (this.isNPCEnabled && this.game.getCurrentPlayer() === Player.WHITE) {
                    // プレイヤーのアニメーション完了後、少し間を置いてからNPCの手を実行
                    setTimeout(() => {
                        this.makeNPCMove();
                    }, 50);
                }
            };
            this.updateBoardDisplay(flippedPieces, { row, col }, false, preMoveBoard, onAnimationComplete);
            this.updateUI();
        }
    }
    /**
     * NPCの手を実行
     */
    makeNPCMove() {
        if (this.game.isGameOver() || this.game.getCurrentPlayer() !== Player.WHITE) {
            return;
        }
        // NPCターン開始
        this.isNPCTurn = true;
        this.hideTargetLock(); // ターゲットロックを非表示
        this.updateBoardDisplay(); // ユーザー入力無効化の表示更新
        try {
            const validMoves = this.game.getValidMoves();
            if (validMoves.length === 0) {
                return;
            }
            const npcMove = this.npcManager.makeMove(this.game.getBoard(), validMoves, this.game.getCurrentPlayer());
            // makeMove前の盤面状態を保存
            const preMoveBoard = this.game.getBoard().map(row => [...row]);
            const flippedPieces = this.game.makeMove(npcMove.row, npcMove.col);
            if (flippedPieces !== false) {
                this.updateNPCTurnState();
                // NPCアニメーション完了後にプレイヤーの有効手を表示
                const onNPCAnimationComplete = () => {
                    if (this.game.isGameOver()) {
                        this.showGameOver();
                    }
                    else {
                        // NPCのアニメーションが完了したら、プレイヤーの有効手を遅延表示
                        this.showValidMovesWithAnimation(33); // 33ms後に表示開始（さらに短縮）
                    }
                };
                this.updateBoardDisplay(flippedPieces, { row: npcMove.row, col: npcMove.col }, true, preMoveBoard, onNPCAnimationComplete);
                this.updateUI();
            }
        }
        catch (error) {
            console.error('NPCの手の実行中にエラーが発生しました:', error);
            // エラーが発生した場合もNPCターンを終了
            this.updateNPCTurnState();
            this.updateBoardDisplay();
        }
    }
    /**
     * NPCのターンかどうかを判定
     */
    isCurrentlyNPCTurn() {
        return this.isNPCEnabled && this.game.getCurrentPlayer() === Player.WHITE && !this.game.isGameOver();
    }
    /**
     * NPCターンの状態を更新
     */
    updateNPCTurnState() {
        this.isNPCTurn = this.isCurrentlyNPCTurn();
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
        this.isNPCTurn = false;
        this.hideTargetLock(); // ターゲットロックをクリア
        this.gameOverElement.classList.add('hidden');
        this.renderBoard();
        this.updateNPCTurnState();
        this.updateUI();
        // リスタート時にプレイヤーの有効手を表示
        if (!this.isNPCTurn) {
            this.showValidMovesWithAnimation(150); // 150ms後に表示開始（さらに短縮）
        }
        // 新しいゲーム開始時にNPCの情報を再表示
        if (this.isNPCEnabled) {
            const npcInfo = this.npcManager.getCurrentStrategyInfo();
            console.log(`新しいゲーム開始 - NPC戦略: ${npcInfo.name} (${npcInfo.difficulty})`);
        }
    }
    /**
     * 新しい盤面サイズでゲームを再開始（将来的な機能）
     * @param newSize 新しい盤面サイズ
     */
    restartWithNewSize(newSize) {
        if (newSize < 4 || newSize % 2 !== 0) {
            throw new Error('盤面サイズは4以上の偶数である必要があります');
        }
        // 新しいサイズでゲームインスタンスを再作成
        this.game = new ReversiGame(newSize);
        this.isNPCTurn = false;
        this.hideTargetLock();
        this.gameOverElement.classList.add('hidden');
        this.renderBoard();
        this.updateNPCTurnState();
        this.updateUI();
        // プレイヤーの有効手を表示
        if (!this.isNPCTurn) {
            this.showValidMovesWithAnimation(150);
        }
        console.log(`新しい盤面サイズ${newSize}x${newSize}でゲーム開始`);
    }
    /**
     * プレイヤーの有効手を段階的にアニメーション表示
     * @param delay 表示開始までの遅延（ミリ秒）
     */
    showValidMovesWithAnimation(delay = 0) {
        if (this.isNPCTurn) {
            return; // NPCターン中は表示しない
        }
        const validMoves = this.game.getValidMoves();
        const boardSize = this.game.getBoardSize();
        const cells = this.boardElement.children;
        setTimeout(() => {
            validMoves.forEach((move, index) => {
                const cellIndex = move.row * boardSize + move.col;
                const cellElement = cells[cellIndex];
                if (cellElement) {
                    // 有効手を少しずつ遅延させて表示
                    setTimeout(() => {
                        cellElement.classList.remove('bg-green-600');
                        cellElement.classList.add('bg-lime-500', 'valid-move-highlight', 'valid-move-appear');
                        // アニメーション終了後にクラスを削除
                        setTimeout(() => {
                            cellElement.classList.remove('valid-move-appear');
                        }, 67);
                    }, index * 10); // 10msずつ遅延（さらに短縮）
                }
            });
        }, delay);
    }
    /**
     * 有効手の表示を消去
     */
    hideValidMovesWithAnimation() {
        const validMoves = this.game.getValidMoves();
        const boardSize = this.game.getBoardSize();
        const cells = this.boardElement.children;
        validMoves.forEach((move, index) => {
            const cellIndex = move.row * boardSize + move.col;
            const cellElement = cells[cellIndex];
            if (cellElement && cellElement.classList.contains('valid-move-highlight')) {
                setTimeout(() => {
                    cellElement.classList.add('valid-move-disappear');
                    // アニメーション終了後にクラスを削除
                    setTimeout(() => {
                        cellElement.classList.remove('bg-lime-500', 'valid-move-highlight', 'valid-move-disappear');
                        cellElement.classList.add('bg-green-600');
                    }, 67);
                }, index * 10); // 10msずつ遅延（短縮）
            }
        });
    }
    /**
     * クリック時のフィードバックエフェクト（画面上のクリック位置に表示）
     */
    showClickFeedback(clientX, clientY) {
        const feedbackElement = document.createElement('div');
        feedbackElement.className = 'fixed pointer-events-none z-50';
        feedbackElement.style.left = `${clientX - 10}px`;
        feedbackElement.style.top = `${clientY - 10}px`;
        feedbackElement.innerHTML = `
            <div class="click-feedback w-5 h-5 bg-red-500 rounded-full opacity-80 animate-ping"></div>
            <div class="absolute inset-0 w-5 h-5 bg-red-300 rounded-full opacity-60"></div>
        `;
        document.body.appendChild(feedbackElement);
        // 167ms後に削除
        setTimeout(() => {
            feedbackElement.remove();
        }, 167);
    }
    /**
     * ターゲットロックの強調表示
     */
    highlightTargetLock() {
        if (this.targetLockElement) {
            this.targetLockElement.classList.add('target-lock-confirm');
            // 67ms後にクラスを削除
            setTimeout(() => {
                if (this.targetLockElement) {
                    this.targetLockElement.classList.remove('target-lock-confirm');
                }
            }, 67);
        }
    }
    /**
     * 盤面サイズ変更時の処理
     */
    handleBoardSizeChange() {
        const selectedSize = parseInt(this.boardSizeSelect.value);
        const currentSize = this.game.getBoardSize();
        if (selectedSize !== currentSize) {
            // 現在の盤面サイズをローカルストレージに保存
            localStorage.setItem('mugen-reversi-board-size', selectedSize.toString());
            // ページをリロードしてゲームを新しいサイズで開始
            window.location.reload();
        }
    }
}
// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    console.log('mugen-reversi initialized');
    // ローカルストレージから保存された盤面サイズを取得（デフォルトは8）
    const savedBoardSize = localStorage.getItem('mugen-reversi-board-size');
    const boardSize = savedBoardSize ? parseInt(savedBoardSize) : 8;
    // 盤面サイズが有効な値かチェック（4以上の偶数）
    const validBoardSize = (boardSize >= 4 && boardSize % 2 === 0) ? boardSize : 8;
    const gameUI = new GameUI(validBoardSize);
    gameUI.start();
});
