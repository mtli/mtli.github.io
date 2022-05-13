(function () {
	"use strict";
	var bPhone = /(android)|iPhone|iPod/i.test(navigator.userAgent);

	function drawRandomSketch(container) {

		var scale = bPhone ? 0.3 : 0.45;
		var nRow = 3, nCol = bPhone ? 2 : 4;
		var nSketch = 1000;
		var nVar = 5;
		var svgFolder = "sketch";

		var fullSet = new Array(nSketch);
		for (var i = 0; i < nSketch; i++)
			fullSet[i] = i + 1;

		Number.prototype.zpad = function(size) {
		var s = String(this);
		while (s.length < size) {s = "0" + s;}
		return s;
	  };

		function getRandomSubarray(arr, size) {
			var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
			while (i-- > min) {
				index = Math.floor((i + 1) * Math.random());
				temp = shuffled[index];
				shuffled[index] = shuffled[i];
				shuffled[i] = temp;
			}
			return shuffled.slice(min);
		}

		function isScrolledIntoView(elem) {
		var docViewTop = $(window).scrollTop();
			var docViewBottom = docViewTop + $(window).height();
		var elemTop = elem.offset().top;
			var elemBottom = elemTop + 0.8*elem.height();
		return (elemBottom <= docViewBottom) && (elemTop >= docViewTop);
	}

		function genList(n) {
			var imgList = getRandomSubarray(fullSet.slice(), n);
			var sktList = new Array(n);
			for (var i = 0; i < n; i++)
				sktList[i] = Math.floor((Math.random() * nVar) + 1);
			return [imgList, sktList]
		}

		var idxList = genList(nRow*nCol);
		var bFirstTime = true;

	  function fetchAndDraw() {
			$(container + " tbody").remove();
			$(container).append("<tbody/>");
			var tbody = $(container + " tbody");

			for (var r = 0; r < nRow; r++) {
				var tr = $("<tr/>").appendTo(tbody);
				for (var c = 0; c < nCol; c++) {
					var td = $("<td/>").appendTo(tr);
					var div = $("<div/>").appendTo(td);
					var i = r*nCol + c;
					var svgFullPath = svgFolder + "/" + 
							idxList[0][i].zpad(8) + "_" + idxList[1][i].zpad(2) + ".svg";
					fetch(svgFullPath)
					.then(response => response.text())
					.then(function (div) {
						return function (text) {
							div.append(text);
							var svg = div.children().first();
							var w = svg.attr("width");
							var h = svg.attr("height");
							svg.removeAttr("width height");
							svg.attr("viewBox", "0 0 " + w + " " + h);
							div.width(scale*w);
							div.height(scale*h);
							svg.drawsvg({duration: 600, stagger: 300});
							if (bFirstTime) {
								function animateWhenInView() {
									if (isScrolledIntoView(svg)) {
										svg.drawsvg("animate");
										$(document).off("scroll", animateWhenInView);
                    $(document).off("touchmove", animateWhenInView);
									}
								}
								$(document).on("scroll", animateWhenInView);
                $(document).on("touchmove", animateWhenInView);
							} else {
								svg.drawsvg("animate");
							}

						};
					} (div));
				}
			}
		}

		fetchAndDraw();

		$("#replay").click(function () {
			bFirstTime = false;
			fetchAndDraw();
		});
		$("#next-random").click(function () {
			bFirstTime = false;
			idxList = genList(nRow*nCol);
			fetchAndDraw();
		});
		}

	$(function () {
		drawRandomSketch("#sketchcanvas");
	});
}) ();