const fs = require("fs");

const result = [];

let lines = fs.readFileSync("./raw", {encoding: "UTF-8"}).replace(/\r/g, '').split("\n");

lines = lines.filter(_ => _.match(/^\d+、(.+)$/));
lines.forEach(line => {
    let body = line.match(/^\d+、(.+)$/)[1];
    let key = body.match(/\[(.+?)]/);
    if (!key || !key[1]) {
        console.warn("cannot parse " + body);
    }

    body = body.replace(/\[(.+?)]/, '');

    result.push(JSON.stringify([body, key[1].trim().toUpperCase()]))
});


lines = fs.readFileSync("./tf", {encoding: "UTF-8"}).replace(/\r/g, '').split("\n");

lines = lines.filter(_ => _.match(/^\d+、(.+)$/));
lines.forEach(line => {
    let body = line.match(/^\d+、(.+)$/)[1];
    let key = body.match(/\[(.+?)]/);
    if (!key || !key[1] || ['√', '×'].indexOf(key[1]) < 0) {
        console.warn("cannot parse " + body);
    }

    body = body.replace(/\[(.+?)]/, '');

    result.push(JSON.stringify([body, ({'√': "TRUE", '×': "FALSE"})[key[1].trim()]]))
});

fs.writeFileSync("generated_paiqiu.txt", result.join(",\n") + ",\n", {encoding: "UTF-8"});

