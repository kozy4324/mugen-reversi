# mugen-reversi 開発ガイド - NPCシステム設計

このドキュメントでは、mugen-reversi プロジェクトのNPCシステムに関する設計思想と実装アイデアを記載します。

## 目次
1. NPCシステムの概要
2. ストラテジーパターンの採用
3. NPCストラテジーの種類とアイデア
4. 実装方針

---

## 1. NPCシステムの概要

mugen-reversi では、白の後手プレイヤーをNPC（Non Player Character）として実装します。これにより：
- 一人でゲームを楽しむことができます
- 異なる難易度のAIと対戦できます
- 様々な戦略パターンを試すことができます

## 2. ストラテジーパターンの採用

NPCの実装には**ストラテジーパターン**を採用します。これにより：
- 新しいAI戦略を簡単に追加できます
- 既存のコードを変更せずに戦略を切り替えられます
- 戦略ごとに独立したファイルで管理できるため、メンテナンスが容易です

### 基本構造
```typescript
interface NPCStrategy {
    makeMove(board: Player[][], validMoves: Array<{row: number, col: number}>): {row: number, col: number};
    getName(): string;
    getDifficulty(): 'Easy' | 'Medium' | 'Hard' | 'Expert';
}
```

## 3. NPCストラテジーの種類とアイデア

### 初級レベル
- **RandomStrategy**: 有効な手からランダムに選択
- **CornerPreferenceStrategy**: 角を優先的に狙う単純な戦略
- **EdgeAvoidanceStrategy**: 端を避けて中央付近を狙う戦略

### 中級レベル
- **GreedyStrategy**: 最も多くの石をひっくり返せる手を選択
- **PositionalStrategy**: 盤面の位置価値に基づいて手を選択
- **MobilityStrategy**: 相手の手の選択肢を減らす戦略

### 上級レベル
- **MinimaxStrategy**: ミニマックス法を使用した先読み戦略
- **AlphaBetaStrategy**: αβ法を使用した効率的な先読み戦略
- **WeightedStrategy**: 複数の評価基準を重み付けして組み合わせた戦略

### エキスパートレベル
- **DeepLearningStrategy**: 事前学習済みモデルを使用した戦略
- **MonteCarloStrategy**: モンテカルロ木探索を使用した戦略
- **AdaptiveStrategy**: 相手の戦略を学習して適応する戦略

## 4. 実装方針

### ファイル構造
```
src/
├── strategies/
│   ├── base/
│   │   └── NPCStrategy.ts          // インターフェース定義
│   ├── easy/
│   │   ├── RandomStrategy.ts       // ランダム戦略
│   │   └── CornerPreferenceStrategy.ts
│   ├── medium/
│   │   ├── GreedyStrategy.ts       // 貪欲戦略
│   │   └── PositionalStrategy.ts
│   ├── hard/
│   │   ├── MinimaxStrategy.ts      // ミニマックス戦略
│   │   └── AlphaBetaStrategy.ts
│   └── expert/
│       └── MonteCarloStrategy.ts
├── main.ts
└── styles.css
```

### 統合方針
- `GameUI`クラスでストラテジーを選択・切り替え可能にする
- 設定画面でNPCの難易度を選択できるようにする
- 各戦略の名前と難易度をUI上に表示する
- ゲーム開始前にNPCの戦略を選択できるようにする

### パフォーマンス考慮事項
- 計算時間が長い戦略には制限時間を設ける
- Worker スレッドを使用して UI をブロックしないようにする
- キャッシュ機能を実装して同じ局面の再計算を避ける

---

このガイドに基づいて、段階的にNPCシステムを実装していきます。まずはRandomStrategyから始めて、徐々に高度な戦略を追加していく予定です。
