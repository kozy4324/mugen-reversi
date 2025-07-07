# mugen-reversi アーキテクチャドキュメント

## 概要

mugen-reversi は TypeScript、HTML、CSS（TailwindCSS）を使用して構築されたブラウザベースのオセロゲームです。将来的な拡張性を考慮したモジュラー設計と、ストラテジーパターンを採用したNPCシステムが特徴です。

## システム構成

### 1. アプリケーション構造

```
mugen-reversi/
├── index.html              # メインHTMLファイル
├── src/
│   ├── main.ts             # エントリーポイント・ゲームロジック
│   ├── styles.css          # カスタムCSS・アニメーション定義
│   └── strategies/         # NPCストラテジーシステム
│       ├── NPCManager.ts   # ストラテジー管理
│       ├── base/
│       │   └── NPCStrategy.ts  # ストラテジー基底クラス・インターフェース
│       └── easy/
│           └── RandomStrategy.ts # ランダム戦略実装
├── dist/                   # ビルド出力先
│   ├── main.js            # コンパイル済みTypeScript
│   └── output.css         # 生成済みTailwindCSS
└── package.json           # プロジェクト設定・依存関係
```

### 2. 主要コンポーネント

#### 2.1 ReversiGame クラス
**責務**: ゲームの状態管理とルール実装

**主要メソッド**:
- `initializeBoard()`: 8x8盤面の初期化
- `makeMove(row, col)`: 石の配置とゲームロジック実行
- `isValidMove()`: 手の有効性判定
- `flipPieces()`: 石のひっくり返し処理
- `getScore()`: スコア計算
- `getWinner()`: 勝敗判定

**状態管理**:
- `board: Player[][]`: 盤面状態（2次元配列）
- `currentPlayer: Player`: 現在のプレイヤー
- `gameOver: boolean`: ゲーム終了フラグ

#### 2.2 GameUI クラス
**責務**: ユーザーインターフェースの管理と描画

**主要機能**:
- 盤面の動的レンダリング
- プレイヤー入力の処理（マウス操作）
- アニメーション制御（石の配置・フリップ）
- NPCターンの管理
- ゲーム状態の表示更新

**高度なUI機能**:
- **ターゲットロックシステム**: マウス位置から最寄りの有効手を自動選択
- **段階的アニメーション**: 石の配置→フリップの順序制御
- **視覚的フィードバック**: クリック位置表示、有効手ハイライト
- **NPCターン識別**: NPCの手に特別なアニメーション適用

### 3. NPCシステム設計

#### 3.1 ストラテジーパターンの実装

```typescript
// 基本インターフェース
interface NPCStrategy {
    makeMove(board: Player[][], validMoves: Array<{row: number, col: number}>): {row: number, col: number};
    getName(): string;
    getDifficulty(): 'Easy' | 'Medium' | 'Hard' | 'Expert';
    getDescription(): string;
}
```

#### 3.2 NPCManager クラス
**責務**: ストラテジーの登録・管理・実行

**機能**:
- ストラテジーファクトリパターンによる動的生成
- 実行時のストラテジー切り替え
- エラーハンドリング
- ストラテジー情報の提供

#### 3.3 ストラテジー拡張ポイント
```
strategies/
├── easy/       # 初級レベル（Random, CornerPreference等）
├── medium/     # 中級レベル（Greedy, Positional等）
├── hard/       # 上級レベル（Minimax, AlphaBeta等）
└── expert/     # エキスパートレベル（MonteCarlo, DeepLearning等）
```

## 技術スタック

### フロントエンド技術

**TypeScript**:
- ES6モジュールシステム使用
- 厳密な型チェック有効
- クラスベース設計

**TailwindCSS**:
- ユーティリティファーストアプローチ
- レスポンシブデザイン対応
- カスタムCSS（アニメーション）との併用

**HTML5**:
- セマンティックマークアップ
- 動的DOM操作（JavaScript）

### ビルドシステム

**TypeScript Compiler**:
- ES6ターゲット
- モジュール分割
- `dist/`フォルダへ出力

**TailwindCSS CLI**:
- カスタムCSS統合
- 最適化されたCSS出力

**開発サーバー**:
- Live Server（ホットリロード）
- Nodemon（ファイル監視）

## データフロー

### 1. ゲーム初期化フロー
```
DOMContentLoaded → GameUI.constructor() → ReversiGame.constructor() → NPCManager.constructor() → GameUI.start()
```

### 2. プレイヤーターンフロー
```
マウス操作 → ターゲットロック表示 → クリック → 手の有効性判定 → 石配置 → アニメーション → NPCターン開始
```

### 3. NPCターンフロー
```
NPCターン開始 → 有効手取得 → ストラテジー実行 → 石配置 → アニメーション → プレイヤーターン復帰
```

## パフォーマンス考慮事項

### 1. アニメーション最適化
- Web Animations API使用
- CSS transformsによる60fps維持
- フレーム間の適切な遅延制御

### 2. DOM操作最適化
- 最小限の要素作成・削除
- クラス操作による状態変更
- イベントデリゲーション

### 3. メモリ管理
- イベントリスナーの適切な登録・解除
- アニメーション要素の自動削除
- オブジェクトの再利用

## 拡張性設計

### 1. 盤面拡張準備
現在は8x8固定だが、動的サイズ変更に対応可能な設計:
- グリッドレイアウトの動的変更
- 盤面配列の可変サイズ対応
- UI要素の自動調整

### 2. ゲームモード拡張
- プレイヤー vs プレイヤー
- プレイヤー vs NPC（現在実装済み）
- NPC vs NPC（観戦モード）
- オンライン対戦（将来的）

### 3. UI拡張ポイント
- 設定画面（難易度選択）
- ゲーム履歴・統計
- テーマ・スキン変更
- モバイル最適化

## セキュリティ・品質考慮事項

### 1. 型安全性
- TypeScriptによる型安全性確保
- enum活用による定数管理
- null/undefined安全性チェック

### 2. エラーハンドリング
- NPCストラテジー実行時のtry-catch
- 無効な手の入力防止
- ゲーム状態の整合性保持

### 3. コード品質
- 単一責任原則の遵守
- 疎結合設計
- 拡張性を考慮したインターフェース設計

## 今後の開発計画

### Phase 1: NPCストラテジー拡張
- 中級・上級ストラテジーの実装
- 難易度調整機能
- ストラテジー選択UI

### Phase 2: 盤面拡張機能
- 無限拡張ルールの実装
- 動的グリッドシステム
- パフォーマンス最適化

### Phase 3: 高度な機能
- ゲーム分析・統計
- リプレイ機能
- AI学習機能（将来的）

---

このアーキテクチャドキュメントは、mugen-reversiプロジェクトの技術的な構造と設計思想を記録しています。新しい開発者がプロジェクトに参加する際の理解促進と、将来の機能拡張時の指針として活用してください。
