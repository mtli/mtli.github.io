'use strict';

class GPUBench {
  constructor() {
    this.data = [
      // ['GPU', 'CI Score', 'CT Score', 'DI Score', 'DT Score'],
      ['GTX TITAN X', 	0.37012987012987, 	0.360615153788447, 	0.375, 	0.384492840542769], 
      ['GTX 1080', 	0.413582934262081, 	0.416605277982407, 	0.455400137583123, 	0.432313398238294], 
      ['TITAN X (Pascal)', 	0.591470374597904, 	0.592542372881356, 	0.580956559894691, 	0.561024967867203], 
      ['GTX 1080 Ti', 	0.598802395209581, 	0.593823347745522, 	0.602365787079163, 	0.586394168929541], 
      ['RTX 2080 Ti', 	0.754667019727261, 	0.844667018098753, 	0.88898836168308, 	0.793831985450606], 
      ['TITAN RTX', 	0.926780341023069, 	0.926780341023069, 	0.926780341023069, 	0.926780341023069], 
      ['V100', 	1, 	1, 	1, 	1], 
      ['RTX A6000', 	1.25109745390694, 	1.17272505489144, 	1.38687150837989, 	1.31321213673025], 
      ['RTX 3090', 	1.28988458927359, 	1.3107021131561, 	1.28087713640761, 	1.28250812703176], 
      ['A100', 	2.24232887490165, 	2.01678204321376, 	1.93378773125609, 	1.99834404831483], 
    ].reverse();
    this.showNumers = false;
    this.animationDuration = 800;
    this.animationInProgress = false;

    // gc is short for Google Charts
    this.gcData = this.createTable();
    this.gcData = google.visualization.arrayToDataTable(this.gcData);
    this.gcView = new google.visualization.DataView(this.gcData);
    this.gcChart = new google.visualization.BarChart(document.getElementById('chart_div'));
    this.gcOpts = {
      fontName: 'Open Sans',
      height: 35*this.data.length,
      bar: {groupWidth: 12},
      chartArea: {width: '60%'},
      hAxis: {
        title: 'Relative Performance Compared to V100',
        titleTextStyle: {italic: false},
        // minValue: 0.2,
        // maxValue: 2.25,
        viewWindow: {max: 2.25},
      },
      legend: {position: 'none'},
      animation:{
        startup: true,
        duration: this.animationDuration,
        easing: 'inAndOut',
      },
      colors: [document.body.dataset.ubColor1],
    };
  }

  createTable() {
    let table = [['GPU', 'Performance']];
    for (const row of this.data) {
      table.push([row[0], 0]);
    }
    return table;
  }

  updateTable(wTrain, wComplexity) {
    let a = wTrain, b = 1 - a;
    let c = wComplexity, d = 1 - c;
    for (const [i, row] of this.data.entries()) {
      this.gcData.setCell(i, 1,
        b*(d*row[1] + c*row[3]) + a*(d*row[2] + c*row[4]));
    }

    let cols = [0, 1];
    if (!this.animationInProgress && this.showNumers)
    {
      cols.push({
        calc: 'stringify',
        sourceColumn: 1,
        type: 'string',
        role: 'annotation',
      });
    }
    this.gcView.setColumns(cols);
  }

  drawChart(update=true) {
    if (update) this.updateTable(trainSlider.value/100.0, complexitySlider.value/100.0);
    this.gcChart.draw(this.gcView, this.gcOpts);
  }
}

$(function(){
  // the 'current' version (51) breaks with data view
  google.charts.load('50', {packages: ['corechart', 'bar']})
  .then(function() {
    let gpubench = new GPUBench();

    let aniEndTimer = null;
    function sliderAction() {
      gpubench.animationInProgress = true;
      if (aniEndTimer) {
        clearTimeout(aniEndTimer);
      }
      aniEndTimer = setTimeout(
        function() {
          gpubench.animationInProgress = false;
          gpubench.drawChart();
        },
        gpubench.animationDuration,
      );
      gpubench.drawChart();
    }

    trainSlider.oninput = sliderAction;
    complexitySlider.oninput = sliderAction;
    $(window).resize(sliderAction);

    toggleNumbers.onclick = function() {
      if (gpubench.showNumers) {
          gpubench.showNumers = false;
          toggleNumbers.innerHTML = 'Show Numbers';
      } else {
        gpubench.showNumers = true;
        toggleNumbers.innerHTML = 'Hide Numbers';
        gpubench.displayAnnotations = false;
      }
      gpubench.drawChart();
    }

    gpubench.drawChart();
  });
});


