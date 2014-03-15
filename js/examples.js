function loadDefaultExample() {
  var p = 0.3;
  var q = 1.0 - p;
  app.setMatrix([
    [p,q,0,0,0],
    [p,0,q,0,0],
    [p,0,0,q,0],
    [p,0,0,0,q],
    [p,0,0,0,q]]);
}

function loadCounterExample() {
  var p = 1.0;
  app.setMatrix([
    [0,p,0,0,0],
    [0,0,p,0,0],
    [0,0,0,p,0],
    [0,0,0,0,p],
    [p,0,0,0,0]]);
}

function loadTwoClassExample() {
  var p = 0.3;
  var q = 1.0 - p;

  var r = 0.2;
  var s = 0.3;
  var t = 1.0 - r - s;
  app.setMatrix([
    [p,q,0,0,0],
    [q,p,0,0,0],
    [0,0,r,s,t],
    [0,0,t,r,s],
    [0,0,s,t,r]]);
}

function loadTwoClassWithSmallJumpExample() {
  var p = 0.3;
  var q = 1.0 - p;
  var e = 0.02;

  var r = 0.2;
  var s = 0.3;
  var t = 1.0 - r - s;
  app.setMatrix([
    [p-e,q,e,0,0],
    [q,p,0,0,0],
    [e,0,r-e,s,t],
    [0,0,t,r,s],
    [0,0,s,t,r]]);
}

function loadPeriodicExample() {
  var p = 0.3;
  var q = 1.0 - p;

  app.setMatrix([
    [0,0,0,p,q],
    [0,0,0,p,q],
    [0,0,1,0,0],
    [p,q,0,0,0],
    [p,q,0,0,0]]);
}


