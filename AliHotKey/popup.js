document.addEventListener('DOMContentLoaded', function() {
	var bg = chrome.extension.getBackgroundPage();
 	document.getElementById("startBtn").addEventListener('click',function(){
 		var keyWord = document.getElementById("keyword").value;
 		if(!!keyWord){
 			var storage = window.localStorage;
 			storage.setItem("keyWord",keyWord);
 			bg.startCrawl();
 		}else{
 			alert("请先输入关键字");
 		}
 	});
});
