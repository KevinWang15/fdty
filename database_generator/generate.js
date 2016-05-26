#!/usr/bin/env node

var fs = require("fs");
var path = require("path");

var result = {};


function stripUnimportantChars(str) {
    return str.replace(/[ 　\t\r\n,，\.。:：“”《》【】()_—\-＿－（）<>、\/\\"'`]/mg, "").toLowerCase();
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

    for (var i = 0; i < fContent.length; i++)
        result[stripUnimportantChars(fContent[i][0])] = parseAnswer(fContent[i][1]);
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