function createSvgElement(tagName) {
  return document.createElementNS("http://www.w3.org/2000/svg", tagName);
}

function Application() {
  "use strict"
  var app = this;

  this.model = new Model();
  this.stateMargin = 5;
  this.stateSize = 50;
  this.stateFontSize = 24;
  this.nstates = 5;

  function createGraph() {
   function updateCircle(circle) {
      return function(value) {
        circle.setAttribute("fill-opacity", value);
      };
    }

    function circleClick(circle, state) {
      return function() {
        app.selectState(state);
      };
    }

    for (var i = 0; i < app.nstates; i++) {
      var div = document.createElement("div");
      div.id = "state-" + i;
      var cx = app.stateSize / 2 + app.stateMargin;
      var cy = app.stateSize / 2 + app.stateMargin;
      
      var svg = createSvgElement("svg");
      svg.setAttribute("width", app.stateSize + 2 * app.stateMargin);
      svg.setAttribute("height", app.stateSize + 2 * app.stateMargin);
      
      var circle = createSvgElement("circle");
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", cy);
      circle.setAttribute("r", app.stateSize / 2);
      circle.setAttribute("stroke", "black");
      circle.setAttribute("stroke-width", "2");
      circle.setAttribute("fill", "cornflowerblue");
      
      var text = createSvgElement("text");
      text.setAttribute("x", cx);
      text.setAttribute("y", cy + app.stateFontSize / 3);
      text.setAttribute("font-family", "Arial");
      text.setAttribute("font-size", app.stateFontSize + "px");
      text.setAttribute("text-anchor", "middle");

      var textNode = document.createTextNode(i);
      text.appendChild(textNode);
      
      app.model.listen("state-" + i, updateCircle(circle));
      circle.onclick = circleClick(circle, i);
      text.onclick = circleClick(circle, i);

      svg.appendChild(circle);
      svg.appendChild(text);
      div.appendChild(svg);
      document.getElementById("graph").appendChild(div);
    }
  }
  
  function createMatrix() {
   function updateBackground(element) {
      return function(value) {
        value = Math.min(1, Math.max(0, value));
        element.style['background-color'] = 'rgba(221, 238, 255, ' + value + ')';
      };
    }

    var table = document.createElement("table");
    for (var from = 0; from < app.nstates; from++) {
      var tr = document.createElement("tr");
      for (var to = 0; to < app.nstates; to++) {
        var td = document.createElement("td");
        var input = new ModelInput(app.model, "prob" + from + "," + to);
        td.appendChild(input.element);
        tr.appendChild(td);
        app.model.listen("state-" + from, updateBackground(input.element));
      }
      table.appendChild(tr);
    }
    document.getElementById("matrix").appendChild(table);
  }
  
  function createButtons() {
    var stepButton = new Button("Step", app.runSimulationSteps(1));
    var runButton = new Button("Run", app.startSimulation);
    var stopButton = new Button("Stop", app.stopSimulation);
    var resetButton = new Button("Reset", app.resetSimulation);
    var speedLabel = new Span("Speed:");
    var speedInput = new ModelInput(app.model, "speed");
    
    var buttons = document.getElementById("buttons");
    buttons.appendChild(stepButton.element);
    buttons.appendChild(runButton.element);
    buttons.appendChild(stopButton.element);
    buttons.appendChild(resetButton.element);
    buttons.appendChild(speedLabel.element);
    buttons.appendChild(speedInput.element);
  }
  
  function createStats() {
    var tr;
    var th;
    var td;
    var i;
    var span;

    var steps = new ModelSpan(app.model, "steps");    
 
    var table = document.createElement("table");
    tr = document.createElement("tr");
    
    // Add headers
    th = document.createElement("th");
    tr.appendChild(th);
    for (i = 0; i < app.nstates; i++) {
      th = document.createElement("th");
      var textNode = document.createTextNode(i);
      th.appendChild(textNode);
      tr.appendChild(th);
    }
    table.appendChild(tr);

    // Add count statistics
    tr = document.createElement("tr");
    td = document.createElement("td");
    td.appendChild(document.createTextNode("Visits"));
    tr.appendChild(td);
    for (i = 0; i < app.nstates; i++) {
      span = new ModelSpan(app.model, "count-" + i);
      td = document.createElement("td");
      td.appendChild(span.element);
      tr.appendChild(td);
    }
    table.appendChild(tr);
    
    // Add count statistics
    tr = document.createElement("tr");
    td = document.createElement("td");
    td.appendChild(document.createTextNode("Visits (%)"));
    tr.appendChild(td);
    for (var i = 0; i < app.nstates; i++) {
      span = new ModelSpan(app.model, "percentage-" + i);
      td = document.createElement("td");
      td.appendChild(span.element);
      tr.appendChild(td);
    }
    table.appendChild(tr);

    document.getElementById("steps").appendChild(steps.element);
    document.getElementById("stats").appendChild(table);
  }

  function performSteps(nsteps) {
    var i;
    if (nsteps == undefined) {
      nsteps = 1;
    }
    var curState = app.model.get("state");
    
    var stateCount = [];
    for (i = 0; i < app.nstates; i++) {
      stateCount[i] = 0;
    }
    
    for (var step = 0; step < nsteps; step++) {
      var nextState = app.nstates - 1;
      var z = Math.random();
      var sum = 0;
      for (i = 0; i < app.nstates - 1; i++) {
        sum += parseFloat(app.model.get("prob" + curState + "," + i));
        if (z < sum) {
          nextState = i;
          break;
        }
      }
      app.model.set("count-" + nextState, app.model.get("count-" + nextState) + 1);
      stateCount[nextState]++;
      curState = nextState;
    }
  
    // Update model  
    var steps = app.model.get("steps") + nsteps;
    app.model.set("steps", steps);
    
    for (i = 0; i < app.nstates; i++) {
      var count = app.model.get("count-" + i);
      app.model.set("percentage-" + i, Math.round(100 * count / steps) + "%");
    }
    
    function updateGraphColors() {
      app.model.set("state", curState);
      for (var i = 0; i < app.nstates; i++) {
        app.model.set("state-" + i, stateCount[i] / nsteps);
      }
    }

    if (nsteps == 1) {
      var speed = app.model.get("speed");
      app.selectState(-1);
      setTimeout(updateGraphColors, speed * 0.2);
    } else {
      updateGraphColors();
    }
  };
   
  this.selectState = function(state) {
    app.model.set("state", state);
    for (var i = 0; i < app.nstates; i++) {
      app.model.set("state-" + i, (i == state) ? 1 : 0);
    }
  }
  
  this.setMatrix = function(matrix) {
    for (var i = 0; i < app.nstates; i++) {
      for (var j = 0; j < app.nstates; j++) {
        var value = matrix[i][j];
        value = +value.toFixed(2);
        app.model.set("prob" + i + "," + j, value);
      }
    }
  };

  this.stopSimulation = function() {
    app.selectState(app.getState());
    if (app.timer != undefined) {
      clearInterval(app.timer);
      app.timer = undefined;
    }
  }
  
  this.runSimulationSteps = function(nsteps) {
    return function() {
      performSteps(nsteps); 
    };
  };

  this.startSimulation = function() {
    app.stopSimulation();

    var speed = parseInt(app.model.get("speed"));
    if (speed <= 30) {
      // do one step per call, and call each 1/speed seconds
      app.timer = setInterval(app.runSimulationSteps(1), 1000 / speed);
    } else {
      // call roughly each 50 ms and do a number of steps in the same call 
      var steps = Math.ceil(speed / 30); 
      app.timer = setInterval(app.runSimulationSteps(steps), 1000 * steps / speed);
    }
  };
  
  this.resetSimulation = function() {
    app.stopSimulation();
    app.model.set("steps", 0);
    for (var i = 0; i < app.nstates; i++) {
      app.model.set("count-" + i, 0);
      app.model.set("percentage-" + i, "-");
    }
  };
  
  this.setSpeed = function(speed) {
    app.model.set("speed", speed);
  };
  
  this.getState = function() {
    return app.model.get("state");
  };
  

  this.start = function() {
    $('.dropdown-toggle').dropdown();

    createGraph();
    createButtons();
    createMatrix();
    createStats();

    app.setSpeed(2);
    app.selectState(0);
    
    var p = 0.3;
    var q = 0.7;
    app.setMatrix([ 
       [p,q,0,0,0], 
       [p,0,q,0,0],
       [p,0,0,q,0],
       [p,0,0,0,q],
       [p,0,0,0,q]]);
       
    app.resetSimulation();
  };
}

