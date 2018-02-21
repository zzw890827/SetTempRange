/********************************************************
 * 設定温度UI制限
 * <p>
 *     1. データを読み込み、処理用配列を作成
 *     2. TODO 上下限を算出
 * </p>
 * @module  setTempUILimited
 * @author  ZHAO Zhongwen 201/02/16
 * @version 1.0
 * @since   4.0
 * @return {Array<Array>} tmpLmtTbl  温度上下限テーブル(0~127)
 *********************************************************/
function setTempUILimited() {
    // データを読み込み、処理用配列を作成
    var path = 'tpcdata/case01/';　// Pathを変更することでテストを替える
    var rcgGr = new SelRCG(path);
    // TODO 上下限を算出
    return calTmpLmt(
        rcgGr.selR02,  // モニター情報
        rcgGr.selR03,  // 静的情報
        rcgGr.selR15); // 動的温度情報
}

/***********************************************************
 * 温度上下限を算出
 * <p>
 *     TODO 今回の課題
 * </p>
 * @module  calTmpLim
 * @author
 * @version 1.0
 * @since   4.0
 * @param  {Array<Array>} selR02    モニター情報二次元配列
 * @param  {Array<Array>} selR03    静的情報二次元配列
 * @param  {Array<Array>} selR15    動的温度情報
 * @return {Array<Array>} tmpLmtTbl 度上下限テーブル(0~127)
 ************************************************************/
function calTmpLmt(selR02, selR03, selR15) {
    // 出力用テーブルを初期化
    var tmpLmtTbl = [
        [0, 127, 0],   // Auto
        [0, 127, 0],   // Cool
        [0, 127, 0],   // Heat
        [0, 127, 0],   // C.Auto.Cool
        [0, 127, 0]    // C.Auto.Heat
    ];
    // 単一温度上下限を取得（And取り）
    localGetSingleTempMinMax();
    // デッドバンドを取得
    //localGetDeadBand();
    // 冷暖別自動冷暖房温度範囲取得（And取り）
    //localGetBiAutoTempMinMax();
    // 冷暖別自動冷暖房温度補正
    //localTuneBiAutoTempMinMax();

    /**************************************************
     * localGetSingleTempMinMax(mode) 単一温度上下限を取得
     **************************************************/
    function localGetSingleTempMinMax() {
        // 温度制限テーブル宣言
        var lowLmtAuto = [];  // Auto下限値テーブル
        var upLmtAuto = [];   // Auto上限値テーブル

        var lowLmtCool = [];  // Cool下限値テーブル
        var upLmtCool = [];   // Cool上限値テーブル

        var lowLmtHeat = [];  // Heat下限値テーブル
        var upLmtHeat = [];   // Heat上限値テーブル

        //温度制限を集計
        for (var i = 0; i < selR03.length; i++) {
            // Auto：機能あり且冷暖別なし
            if (parseInt(selR03[i][18]) === 1 &&
                parseInt(selR03[i][81]) === 0) {
                lowLmtAuto.push(parseFloat(selR03[i][37]) * 2);
                upLmtAuto.push(parseFloat(selR03[i][38]) * 2);
            }
            // 暖房：機能あり
            if (parseInt(selR03[i][19]) === 1) {
                lowLmtHeat.push(parseFloat(selR03[i][39]) * 2);
                upLmtHeat.push(parseFloat(selR03[i][40]) * 2);
            }
            // 冷房：機能あり
            if (parseInt(selR03[i][20]) === 1) {
                lowLmtCool.push(parseFloat(selR03[i][41]) * 2);
                upLmtCool.push(parseFloat(selR03[i][42]) * 2);
            }
        }
        // Auto、Cool、Heat各々の制限値を取得
        // Auto
        if (lowLmtAuto.length !== 0) {
            tmpLmtTbl[0][0] = Math.max.apply(null, lowLmtAuto);
            tmpLmtTbl[0][1] = Math.min.apply(null, upLmtAuto);
            tmpLmtTbl[0][2] = 1; //機能あり
        }
        // Cool
        if (lowLmtCool.length !== 0) {
            tmpLmtTbl[1][0] = Math.max.apply(null, lowLmtCool);
            tmpLmtTbl[1][1] = Math.min.apply(null, upLmtCool);
            tmpLmtTbl[1][2] = 1; //機能あり
        }
        // Heat
        if (lowLmtHeat.length !== 0) {
            tmpLmtTbl[2][0] = Math.max.apply(null, lowLmtHeat);
            tmpLmtTbl[2][1] = Math.min.apply(null, upLmtHeat);
            tmpLmtTbl[2][2] = 1; //機能あり
        }
    }

    return tmpLmtTbl;
}
