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
    let selElm = $(elemID);
    selElm
        .dropdown('restore default text')
    ;
    selElm
        .dropdown({
            values: new TempRange(min, max).tempList.reverse()
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
    let selElm = $(elemID);
    selElm
        .addClass('disabled')
    ;
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
    let selElm = $(elemID);
    if (flg === 1) {
        selElm.hide();
    } else if (flg === 0) {
        selElm.show();
    }
}
