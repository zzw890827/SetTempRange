const calTmpLmt = require('../static/js/setTempUILimited');
const fs = require('fs');
const CSV = require('../static/vendor/csv');

describe('Name: Zhao', () => {
    let selR02;
    let selR03;
    let selR15;
    let ref;
    const totalCase = 15;
    for (let i = 0; i < totalCase; i++) {
        (num => {
            test('case' + ('00' + (num + 1).toString()).slice(-2), () => {
                let caseRoot = './tpcdata/case'
                    + ('00' + (num + 1).toString()).slice(-2) + '/';
                let r02Path = caseRoot + 'R02monUnit.csv';
                let r03Path = caseRoot + 'R03infUnit.csv';
                let r15Path = caseRoot + 'R15tempSet.csv';
                let refPath = caseRoot + 'reference.txt';
                selR02 = CSV.parse(fs.readFileSync(r02Path).toString());
                selR03 = CSV.parse(fs.readFileSync(r03Path).toString());
                selR15 = CSV.parse(fs.readFileSync(r15Path).toString());
                ref = CSV.parse(fs.readFileSync(refPath).toString());
                expect(calTmpLmt(selR02, selR03, selR15)).toEqual(ref);
            })
        })(i)
    }
});
