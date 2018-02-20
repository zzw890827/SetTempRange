/*
* # Remote Touch Panel Controller
*
* http://www.fujitsu-general.com/jp/
*
* waterfall -v4.0 (2018-02-16T16:37:41+0900)
*
* Copyright 2018 FUJITSU GENERAL LIMITED.
*
* Released under the MIT license
*
* http://opensource.org/licenses/MIT
*
* Include Semantic UI - 2.2.14 (http://www.semantic-ui.com/)
* Include jQuery v3.3.1 (https://jquery.com/)
* Include CSV.js v3.3.6 (https://github.com/knrz/CSV.js)
*
*/


/**
 * アプリメーンモジュール
 * @module main
 *
 */
function main() {
    // 温度上下限を読み込む
    var tmpLmtTbl = setTempUILimited();
    var drpDnIdTbl = [
        '#auto', '#cool', '#heat', '#cautocool', '#cautoheat'
    ];
    var funLabIdTbl = [
        '#funLabAuto',
        '#funLabCool',
        '#funLabHeat',
        '#funLabCCool',
        '#funLabCHeat',
    ];
    for (var i = 0; i < drpDnIdTbl.length; i++) {
        activateDropDown(tmpLmtTbl[i][0], tmpLmtTbl[i][1], drpDnIdTbl[i]);
        ctlFunLabel(tmpLmtTbl[i][2], funLabIdTbl[i]);
        if (tmpLmtTbl[i][2] === 0) {
            unactivateDropDown(drpDnIdTbl[i]);
        }
    }
}
