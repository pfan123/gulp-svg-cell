'use strict';
var through = require("through-gulp"); 
var fs = require('fs');
var path = require("path");
var cheerio = require('cheerio')
var gutil = require('gulp-util');

/**
 * [writeToFile 写入文件]
 * @param  {[type]} data [数组数据列表或对象列表]
 * @param  {[type]} path [写入的路径]
 */
function writeToFile(data,path,calllback){
    var data = "var symbol = " + JSON.stringify(data,null, "\t");
    fs.writeFile(path,data,"utf-8",function(err){
        if(err) throw err;
        calllback && calllback();
    });
}



function convertSvgData(opts) {
  var  mergeBool = opts.mergeBool || false;
  var fileList = {},i = 0;

  //通过through创建流stream
  var stream = through(function(file, encoding,callback) {
    
    //进程文件判断
    if (file.isNull()) {
         throw "NO Files,Please Check Files!"
    }

    var dir = path.basename(file.path);  //文件夹
    var extName = path.extname(file.path); //后缀名
    var fileName = path.basename(file.path,extName); //文件名
    var cate = file.path.split(/[\/,\\]/);

    //增加数据
    function addList(){
        var $ = cheerio.load(content.toString("utf-8").replace(/[\r\n]/g,""));
        var symbol = $("symbol");

        for(var i = symbol.length;i--;){
         // fileList.push({name:symbol.eq(i).attr("id"),html:$('svg').append(symbol.eq(i).clone()).html()})
         
          fileList[symbol.eq(i).attr("id")] = $('<div>').append(symbol.eq(i).clone()).html()
        }

             
    }

    if (file.isBuffer()) {
        //拿到单个文件buffer
        var content = file.contents;
        extName = extName.replace(".","").toLowerCase();
        addList(); 
    }
    if (file.isStream()) {
        var content = fs.readFileSync(file.path).toString("utf-8");
        addList();     
    }



      callback();
    },function(callback) {
     
      writeToFile(fileList,path.join(opts.outPath,opts.outFilename),function(){
        gutil.log(gutil.colors.green("svg对应列表已经生成完毕！"));
      })
      
      callback();
    });
  
  //返回这个流文件
  return stream;
};
  
module.exports = convertSvgData;
