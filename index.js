"use strict";
const path = require('path');
const def = {
  partials:{},
  postfix:'.json',
  extname: '.hbs'
};
let hbs  = require('handlebars');
let opts = null;
let File = null;
//将字符串转换为可用数据
function getValue(str){
  var code = ['try{return ',str,'}catch(e){throw e}'];
  var fn = Function(code.join(''));
  return fn();
}
//提取 {{>targetName options}} 中的options数据
function custom_data(str,file){
  var data = {};
  str.replace(/(\{\{>\w+\s*)|(\}\}$)/g,'').split(/\s+/).map(function(item){
    var arr = item.split('=');
    //如果值为*.json,载入json文件数据，否则直接赋值
    if(arr.length<2)return;
    if(arr[1].indexOf('.json')>0){
      var jsonPath = arr[1].replace(/^"|"$/g,'');
      var filepath = path.join(jsonPath.indexOf('/')===0?fis.project.getProjectPath()
      :file.dirname,jsonPath);
      data = JSON.parse(fis.file(filepath).getContent());
      if(file.cache&&file.cache.addDeps){
        file.cache.addDeps(filepath);
      }
    }else{
      data[arr[0]] = getValue(arr[1]);
    }
  });
  return data||{};
}
var handles = function(content,file,options){
    if(!opts){
      opts = Object.assign({},def,options);
    }
    let name = file.fullname.replace(file.dirname+'/','').replace(file.ext,'');
    if (file.useCache&&!file.cache) {
      // 如果启用，则创建 cache 对象
      file.cache = fis.cache(file.realpath, fis.project.getCachePath());
      // 保存内容以及信息到缓存中。
      file.cache.save();
    }
    //从内容中提取 partials 并进行内容替换
    var content = content.replace(/\{\{>([\w\/\.]+)(\s*[^\}\s])*\}\}/g,function(a,b){
      var body = '';
      if(!opts.partials[b]){
        var filepath = path.join(b.indexOf('/')===0?fis.project.getProjectPath():file.dirname,b+opts.extname);
        var fl = fis.file(filepath),
        _cdata = custom_data(arguments[0],file.dirname);
        body = handles(fl.getContent().toString(fl.charset),fl,custom_data(arguments[0],file));
      }
      if(body&&file.cache&&file.cache.addDeps){
        file.cache.addDeps(file.fullname);
      }
      return body||'';
    });
    //当引入的 partial 有自定义值时，进行值覆盖
    let dataFilePath = path.join(file.dirname,file.filename+opts.postfix);
    let jsonData = {};
    //如果json存在并且有值才进行保存
    if(fis.file(dataFilePath).exists()&&fis.util.isFile(dataFilePath)){
      var json = JSON.parse(fis.file(dataFilePath).getContent());
      fis.util.isEmpty(json)||(jsonData=json);
      if(file.cache&&file.cache.addDeps){
        file.cache.addDeps(dataFilePath);
      }
    }
    let data = Object.assign({},jsonData,options||{});
    let tpl = hbs.compile(content);
    let partialName = file.subpathNoExt.replace('/','');
    //缓存 partial
    opts.partials[partialName]||(opts.partials[partialName]=tpl);
    return tpl(data,opts); // 处理后的文件内容
};
module.exports = function (content, file, options) {
  return handles(content.toString(file.charset),file,options);
}
