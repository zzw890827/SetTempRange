# 設定温度上下限UI制限
## 環境
### ローカルで動かないため、必ずサーバを立ち上がって行う。
* 簡易静的サーバanywhereを推奨する
  * Nodeをインストール
  * 下記のコマンドを実行<br>
    <b>`node -g install anywhere`</b>
  * SetTempRangeの配下に下記のコマンドを実行<br>
  　<b>`anywhere 8810`</b>
  * Chromeを開いて、下記のURLにアクセスをする<br>
    <href>`localhost:8810`</b>
  * <b>※IEにサポートされてない要素(let)を使っているため、IEにての動作確認することができない。
 ### tpcdataの配下は選択しRCGデータである、要するにselRxxのことである。