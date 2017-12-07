/**
 * =======================================
 * 复旦体育考试-自动答题机器
 * =======================================
 * 方便易用，基于Chrome，兼容所有操作系统。
 * 自动读取网页、匹配题库，瞬间出答案、自动勾选，节省时间。
 *
 * https://github.com/KevinWang15/fdty
 *
 * 求完善题库，请发Pull Request
 *
 * By 王轲 (KevinWang)
 * 2017-5-12
 */

(function () {

    var base_url;

    if (!window.fdty_src) {
        console.error("复旦体育理论考试-自动答题机器已经更新，请至https://github.com/KevinWang15/fdty查看。");
        return;
    } else {
        base_url = window.fdty_src.replace(/fdty.js$/, '')
    }

    function stripUnimportantChars(str) {
        return str.replace(/[ 　\t\r\n,，\.。:：“”《》？?！!~～｀`【】()_—\-＿－（）<>、\/\\"'`]/mg, "").toLowerCase();
    }

    function getRadioButtonElement(id, answer) {
        return $('input', $('#repVer_rbtn_ver_' + id)).filter(function (_, item) {
            return (+item.value == +answer);
        })[0];
    }

    function getRadioButtonElementForMultipleSelection(id, answer) {
        answer = stripUnimportantChars(answer);
        return window.jQuery('#repSin_RadioButtonList1_' + id + '_' + {'a': 0, 'b': 1, 'c': 2, 'd': 3}[answer] + "_" + id);
    }

    function doWork(panelElement, questionType) {
        //主要算法在此。

        console.info('%c【 ' + questionType + ' 】','color:#2196F3;text-shadow:#00bcd4 0px 0px 2px;font-size:14px;margin:0 -6px');
        if (questionType == '单选题')
            console.log('%c体教部网站修改了体育理论考试系统，单选题自动勾选未经测试，请仔细核对！%c\n> 报告问题： https://github.com/KevinWang15/fdty/issues', 'color: orange;', 'color: #AAA;');

        var html = panelElement.html();
        var questions = [];

        var successCount = 0;
        var questionI = -1;

        var regexp = /(\d+)\s*\n\s*\.\s*\n\s*(.+?)$/mg;
        var match = regexp.exec(html);
        while (match != null) {
            questions.push({id: +match[1], text: match[2]});
            match = regexp.exec(html);
        }
        questions.forEach(function (question) {
            questionI++;

            var strippedText = stripUnimportantChars(question.text);
            var answer = window.fdty_database[strippedText];

            if (typeof answer == 'undefined') {
                answer = tryFindSimilar(question.text);
                if (typeof answer == 'undefined') {
                    console.error('【题库中没有答案！】', question.text);
                    return;
                }
            }

            successCount++;


            if (answer === true)
                console.log((questionI + 1) + "." + '%c√正确 %c' + question.text, 'color: green', 'color: black');
            else if (answer === false)
                console.log((questionI + 1) + "." + '%c×错误 %c' + question.text, 'color: red', 'color: black');
            else {
                console.log((questionI + 1) + "." + '%c答案：' + answer + ' %c' + question.text, 'color: orange', 'color: black');
            }

            //自动勾选是非题
            if (answer === true || answer === false) {
                getRadioButtonElement(questionI, answer).click();
            }
            else {
                getRadioButtonElementForMultipleSelection(questionI, answer).click();
            }
        });

        console.info('总共' + questions.length + "题，匹配成功" + successCount + "题。\n　");
    }


    //以下为加载器
    function loadScript(url, callback) {
        var script = document.createElement("script");
        script.type = "text/javascript";

        if (script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else {
            script.onload = function () {
                callback();
            };
        }

        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    }

    function tryFindSimilar(text) {
        // 若都选择否，则返回undefined
        var text_core_strip_parentheses = stripUnimportantChars(text.replace(/(\(.+?\)|（(.+?)）|【(.+?)】|\[(.+?)\])/mg, ""));
        var text_core = stripUnimportantChars(text);
        var threshold = text_core.length * 0.22;
        for (var key in window.fdty_database) {
            if (!window.fdty_database.hasOwnProperty(key))
                continue;

            var possible = false;

            //尝试Levenshtein
            var LevenshteinDistance = new Levenshtein(text_core, key).distance;
            if (LevenshteinDistance <= threshold)
                possible = true;

            //尝试包含
            if (key.indexOf(text_core_strip_parentheses) >= 0)
                possible = true;

            if (possible) {
                if (confirm(text + '\n' + key + '\n这两题是否一样？')) {
                    return window.fdty_database[key];
                }
            }
        }
        return undefined;
    }


    loadScript(base_url + "lib/jquery.min.js", function () {
        loadScript(base_url + "lib/levenshtein.js", function () {
            var IntervalId = 0;
            console.info('请在考试界面中运行本程序哦！\n点击“开始考试”，能看到题目，计时器开始走，然后将Chrome开发者工具的“top”下拉菜单调整到paper(stexampaperV1.aspx)后。');
            console.info('正在寻找页面中的题目…');
            IntervalId = setInterval(function () {
                var panelElement = window.jQuery('#Panel3');
                if (!!panelElement && !!panelElement.html()) {
                    clearInterval(IntervalId);
                    IntervalId = -9999;
                    console.info('成功找到题目！');
                    console.info('正在下载题库，请稍后（比较大，要下载一会儿）');

                    loadScript(base_url + 'database.js', function () {
                        console.info('题库下载成功！总共' + Object.keys(window.fdty_database).length + "条记录");
                        doWork(window.jQuery('#Panel3'), '是非题');
                        doWork(window.jQuery('#Panel1'), '单选题');

                        console.warn('程序完成，请【仔细核对】！\n请过几分钟，等计时器走到一个正常数字了，再交卷！');
                    });
                }
            }, 100);

            setTimeout(function () {
                if (IntervalId != -9999) {
                    console.warn('仍然没有找到题目，您确定已经点了开始考试、在考试界面中，而且Chrome开发者工具的“top”下拉菜单调整到了paper(stexampaperV1.aspx)中了？\n如果您是忘记调整到paper(stexampaperV1.aspx)中了，请调整后重新运行代码（无需刷新页面）。');
                }
            }, 3000);
        });
    });
})();
