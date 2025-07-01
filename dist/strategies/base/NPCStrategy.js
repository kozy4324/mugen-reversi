// NPCストラテジーの基本インターフェース
// Player enumをインポート（main.tsから移動予定）
var Player;
(function (Player) {
    Player[Player["EMPTY"] = 0] = "EMPTY";
    Player[Player["BLACK"] = 1] = "BLACK";
    Player[Player["WHITE"] = 2] = "WHITE";
})(Player || (Player = {}));
// NPCストラテジーの抽象基底クラス
export class BaseNPCStrategy {
    constructor(name, difficulty, description) {
        this.name = name;
        this.difficulty = difficulty;
        this.description = description;
    }
    getName() {
        return this.name;
    }
    getDifficulty() {
        return this.difficulty;
    }
    getDescription() {
        return this.description;
    }
    /**
     * ランダムな手を選択するヘルパーメソッド
     * @param validMoves 有効な手の一覧
     * @returns ランダムに選択された手
     */
    getRandomMove(validMoves) {
        const randomIndex = Math.floor(Math.random() * validMoves.length);
        return validMoves[randomIndex];
    }
    /**
     * 相手のプレイヤーを取得
     * @param player 現在のプレイヤー
     * @returns 相手のプレイヤー
     */
    getOpponent(player) {
        return player === Player.BLACK ? Player.WHITE : Player.BLACK;
    }
}
export { Player };
