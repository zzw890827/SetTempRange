/**
 * ローカルファイルを読み込む
 * <p>
 *     1. Ajaxを使ってローカルファイルを読み込む
 *     2. 読み込まれたデータを配列に格納
 * </p>
 * @module readLocalFile
 * @author ZHAO Zhongwen 2018/02/16
 * @param {Array<number>} aryData 格納用データ
 * @param {string} path ローカルファイルの場所
 * @return {Object} jqXHR jqueryオブジェクト
 *
 */
function readLocalFile(aryData, path) {
    let jqXHR;
    jqXHR = $.ajax({
        url: path,      // 元データの場所
        type: 'GET',    // 取得
        async: false,   // 同期
        success: function (data) {
            // CSVデータを二次元配列に格納
            (new CSV(data)).forEach(e => {
                aryData.push(e);
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR.responseText);
            console.log(jqXHR.status);
            console.log(jqXHR.readyState);
            console.log(jqXHR.statusText);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
    return jqXHR;
}
