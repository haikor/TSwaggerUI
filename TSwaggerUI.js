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
        $(".response_body").each(
            function (i, responseBody) {
                if ($(responseBody).find(".copyResponse").length > 0) return;
                $(responseBody).append($("<div style='right:10px;float:right;margin:10px;top:10px;'><a class='copyResponse' href='javascript:void(0);'>复制响应</a></div>"))
                $(responseBody).append($("<div style='right:10px;float:right;margin:10px;top:10px;'><a class='copyCURL' href='javascript:void(0);'>复制CURL</a></div>"))
                $(responseBody).append($("<div style='right:10px;float:right;margin:10px;top:10px;'><a class='copyURL' href='javascript:void(0);'>复制URL</a></div>"))
                added = true;
            }


        );

        if(added){
             new Clipboard('.copyResponse', {
                text: function (trigger) {
                    var $button = $(trigger);
                    return $button.parent().parent().find("pre").text();
                }
            }
           );

            new Clipboard('.copyURL', {
                text: function (trigger) {
                    var $button = $(trigger);
                    return $button.parents(".response").find(".request_url pre").text();
                }
            }
           );

           new Clipboard('.copyCURL', {
                text: function (trigger) {
                    var $button = $(trigger);
                    return $button.parents(".response").find("div.curl pre").text();
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

    setInterval(render, 500);

    setInterval(autoSave, 500);
})();
