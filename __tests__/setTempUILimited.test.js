const calTmpLmt = require('../static/js/setTempUILimited');
const $ = require('jquery');
const Sample = require('../sample/sample');


describe('Zhao', () => {
    const sample = new Sample;
    const testNameList = ['1st', '2nd', '3rd'];

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

describe('Usui', () => {
    const sample = new Sample;
    const testNameList = ['1st', '2nd', '3rd'];

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

describe('Tsuji', () => {
    const sample = new Sample;
    const testNameList = ['1st', '2nd', '3rd'];

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