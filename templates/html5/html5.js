
function addParam(param, value, url)
{
    if (url.lastIndexOf('?') <= 0) url = url + "?";

    var re = new RegExp("([?|&])" + param + "=.*?(&|$)", "i");
    if (url.match(re))
        return url.replace(re, '$1' + param + "=" + value + '$2');
    else
        return url.substring(url.length - 1) == '?'
            ? url + param + "=" + value
            : url + '&' + param + "=" + value;
}

function getParam( name, url )
{
  if (!url) url = location.href;
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( url );
  if( results == null )
    return "";
  else
    return results[1];
}

firstStateChange = true;

(function(window,undefined){
    var History = window.History; // we are using a capital H instead of a lower h
    var State = History.getState();
    History.Adapter.bind(window,'statechange',function(){ // this does not listen for hash changes
        var State = History.getState();
        url = State.url;
        if ( location.hash.substring(0,2)=='#/' ) {
            // html4
            qs = '?' + decodeURIComponent(location.hash.substring(1)).split('?')[1];
            skyboxURL = getParam('skybox',qs);
        } else {
            // html5
            skyboxURL = getParam('skybox');
        }
        if ( skyboxURL ) {
            $.skyboxShow(skyboxURL);
        } else if (!firstStateChange) {
            $.skyboxHide();
            if ( $('body').hasClass('ajax') ) {
                $.post(url, {_ajax:1}, function(json){
                    p = jQuery.parseJSON(json);
                    //console.log(p);
                    if ( p != null ) {
                        document.title = p.title;
                        for (var key in p.div) {
                             $('#'+key).html(p.div[key]);
                        }
                        $('div[ajax]').ajaxRefresh(json);
                    } else {
                        location.href = url;
                    }
                }).error(function() {
                    location.href = url;
                });
            }
        }
        firstStateChange = false;
    });
})(window);

$(function(){
    $('body').addClass('ajax');
    selector = 'body.ajax a[class!="noajax"]';
    $(selector).live('click',function(event){
        $(this).addClass('ajax-in-progress');
        url = $(this).attr('href');
        //console.log('live click handlers:');
        liveClickHandlers = $(document).data('events').click;
        //console.log( clickHandlers );
        /* // this is not necessary because .click handlers return false fo' real
        if ($(this).data('events')) {
            console.log('click handlers:');
            console.log( $(this).data('events').click );
        }
        */
        thisHandlers = $.map(liveClickHandlers, function(handler) {
            if ( handler.selector == selector ) return null;
            if ( $(handler.selector).filter('.ajax-in-progress').length > 0 ) return handler.selector;
            return null;
        });
        $(this).removeClass('ajax-in-progress');
        //console.log(thisHandlers);
        //console.log(thisHandlers.length);
        if ( thisHandlers.length == 0 ) window.History.pushState(null,null,url);
        return false;
    });
    $(window).resize(function() {
      $('#skybox').center();
      $('#overlay').width($(window).width()).height($(window).height());
    });
    $('uploader').livequery(function(){
        $(this).uploader();
    });
    // console.log('PAGE LOADED');
    $.pageLoaded = true;
});


(function($){


    jQuery.fn.uploader = function (vfolder,options) {
        // read attributes of this
        // display gallery
        // display upload button
        return this;
    }




    /*
     *  skybox(url)
     *  skybox(url,width)
     *  skybox(url,width,height)
     *
     **/
    $.skybox = function(skyboxURL,w,h) {
        uri = location.pathname;
        if ( location.hash.substring(0,2)=='#/' ) {
            uri = location.hash.substring(1);
            //console.log('hashURI: '+uri);
        }
        uri = addParam('skybox',skyboxURL,uri);
        History.pushState(null,null,uri);
        if (w) $('#skybox').width(w);
        if (h) $('#skybox').height(h);
    };
    $.skyboxIsOpen = function() {
        if ( $('#skybox').css('opacity') > 0 ) return true;
        else return false;
    };
    $.skyboxShow = function(url, data) {
        if (url) {
            if (!url.match(/\</)) {
                $('#skybox').html('');
                if (!data) {
                    var data = {};
                }
                data['skybox'] = 1;
                data['_ajax'] = 1;
                $.post(url,data,function(json){
                    p = jQuery.parseJSON(json);
                    $('#skybox').html(p.div['page']).center();
                });
            } else {
                $('#skybox').html(url);
            }
        }
        $('#skybox').css('backgroundColor','#fff').show().center().fadeTo('fast', 1);
        $('#overlay').width($(window).width()).height($(document).height()).css('backgroundColor','#000').show().fadeTo('fast', 0.4);
    };
    $.skyboxHide = function() {
        $('#skybox').fadeTo('fast', 0).hide();
        $('#overlay').fadeTo('fast', 0).hide();
    };

    jQuery.fn.center = function () {
        var top = ( $(window).height() - this.height() ) / 2+$(window).scrollTop();
        if ( top < 5 ) top = 5;
        var left = ( $(window).width() - this.width() ) / 2+$(window).scrollLeft();
        if ( left < 5 ) left = 5;
        this.css("position","absolute");
        this.css("top", top + "px");
        this.css("left", left + "px");
        return this;
    }

    jQuery.fn.ajaxRefresh = function (p_json) {
        div = this;
        url = this.attr('ajax');
        $.post(url,{_p:p_json},function(data){
            div.fadeTo('fast',0.01);
            div.html(data);
            div.fadeTo('fast',1);
        });
    }

})( jQuery );

function skybox_alert(text) {
    var html = '<div style="padding:10px;">';
    html += '<div>' + text + '</div>';
    html += '<a href="javascript:void(0)" onclick="$.skyboxHide()">close</a>';
    html += '</div>';
    $.skyboxShow(html);
}