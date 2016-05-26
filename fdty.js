/**
 * =======================================
 * 复旦体育考试-自动答题机器
 * =======================================
 * 方便易用，基于Chrome，兼容所有操作系统。
 * 自动读取网页、匹配题库，瞬间出答案，节省时间。
 *
 * https://github.com/KevinWang15/fdty
 *
 * 求Pull Request：
 *  1. 完善题库
 *  2. 自动点击功能
 *
 * By 王轲 (KevinWang)
 * 2016-5-26
 */

(function () {

    var database_url = 'http://139.196.50.217/fdty/database.js';

    function stripUnimportantChars(str) {
        return str.replace(/[ 　\t\r\n,，\.。:：“”《》【】()_—\-＿－（）<>、\/\\"'`]/mg, "").toLowerCase();
    }

    function getRadioButtonId(id, answer) {
        return 'repVer_rbtn_ver_' + id + '_' + (answer ? 1 : 0) + '_' + id;
    }

    function doJob(panelElement) {
        //主要算法在此。

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
                console.error('【题库中没有答案！】', question.text);
                return;
            }

            successCount++;

            if (answer)
                console.log((questionI + 1) + "." + '%c√正确 %c' + question.text, 'color: green', 'color: black');
            else
                console.log((questionI + 1) + "." + '%c×错误 %c' + question.text, 'color: red', 'color: black');

            //我用的自动勾选是：
            window.jQuery("#" + getRadioButtonId(questionI, answer ^ 1)).click();

            //如果你有两次提交机会，请拿你的第一次提交机会做个试验
        });

        //console.info('目前自动勾选功能不稳定，可能导致0分，已被禁用，请手动勾选！%c(有能力的同学请看代码，为本程序做出贡献)', 'font-size:6px; color: #AAA');

        console.info('总共' + questions.length + "题，匹配成功" + successCount + "题。");
        console.warn('请过几分钟，等计时器走到一个正常数字了，再交卷！');
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

    loadScript("http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js", function () {
        var IntervalId = 0;
        console.info('加载中，如果长时间无响应，请确定Chrome Console的“top”下拉菜单调整到了paper(stexampaperV1.aspx)中');
        IntervalId = setInterval(function () {
            var panelElement = window.jQuery('#Panel3');
            if (!!panelElement && !!panelElement.html()) {
                clearInterval(IntervalId);
                IntervalId = -9999;
                console.info('成功找到题目！');
                console.info('正在下载题库，请稍后（比较大，要下载一会儿）');

                loadScript(database_url, function () {
                    console.info('题库下载成功！总共' + Object.keys(window.fdty_database).length + "条记录");
                    doJob(panelElement);
                });
            }
        }, 100);

        setTimeout(function () {
            if (IntervalId != -9999) {
                console.warn('仍然没有找到题目，您确定在Chrome Console的“top”下拉菜单调整到了paper(stexampaperV1.aspx)中了？');
            }
        }, 3000);
    });
})();
