/**
 * DropDownListを活性化
 * @module activateDropDown
 * @author ZHAO Zhongwen 2018/02/16
 * @param {number} min 最小値 (0~127)
 * @param {number} max 最大値 (0~127)
 * @param {string} elemID プルダウン要素id
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
