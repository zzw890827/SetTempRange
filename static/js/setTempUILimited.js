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

var dataRoot = 'tpcdata/case27/';

/***********************************************************
 * 温度上下限を算出
 * <p>
 *     1. 運転モードを判定（単一/混在）
 *     2. 静的範囲算出
 *     3. 動的範囲算出
 *     4. 静的範囲∩動的範囲
 *     5. デッドバンド補正（必要あれば）
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
    // 初期化
    var MIN = 0;
    var MAX = 126;
    // 出力用テーブルを初期化

    // 運転モードと温度テーブルの指定関係
    var map_obj = {
        0: 1,  // 冷房
        2: 2,  // 暖房
        3: 0,  // 自動
        7: 5,
        1: 1
    };

    var tmpLmtTbl = [
        [MIN, MAX, 0],   // Auto
        [MIN, MAX, 0],   // Cool
        [MIN, MAX, 0],   // Heat
        [MIN, MAX, 0],   // C.Auto.Cool
        [MIN, MAX, 0],   // C.Auto.Heat
        [MIN, MAX, 1]    // Mix
    ];

    var dyTmpLmtTbl = [
        [MIN, MAX],   // Auto
        [MIN, MAX],   // Cool
        [MIN, MAX],   // Heat
        [MIN, MAX],   // C.Auto.Cool
        [MIN, MAX]    // C.Auto.Heat
    ];

    var deadBand = MIN;

    // 運転モードを判定（単一/混在）
    var current_mode = localCheckMode();

    // 静的温度上下限を取得（And取り）
    localCalStaTmpLmt();

    // 動的温度範囲取得
    localGetDymTmp();

    // 静的範囲と動的範囲And取り
    if (current_mode !== 5) {   //単一運転モード
        var rstTmp = [];
        for (var i = 0; i < 5; i++) {
            rstTmp = localGetStaAndDynTmp(tmpLmtTbl[i], dyTmpLmtTbl[i]);
            tmpLmtTbl[i][0] = rstTmp[0];
            tmpLmtTbl[i][1] = rstTmp[1];
        }
        tmpLmtTbl[5][0] = tmpLmtTbl[map_obj[current_mode]][0];
        tmpLmtTbl[5][1] = tmpLmtTbl[map_obj[current_mode]][1];
        tmpLmtTbl[5][2] = 0;
    } else {
        rstTmp = [];
        for (i = 3; i < 5; i++) {
            rstTmp = localGetStaAndDynTmp(tmpLmtTbl[i], dyTmpLmtTbl[i]);
            tmpLmtTbl[i][0] = rstTmp[0];
            tmpLmtTbl[i][1] = rstTmp[1];
        }
        // 混在値
        tmpLmtTbl[5][0] = Math.max(
            Math.max(tmpLmtTbl[0][0], tmpLmtTbl[1][0]),
            tmpLmtTbl[2][0]);
        tmpLmtTbl[5][1] = Math.min(
            Math.min(tmpLmtTbl[0][1], tmpLmtTbl[1][1]),
            tmpLmtTbl[2][1]);
    }
    // デッドバンド確保
    if (tmpLmtTbl[3][2] === 1 || tmpLmtTbl[4][2] === 1) {
        // 冷暖別自動冷暖房温度補正
        var tunedTmp = localTuneCoolHeat(tmpLmtTbl[3], tmpLmtTbl[4]);
        tmpLmtTbl[3][0] = tunedTmp[0];
        tmpLmtTbl[4][1] = tunedTmp[1];
    }

    /****************************************************************
     * localCheckMode 運転モードを判定（単一/混在）
     * return: 0:Cool 1:Dry 2:Heat 3:Auto 4:Fan 5:Mix 6:NoFunc 7:CAuto
     ****************************************************************/
    function localCheckMode() {
        var current_mode = -1;
        for (var i = 0; i < selR02.length; i++) {
            if (current_mode !== selR02[i][9]) {
                if (current_mode === -1
                    && selR02[i][9] !== 4     // Fan
                    && selR02[i][9] !== 7) {  // C.Auto
                    current_mode = selR02[i][9];
                } else if (current_mode !== selR02[i][9]
                    && selR02[i][9] !== 4
                    && selR02[i][9] !== 7) {
                    return 5;
                }
            }
        }
        if (current_mode === -1) {
            current_mode = 7;
        }
        return current_mode;
    }

    /****************************************************************
     * localCalStaTmpLmt 静的温度範囲及びデッドバンドの最大値を取得
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

        // 逆転防止
        if (tunedTmpLmtTbl[0] > coolTbl[1]) {
            tunedTmpLmtTbl[0] = coolTbl[1];
        }
        if (tunedTmpLmtTbl[1] < heatTbl[0]) {
            tunedTmpLmtTbl[1] = heatTbl[0];
        }

        return tunedTmpLmtTbl;
    }

    /**********************************************************************
     * method localGetDymTmp 動的温度集約
     *********************************************************************/
    function localGetDymTmp() {
        for (var i = 0; i < selR15.length; i++) {
            if (selR15[i][1] === 1) { // 有効に設定
                if (parseInt(selR03[i][18]) === 1 &&   // Auto：
                    parseInt(selR03[i][81]) === 0) {
                    dyTmpLmtTbl[0][0] = Math.max(      // Auto下限値
                        dyTmpLmtTbl[0][0],
                        parseFloat(selR15[i][3])
                    );
                    dyTmpLmtTbl[0][1] = Math.min(    // Auto上限値
                        dyTmpLmtTbl[0][1],
                        parseFloat(selR15[i][4])
                    );
                } else if (parseInt(selR03[i][81]) === 1) { //　冷暖別あり
                    dyTmpLmtTbl[3][0] = Math.max(   // 冷暖別Cool下限値
                        dyTmpLmtTbl[3][0],
                        parseFloat(selR15[i][7])
                    );
                    dyTmpLmtTbl[3][1] = Math.min(  // 冷暖別Cool上限値
                        dyTmpLmtTbl[3][1],
                        parseFloat(selR15[i][8])
                    );
                    dyTmpLmtTbl[4][0] = Math.max(   // 冷暖別Heat下限値
                        dyTmpLmtTbl[4][0],
                        parseFloat(selR15[i][5])
                    );
                    dyTmpLmtTbl[4][1] = Math.min(   // 冷暖別Heat上限値
                        dyTmpLmtTbl[4][1],
                        parseFloat(selR15[i][6])
                    );
                }
                // 暖房：機能あり
                if (parseInt(selR03[i][19]) === 1) {
                    dyTmpLmtTbl[2][0] = Math.max(   // Heat下限値
                        dyTmpLmtTbl[2][0],
                        parseFloat(selR15[i][5])
                    );
                    dyTmpLmtTbl[2][1] = Math.min(  // Heat上限値
                        dyTmpLmtTbl[2][1],
                        parseFloat(selR15[i][6])
                    );
                }
                // 冷房：機能あり
                if (parseInt(selR03[i][20]) === 1) {
                    dyTmpLmtTbl[1][0] = Math.max(   // Cool下限値
                        dyTmpLmtTbl[1][0],
                        parseFloat(selR15[i][7])
                    );
                    dyTmpLmtTbl[1][1] = Math.min(  // Cool上限値
                        dyTmpLmtTbl[1][1],
                        parseFloat(selR15[i][8])
                    );
                }
            }
        }
    }

    /**********************************************************************
     * method localGetStaAndDynTmp 静的と動的AND取り
     * param: {Array<Number>} staTmp: 静的温度範囲二次元配列
     * param: {Array<Number>} dymTmp: 動的温度範囲
     * return: {Array<Number>} And後の温度上下限
     *********************************************************************/
    function localGetStaAndDynTmp(staTmp, dymTmp) {
        if (dymTmp[1] < dymTmp[0] || staTmp[2] === 0) { // 動的は逆転している
            return staTmp;
        }
        var result = [];
        result[0] = Math.max(staTmp[0], dymTmp[0]);
        result[1] = Math.min(staTmp[1], dymTmp[1]);

        return result;

    }

    return tmpLmtTbl;

}

module.exports = calTmpLmt;
