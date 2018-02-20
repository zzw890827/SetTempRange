/**
 * RCGクラス
 * <p>
 *     選ばれたRCGオブジェクト
 * </p>
 * @class SelRCG
 */
let SelRCG;
SelRCG = function () {
    /**
     * @constructor
     * @param {string} path データの保存場所
     */
    function SelRCG(path) {
        this.selR02 = [];
        this.selR03 = [];
        this.selR15 = [];
        let selR02_path = `${path}R02monUnit.csv`;
        let selR03_path = `${path}R03infUnit.csv`;
        let selR15_path = `${path}R15tempSet.csv`;
        readLocalFile(this.selR02, selR02_path);
        readLocalFile(this.selR03, selR03_path);
        readLocalFile(this.selR15, selR15_path);
    }

    return SelRCG;
}();
