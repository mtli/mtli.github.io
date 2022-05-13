"use strict";

var nImage, nLoaded = 0, loadPercent = 0;

Number.prototype.zpad = function(size)
{
      var s = String(this);
      while (s.length < size) {s = "0" + s;}
      return s;
};

function getSizeCall(img, callback, args)
{
	var msInterval = 30;
	setTimeout(function checkSize() {
  		var w = img.naturalWidth,
            h = img.naturalHeight;
		if (w && h)
            callback(args, w, h);
        else
  			setTimeout(checkSize, msInterval);
	}, msInterval);
}

function imageLoaded(elems, w, h)
{
	for(var i = 0; i < elems.length; i++)
	{
		elems[i].style.width = String(w) + "px";
		elems[i].style.height = String(h) + "px";
	}
	nLoaded++;
	var newPercent = Math.floor(nLoaded/nImage*100);
	if (loadPercent != newPercent)
	{
		loadPercent = newPercent;
		var ele = document.getElementById("percent");
		ele.innerHTML = String(loadPercent) + "%";
	}
	if (nLoaded == nImage) allLoaded();
}

function toggleElements(className)
{
	var elements = document.getElementsByClassName(className);
	var dispStr = (elements[0].style.display && elements[0].style.display == "none") ?
		"block": "none";
	for(var i = 0; i < elements.length; i++)
		elements[i].style.display = dispStr;
}

var toggleImg = toggleElements.bind(null, "images");
var toggleOverlay = toggleElements.bind(null, "overlayimg");

function enableInteraction()
{
	var jpgs = document.querySelectorAll('img[src$=".jpg"]');
	var svgs = document.querySelectorAll('img[src$=".svg"]');
	var n = svgs.length/jpgs.length;
	var wStr, hStr, elem, bkg, idx;
	
	for (var i = 0; i < jpgs.length; i++)
	{
		wStr = String(jpgs[i].naturalWidth) + "px";
		hStr = String(jpgs[i].naturalHeight) + "px";
		
		jpgs[i].className = "images";
		elem = document.createElement("div");
		elem.style = "position: relative;";
		elem.style.width = wStr;
		elem.style.height = hStr;
		elem.onclick = toggleImg;
		jpgs[i].parentNode.appendChild(elem);
		elem.appendChild(jpgs[i]);
	
		for(var j = 0; j < n; j++)
		{
			idx = i*n + j;
			elem = document.createElement("div");
			elem.style = "position: relative;";
			elem.style.width = wStr;
			elem.style.height = hStr;
			elem.onclick = toggleOverlay;

			bkg = document.createElement("img");
			bkg.src = jpgs[i].src;
			bkg.className = "overlayimg";
			bkg.style.width = wStr;
			bkg.style.height = hStr;
			bkg.style.display = "none";

			svgs[idx].parentNode.appendChild(elem);
			elem.appendChild(svgs[idx]);
			elem.appendChild(bkg);
		}
	}
}

function loadingScreen()
{
	var div = document.createElement("div");
	div.className = "loader loading";
	document.body.appendChild(div);
	div = document.createElement("div");
	div.className = "loadtext loading";
	div.innerHTML = "Loading images...";
	document.body.appendChild(div);	
	div = document.createElement("div");
	div.id = "percent";
	div.className = "loadpercent loading";
	div.innerHTML = String(loadPercent) + "%";
	document.body.appendChild(div);
}

function allLoaded()
{
	enableInteraction();
	var loadingStuffs = document.getElementsByClassName("loading");
	// this is a live reference
	while(loadingStuffs.length > 0)
		loadingStuffs[0].remove();
	
	var elems = document.getElementsByTagName("table");
	elems[0].style.display = "";
}

function loadContent(list)
{
	nImage = list.length;
	
	var table = document.createElement("table");
	table.style.display = "none";
	document.body.appendChild(table);
	var tbody = document.createElement("tbody");
	table.appendChild(tbody);
	
	var tr, td, img, idxStr, srcStr, svgs = [];
	for(var i = 0; i < nImage; i++)
	{
		tr = document.createElement("tr");
		tbody.appendChild(tr);
		
		td = document.createElement("td");
		td.innerHTML = String(list[i]);
		tr.appendChild(td);

		idxStr = list[i].zpad(8);
		img = document.createElement("img");
		srcStr = "image/" + idxStr + ".jpg";
		img.src = srcStr;
		img.title = srcStr;
		img.alt = "Cannot load " + srcStr;
		
		td = document.createElement("td");
		td.appendChild(img);
		tr.appendChild(td);
		
		for (var j = 0; j < 5; j++)
		{
			svgs[j] = document.createElement("img");
			srcStr = "sketch-tagged/width-1/jet/" + idxStr + "_" + (j+1).zpad(2) + ".png";
			svgs[j].src = srcStr;
			svgs[j].title = srcStr;
			svgs[j].alt = "Cannot load " + srcStr;
				
			td = document.createElement("td");
			td.appendChild(svgs[j]);
			tr.appendChild(td);
		}
		getSizeCall(img, imageLoaded, svgs.slice(0));
	}
	
}

function showData(list)
{
	document.getElementById("inputpage").remove();
	loadingScreen();
	loadContent(list);
}

function randList(n)
{
	var list = [];
	for(var i = 0; i < n; i++)
		list[i] = Math.floor((Math.random() * 1000) + 1);
	showData(list);
}

function checkRange(x) {return x >= 1 && x <= 1000;}

function rangeList()
{
	var i, start, end, list = [], bError = false;
	try
	{
		start = parseInt(document.forms["range"]["start"].value);
		end = parseInt(document.forms["range"]["end"].value);
		if (checkRange(start) && checkRange(end) && start <= end)
			for(i = start; i <= end; i++) list.push(i);
		else
			throw new Error("Invalid input");
	}
	catch(err)
	{
		bError = true;
		alert(err.message);
	}
	if(!bError) showData(list);
	return false;
}

function inputList()
{
	var i, idx, items, list = [], bError = false;
	try
	{
		items = document.forms["listform"]["list"].value.split(",");
		for (i = 0; i < items.length; i++)
		{
			idx = parseInt(items[i]);
			if(!checkRange(idx))
				throw new Error("Invalid input");
			list.push(idx);
		}
	}
	catch(err)
	{
		bError = true;
		alert(err.message);
	}
	if(!bError) showData(list);
	return false;
}