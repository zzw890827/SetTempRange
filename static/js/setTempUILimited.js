/*
* # Remote Touch Panel Controller
*
* http://www.fujitsu-general.com/jp/
*
* waterfall -v4.0 (2018-02-26T10:01:51+09)
*
* Copyright 2018 FUJITSU GENERAL LIMITED.
*
* Released under the MIT license
*
* http://opensource.org/licenses/MIT
*
* Include Semantic UI - 2.2.14 (http://www.semantic-ui.com/)
* Include jQuery v3.3.1 (https://jquery.com/)
* Include AngularJS v1.6.9 (https://angularjs.org)
* Include CSV-JS v1.1.1 (https://github.com/gkindel/CSV-JS)
*
*/

var dataRoot = 'tpcdata/case15/';

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
    var MIN = 0;
    var MAX = 127;
    // 出力用テーブルを初期化
    var tmpLmtTbl = [
        [MIN, MAX, 0],   // Auto
        [MIN, MAX, 0],   // Cool
        [MIN, MAX, 0],   // Heat
        [MIN, MAX, 0],   // C.Auto.Cool
        [MIN, MAX, 0]    // C.Auto.Heat
    ];

    var dyTmpLmtTbl = [
        [-1, -1, 1],   // Auto
        [-1, -1, 1],   // Cool
        [-1, -1, 1],   // Heat
        [-1, -1, 1],   // C.Auto.Cool
        [-1, -1, 1]    // C.Auto.Heat
    ];

    var deadBand = MIN;
    // 静的温度上下限を取得（And取り）
    localCalStaTmpLmt();

    // 運転モード混在
    if (localIsModeMixed()) {
        return tmpLmtTbl;
    }
    // 動的温度を修正
    localCorrectTemp();
    // 動的温度範囲取得

    localGetDymTmp();
    // 静的範囲と動的範囲And取り
    localGetStaAndDynTmp();
    // デッドバンド確保
    if (tmpLmtTbl[3][2] === 1 || tmpLmtTbl[4][2] === 1) {
        // 冷暖別自動冷暖房温度補正
        var tunedTmp = localTuneCoolHeat(tmpLmtTbl[3], tmpLmtTbl[4]);
        tmpLmtTbl[3][0] = tunedTmp[0];
        tmpLmtTbl[4][1] = tunedTmp[1];
    }

    /****************************************************************
     * localCalStaTmpLmt 静的温度範囲及びデッドバンドの最大値を取得得
     ****************************************************************/
    function localCalStaTmpLmt() {
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
                tmpLmtTbl[2][0] = Math.max(   // Heat下限値
                    tmpLmtTbl[2][0],
                    parseFloat(selR03[i][39]) * 2
                );
                tmpLmtTbl[2][1] = Math.min(  // Heat上限値
                    tmpLmtTbl[2][1],
                    parseFloat(selR03[i][40]) * 2
                );
                tmpLmtTbl[2][2] = 1;  //　機能フラグ：ありにする
            }
            // 冷房：機能あり
            if (parseInt(selR03[i][20]) === 1) {
                tmpLmtTbl[1][0] = Math.max(   // Cool下限値
                    tmpLmtTbl[1][0],
                    parseFloat(selR03[i][41]) * 2
                );
                tmpLmtTbl[1][1] = Math.min(  // Cool上限値
                    tmpLmtTbl[1][1],
                    parseFloat(selR03[i][42]) * 2
                );
                tmpLmtTbl[1][2] = 1;  //　機能フラグ：ありにする
            }
        }
    }

    /**********************************************************************
     * method localIsModeMixed 運転モード判定
     * return {Boolean}  true: 混在 false: 単一
     *********************************************************************/
    function localIsModeMixed() {
        var this_value = selR02[0][9] === 7 ? 3 : selR02[0][9]; // 新自動の場合
        var temp;
        for (var i = 1; i < selR02.length; i++) {
            temp = selR02[i][9] === 7 ? 3 : selR02[i][9];
            if (this_value !== temp) {
                return true;
            }
        }
        return false;
    }

    /**********************************************************************
     * method localTuneCoolHeat 冷暖別自動冷暖房温度補正
     * param {Array<Number>} coolTbl: Cool温度上下限、機能情報
     * param {Array<Number>} heatTbl: Heat温度上下限、機能情報
     * return {Array<Number>} tunedTmpTbl: 補正した温度(冷房下限値、暖房上限値)
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

    /**********************************************************************
     * method localCorrectTemp R15に機能無しの温度を-1に修正
     *********************************************************************/
    function localCorrectTemp() {
        for (var i = 0; i < selR15.length; i++) {
            if (selR03[i][18] === 0 || selR03[i][81] === 1) { // Auto
                selR15[i][3] = selR15[i][4] = -1;
            }
            if (selR03[i][19] === 0) { // Heat
                selR15[i][5] = selR15[i][6] = -1;
            }
            if (selR03[i][20] === 0) { // Cool
                selR15[i][7] = selR15[i][8] = -1;
            }
        }
    }


    /**********************************************************************
     * method localGetDymTmp 動的温度集約
     *********************************************************************/
    function localGetDymTmp() {
        // Auto
        dyTmpLmtTbl[0][0] = localGetValue(3);
        dyTmpLmtTbl[0][1] = localGetValue(4);
        if (dyTmpLmtTbl[0][0] === -1 || dyTmpLmtTbl[0][1] === -1) {
            dyTmpLmtTbl[0][2] = 0;
        }
        // Cool
        dyTmpLmtTbl[1][0] = localGetValue(7);
        dyTmpLmtTbl[1][1] = localGetValue(8);
        if (dyTmpLmtTbl[1][0] === -1 || dyTmpLmtTbl[1][1] === -1) {
            dyTmpLmtTbl[1][2] = 0;
        }
        // Heat
        dyTmpLmtTbl[2][0] = localGetValue(5);
        dyTmpLmtTbl[2][1] = localGetValue(6);
        if (dyTmpLmtTbl[2][0] === -1 || dyTmpLmtTbl[2][1] === -1) {
            dyTmpLmtTbl[2][2] = 0;
        }
        // C.Cool
        dyTmpLmtTbl[3][0] = dyTmpLmtTbl[1][0];
        dyTmpLmtTbl[3][1] = dyTmpLmtTbl[1][1];
        if (dyTmpLmtTbl[3][0] === -1 || dyTmpLmtTbl[3][1] === -1) {
            dyTmpLmtTbl[3][2] = 0;
        }
        // C.Heat
        dyTmpLmtTbl[4][0] = dyTmpLmtTbl[2][0];
        dyTmpLmtTbl[4][1] = dyTmpLmtTbl[2][1];
        if (dyTmpLmtTbl[4][0] === -1 || dyTmpLmtTbl[4][1] === -1) {
            dyTmpLmtTbl[4][2] = 0;
        }

    }

    /**********************************************************************
     * method localGetValue 対象列集約をする
     * param {Number} idx 対象列のインデクス
     * return {Number} -1 混在、集約失敗 集約値
     *********************************************************************/
    function localGetValue(idx) {
        var value = -1;
        for (var i = 0; i < selR15.length; i++) {
            if (selR15[i][idx] === -1) {  //機能無し
                continue;
            }
            if (value === -1) {
                value = selR15[i][idx];
            } else if (value !== selR15[i][idx]) {
                return -1;
            }
        }
        return value;
    }

    /**********************************************************************
     * localGetStaAndDynTmp 静的と動的AND取り
     *********************************************************************/
    function localGetStaAndDynTmp() {
        for (var i = 0; i < 5; i++) {
            if (tmpLmtTbl[i][2] === 1 &&
                dyTmpLmtTbl[i][2] === 1 &&
                dyTmpLmtTbl[i][0] < dyTmpLmtTbl[i][1]) {
                if (dyTmpLmtTbl[i][0] >= tmpLmtTbl[i][0]) { // 静的範囲超えな
                    tmpLmtTbl[i][0] = dyTmpLmtTbl[i][0];
                }
                if (dyTmpLmtTbl[i][1] <= tmpLmtTbl[i][1]) {
                    tmpLmtTbl[i][1] = dyTmpLmtTbl[i][1];
                }
            }
        }
    }

    return tmpLmtTbl;
}

module.exports = calTmpLmt;
