const calTmpLmt = require('../static/js/setTempUILimited');
const $ = require('jquery');
const Sample = require('../sample/sample');


describe('Normal Test', () => {
    const sample = new Sample;
    const testNameList = ['First', 'Second'];

    for (var i = 0; i < testNameList.length; i++) {
        (num => { // JSの仕組みによりclosureを設定すること
            test(testNameList[num], () => {
                expect(calTmpLmt(
                    sample.selR02Tbl[num],
                    sample.selR03Tbl[num],
                    sample.selR15Tbl[num])).toEqual(sample.refTbl[num]);
            })
        })(i)
    }

});
