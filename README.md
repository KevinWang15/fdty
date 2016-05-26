
# 复旦体育考试-自动答题机器
* 方便易用，基于Chrome，兼容所有操作系统。
* 自动读取网页、匹配题库，瞬间出答案，节省时间。
* 截止到2016年5月26日，总共有5558道不重复的题

##一张图体会一下
![show](screenshots/show.png)
##使用方法

###1. 使用 **Chrome** 打开考试界面
一定要较新版本的Chrome！别的浏览器没试过，尽量不要用！
###2. 在考试界面中，打开开发者工具里的控制台
| 操作系统 | 快捷键 |
| ----- | ----- |
| Windows | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>J</kbd> |
| Mac | <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>J</kbd> |
###3. 修改左上角下拉菜单的值
![show](screenshots/1.png)

调整为 ```paper(stexampaperV1.aspx)```
###4. 复制以下代码，粘贴、运行
	var fdty_loader = document.createElement("script");fdty_loader.type = "text/javascript";console.info('正在加载自动答题脚本');fdty_loader.src = "http://139.196.50.217/fdty/fdty.js";document.getElementsByTagName("head")[0].appendChild(fdty_loader);

![show](screenshots/2.png)

###5. 按照自动匹配的结果，打钩、交卷！
![show](screenshots/3.png)

###关于刷新/关闭页面重开
体育理论考的界面是可以刷新的，在提交之前，也可以关闭然后重新开，不会消耗提交的次数（2016年5月26日 亲测）
体育理论考界面有代码防止学生刷新，所以按<kbd>F5</kbd>是没用的。但这个很容易绕过，在Chrome开发者工具中，按<kbd>Ctrl</kbd>+<kbd>R</kbd>刷新就行。
所以，如果哪次打开，发现有好几题没有匹配成功的，不妨刷新了重新匹配试试。刷新后，要回到第三步，重新做哦。

##求Pull Request
###1. 完善题库
在```database_generator```目录下有个nodeJs的题目格式转换器，在```rawdata```文件夹中，新建一个txt，以这种方式一行一题，

	["获得和利用食物的综合过程称为营养。","true"],
	["合理的营养意味着机体能够摄入保持身体健康所必须的部分营养成分。","false"],
	...

然后运行```node generate.js```就行了，谢谢。
