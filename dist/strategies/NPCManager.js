// NPCマネージャー - ストラテジーの管理と実行を担当
import { RandomStrategy } from './easy/RandomStrategy.js';
/**
 * NPCマネージャークラス
 * 利用可能なストラテジーの管理と、NPCの手を実行する責任を持つ
 */
export class NPCManager {
    constructor() {
        this.availableStrategies = new Map();
        this.registerStrategies();
        // デフォルトでランダム戦略を使用
        this.currentStrategy = new RandomStrategy();
    }
    /**
     * 利用可能なストラテジーを登録
     */
    registerStrategies() {
        this.availableStrategies.set('random', () => new RandomStrategy());
        // 将来的に他のストラテジーを追加
        // this.availableStrategies.set('greedy', () => new GreedyStrategy());
        // this.availableStrategies.set('minimax', () => new MinimaxStrategy());
    }
    /**
     * 利用可能なストラテジーの一覧を取得
     * @returns ストラテジーのキーと名前のマップ
     */
    getAvailableStrategies() {
        const strategies = [];
        for (const [key, strategyFactory] of this.availableStrategies.entries()) {
            const strategy = strategyFactory();
            strategies.push({
                key,
                name: strategy.getName(),
                difficulty: strategy.getDifficulty(),
                description: strategy.getDescription()
            });
        }
        return strategies;
    }
    /**
     * ストラテジーを変更
     * @param strategyKey ストラテジーのキー
     */
    setStrategy(strategyKey) {
        const strategyFactory = this.availableStrategies.get(strategyKey);
        if (!strategyFactory) {
            throw new Error(`ストラテジー '${strategyKey}' が見つかりません`);
        }
        this.currentStrategy = strategyFactory();
    }
    /**
     * 現在のストラテジーを取得
     * @returns 現在のストラテジー
     */
    getCurrentStrategy() {
        return this.currentStrategy;
    }
    /**
     * NPCの手を実行
     * @param board 現在の盤面
     * @param validMoves 有効な手の一覧
     * @param currentPlayer 現在のプレイヤー
     * @returns NPCが選択した手
     */
    makeMove(board, validMoves, currentPlayer) {
        if (validMoves.length === 0) {
            throw new Error('NPCが打てる手がありません');
        }
        return this.currentStrategy.makeMove(board, validMoves, currentPlayer);
    }
    /**
     * 現在のストラテジー情報を取得
     * @returns ストラテジー情報
     */
    getCurrentStrategyInfo() {
        return {
            name: this.currentStrategy.getName(),
            difficulty: this.currentStrategy.getDifficulty(),
            description: this.currentStrategy.getDescription()
        };
    }
}
