function getYoutuParams(html) {
            var URL = "url=";
            var QUALITY = "quality=";
            var FALLBACK_HOST = "fallback_host=";
            var TYPE = "type=";
            var ITAG = "itag=";
            var SIG = "sig=";
            var S = "s=";

            try { var innerHTML = html; } catch(ex) { return false; }  // in case document is not fully loaded ---
            var urls = innerHTML.match(/"url_encoded_fmt_stream_map":"([^"]*)"/)[1];
            urls = urls.split(",");
            var videoParams = new Array();
      var s =false;
            for (var i in urls) {
                urls[i] = unescape(urls[i]);
                var params = urls[i].split("\\u0026");
                for (var j in params) {
                    if (params[j].indexOf(URL) != -1)       { var url = params[j].split(URL)[1]; }
                    if (params[j].indexOf(QUALITY) != -1)   { var quality = params[j].split(QUALITY)[1]; }
                    if (params[j].indexOf(FALLBACK_HOST) != -1) { var fallbackHost = params[j].split(FALLBACK_HOST)[1]; }
                    if (params[j].indexOf(TYPE) != -1)    { var fileType = params[j].split(TYPE)[1]; }
                    if (params[j].indexOf(ITAG) != -1)    { var itag = parseInt(params[j].split(ITAG)[1]); }
                    if (params[j].indexOf(SIG) != -1)     { var sig = params[j].split(SIG)[1]; }
                    if (params[j].indexOf(S) != -1 && params[j].substring(0,2) == S) {s = params[j].split(S)[1]; }
                }
                if (sig && url.indexOf("signature") == -1) { url += "&signature=" + sig; }

                    videoParams.push({
                        url     : url,                            // "\u0026" is an "&"
                        quality           : quality,                          // example, "large", "medium"
                        fallbackHost  : fallbackHost,                         // example, "tc.v22.cache4.c.youtube.com"
                        id                  : i,
                        itag : itag,
                        s : s
                    });
            }
            return videoParams;
        }
var Request = require("sdk/request").Request;
var prefs = require("sdk/simple-prefs").prefs;
var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var panel;

exports.main = function() {
    var cm = require("sdk/context-menu");
    cm.Item({
      label: "Send to DUNE",
      context: cm.SelectorContext('a[href*="rutube.ru/video"]:not([href*="person"]),a[href*="youtu"],a[href^="/watch"],a[href^="/get"],a[href*=".mp4"],a[href*=".mkv"],a[href*=".avi"],a[href*=".flv"],a[href*=".wmv"],a[href*=".asf"],a[href*=".mp3"],a[href*=".flac"],a[href*=".mka"],a[href*=".mov"],a[href*=".m4a"],a[href*=".aac"],a[href*=".ogg"],a[href*=".pls"],a[href*=".jpg"],a[href*=".png"],a[href*=".gif"],a[href*=".jpeg"],a[href*=".tiff"],a[href*=".mpg"],a[href*=".m3u"]'),
      image: data.url('dune_logo.ico'),
      contentScript: 'self.on("click", function (node, data) {' +
                 ' self.postMessage({url:node.href,pathname:node.pathname});' +
                 '});',
      onMessage: function(data) {
         parseUrl(data.url,data.pathname);
       }
    });
    pageMod.PageMod({
      include: "*.youtube.com",
      contentScriptFile: data.url("youtube.js"),
      onAttach: function(worker) {
        worker.port.emit('injectSendButton',data.url('dune.png'));
        worker.port.on("openurl", function(url) {
            //parseUrl(url,'');
            YouTubeSearchLink(url);
        });
      }
    });
    pageMod.PageMod({
      include: "*.rutube.ru",
      contentScriptFile: data.url("rutube.js"),
      onAttach: function(worker) {
        worker.port.emit('injectSendButton',data.url('dune_rutoo5.png'));
        worker.port.on("openurl", function(url) {
            RuTubeSearchLink(url);
        });
      }
    });
};
function displayMessage(title,message,type){
    if(panel){
        panel.show();
        panel.port.emit("showtext",{'title':title,'message':message,'type':type});
    }else{
        panel = require("sdk/panel").Panel({
          width: 300,
          height: 200,
          contentURL: data.url('dialog.html'),
          contentScriptFile: data.url("listener.js"),
          onHide: function(){
            panel.destroy();
            panel = null;
          },
          onShow: function(){
              panel.port.emit("showtext",{'title':title,'message':message,'type':type});
          }
        }).show();
    }
}
function parseUrl(url,pathname){
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[2].length==11){
    YouTubeSearchLink(url);
        return;
    }
    var regExp2 = /^.*(youtube.com\/watch.*[\?\&]v=)([^#\&\?]*).*/;
    var match = url.match(regExp2);
    if (match&&match[2].length==11){
    YouTubeSearchLink(url);
        return;
    }
  var regExp3 = /rutube.ru\/video\/([^\/].*)\//;
  var match = url.match(regExp3);
  if (match&&match[1].length==32){
      RuTubeSearchLink(url);
    return;
  }
    var ext = pathname.split('.').pop();
        sendToDUNE(url);
        return;
}
function YouTubeSearchLink(link){
    Request({
        url: link,
      headers: {"User-Agent": "None"},       // "User-Agent": "None" for youtube server, that he thought that I do not know what is SSL
      onComplete: function (resp) {
        var videos = getYoutuParams(resp.text);
            var url="";
            var ytresolution;
   if (prefs.ytresolution == '1080p') {ytresolution = 37;}
   if (prefs.ytresolution == '720p') {ytresolution = 22;}
   if (prefs.ytresolution == '360p') {ytresolution = 18;}

            var needVideo = null;
            videos.forEach(function (video){
                 if(video.itag == ytresolution){

                    needVideo = video; }});
       if (!needVideo){videos.forEach(function (video){
                     if(video.itag == 22){

                     needVideo = video;  }     }  );}
       if (!needVideo){videos.forEach(function (video){
                     if(video.itag == 18){

                     needVideo = video; }     }  );}

            url = needVideo.url;
             if (url == ""){
                displayMessage('Error','No suported formats: ','error');
                }
            else {
                url = url.replace(/&/g,"%26");
          if(needVideo.s){
                    // Instead of "any the site" must be a real address server for decipher sig
                    var forDecodeUrl = "http://any the site/echo?message=" + needVideo.s;
                    Request({
                        url: forDecodeUrl,
                      onComplete: function (resp) {
            if (resp.status == 200) {
                            url += "%26signature="+resp.text;
                            sendToDUNE(url);
                      } else { displayMessage('Error','Server decrypt signature return ERROR '+ resp.status +': '+ resp.statusText,'error');}
              }
                    }).get();
                }
                else{
                    sendToDUNE(url);
                }
            }
      }}).get();
}
function RuTubeSearchLink(link){
var rutubeVideoID = link.match(/rutube.ru\/video\/([^\/].*)\//)[1];
var link = "http://rutube.ru/api/play/options/" + rutubeVideoID + "/?format=json";
    Request({
        url: link,
      onComplete: function (resp) {
      getRutubeParams(resp.text);
      }}).get();
}
function getRutubeParams(html){
try { var innerHTML = html; } catch(ex) { return false; }  // in case document is not fully loaded ---
if (innerHTML.search(/\"m3u8\"\: \"([^\"]*)\"/) == -1) {displayMessage('Error','This video can not be sent to Dune. Most likely, the copyright holder of this video, banned the show in your region.','error'); return;}
var urls = innerHTML.match(/\"m3u8\"\: \"([^\"]*)\"/)[1];
       Request({
        url: urls,
      overrideMimeType: "text/plain; charset=latin1",
      onComplete: function (resp) {
                var playlistRes = resp.text;
                playlistRes = playlistRes.replace(/\#EXT([^\n].*)\n/gm,"").replace(/\n$/,'').split("\n");
            var videourl = playlistRes[playlistRes.length-1];
      sendToDUNE(videourl);
        }
            }).get();
}
function sendToDUNE(fileurl){
   fileurl = fileurl.replace(/&/g,"%26");
   fileurl = fileurl.replace("file:///","smb:");

   if(!prefs.duneip || prefs.duneip == ''){
        displayMessage('Error','You have to set up your DUNE address first in the Addon Settings','error');
        return false;
    }var pictReg=/\.(?:jp(?:e?g|e|2)|gif|png|tiff?|bmp|ico)$/i;
  if (pictReg.test (fileurl))
  {var link='http://'+prefs.duneip+'/cgi-bin/do?cmd=start_file_playback&media_url='+fileurl;  // Protocol "1"
  } else {
  var link='http://'+prefs.duneip+'/cgi-bin/do?cmd=start_playlist_playback&media_url='+fileurl;  // Protocol "3" starting with firmware v.120531_2200_beta
          }
    displayMessage('Sending','Sending url to DUNE... ','info');
   Request({
      url: link,
      onComplete: function (resp) {
      if(resp.text.indexOf('<param name="command_status" value="ok"/>')>-1){
            var    re = /<param name="playback_state" value="((\w)*)"/i;;
          var match = resp.text.match(re);
          if (match != null) {
            var result = match[1];
            }
        displayMessage('Success Sent to DUNE',' DUNE reported: PLAYBACK_STATE '+result,'ok');
      }
            if(resp.text.indexOf('<param name="command_status" value="timeout"/>')>-1){
              var    re = /<param name="playback_state" value="((\w)*)"/i;;
          var match = resp.text.match(re);
          if (match != null) {
            var result = match[1];
            }
        displayMessage('Success Sent to DUNE',' DUNE reported: PLAYBACK_STATE '+result,'ok');
      }
            if(resp.text.indexOf('<param name="command_status" value="failed"/>')>-1){
              var    re = /<param name="error_description" value="((((\w)*)((\s)*))*)"/i;
          var match = resp.text.match(re);
          if (match != null) {
            var result = match[1];
            }
        displayMessage('Failed Sent to DUNE','DUNE reported: ERROR_DESCRIPTION '+result,'error');
      }

             if(resp.text == ""){
                displayMessage('Network error','Could not contact DUNE. Check your configuration.','error');
                return;
            }
    }}).get();
}