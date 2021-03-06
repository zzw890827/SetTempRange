/*
* # Remote Touch Panel Controller
*
* http://www.fujitsu-general.com/jp/
*
* waterfall -v4.0 (2018-02-26T10:48:12+09)
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
 * 静的情報クラス
 * <p>
 *     R03の情報
 * </p>
 * @class StaticInfo
 */

var StaticInfo = (function () {
    /**
     *
     * @param {Array<Number>} arrR03 R03情報
     * @constructor
     */
    function StaticInfo(arrR03) {
        this.rcgID = arrR03[0];
        this.hasAuto = arrR03[18] === 1 && arrR03[81] !== 1;
        this.hasCAuto = arrR03[81] === 1;
        this.hasCool = arrR03[20] === 1;
        this.hasHeat = arrR03[19] === 1;
        this.lowLmtAuto = arrR03[18] === 1 && arrR03[81] !== 1 ?
            arrR03[37] : -1;
        this.upLmtAuto = arrR03[18] === 1 && arrR03[81] !== 1 ?
            arrR03[38] : -1;
        this.lowLmtCool = arrR03[20] === 1 ? arrR03[41] : -1;
        this.upLmtCool = arrR03[20] === 1 ? arrR03[42] : -1;
        this.lowLmtHeat = arrR03[19] === 1 ? arrR03[39] : -1;
        this.upLmtHeat = arrR03[19] === 1 ? arrR03[40] : -1;
        this.deadBand = arrR03[81] === 1 ? arrR03[82] : -1;
    }

    return StaticInfo;
}());

/**
 * 動的情報クラス
 * <p>
 *     R02とR15情報
 * </p>
 * @class DynamicInfo
 */

var DynamicInfo = (function () {
    /**
     *
     * @param {Array<Number>} arrR02 運転情報
     * @param {Array<Number>} arrR03 機能情報
     * @param {Array<Number>} arrR15 温度情報
     * @constructor
     */
    function DynamicInfo(arrR02, arrR03, arrR15) {
        this.rcgID = arrR03[0];
        this.mode = MODE_TABLE[arrR02[9]];
        this.lowLmtAuto = arrR03[18] === 1 && arrR03[81] !== 1 ?
            arrR15[3] / 2 : -1;
        this.upLmtAuto = arrR03[18] === 1 && arrR03[81] !== 1 ?
            arrR15[4] / 2 : -1;
        this.lowLmtHeat = arrR03[19] === 1 ? arrR15[5] / 2 : -1;
        this.upLmtHeat = arrR03[19] === 1 ? arrR15[6] / 2 : -1;
        this.lowLmtCool = arrR03[20] === 1 ? arrR15[7] / 2 : -1;
        this.upLmtCool = arrR03[20] === 1 ? arrR15[8] / 2 : -1;
    }

    return DynamicInfo;
}());

/**
 * 設定温度上下限データ
 */
var TempData = /** @class */ (function () {
    function TempData(name, value) {
        this.name = name;     // 表示温度
        this.value = value;   // 内部値
    }

    return TempData;
}());

/**
 * 設定温度上下限リスト
 */
var TempRange = /** @class */ (function () {
    function TempRange(min, max) {
        this.tempList = [];
        // 温度リストを作成
        if (min >= 0 && min <= 127) {
            for (let i = min, j = 0; i <= max; i++) {
                this.tempList[j++] = new TempData(TEMP_TABLE[i] + '℃', i);
            }
        }
    }

    return TempRange;
}());

/**
 * 定数：温度テーブル
 * @type {string[]}
 */

var TEMP_TABLE = [
    '0.0', '0.5', '1.0', '1.5', '2.0',
    '2.5', '3.0', '3.5', '4.0', '4.5',
    '5.0', '5.5', '6.0', '6.5', '7.0',
    '7.5', '8.0', '8.5', '9.0', '9.5',
    '10.0', '10.5', '11.0', '11.5', '12.0',
    '12.5', '13.0', '13.5', '14.0', '14.5',
    '15.0', '15.5', '16.0', '16.5', '17.0',
    '17.5', '18.0', '18.5', '19.0', '19.5',
    '20.0', '20.5', '21.0', '21.5', '22.0',
    '22.5', '23.0', '23.5', '24.0', '24.5',
    '25.0', '25.5', '26.0', '26.5', '27.0',
    '27.5', '28.0', '28.5', '29.0', '29.5',
    '30.0', '30.5', '31.0', '31.5', '32.0',
    '32.5', '33.0', '33.5', '34.0', '34.5',
    '35.0', '35.5', '36.0', '36.5', '37.0',
    '37.5', '38.0', '38.5', '39.0', '39.5',
    '40.0', '40.5', '41.0', '41.5', '42.0',
    '42.5', '43.0', '43.5', '44.0', '44.5',
    '45.0', '45.5', '46.0', '46.5', '47.0',
    '47.5', '48.0', '48.5', '49.0', '49.5',
    '50.0', '50.5', '51.0', '51.5', '52.0',
    '52.5', '53.0', '53.5', '54.0', '54.5',
    '55.0', '55.5', '56.0', '56.5', '57.0',
    '57.5', '58.0', '58.5', '59.0', '59.5',
    '60.0', '60.5', '61.0', '61.5', '62.0',
    '62.5', '63.0', '63.5'
];

/**
 * 運転状態テーブル
 * @type {string[]}
 */
var MODE_TABLE = [
    '冷房', '除湿', '暖房', '自動', '送風', '混在', '機能無し', '冷暖別自動'
];
