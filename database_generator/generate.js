#!/usr/bin/env node

var fs = require("fs");
var path = require("path");

var result = {};
var ignored = {};

var answerCount = {tf: 0, ms: 0, dup: 0, conflict: 0};

function stripUnimportantChars(str) {
    return str.replace(/[ 　\t\r\n,，\.。:：“”《》？?！!~～｀`【】()_—\-＿－（）<>、\/\\"'`]/mg, "").toLowerCase();
}

function parseAnswer(answer) {
    answer = answer.toLowerCase();
    if (answer == 0 || answer == 'false' || answer == 'no')
        return false;

    if (answer == 1 || answer == 'true' || answer == 'yes')
        return true;

    //单选题答案
    return stripUnimportantChars(answer);
}


function updateCount(answer, amount) {
    if (typeof answer == 'boolean')
        answerCount.tf += amount;
    else
        answerCount.ms += amount;
}
function readFile(fileName) {

    var fContent = ('[' + fs.readFileSync(fileName, {encoding: "utf8"}) + ']').replace(/[\r\n]/mg, '');

    if (fContent.substring(fContent.length - 2) == ',]')
        fContent = fContent.substring(0, fContent.length - 2) + ']';

    try {
        fContent = JSON.parse(fContent);
    } catch (exception) {
        console.error('读取' + fileName + '失败，请确定是UTF8编码，且格式正确。');
        console.error(exception);
    }

    for (var i = 0; i < fContent.length; i++) {

        var answer = parseAnswer(fContent[i][1]);
        var text = stripUnimportantChars(fContent[i][0]);
        if (ignored[text]) {
            console.warn('已经忽略答案自相矛盾的题目：' + fContent[i][0]);
            continue;
        }

        if (typeof result[text] != 'undefined') {
            answerCount.dup++;
            // console.warn('重复的题目：' + fContent[i][0]);
            if (result[text] != answer) {
                console.error('重复的题目，不同的答案！：' + fContent[i][0] + '答案1：' + answer + "，答案2：" + result[text]);
                answerCount.conflict++;
                updateCount(answer, -1);
                ignored[text] = true;
                delete result[text];
            }

            continue;
        }
        updateCount(answer, 1);

        result[text] = answer;
    }
}


var dirPath = 'rawdata';
var files = fs.readdirSync(dirPath);
for (var n = 0; n < files.length; n++) {
    var file = path.join(dirPath, files[n]);
    readFile(file);
}


fs.writeFileSync("database.js",
    'var fdty_database=' +
    JSON.stringify(result)
    , {encoding: "utf8"}
);

console.log('\n已经写入database.js, \n成功生成是非题' + answerCount.tf + "题，单选题" + answerCount.ms + "题。" +
    (answerCount.dup > 0 ? ( "\n有" + answerCount.dup + "题重复了，已跳过。" ) : "") +
    (answerCount.conflict > 0 ? ("\n有" + answerCount.conflict + "题答案自相矛盾，已删除。") : ""));