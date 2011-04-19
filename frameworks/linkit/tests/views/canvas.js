sc_require('views/canvas');

(function() {

  var pane = SC.ControlTestPane.design({ height: 600 });

  pane.add('canvas', LinkIt.CanvasView, {
    layout: { left: 0, right: 0, top: 0, bottom: 0 },
    nodes: [
      SC.Object.create(LinkIt.Node, {
        nodeID: '1',
        position: { x: 0, y: 0 }
      })
    ]
  });

  pane.show();
  
  module('LinkIt.CanvasView UI', pane.standardSetup());
  
  test('all', function() {
    ok(true);
  });
  
})();

