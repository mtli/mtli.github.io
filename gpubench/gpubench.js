'use strict';

class GPUBench {
  constructor() {
    this.data = [
      // ['GPU', 'CI Score', 'CT Score', 'DI Score', 'DT Score'],
      ['A100', 1.10906515580737, 1.92011019283747, 1.93378773125609, 1.99834404831483], 
      ['RTX 3090', 1.27941176470588, 1.2625286801111, 1.28087713640761, 1.28250812703176],
      ['V100', 1, 1, 1, 1],
      ['TITAN RTX', 0.926780341023069, 0.926780341023069, 0.926780341023069, 0.926780341023069],
      ['RTX 2080 Ti', 0.951397326852977, 0.814442626781958, 0.88898836168308, 0.793831985450606],
      ['GTX 1080 Ti', 1.0595399188092, 0.605139781212016, 0.602365787079163, 0.586394168929541], 
      ['TITAN X (Pascal)', 0.795731707317073, 0.603707125534126, 0.578671328671329, 0.556323896301117], 
      ['GTX TITAN X', 0.773715415019763, 0.396277906227495, 0.375, 0.384492840542769],
    ];
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
      height: 280,
      bar: {groupWidth: 12},
      chartArea: {width: '60%'},
      hAxis: {
        title: 'Relative Performance Compared to V100',
        titleTextStyle: {italic: false},
        // viewWindow: {min: 0.2},
        // minValue: 0.2,
        maxValue: 2.0,
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


