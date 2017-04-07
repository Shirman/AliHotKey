function startCrawl(){
	var storage = window.localStorage;
 	var keyWord = storage.getItem("keyWord");
 	storage.removeItem("keyWord");
	chrome.tabs.getSelected(null, function(tab) {
    	chrome.tabs.sendMessage(tab.id, {keyWord: keyWord}, function(response) {
        	
    	}
    );
});
}