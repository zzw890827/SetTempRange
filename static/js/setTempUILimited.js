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
    var path = 'tpcdata/case03/';　// Pathを変更することでテストを替える
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
 *     1. 静的範囲算出
 *     2. 動的範囲算出
 *     3. 静的範囲∩動的範囲
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
    var MIN = Number.MIN_SAFE_INTEGER;
    var MAX = Number.MAX_SAFE_INTEGER;
    // 出力用テーブルを初期化
    var tmpLmtTbl = [
        [MIN, MAX, 0],   // Auto
        [MIN, MAX, 0],   // Cool
        [MIN, MAX, 0],   // Heat
        [MIN, MAX, 0],   // C.Auto.Cool
        [MIN, MAX, 0]    // C.Auto.Heat
    ];
    var deadBand = MIN;
    // 静的温度上下限を取得（And取り）
    localGetStaTmpLmt();
    if (tmpLmtTbl[3][2] === 1 || tmpLmtTbl[4][2] === 1) {
        // 冷暖別自動冷暖房温度補正
        var tunedTmp = localTuneCoolHeat(tmpLmtTbl[3], tmpLmtTbl[4]);
        tmpLmtTbl[3][0] = tunedTmp[0];
        tmpLmtTbl[4][1] = tunedTmp[1];
    }
    // 動的温度範囲を取得
    //localGetDymTempMinMax();
    // 静的範囲と動的範囲And取り
    // localGetStaAndDynTmp()

    /***********************************************************
     * localGetStaTmpLmt() 静的温度範囲及びデッドバンドの最大値を取得得
     ***********************************************************/
    function localGetStaTmpLmt() {
        // 温度制限を集計
        for (var i = 0; i < selR03.length; i++) {
            if (parseInt(selR03[i][18]) === 1 &&   // Auto：機能あり且冷暖別なし
                parseInt(selR03[i][81]) === 0) {
                tmpLmtTbl[0][0] = Math.max(      // Auto下限値
                    tmpLmtTbl[0][0],
                    parseFloat(selR03[i][37]) * 2
                );
                tmpLmtTbl[0][1] = Math.min(    // Auto上限値
                    tmpLmtTbl[0][1],
                    parseFloat(selR03[i][38]) * 2
                );
                tmpLmtTbl[0][2] = 1;  //　機能フラグ：ありにする
            } else if (parseInt(selR03[i][81]) === 1) { //　冷暖別あり
                tmpLmtTbl[3][0] = Math.max(   // 冷暖別Cool下限値
                    tmpLmtTbl[3][0],
                    parseFloat(selR03[i][41]) * 2
                );
                tmpLmtTbl[3][1] = Math.min(  // 冷暖別Cool上限値
                    tmpLmtTbl[3][1],
                    parseFloat(selR03[i][42]) * 2
                );
                tmpLmtTbl[4][0] = Math.max(   // 冷暖別Heat下限値
                    tmpLmtTbl[4][0],
                    parseFloat(selR03[i][39]) * 2
                );
                tmpLmtTbl[4][1] = Math.min(   // 冷暖別Heat上限値
                    tmpLmtTbl[4][1],
                    parseFloat(selR03[i][40]) * 2
                );
                deadBand = Math.max(  // デッドバンド
                    deadBand,
                    parseFloat(selR03[i][82]) * 2
                );
                tmpLmtTbl[3][2] = 1;  //　機能フラグ：ありにする
                tmpLmtTbl[4][2] = 1;  //　機能フラグ：ありにする
            }
            // 暖房：機能あり
            if (parseInt(selR03[i][19]) === 1) {
                tmpLmtTbl[1][0] = Math.max(   // Heat下限値
                    tmpLmtTbl[1][0],
                    parseFloat(selR03[i][39]) * 2
                );
                tmpLmtTbl[1][1] = Math.min(  // Heat上限値
                    tmpLmtTbl[1][1],
                    parseFloat(selR03[i][40]) * 2
                );
                tmpLmtTbl[1][2] = 1;  //　機能フラグ：ありにする
            }
            // 冷房：機能あり
            if (parseInt(selR03[i][20]) === 1) {
                tmpLmtTbl[2][0] = Math.max(   // Cool下限値
                    tmpLmtTbl[2][0],
                    parseFloat(selR03[i][41]) * 2
                );
                tmpLmtTbl[2][1] = Math.min(  // Cool上限値
                    tmpLmtTbl[2][1],
                    parseFloat(selR03[i][42]) * 2
                );
                tmpLmtTbl[2][2] = 1;  //　機能フラグ：ありにする
            }
        }
    }

    /**********************************************************************
     * localTuneCoolHeat(coolTbl, heatTbl) 冷暖別自動冷暖房温度補正
     * @param {Array<Number>} coolTbl: Cool温度上下限、機能情報
     * @param {Array<Number>} heatTbl: Heat温度上下限、機能情報
     * @return {Array<Number>} tunedTmpTbl: 補正した温度(冷房下限値、暖房上限値)
     *********************************************************************/
    function localTuneCoolHeat(coolTbl, heatTbl) {
        var tunedTmpLmtTbl = [];
        tunedTmpLmtTbl[0] = // 冷房下限値
            coolTbl[0] - heatTbl[0] > deadBand ?
                coolTbl[0] : heatTbl[0] + deadBand;
        tunedTmpLmtTbl[1] = // 暖房上限値
            coolTbl[1] - heatTbl[1] > deadBand ?
                heatTbl[1] : coolTbl[1] - deadBand;

        return tunedTmpLmtTbl;
    }

    return tmpLmtTbl;
}
