// ランダム戦略のNPC実装
import { BaseNPCStrategy } from '../base/NPCStrategy.js';
/**
 * ランダムストラテジー
 * 有効な手の中からランダムに選択する最も単純なNPC
 */
export class RandomStrategy extends BaseNPCStrategy {
    constructor() {
        super('ランダム', 'Easy', '有効な手の中からランダムに選択します。最も簡単な相手です。');
    }
    /**
     * 有効な手の中からランダムに選択
     * @param board 現在の盤面（使用しない）
     * @param validMoves 有効な手の一覧
     * @param currentPlayer 現在のプレイヤー（使用しない）
     * @returns ランダムに選択された手
     */
    makeMove(board, validMoves, currentPlayer) {
        // 有効な手がない場合のエラーハンドリング
        if (validMoves.length === 0) {
            throw new Error('有効な手がありません');
        }
        // ランダムに手を選択
        return this.getRandomMove(validMoves);
    }
}
