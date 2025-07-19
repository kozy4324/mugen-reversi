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
        // 盤面拡張が必要かチェック
        const expansionNeeded = this.checkBoardExpansion(row, col);
        // 盤面拡張を実行
        if (expansionNeeded.needsExpansion) {
            this.expandBoard(expansionNeeded);
            // 拡張後の座標を調整
            row += expansionNeeded.adjustRow;
            col += expansionNeeded.adjustCol;
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
    // 盤面拡張が必要かチェック
    checkBoardExpansion(row, col) {
        // 石を置いた後、その位置から相手の石をひっくり返した結果、
        // 盤面の端まで到達するかチェック
        const opponent = this.currentPlayer === Player.BLACK ? Player.WHITE : Player.BLACK;
        let needsTop = false;
        let needsBottom = false;
        let needsLeft = false;
        let needsRight = false;
        // 各方向をチェックして、ひっくり返した結果端に到達するかチェック
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        for (const [dr, dc] of directions) {
            if (this.canFlipInDirection(row, col, dr, dc, this.currentPlayer)) {
                let r = row + dr;
                let c = col + dc;
                // この方向で石をひっくり返していき、端に到達するかチェック
                while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && this.board[r][c] === opponent) {
                    r += dr;
                    c += dc;
                }
                // 石を配置する位置、またはひっくり返した最終位置が端の場合、拡張が必要
                if (row === 0 || r <= 0)
                    needsTop = true;
                if (row === this.boardSize - 1 || r >= this.boardSize - 1)
                    needsBottom = true;
                if (col === 0 || c <= 0)
                    needsLeft = true;
                if (col === this.boardSize - 1 || c >= this.boardSize - 1)
                    needsRight = true;
            }
        }
        // 石を配置する位置自体が端の場合も拡張
        if (row === 0)
            needsTop = true;
        if (row === this.boardSize - 1)
            needsBottom = true;
        if (col === 0)
            needsLeft = true;
        if (col === this.boardSize - 1)
            needsRight = true;
        const needsExpansion = needsTop || needsBottom || needsLeft || needsRight;
        return {
            needsExpansion,
            expandTop: needsTop,
            expandBottom: needsBottom,
            expandLeft: needsLeft,
            expandRight: needsRight,
            adjustRow: needsTop ? 1 : 0,
            adjustCol: needsLeft ? 1 : 0
        };
    }
    // 盤面を拡張
    expandBoard(expansion) {
        const oldSize = this.boardSize;
        // 新しいサイズを計算（各方向に1つずつ拡張）
        let newRowCount = oldSize;
        let newColCount = oldSize;
        if (expansion.expandTop)
            newRowCount++;
        if (expansion.expandBottom)
            newRowCount++;
        if (expansion.expandLeft)
            newColCount++;
        if (expansion.expandRight)
            newColCount++;
        // 正方形を保つため、大きい方に合わせる
        const newSize = Math.max(newRowCount, newColCount);
        const newBoard = Array(newSize).fill(null).map(() => Array(newSize).fill(Player.EMPTY));
        // 既存の盤面をコピー（適切なオフセットで配置）
        const rowOffset = expansion.expandTop ? 1 : 0;
        const colOffset = expansion.expandLeft ? 1 : 0;
        for (let row = 0; row < oldSize; row++) {
            for (let col = 0; col < oldSize; col++) {
                newBoard[rowOffset + row][colOffset + col] = this.board[row][col];
            }
        }
        this.board = newBoard;
        this.boardSize = newSize;
        console.log(`Board expanded from ${oldSize}x${oldSize} to ${newSize}x${newSize}`, {
            expandTop: expansion.expandTop,
            expandBottom: expansion.expandBottom,
            expandLeft: expansion.expandLeft,
            expandRight: expansion.expandRight,
            rowOffset,
            colOffset
        });
    }
    // 盤面の現在のサイズを取得（UIが更新を検知するため）
    getBoardChanges() {
        return {
            sizeChanged: true, // 実際には前回との比較が必要だが、シンプルにするため常にtrueを返す
            newSize: this.boardSize
        };
    }
    // ゲームリセット
    reset() {
        this.gameOver = false;
        this.currentPlayer = Player.BLACK;
        this.boardSize = 8; // 初期サイズにリセット
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
        this.gameOverElement = document.getElementById('game-over');
        this.winnerElement = document.getElementById('winner');
        this.restartButton = document.getElementById('restart-btn');
        this.boardSizeSelect = document.getElementById('board-size-select');
        // 初期化時にセレクトボックスの値を現在の盤面サイズに設定
        this.updateBoardSizeSelect();
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
        this.updateBoardSizeSelect();
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
        // 動的グリッドクラスを追加
        this.boardElement.className = 'dynamic-grid w-full max-w-lg aspect-square p-2 bg-green-800 rounded-lg shadow-lg';
        // ボード拡張アニメーションを追加
        this.boardElement.classList.add('board-expansion');
        // アニメーション完了後にクラスを削除
        setTimeout(() => {
            this.boardElement.classList.remove('board-expansion');
        }, 500);
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'bg-green-600 border border-green-700 rounded flex items-center justify-center transition-colors duration-200 ease-in-out';
                cell.dataset.row = row.toString();
                cell.dataset.col = col.toString();
                // 新しく追加されたセルにアニメーションを適用（端のセルを判定）
                if (boardSize > 8 && (row === 0 || row === boardSize - 1 || col === 0 || col === boardSize - 1)) {
                    cell.classList.add('new-cell-appear');
                    // アニメーション完了後にクラスを削除
                    setTimeout(() => {
                        cell.classList.remove('new-cell-appear');
                    }, 400);
                }
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
                let colorClasses;
                const isNewPiece = newPiecePosition && newPiecePosition.row === row && newPiecePosition.col === col;
                const isFlippedPiece = flippedPositions.has(positionKey) && preMoveBoard;
                if (isFlippedPiece) {
                    // フリップされる石は元の色（preMoveBoard の情報）で表示
                    const originalPiece = preMoveBoard[row][col];
                    colorClasses = originalPiece === Player.BLACK
                        ? 'bg-gray-800 border-2 border-gray-600'
                        : 'bg-gray-50 border-2 border-gray-300';
                }
                else if (isNewPiece) {
                    // 新しく配置される石は透明で開始（アニメーション中に色を設定）
                    console.log(`Creating transparent piece at (${row}, ${col}), isNPC: ${isNPCMove}`);
                    colorClasses = 'bg-transparent border-transparent'; // border-2を削除
                    // データ属性で最終的な色を記録
                    const finalColor = piece === Player.BLACK ? 'black' : 'white';
                    pieceElement.setAttribute('data-final-color', finalColor);
                }
                else {
                    // 既存の石は現在の色で表示
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
            console.log('No pieces to flip, calling completion callback immediately');
            if (onAllComplete) {
                onAllComplete();
            }
            return;
        }
        console.log(`Starting flip animations for ${flippedPieces.length} pieces`);
        let completedCount = 0;
        const expectedCompletions = flippedPieces.length;
        const checkAllComplete = () => {
            completedCount++;
            console.log(`Flip animation completed: ${completedCount}/${expectedCompletions}`);
            if (completedCount === expectedCompletions) {
                console.log('All flip animations completed');
                if (onAllComplete) {
                    onAllComplete();
                }
            }
        };
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
                    this.applyFlipAnimation(pieceElement, newColorClasses, checkAllComplete);
                }, index * 15); // 15msずつ遅延（10ms→15msに調整）
            }
            else {
                // 要素が見つからない場合もカウントを進める
                console.warn(`Piece element not found at (${flipped.row}, ${flipped.col})`);
                setTimeout(checkAllComplete, index * 15);
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
            let colorChangeCompleted = false;
            let animationCompleted = false;
            // アニメーションの正確な中間点（133ms、90度回転の瞬間）で色を変更
            // ease-in-outの場合、実際の90度回転は約67msで発生する（0.133sの50%）
            const colorChangeTimer = setTimeout(() => {
                console.log('Changing color during flip animation at 67ms');
                // 既存の色クラスを削除
                pieceElement.classList.remove('bg-gray-800', 'border-gray-600', 'bg-gray-50', 'border-gray-300');
                // 新しい色クラスを適用
                const colorClassArray = newColorClasses.split(' ');
                pieceElement.classList.add(...colorClassArray);
                colorChangeCompleted = true;
            }, 67); // 133msアニメーションの50%時点（67ms）
            // アニメーション終了後にクラスを削除
            const animationTimer = setTimeout(() => {
                console.log('Flip animation completed');
                pieceElement.classList.remove('piece-flip');
                animationCompleted = true;
                if (onComplete) {
                    onComplete();
                }
            }, 133);
            // フォールバックタイマー
            setTimeout(() => {
                if (!animationCompleted) {
                    console.warn('Flip animation timeout, forcing completion');
                    clearTimeout(colorChangeTimer);
                    clearTimeout(animationTimer);
                    if (!colorChangeCompleted && newColorClasses) {
                        pieceElement.classList.remove('bg-gray-800', 'border-gray-600', 'bg-gray-50', 'border-gray-300');
                        const colorClassArray = newColorClasses.split(' ');
                        pieceElement.classList.add(...colorClassArray);
                    }
                    pieceElement.classList.remove('piece-flip');
                    if (onComplete) {
                        onComplete();
                    }
                }
            }, 150); // 133ms + バッファー
        }
        else {
            // 通常のフリップアニメーション（色変更なし）
            pieceElement.classList.add('piece-flip');
            const timer = setTimeout(() => {
                pieceElement.classList.remove('piece-flip');
                if (onComplete) {
                    onComplete();
                }
            }, 133);
            // フォールバック
            setTimeout(() => {
                clearTimeout(timer);
                pieceElement.classList.remove('piece-flip');
                if (onComplete) {
                    onComplete();
                }
            }, 150);
        }
    }
    // 石の配置アニメーションを適用（プレイヤー用）
    applyPlaceAnimation(pieceElement, onComplete) {
        console.log('Starting player place animation');
        // データ属性から最終的な色を取得
        const finalColor = pieceElement.getAttribute('data-final-color');
        const finalColorClasses = finalColor === 'black'
            ? 'bg-gray-800 border-2 border-gray-600'
            : 'bg-gray-50 border-2 border-gray-300';
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
            console.log('Player place animation completed - now setting color');
            // アニメーション完了後に色を設定
            pieceElement.classList.remove('bg-transparent', 'border-transparent');
            const colorClassArray = finalColorClasses.split(' ');
            pieceElement.classList.add(...colorClassArray);
            if (onComplete) {
                onComplete();
            }
        };
        // フォールバックタイマーを追加（アニメーションが何らかの理由で完了しない場合）
        setTimeout(() => {
            if (animation.playState === 'running') {
                console.warn('Player animation timeout, forcing completion');
                animation.finish();
            }
        }, 200); // 167ms + バッファー
    }
    // 石の配置アニメーションを適用（NPC用）
    applyNPCPlaceAnimation(pieceElement, cellElement, onComplete) {
        console.log('Starting NPC place animation');
        // データ属性から最終的な色を取得
        const finalColor = pieceElement.getAttribute('data-final-color');
        const finalColorClasses = finalColor === 'black'
            ? 'bg-gray-800 border-2 border-gray-600'
            : 'bg-gray-50 border-2 border-gray-300';
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
        let pieceCompleted = false;
        let cellCompleted = false;
        const checkCompletion = () => {
            if (pieceCompleted && cellCompleted) {
                console.log('NPC place animation fully completed - now setting color');
                // 両方のアニメーション完了後に色を設定
                pieceElement.classList.remove('bg-transparent', 'border-transparent');
                const colorClassArray = finalColorClasses.split(' ');
                pieceElement.classList.add(...colorClassArray);
                if (onComplete) {
                    onComplete();
                }
            }
        };
        pieceAnimation.onfinish = () => {
            console.log('NPC piece animation completed');
            pieceCompleted = true;
            checkCompletion();
        };
        cellAnimation.onfinish = () => {
            console.log('NPC cell animation completed');
            cellCompleted = true;
            checkCompletion();
        };
        // フォールバックタイマーを追加（アニメーションが何らかの理由で完了しない場合）
        setTimeout(() => {
            if (!pieceCompleted || !cellCompleted) {
                console.warn('NPC animation timeout, forcing completion');
                pieceAnimation.finish();
                cellAnimation.finish();
            }
        }, 300); // 267ms + バッファー
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
        const preMoveSize = this.game.getBoardSize();
        const flippedPieces = this.game.makeMove(row, col);
        if (flippedPieces !== false) {
            // 盤面サイズが変更されたかチェック
            const postMoveSize = this.game.getBoardSize();
            const boardExpanded = postMoveSize !== preMoveSize;
            this.updateNPCTurnState();
            // アニメーション完了後にNPCの手を実行するコールバック
            const onAnimationComplete = () => {
                console.log('Player animation sequence completed');
                console.log(`After player move - currentPlayer: ${this.game.getCurrentPlayer()}, isGameOver: ${this.game.isGameOver()}`);
                if (this.game.isGameOver()) {
                    this.showGameOver();
                }
                else if (this.isNPCEnabled && this.game.getCurrentPlayer() === Player.WHITE) {
                    // プレイヤーのアニメーション完了後、適切な間を置いてからNPCの手を実行
                    console.log('Scheduling NPC move after player animation completion');
                    setTimeout(() => {
                        this.makeNPCMove();
                    }, 200); // 200msに延長してアニメーション完了を確実に待つ
                }
            };
            // 盤面が拡張された場合は完全に再描画
            if (boardExpanded) {
                console.log(`Board expanded from ${preMoveSize}x${preMoveSize} to ${postMoveSize}x${postMoveSize}`);
                this.renderBoard();
                this.updateUI();
                onAnimationComplete();
            }
            else {
                this.updateBoardDisplay(flippedPieces, { row, col }, false, preMoveBoard, onAnimationComplete);
                this.updateUI();
            }
        }
    }
    /**
     * NPCの手を実行
     */
    makeNPCMove() {
        if (this.game.isGameOver() || this.game.getCurrentPlayer() !== Player.WHITE) {
            return;
        }
        console.log('NPC move started');
        // NPCターン開始
        this.isNPCTurn = true;
        this.hideTargetLock(); // ターゲットロックを非表示
        this.updateBoardDisplay(); // ユーザー入力無効化の表示更新
        try {
            const validMoves = this.game.getValidMoves();
            if (validMoves.length === 0) {
                console.log('No valid moves for NPC');
                return;
            }
            const npcMove = this.npcManager.makeMove(this.game.getBoard(), validMoves, this.game.getCurrentPlayer());
            console.log(`NPC selected move: (${npcMove.row}, ${npcMove.col})`);
            // makeMove前の盤面状態を保存
            const preMoveBoard = this.game.getBoard().map(row => [...row]);
            const preMoveSize = this.game.getBoardSize();
            const flippedPieces = this.game.makeMove(npcMove.row, npcMove.col);
            if (flippedPieces !== false) {
                // 盤面サイズが変更されたかチェック
                const postMoveSize = this.game.getBoardSize();
                const boardExpanded = postMoveSize !== preMoveSize;
                this.updateNPCTurnState();
                // NPCアニメーション完了後にプレイヤーの有効手を表示
                const onNPCAnimationComplete = () => {
                    console.log('NPC animation sequence completed');
                    if (this.game.isGameOver()) {
                        this.showGameOver();
                    }
                    else {
                        // NPCのアニメーションが完了したら、プレイヤーの有効手を遅延表示
                        console.log('Showing player valid moves after NPC animation completion');
                        this.showValidMovesWithAnimation(100); // 100msに短縮（但し確実に待つ）
                    }
                };
                // 盤面が拡張された場合は完全に再描画
                if (boardExpanded) {
                    console.log(`Board expanded by NPC from ${preMoveSize}x${preMoveSize} to ${postMoveSize}x${postMoveSize}`);
                    this.renderBoard();
                    this.updateUI();
                    onNPCAnimationComplete();
                }
                else {
                    this.updateBoardDisplay(flippedPieces, { row: npcMove.row, col: npcMove.col }, true, preMoveBoard, onNPCAnimationComplete);
                    this.updateUI();
                }
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
        const currentPlayer = this.game.getCurrentPlayer();
        const isGameOver = this.game.isGameOver();
        const result = this.isNPCEnabled && currentPlayer === Player.WHITE && !isGameOver;
        console.log(`NPC Turn Check: enabled=${this.isNPCEnabled}, currentPlayer=${currentPlayer}, isGameOver=${isGameOver}, result=${result}`);
        return result;
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
    // セレクトボックスの値を現在の盤面サイズに同期
    updateBoardSizeSelect() {
        const currentBoardSize = this.game.getBoardSize();
        this.boardSizeSelect.value = currentBoardSize.toString();
        // もし現在の盤面サイズがセレクトボックスのオプションにない場合、カスタムオプションを追加
        const options = Array.from(this.boardSizeSelect.options);
        const hasOption = options.some(option => option.value === currentBoardSize.toString());
        if (!hasOption && currentBoardSize > 8) {
            // 動的に拡張されたサイズのオプションを追加
            const newOption = document.createElement('option');
            newOption.value = currentBoardSize.toString();
            newOption.textContent = `${currentBoardSize}x${currentBoardSize} (拡張済み)`;
            newOption.selected = true;
            this.boardSizeSelect.appendChild(newOption);
            console.log(`Added dynamic board size option: ${currentBoardSize}x${currentBoardSize}`);
        }
        else if (!hasOption) {
            console.warn(`Invalid board size: ${currentBoardSize}. Resetting to 8x8.`);
            this.boardSizeSelect.value = '8';
            // ローカルストレージも更新
            localStorage.setItem('mugen-reversi-board-size', '8');
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
