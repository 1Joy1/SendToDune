/*
Copyright (c) 2014 MarshakDeveloper and !Joy!
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

//Includes
var Request = require("sdk/request").Request;
var prefs = require("sdk/simple-prefs").prefs;
var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var _ = require("sdk/l10n").get;
var cm = require("sdk/context-menu");
var addonUri = require("sdk/self").uri;
var tabs = require("sdk/tabs");
var store = require("sdk/simple-storage");
var panel;
var manager;
var topmenu;
var separator;
var duneIPplay;
var DeviceLabel;
var YTworkers = [];
var RTworkers = [];

//Update? Just see if we can find the deprecated config entries//Update if
function checkUpdate() {
    if (!store.storage.servers || store.storage.servers.length === 0) {
        store.storage.servers = [];
        var duneipfull = require('sdk/preferences/service')
            .get(['extensions', require('sdk/self').id, 'duneip'].join('.'));
        if (typeof duneipfull !== "undefined" && duneipfull !== '') {
            duneipfull = duneipfull.split(":");
            var duneip = duneipfull[0];
            var duneport = duneipfull[1];
            if (typeof duneport === "undefined" || duneport === '') duneport =
                "80";
            //Previous version detected
            var defaultserver = {
                label: 'Default',
                host: duneip,
                port: duneport
            };
            //Store new default server
            store.storage.servers.push(defaultserver);
        }
    }
}
//Launch configuration manager
function launchConfigTab() {
    for (let tab of tabs) {
        if (tab.url ===
            "resource://send-to-dune-at-jetpack/send-to-dune/data/preferences.html"
        ) {
            tab.activate();
            return;
        }
    }
    tabs.open({
        url: data.url('preferences.html')
    });
}
//Save the servers
function saveServers(servers) {
    store.storage.servers = [];
    servers.forEach(function(server) {
        store.storage.servers.push({
            label: server.label,
            host: server.host,
            port: server.port
        });
    });
    refreshMenus();
}
//Sends the current options in the settings page
function getCurrServ(worker) {
    worker.port.emit('init', {
        servers: getServers(),
        YTresolution: prefs.ytresolution,
        textbtnDEL: _("Delete"),
        textbtnEDIT: _("Edit")
    });
}
//Refresh context menus with new servers
function refreshMenus() {
    //Remove all old items from the menu
    if (topmenu.items) {
        topmenu.items.forEach(function(it) {
            it.destroy();
        });
    }
    topmenu.destroy();
    if (store.storage.servers.length > 1) {
        setUpTopMenu(initSubMenus());
    } else {
        SingleContextMenu();
    }
}
//Set up the top context menu with submenus
function setUpTopMenu(mitems) {
    topmenu = cm.Menu({
        label: "Send to DUNE",
        context: cm.SelectorContext(
            'a[href*="rutube.ru/video"]:not([href*="person"]),a[style*="rutube.ru"][href^="/video"]:not([href*="person"]),a[href*="youtu"],a[href^="/watch"],a[href^="/get"],a[href*=".mp4"],a[href*=".mkv"],a[href*=".avi"],a[href*=".flv"],a[href*=".wmv"],a[href*=".asf"],a[href*=".mp3"],a[href*=".flac"],a[href*=".mka"],a[href*=".mov"],a[href*=".m4a"],a[href*=".aac"],a[href*=".ogg"],a[href*=".pls"],a[href*=".jpg"],a[href*=".png"],a[href*=".gif"],a[href*=".jpeg"],a[href*=".tiff"],a[href*=".mpg"],a[href*=".m3u"]'
        ),
        image: data.url('dune_logo.ico'),
        contentScript: 'self.on("click", function (node, data) {' +
            ' self.postMessage({url:node.href,pathname:node.pathname,server:data});' +
            '});',
        items: mitems[0],
        onMessage: function(data) {
            if (data.server != undefined) {
                var servANDlable = data.server.split('separator_string');
                duneIPplay = servANDlable[0];
                DeviceLabel = servANDlable[1];
                parseUrl(data.url, data.pathname);
            }
        }
    });
    separator = cm.Separator();
    topmenu.addItem(separator);
    manager = cm.Item({
        label: _("Manage Send to DUNE"),
        contentScript: 'self.on("click", self.postMessage)',
        onMessage: launchConfigTab
    });
    topmenu.addItem(manager);
}
//Create submenus
function initSubMenus() {
    //Parse all servers
    var servers = getServers();
    var items = [];
    servers.forEach(function(server) {
        var it = cm.Item({
            label: server.label,
            data: server.host + ':' + server.port +
                'separator_string' + server.label
        });
        items.push(it);
    });
    return [items];
}
//Get all servers from the config
function getServers() {
    if (!store.storage.servers)
        store.storage.servers = [];
    return store.storage.servers;
}
// Create sigle context menu
function SingleContextMenu() {
    var servers = getServers();
    if (servers[0] !== undefined) {
        duneIPplay = servers[0].host + ':' + servers[0].port;
        DeviceLabel = "";
    } else {
        duneIPplay = "";
    }
    topmenu = cm.Item({
        label: "Send to DUNE",
        context: cm.SelectorContext(
            'a[href*="rutube.ru/video"]:not([href*="person"]),a[style*="rutube.ru"][href^="/video"]:not([href*="person"]),a[href*="youtu"],a[href^="/watch"],a[href^="/get"],a[href*=".mp4"],a[href*=".mkv"],a[href*=".avi"],a[href*=".flv"],a[href*=".wmv"],a[href*=".asf"],a[href*=".mp3"],a[href*=".flac"],a[href*=".mka"],a[href*=".mov"],a[href*=".m4a"],a[href*=".aac"],a[href*=".ogg"],a[href*=".pls"],a[href*=".jpg"],a[href*=".png"],a[href*=".gif"],a[href*=".jpeg"],a[href*=".tiff"],a[href*=".mpg"],a[href*=".m3u"]'
        ),
        image: data.url('dune_logo.ico'),
        contentScript: 'self.on("click", function (node, data) {' +
            ' self.postMessage({url:node.href,pathname:node.pathname});' +
            '});',
        onMessage: function(data) {
            parseUrl(data.url, data.pathname);
        }
    });
}

exports.onUnload = function(reason) {
    if (reason === "disable") {
        for (let tab of tabs) {
            if (tab.url ===
                "resource://send-to-dune-at-jetpack/send-to-dune/data/preferences.html"
            ) {
                tab.close();
                return;
            }
        }
    }
}

exports.main = function() {
    checkUpdate();
    if (store.storage.servers.length > 1) {
        setUpTopMenu(initSubMenus());
    } else SingleContextMenu();

    pageMod.PageMod({
        include: "*.youtube.com",
        contentScriptFile: data.url("youtube.js"),
        attachTo: ["existing", "top"],
        onAttach: function(worker) {
            worker.port.emit('injectSendButton', {
                image: data.url('dune.png'),
                servers: getServers()
            });
            worker.port.on("openurl", function(data) {
                duneIPplay = data.server;
                DeviceLabel = data.label;
                YouTubeSearchLink(data.url);
            });
            //Keep a list of the active workers to be able to notify them in case the configuration changes
            YTworkers.push(worker);
            worker.on('detach', function() {
                var index = YTworkers.indexOf(this);
                if (index != -1) {
                    YTworkers.splice(index, 1);
                }
            });
        }
    });
    pageMod.PageMod({
        include: "*.rutube.ru",
        contentScriptFile: data.url("rutube.js"),
        attachTo: ["existing", "top"],
        onAttach: function(worker) {
            worker.port.emit('injectSendButton', {
                image: data.url('dune_rutoo5.png'),
                servers: getServers()
            });
            worker.port.on("openurl", function(data) {
                duneIPplay = data.server;
                DeviceLabel = data.label;
                RuTubeSearchLink(data.url);
            });
            //Keep a list of the active workers to be able to notify them in case the configuration changes
            RTworkers.push(worker);
            worker.on('detach', function() {
                var index = RTworkers.indexOf(this);
                if (index != -1) {
                    RTworkers.splice(index, 1);
                }
            });
        }
    });
    pageMod.PageMod({
        include: data.url('preferences.html'),
        contentScriptFile: [data.url("jquery-2.1.1.min.js"), data.url(
            'preferences.js')],
        onAttach: function(worker) {
            worker.port.on("updateservers", function(servers,
                YoutubeResolutios) {
                //Update the server configuration
                prefs.ytresolution = YoutubeResolutios;
                saveServers(servers);
                //Poke the YouTube workers that the configuration changed
                if (YTworkers.length > 0) {
                    YTworkers.forEach(function(ytworker, i) {
                        try {
                            ytworker.port.emit('refreshButton', {
                                image: data.url('dune.png'),
                                servers: getServers()
                            });
                        } catch (e) {
                            console.log("YT " + e);
                        }
                    });
                }
                //Poke the RuTube workers that the configuration changed
                if (RTworkers.length > 0) {
                    RTworkers.forEach(function(rtworker, i) {
                        try {
                            rtworker.port.emit('refreshButton', {
                                image: data.url(
                                    'dune_rutoo5.png'),
                                servers: getServers()
                            });
                        } catch (e) {
                            console.log("RT " + e);
                        }
                    });
                }
            });
            //Now sends the current options in the settings page
            getCurrServ(worker);
        }
    })
};

function displayMessage(title, message, message2, type) {
    var futer = _(
        "If you enjoy this add-on, you can support its continued development by making a small contribution."
    );
    if (message2 !== '') {
        message2 = '"' + message2 + '"';
    }
    if (panel) {
        panel.show();
        panel.port.emit("showtext", {
            'title': title,
            'message': message,
            'devicelabel': message2,
            'futer': futer,
            'type': type
        });
    } else {
        panel = require("sdk/panel").Panel({
            width: 300,
            height: 200,
            contentURL: data.url('dialog.html'),
            contentScriptFile: data.url("listener.js"),
            onHide: function() {
                panel.destroy();
                panel = null;
            },
            onShow: function() {
                panel.port.emit("showtext", {
                    'title': title,
                    'message': message,
                    'devicelabel': message2,
                    'futer': futer,
                    'type': type
                });
            }
        }).show();
    }
}

function parseUrl(url, pathname) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[2].length == 11) {
        YouTubeSearchLink(url);
        return;
    }
    var regExp2 = /^.*(youtube.com\/watch.*[\?\&]v=)([^#\&\?]*).*/;
    var match = url.match(regExp2);
    if (match && match[2].length == 11) {
        YouTubeSearchLink(url);
        return;
    }
    var regExp3 = /rutube.ru\/video\/([^\/].*)\//;
    var match = url.match(regExp3);
    if (match && match[1].length == 32) {
        RuTubeSearchLink(url);
        return;
    }
    var ext = pathname.split('.').pop();
    sendToDUNE(url);
    return;
}

function extractVideoID(url) {
    var regExp =
        /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[7].length == 11) {
        return match[7];
    }
}

function getYoutuParams(html) {
    try {
        var innerHTML = html;
    } catch (ex) {
        return false;
    } // in case document is not fully loaded ---
    //  var urls = innerHTML.match(/"url_encoded_fmt_stream_map":"([^"]*)"/)[1];
    var urls = innerHTML.match(/url_encoded_fmt_stream_map=([^&]*)&/)[1];
    urls = urls.split("%2C");
    //   urls = urls.split(",");
    var videoParams = new Array();
    var s = false;
    for (var i in urls) {
        urls[i] = unescape(urls[i]);
        // var params = urls[i].split("\\u0026");
        var params = urls[i].split("&");
        for (var j in params) {
            if (params[j].indexOf("url=") != -1) {
                var url = params[j].split("url=")[1];
            }
            if (params[j].indexOf("quality=") != -1) {
                var quality = params[j].split("quality=")[1];
            }
            if (params[j].indexOf("fallback_host=") != -1) {
                var fallbackHost = params[j].split("fallback_host=")[1];
            }
            if (params[j].indexOf("type=") != -1) {
                var fileType = params[j].split("type=")[1];
            }
            if (params[j].indexOf("itag=") != -1) {
                var itag = parseInt(params[j].split("itag=")[1]);
            }
            if (params[j].indexOf("sig=") != -1) {
                var sig = params[j].split("sig=")[1];
            }
            if (params[j].indexOf("s=") != -1 && params[j].substring(0, 2) ==
                "s=") {
                s = params[j].split("s=")[1];
            }
        }
        if (sig && url.indexOf("signature") == -1) {
            url += "&signature=" + sig;
        }

        videoParams.push({
            url: url, // "\u0026" is an "&"
            quality: quality, // example, "large", "medium"
            fallbackHost: fallbackHost, // example, "tc.v22.cache4.c.youtube.com"
            id: i,
            itag: itag,
            s: s
        });
    }
    return videoParams
}

function getYoutuParamsHLS(text) {
    var urls = text.match(/BANDWIDTH=(.*?),.*\n(.*)/gm);
    var videoParams = new Array();
    for (var i in urls) {
        if (urls[i].match(/BANDWIDTH=(.*?),/)) {
            var bandwidth = urls[i].match(/BANDWIDTH=(.*?),/)[1];
        }
        if (urls[i].match(/CODECS="(.*?)",/)) {
            var codecs = urls[i].match(/CODECS="(.*?)",/)[1];
        }
        if (urls[i].match(/RESOLUTION=(.*?),/)) {
            var resolution = urls[i].match(/RESOLUTION=(.*?),/)[1];
        }
        if (urls[i].match(/CLOSED-CAPTIONS=(.*?)http/)) {
            var closed_captions = urls[i].match(/CLOSED-CAPTIONS=(.*?)http/)[1];
        }
        if (urls[i].match(/http(.*?)m3u8/)) {
            var url = urls[i].match(/http(.*?)m3u8/)[0];
        }

        videoParams.push({
            url: url,
            resolution: resolution,
            bandwidth: bandwidth,
            codecs: codecs,
            closed_captions: closed_captions
        });
    }
    return videoParams;
}

function YouTubeSearchLink(link) {
    var videoId = extractVideoID(link);
    //link = 'http://www.youtube.com/get_video_info?&video_id=' + videoId + '&asv=3&el=detailpage&hl=en_US';
    link = 'http://www.youtube-nocookie.com/get_video_info?&video_id=' + videoId + '&asv=3&el=detailpage&hl=en_US';
    Request({
        url: link,
        anonymous: true,
        //  headers: {"User-Agent": "None"}, // "User-Agent": "None" for youtube server, that he thought that I do not know what is SSL
        onComplete: function(resp) {
            var hls_live = resp.text.match(/hlsvp=(.*?)m3u8/);
            if (hls_live) {
                Request({
                    url: decodeURIComponent(hls_live[1]) + "m3u8",
                    overrideMimeType: "text/plain; charset=latin1",
                    onComplete: function(resp) {
                        var videos = getYoutuParamsHLS(resp.text);
                        var url = "";
                        var ytresolution;
                        if (prefs.ytresolution == '1080p') {
                            ytresolution = "1920x1080";
                        }
                        if (prefs.ytresolution == '720p') {
                            ytresolution = "1280x720";
                        }
                        if (prefs.ytresolution == '360p') {
                            ytresolution = "640x360";
                        }
                        var needVideo = null;
                        videos.forEach(function(video) {
                            if (video.resolution === ytresolution) {
                                needVideo = video;
                            }
                        });
                        if (!needVideo) {
                            videos.forEach(function(video) {
                                if (video.resolution === "1280x720") {
                                    needVideo = video;
                                }
                            });
                        }
                        if (!needVideo) {
                            videos.forEach(function(video) {
                                if (video.resolution === "640x360") {
                                    needVideo = video;
                                }
                            });
                        }
                        url = needVideo.url;
                        if (url == "") {
                            displayMessage(_("Error"), _(
                                    "No supported formats: "), '',
                                'error');
                        } else {
                            sendToDUNE(url);
                        }
                    }
                }).get();
            } else {
                var videos = getYoutuParams(resp.text);
                var url = "";
                var ytresolution;
                if (prefs.ytresolution == '1080p') {
                    ytresolution = 37;
                }
                if (prefs.ytresolution == '720p') {
                    ytresolution = 22;
                }
                if (prefs.ytresolution == '360p') {
                    ytresolution = 18;
                }

                var needVideo = null;
                videos.forEach(function(video) {
                    if (video.itag == ytresolution) {
                        needVideo = video;
                    }
                });
                if (!needVideo) {
                    videos.forEach(function(video) {
                        if (video.itag == 22) {
                            needVideo = video;
                        }
                    });
                }
                if (!needVideo) {
                    videos.forEach(function(video) {
                        if (video.itag == 18) {
                            needVideo = video;
                        }
                    });
                }
                url = needVideo.url;
                if (url == "") {
                    displayMessage(_("Error"), _("No supported formats: "),
                        '', 'error');
                } else {
                    url = decodeURIComponent(url);
                    url = url.replace(/&/g, "%26");
                    if (needVideo.s) {
                        // Instead of "any the site" must be a real address
                        var forDecodeUrl = "http://any the site/echo?message=" + needVideo.s;
                        Request({
                            url: forDecodeUrl,
                            onComplete: function(resp) {
                                if (resp.status == 200) {
                                    url += "%26signature=" + resp.text;
                                    sendToDUNE(url);
                                } else {
                                    displayMessage(_("Error"), _(
                                            "Server decrypt signature return ERROR "
                                        ) + resp.status + ': ' + resp.statusText,
                                        '', 'error');
                                }
                            }
                        }).get();
                    } else {
                        sendToDUNE(url);
                    }
                }
            }
        }
    }).get();
}

function RuTubeSearchLink(link) {
    var rutubeVideoID = link.match(/rutube.ru\/video\/([^\/].*)\//)[1];
    var link = "http://rutube.ru/api/play/options/" + rutubeVideoID +
        "/?format=json";
    Request({
        url: link,
        onComplete: function(resp) {
            getRutubeParams(resp.text);
        }
    }).get();
}

function getRutubeParams(html) {
    try {
        var innerHTML = html;
    } catch (ex) {
        return false;
    } // in case document is not fully loaded ---
    if (innerHTML.search(/\"m3u8\"\: \"([^\"]*)\"/) == -1) {
        displayMessage(_("Error"), _(
            "This video can not be sent to Dune. Most likely, the copyright holder of this video, banned the show in your region."
        ), '', 'error');
        return;
    }
    var urls = innerHTML.match(/\"m3u8\"\: \"([^\"]*)\"/)[1];
    Request({
        url: urls,
        overrideMimeType: "text/plain; charset=latin1",
        onComplete: function(resp) {
            var playlistRes = resp.text;
            playlistRes = playlistRes.replace(/\#EXT([^\n].*)\n/gm, "").replace(
                /\n$/, '').split("\n");
            var videourl = playlistRes[playlistRes.length - 1];
            sendToDUNE(videourl);
        }
    }).get();
}

function sendToDUNE(fileurl) {
    console.log("fileurl=   " + fileurl + "    =fileurl");
    if (duneIPplay == '') {
        displayMessage(_("Error"), _(
            "You have to set up your DUNE address first in the Addon Settings"
        ), '', 'error');
        return false;
    }

    fileurl = fileurl.replace(/&/g, "%26");
    fileurl = fileurl.replace("file:///", "smb:");
    if (fileurl.search(/googlevideo\.com\/videoplayback/) == -1) { // Проверяем не ютобовская ли ссылка
        fileurl = fileurl.replace("https", "http"); // Для контакта с доподнительными плагинами.
        if (fileurl.search(/mp4$/i) !== -1) {
            fileurl = fileurl.replace("http://", "http://mp4://");
        }
        if (fileurl.search(/flv$/i) !== -1) { // Поддержка flv через кодеки.
            fileurl = fileurl.replace("http://",
                "http://ts://127.0.0.1:81/cgi-bin/flv.sh?http://");
        }
    } else if (fileurl.search(/mp4/i) !== -1) { // Проверяем есть ли в ютубовской ссылке mp4
        fileurl = fileurl.replace("http://", "http://mp4://");
    }
    var pictReg = /\.(?:jp(?:e?g|e|2)|gif|png|tiff?|bmp|ico)$/i;
    if (pictReg.test(fileurl)) {
        var link = 'http://' + duneIPplay +
            '/cgi-bin/do?cmd=start_file_playback&media_url=' + fileurl; // Protocol "1"
    } else {
        var link = 'http://' + duneIPplay +
            '/cgi-bin/do?cmd=start_playlist_playback&media_url=' + fileurl; // Protocol "3" starting with firmware v.120531_2200_beta
    }

    displayMessage(_("Sending"), _("Sending url to DUNE... "), DeviceLabel,
        'info');
    console.log("link=   " + link);
    Request({
        url: link,
        onComplete: function(resp) {
            if (resp.text.indexOf(
                '<param name="command_status" value="ok"/>') > -1) {
                var re = /<param name="playback_state" value="((\w)*)"/i;;
                var match = resp.text.match(re);
                if (match != null) {
                    var result = match[1];
                }
                displayMessage(_("Success Sent to DUNE"), _(
                        " DUNE reported: PLAYBACK_STATE ") + result, '',
                    'ok');
            }
            if (resp.text.indexOf(
                '<param name="command_status" value="timeout"/>') > -1) {
                var re = /<param name="playback_state" value="((\w)*)"/i;;
                var match = resp.text.match(re);
                if (match != null) {
                    var result = match[1];
                }
                displayMessage(_("Success Sent to DUNE"), _(
                        " DUNE reported: PLAYBACK_STATE ") + result, '',
                    'ok');
            }
            if (resp.text.indexOf(
                '<param name="command_status" value="failed"/>') > -1) {
                var re =
                    /<param name="error_description" value="((((\w)*)((\s)*))*)"/i;
                var match = resp.text.match(re);
                if (match != null) {
                    var result = match[1];
                }
                displayMessage(_("Failed Sent to DUNE"), _(
                        "DUNE reported: ERROR_DESCRIPTION ") + result, '',
                    'error');
            }
            if (resp.text == "") {
                displayMessage(_("Network error"), _(
                    "Could not contact DUNE. Check your configuration."
                ), '', 'error');
                return;
            }
        }
    }).get();
}