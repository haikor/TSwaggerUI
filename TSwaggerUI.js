// ==UserScript==
// @name         TSwaggerUI
// @namespace    https://github.com/haikor/TSwaggerUI/
// @version      0.1
// @description  swagger extension
// @author       teck
// @include      *swagger-ui.html*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.7.1/clipboard.min.js
// ==/UserScript==

(function () {
    'use strict';

    function render() {
        var added = false;
        $(".sandbox_header").each(
            function (i, responseBody) {
                if ($(responseBody).find(".copyResponse").length > 0) return;
                $(responseBody).append($("<div style='right:10px;float:right;margin:10px;top:10px;'><a class='copyResponse' href='javascript:void(0);'>复制响应</a></div>"))
                $(responseBody).append($("<div style='right:10px;float:right;margin:10px;top:10px;'><a class='downCsv' href='javascript:void(0);'>下载csv</a></div>"))
                $(responseBody).append($("<div style='right:10px;float:right;margin:10px;top:10px;'><a class='copyCURL' href='javascript:void(0);'>复制CURL</a></div>"))
                $(responseBody).append($("<div style='right:10px;float:right;margin:10px;top:10px;'><a class='copyURL' href='javascript:void(0);'>复制URL</a></div>"))
                added = true;
            }


        );

        if(added){
             new Clipboard('.copyResponse', {
                text: function (trigger) {
                    var $button = $(trigger);
                    var value  = $button.parents(".operation").find(".response_body").find("pre").text();
                    console.log(value);
                    return value;
                }
            }
           );


             $('.downCsv').each(function() {
                 var $button = $(this);
                 if($button.data("done")){
                     return;
                 }
                 $button.data("done",true);
                 $button.click(function(){
                 var value  = $(this).parents(".operation").find(".response_body").find("pre").text();
                 var csv = json2csv(JSON.parse(value));
                 var method = $(this).parents(".operation").attr("id");
                 saveAs(new Blob([csv],{type:"text/csv;charset=utf-8"}),method+".csv");
                 });
            }
           );

            new Clipboard('.copyURL', {
                text: function (trigger) {
                    var $button = $(trigger);
                    var value  = $button.parents(".operation").find(".response").find(".request_url pre").text();
                    console.log(value);
                    return value;
                }
            }
           );

           new Clipboard('.copyCURL', {
                text: function (trigger) {
                    var $button = $(trigger);
                    var value  = $button.parents(".operation").find(".response").find("div.curl pre").text();
                    console.log(value);
                    return value;
                }
            }
           );
        }



        $(".response-messages").prev().hide();$(".response-messages").hide();
        $(".response").children().hide();$(".response_body").show();
        $(".response-content-type").hide();$(".response-class h4").hide();$(".response-class h4").next().hide();
        $(".response-class .snippet_json pre").css("height","50px");
        $("h4").hide();

    }

    function autoSave(){
        $("#resources input,textarea").each(function(i,item){
            var input  = $(item);
            var method = $(item).parents(".operation").attr("id");
            var name = input.attr("name");
            if(!name){
                return;
            }
            var key = method+":" + name;

            //有值，保存
            if(input.val()){
                localStorage.setItem(key,input.val());
                return ;
            }

            //自动加载
            if(input.data("loaded")){
                return;
            }
            input.data("loaded",true);
            var value = localStorage.getItem(key);
            if(value)
            {
                input.val(value);
            }
        });
    }

    function json2csv(json){
        if(!json){
            return "";
        }
        if(Array.isArray(json)){
            //获取所有头
            var headers = [];
             for(var i in json){
                 for(var key in json[i]){
                     headers.push(key);
                 }
             }
            headers = Array.from(new Set(headers));
            var csv = "";
            //输出头
            csv+=headers.join();
            var needTab = {};
              for(var j in headers){
                     var header = headers[j];
              	  var value  = json[0][header];
                         if(typeof value =="string" && value.match(/^\d{8,}$/)){
                         	 	 //先简单只判断第一行长数字
                             needTab[header] = true;
                             csv = csv.replace(eval("/\\b"+header+"\\b/"),"\t"+header);
                         }
              }
              
            //输出数据
            for(var i in json){
                csv+="\n";
                 for(var j in headers){
                     var header = headers[j];
                     if(j>0){
                         csv+=",";
                     }
                     var value = json[i][header];
                     if(value){
                         if(typeof value =="object"){
                             value  = JSON.stringify(value);
                         }
                         if(typeof value =="string" && (value.indexOf("\"")>-1 ||  value.indexOf(",")>-1)){
                             value = "\""+ (value.replace(/\"/g,"\"\""))+"\"";
                         }
                         
                         if(needTab[header]){
                             value = "\t"+value;
                         }
                         
                         var lowerHeader = header.toLowerCase();
                         if((lowerHeader.indexOf("time") > -1 || lowerHeader.indexOf("gmt") > -1|| lowerHeader.indexOf("date") > -1)&&  Number.isInteger(value)){
                             value = new Date(value+3600*8*1000).toISOString().replace("T"," ").replace(/\..*/,"")
                         }
                     }
	      if(value == undefined){
		value  = null;
                 }
                     csv += value;
                 }
             }
            return csv;
        }

        for(var k in json){
            if(!json[k]){
                continue;
            }
            if(Array.isArray(json[k])){
                return json2csv(json[k]);
               }
            if(typeof (json[k]) == "object"){
                var ret = json2csv(json[k]);
                if(ret){
                    return ret;
                }
               }
        }
        return "";
    }


    /**
 * 保存
 * @param  {Blob} blob
 * @param  {String} filename 想要保存的文件名称
 */
    function saveAs(blob, filename) {
        if (window.navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, filename);
        } else {
            var link = document.createElement("a");
            var body = document.querySelector("body");

            link.href = window.URL.createObjectURL(blob);
            link.download = filename;

            // fix Firefox
            link.style.display = "none";
            body.appendChild(link);

            link.click();
            body.removeChild(link);

            window.URL.revokeObjectURL(link.href);
        }
    }

    setInterval(render, 1000);

    setInterval(autoSave, 1000);
})();
