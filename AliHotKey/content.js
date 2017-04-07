/*
*数据抓取逻辑：
*1.首先获取搜索关键词
*2.进行第一次搜索，但不处理数据
*3.开始进行循环抓取，每次循环先处理页面上的数据，然后进入下一页。
* 	数据处理会在休眠@crawParam.dealDataInterval后的下一个循环开始。
*	循环结束条件：抓取到的页面数据为空
**/
var page = new Page();

var crawParam = {
	"dealDataInterval":1000//每秒处理一次数据
};

var result = [];

function start(){
	console.log("start crawl...")
	page.doSearch();
	doCrawl();
}

function doCrawl(){//根据设置的参数，每隔一段时间处理一次数据并进入下一页
	setTimeout("getCurrentDataAndNext()",crawParam.dealDataInterval);
}

function getCurrentDataAndNext(){//处理当前数据并进入下一页
	var pageData = page.getPageHtmlData();
	result = result.concat(pageData);//合并抓取到的数据
	page.hasNext =  pageData.length > 0 && page.nextPage();
	if(page.hasNext){
		doCrawl();
	}else{
		console.log("crawl end.");
		exportExcel(result);
		result = [];
		page = new Page();
	}
};

//导出excel
function exportExcel(result){
	var tableHtml = "<table><thead><tr><th>key word</th><th>competition</th><th>window number</th><th>hot</th></tr></thead><tbody>"
	$.each(result,function(i,e){
		var t = "<tr><td>"+e.name+"</td><td>"+e.competition+"</td><td>"+e.hotNum+"</td><td>"+e.windowNum+"</td></tr>";
		tableHtml += t;
	});
	tableHtml+="</tbody></table>";
	var $table = $(tableHtml);
	$(tableHtml).tableExport({
        type:'excel',
        escape:'false',
        fileName: 'ali_key_word'
    });
}

//页面处理类
function Page(){
	this.pageNum = 0;
	this.total = 0;
	this.hasNext = true;
	this.keyWord = "";
	this.getSearchKeyWords = function(){
		return this.keyWord;
	};
	this.getPageTotalNum = function(){
		var $lastBtnEl = $('#J-pagination > .ui-pagination-next').prev();
		this.total = $lastBtnEl.text();
	}
	this.doSearch = function(){//进行搜索
		var keyword = this.getSearchKeyWords();
		if (!keyword) {
			return false;
		};
		$("#J-search-keywords").val(keyword);
		document.getElementById("J-search-trigger").click();
		this.pageNum = 1;
		return true;
	};
	this.nextPage = function(){//进入下一页
		var hasGo = false;
		if(!this.hasNext){//是否到了最后一页进行检查
			return hasGo;
		}
		this.pageNum++;
		var nextBtn = document.getElementsByClassName("ui-pagination-active")[0].nextSibling.nextSibling;
		var isNextBtn = !$(nextBtn).hasClass('ui-pagination-next');
		if(isNextBtn){
			nextBtn.click();
			hasGo = true;
		}
		return hasGo;
	};
	this.getPageHtmlData = function(){//获取本页的页面内容
		var data = [];
		var $lines = $(".J-keyword-line");
		$lines.each(function(index, el) {
			var $me = $(el);
			var values = $me.find("td");
			var name = $(values[0]).text();
			var competition = $(values[1]).text();
			var windowNum = $(values[2]).text();
			var hotNum = $(values[3]).text();
			var record = new Record(name, competition, windowNum, hotNum);
			data.push(record);
		});
		return data;
	};
}

//数据记录
function Record(name,competition,windowNum,hotNum){
	this.name = name;//关键词
	this.competition = competition;//卖家竞争度
	this.windowNum = windowNum;//橱窗数
	this.hotNum = hotNum;//搜索热度
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
    	console.log(request.keyWord);
    	page.keyWord = request.keyWord;
   		start();
	}
);