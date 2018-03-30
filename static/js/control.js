/*
* # Remote Touch Panel Controller
*
* http://www.fujitsu-general.com/jp/
*
* waterfall -v4.0 (2018-02-26T10:48:25+09)
*
* Copyright 2018 FUJITSU GENERAL LIMITED.
*
* Released under the MIT license
*
* http://opensource.org/licenses/MIT
*
* Include AngularJS v1.6.9 (https://angularjs.org)
* Include Semantic UI - 2.2.14 (http://www.semantic-ui.com/)
* Include jQuery v3.3.1 (https://jquery.com/)
* Include CSV-JS v1.1.1 (https://github.com/gkindel/CSV-JS)
*
*/


/**
 * DropDownListを活性化
 * @module activateDropDown
 * @author ZHAO Zhongwen 2018/02/16
 * @param {number} min 最小値 (0~127)
 * @param {number} max 最大値 (0~127)
 * @param {string} elemID DropDown要素id
 *
 */
function activateDropDown(min, max, elemID) {
    let selElm = angular.element(document.getElementById(elemID));
    selElm.dropdown('restore default text');
    selElm
        .dropdown({
            values: new TempRange(min, max).tempList
        })
    ;
}

/**
 * DropDownListを非活性化
 * @module unactivateDropDown
 * @author ZHAO Zhongwen 2018/02/20
 * @param {string} elemID DropDown要素id
 *
 */
function unactivateDropDown(elemID) {
    let selElm = angular.element(document.getElementById(elemID));
    selElm.addClass('disabled');
}

/**
 * 機能有り無しラベル制御
 * @module ctlFunLabel
 * @author ZHAO Zhongwen 2018/02/20
 * @param {number} flg 機能有無情報：0無し、１有り
 * @param {string} elemID ラベル要素ID
 *
 */
function ctlFunLabel(flg, elemID) {
    let selElm = angular.element(document.getElementById(elemID));
    if (flg === 1) {
        selElm.hide();
    } else if (flg === 0) {
        selElm.show();
    }
}

/**
 * DropDown及びラベル描画
 * @module setDropDown
 * @param {Array<Array>} tmpLmtTbl 温度上下限テーブル
 *
 */

function setDropDown(tmpLmtTbl) {
    // 温度上下限を読み込む
    var drpDnIdTbl = ['auto', 'cool', 'heat', 'cautocool', 'cautoheat', 'mix'];
    var funLabIdTbl = [
        'funLabAuto',
        'funLabCool',
        'funLabHeat',
        'funLabCCool',
        'funLabCHeat'
    ];
    for (var i = 0; i < drpDnIdTbl.length; i++) {
        activateDropDown(tmpLmtTbl[i][0], tmpLmtTbl[i][1], drpDnIdTbl[i]);
        ctlFunLabel(tmpLmtTbl[i][2], funLabIdTbl[i]);
        if (tmpLmtTbl[i][2] === 0) {
            unactivateDropDown(drpDnIdTbl[i]);
        }
    }
    // 混在ラベル
    if (tmpLmtTbl[5][2] === 1) {
        angular.element(document.getElementById('funLabMixed')).show();
    }
}

