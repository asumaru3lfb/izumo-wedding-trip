# 須内達也 結婚式 in 島根 － 旅行行程Webサイト

須内達也の結婚式（島根県出雲市）に参列するメンバー7名向けの、9/12〜9/14 旅行行程サイトです。
静的サイト（HTML/CSS/JS、ビルドツールなし）で、GitHub Pagesでの公開を前提にしています。

## 見れるもの

- ヒーローセクション：出雲大社での挙式をお祭り的に演出（🎉 ボタンで紙吹雪）
- メンバー一覧：7名のニックネーム・班・乗車車両
- 日付タブ（9/12 / 9/13 / 9/14）と班タブ（直帰班 / 滞在班）
- タイムライン⇄地図（Leaflet + OpenStreetMap）の連動表示
  - タイムライン項目タップ → 地図ピンをハイライト＆ズーム＋詳細モーダル表示
  - 地図ピンタップ → 該当タイムライン項目をハイライト＆スクロール
- 観光候補地レイヤー（常時薄く表示、確定行程と視覚的に区別）
- スマホ：タブ切替＋下部固定ナビ、地図全画面表示切替

## ディレクトリ構成

```
/
├── index.html
├── README.md
├── .nojekyll
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── app.js       … 状態管理・タブ・モーダル
│       ├── map.js        … Leaflet地図制御
│       └── confetti.js   … 紙吹雪演出
└── data/
    ├── members.json      … メンバー一覧
    ├── itinerary.json    … 日付・班ごとの行程
    └── spots.json        … 観光候補地一覧
```

## ローカルでの確認方法

`fetch()` でJSONを読み込むため、`file://` では動作しません。ローカルサーバーを立てて確認してください。

```bash
npx serve .
```

または

```bash
python -m http.server 8000
```

## GitHub Pagesでの公開手順

1. このディレクトリの内容をGitHubリポジトリにpush
2. リポジトリの Settings → Pages → Source を `main` ブランチ / `/`(root) に設定
3. 数分後、`https://<ユーザー名>.github.io/<リポジトリ名>/` で公開される

`.nojekyll` を配置済みのため、Jekyll変換をスキップして配信されます。

## 行程・座標データの更新方法

`data/itinerary.json`・`data/spots.json`・`data/members.json` を編集するだけでUIに反映されます（コード変更不要）。

- 座標が「概算」となっている地点は、Google Maps や [OSM Nominatim](https://nominatim.openstreetmap.org/) 等で再検証してください。
- `"tbd": true` を持つイベントは行き先未定の項目です。決定次第、`lat`/`lng`/`place` を確定値に差し替え、`tbd` フィールドを削除してください。

## 今後の確認事項（オープン課題）

サイト下部「🚧 まだ決まってないこと」にも表示していますが、以下は要確認です。

- 直帰班の9/13観光先（未定）
- 滞在班の9/14午前観光先（未定）
- ヴィラ・ノッツェ コルティーレ出雲、あざまる水産、風の倉吉、ドーミーイン出雲の正確な座標（現状概算あり）
- 境港での海鮮丼の具体的な店舗
- メンバー呼称・表記の統一（濱口貴志／貴史、大田尚人 等 → `data/members.json` の `note` 欄参照）
- メインビジュアル・観光地写真の実素材への差し替え（現状はイラスト風CSS演出で代替）

## 技術スタック

- 素のHTML / CSS / JavaScript（ビルドツールなし）
- 地図：[Leaflet.js](https://leafletjs.com/) + OpenStreetMapタイル（APIキー不要）
- フォント：Google Fonts（Noto Sans JP / Kosugi Maru）
- 紙吹雪：自作の軽量Canvasアニメーション（外部ライブラリ不使用）
