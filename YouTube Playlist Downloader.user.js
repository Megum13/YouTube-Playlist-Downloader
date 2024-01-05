// ==UserScript==
// @name         YouTube Playlist Downloader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @author       MeGum
// @grant        GM_registerMenuCommand
// @match        https://www.youtube.com/*
// @connect      save4k.com
// @grant        GM_xmlhttpRequest
// @icon         https://www.google.com/s2/favicons?domain=github.com
// ==/UserScript==

var myWindow;
var responses = [];

(function() {
	'use strict';

	GM_registerMenuCommand ("Donwload", start);

	var links1names2;
	async function start () {
		myWindow = createWindow("Donwload console", 900,300);
		await new Promise(r => setTimeout(r,2400));
		links1names2 = parseYoutubeVideos();
		writeParseVideos(links1names2);
		loadCodesToServer(links1names2);
		waitingDownloadVideos(responses,links1names2);
	}


})();

function loadCodesToServer(array){
	responses = [];
	for(var i = 0; i < array.length; i+=2)
	{
		GM_xmlhttpRequest({method: "POST", url: `https://save4k.com/download.php`,headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Referer': `https://save4k.com/youtube/${array[i]}`,
		},data: `category=10&serv=3&sid=e1c02982&id=${array[i]}}&ext=m4a&exte=mp3&fv=14&asize=2943860&size=2943860&nid=${array[i+1].replace(" ", "+")}&step=2&m4a=1&root=1&key=youtube`,
						   onload: function(detail)
						   {
							   //var response = new DOMParser().parseFromString(detail.responseText,"text/html");
							   responses.push(detail.responseText);
						   }});
	}

}

function sleep(ms){
	return new Promise(r => setTimeout(r, ms));
}
var links = [];
async function waitingDownloadVideos(responses,array){

	while(responses.length != array.length/2){
		log(`Waiting to receive...` + responses.length + " / " + array.length/2);
		await sleep(2000);
	}
	log("Load... "+ responses.length + " / " + array.length/2);
	links = [];
	loadCodesToServer(parseYoutubeVideos());
	while(links.length != responses.length){
		links = [];
		for(var i = 0; i < responses.length; i++)
		{
			if (responses[i].search(`<a class="button4" href="`) != -1) {
				var link = (responses[i].split('<a class="button4" href="')[1].split(`">Ск`)[0]);
				if (link.search(`plan[i]["href"]`) == -1) links.push(link);
			}
		}
		log("Downloaded: " + links.length + ' / ' + responses.length);
		log("Wait 5s...")

		await sleep(5000);
	}
	log(`Succes! <br>`);

	myWindow.links = links;
	myWindow.download = function(){for(var j = 0; j < links.length; j++)window.open(links[j]);};

	for(var i = 0; i < links.length; i++)
	{
		log(links[i]);
		log();

	}
	log(`<button onclick="download()">Download</button>`);

}

function writeParseVideos(array){
	for(var i = 0; i < array.length; i+=2)
	{
		log(array[i+1]);
		log(array[i] +'<br>');
	}
	log();
	log('...............................................');
	log();
}

function log(data){
	if(data == undefined)
		data = "";
	myWindow.document.write(data + '<br>');
	myWindow.scrollTo(0, myWindow.document.body.scrollHeight);
}

function createWindow(name,width,height){

	return window.open(`about:blank`,name,`width=${width},height=${height}`);
}

function parseYoutubeVideos(){
	var list = $('ytd-playlist-video-renderer')
	var arr = []
	for(var i = 0; i < list.length; i++)
	{
		var vLink = (list[i].innerHTML.split('href="/watch?v=')[1].split('&amp;')[0]);

		var vName = (list[i].innerHTML.split(`<h3 class="style-scope ytd-playlist-video-renderer" aria-label="`)[1].split(' Автор:')[0]);

		arr.push(vLink);
		arr.push(vName);
	}
	return arr;
}