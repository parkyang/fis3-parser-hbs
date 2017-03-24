# fis3-parser-hbs
fis3-parser-handlebars 。依赖的handlebars具体用法请参考 [http://handlebarsjs.com/](http://handlebarsjs.com/)

## Install

* `npm install -g fis3-parser-hbs-3x`

## Use
默认参数设置:

	{
		extname:'.hbs',  //模版文件后缀
		postfix:'.json'  //模版相对应数据文件(需与模版同名且同目录)后缀
	}

fis-conf.js配置

	fis.match('**.hbs', {
  		parser: fis.plugin('hbs'),
  		rExt: '.html'
	});
	
## Example
index.html 内容:

	<link rel="import" href="hbs/layout.hbs?__inline">

`模版内部插入模块实，自定义数据会覆盖对应文件中的data数据：`

layout.hbs 内容:

	<html>
	...
	<body>
	{{>test name="test" age=18 list=[1,2,3,4,5]}}
	{{>common/header}}
	...
	</body>
	</html>
	
`说明：此处layout.hbs、test.hbs以及common文件夹同级`

* 此处 `test`为模块名，name、age、list等分别为data的属性与值
* 属性的值为字符串需加双引号(`"`)或单引号(`'`)
