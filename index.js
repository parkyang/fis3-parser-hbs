"use strict";
const path = require('path');
const def = {
  partials:{},
  defaultLayout: 'layout',
  postfix:'.json',
  extname: '.hbs'
};
let hbs  = require('handlebars');
let opts = null;
let File = null;
let isData = false;
//将字符串转换为可用数据
function getValue(str){
  var code = ['try{return ',str,'}catch(e){throw e}'];
  var fn = Function(code.join(''));
  return fn();
}
//提取 {{>targetName options}} 中的options数据
function custom_data(str){
  var data = {};
  str.replace(/(\{\{>\w+\s*)|(\}\}$)/g,'').split(/\s+/).map(function(item){
    var arr = item.split('=');
    data[arr[0]] = getValue(arr[1]);
  });
  return data;
}
var handles = function(content,file,options){
    if(!opts){
      opts = Object.assign(def,options);
    }
    let name = file.fullname.replace(file.dirname+'/','').replace(file.ext,'');
    //从内容中提取 partials 并进行内容替换
    var content = content.replace(/\{\{>([\w\/\.]+)(\s*[^\}\s])*\}\}/g,function(a,b){
      var body = '';
      if(!opts.partials[b]){
        var filepath = path.join(file.dirname,b+opts.extname);
        var fl = fis.file(filepath);
        isData = true;
        body = handles(fl.getContent().toString(fl.charset),fl,custom_data(arguments[0]));
      }
      return body||'';
    });
    //当引入的 partial 有自定义值时，进行值覆盖
    let dataFilePath = path.join(file.dirname,file.filename+opts.postfix);
    let jsonData = {};
    //如果json存在并且有值才进行保存
    if(fis.file(dataFilePath).exists()&&fis.util.isFile(dataFilePath)){
      var json = require(dataFilePath);
      fis.util.isEmpty(json)||(jsonData=json);
    }
    let data = Object.assign(jsonData,isData&&typeof(options)?options:{});
    let tpl = hbs.compile(content);
    let partialName = file.subpathNoExt.replace('/','');
    //缓存 partial
    opts.partials[partialName]||(opts.partials[partialName]=tpl);
    return tpl(data,opts); // 处理后的文件内容
};
module.exports = function (content, file, options) {
  isData = false;
  return handles(content.toString(file.charset),file,options);
}
