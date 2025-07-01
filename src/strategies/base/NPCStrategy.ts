// NPCストラテジーの基本インターフェース

// Player enumをインポート（main.tsから移動予定）
enum Player {
    EMPTY = 0,
    BLACK = 1,
    WHITE = 2
}

// NPCの難易度レベル
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Expert';

// NPCストラテジーのインターフェース
export interface NPCStrategy {
    /**
     * 次の手を決定する
     * @param board 現在の盤面状態
     * @param validMoves 有効な手の一覧
     * @param currentPlayer 現在のプレイヤー（通常はWHITE）
     * @returns 選択した手の座標
     */
    makeMove(
        board: Player[][], 
        validMoves: Array<{row: number, col: number}>, 
        currentPlayer: Player
    ): {row: number, col: number};

    /**
     * ストラテジーの名前を取得
     * @returns ストラテジー名
     */
    getName(): string;

    /**
     * ストラテジーの難易度を取得
     * @returns 難易度レベル
     */
    getDifficulty(): DifficultyLevel;

    /**
     * ストラテジーの説明を取得
     * @returns ストラテジーの説明文
     */
    getDescription(): string;
}

// NPCストラテジーの抽象基底クラス
export abstract class BaseNPCStrategy implements NPCStrategy {
    protected name: string;
    protected difficulty: DifficultyLevel;
    protected description: string;

    constructor(name: string, difficulty: DifficultyLevel, description: string) {
        this.name = name;
        this.difficulty = difficulty;
        this.description = description;
    }

    abstract makeMove(
        board: Player[][], 
        validMoves: Array<{row: number, col: number}>, 
        currentPlayer: Player
    ): {row: number, col: number};

    getName(): string {
        return this.name;
    }

    getDifficulty(): DifficultyLevel {
        return this.difficulty;
    }

    getDescription(): string {
        return this.description;
    }

    /**
     * ランダムな手を選択するヘルパーメソッド
     * @param validMoves 有効な手の一覧
     * @returns ランダムに選択された手
     */
    protected getRandomMove(validMoves: Array<{row: number, col: number}>): {row: number, col: number} {
        const randomIndex = Math.floor(Math.random() * validMoves.length);
        return validMoves[randomIndex];
    }

    /**
     * 相手のプレイヤーを取得
     * @param player 現在のプレイヤー
     * @returns 相手のプレイヤー
     */
    protected getOpponent(player: Player): Player {
        return player === Player.BLACK ? Player.WHITE : Player.BLACK;
    }
}

export { Player };
