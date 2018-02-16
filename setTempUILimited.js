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
    var path = 'tpcdata/case02/';　// Pathを変更することでテストを替える
    var rcgGr = new SelRCG(path);
    // TODO 上下限を算出
    var tmpLmtTbl = calTmpLmt(
        rcgGr.selR02,  // モニター情報
        rcgGr.selR03,  // 静的情報
        rcgGr.selR15)  // 動的温度情報
    ;
    return tmpLmtTbl;
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
    // 以下の内容を編集しても構いません
    var tmpLmtTbl = [
        [36, 60],   // Auto
        [0, 127],   // Cool
        [10, 50],   // Heat
        [23, 55],   // C.Auto.Cool
        [24, 89]    // C.Auto.Heat
    ];
    return tmpLmtTbl;
}
