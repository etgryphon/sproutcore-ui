/*globals SCUI*/

(function() {

  var view;

  module('Undoable', {
    setup: function() {

      view = SC.View.create(SCUI.Undoable, {
        undoableProperties: ['foo', 'bar'],
        foo: null,
        bar: null
      });
    }
  });

  test('basic undo/redo works', function () {
    SC.RunLoop.begin();
    view.set('foo', 'monkey');
    view.set('bar', 'foot');
    SC.RunLoop.end();
    
    equals(view.get('foo'), 'monkey', "set foo to monkey");
    equals(view.get('bar'), 'foot', "set bar to foot");
    
    var undoManager = view.get('undoManager');

    SC.RunLoop.begin();
    undoManager.undo();
    SC.RunLoop.end();
    
    equals(view.get('bar'), null, "foo went back to null after undo");
    
    SC.RunLoop.begin();
    undoManager.undo();
    SC.RunLoop.end();
    
    equals(view.get('foo'), null, "bar went back to null after undo");    
    
    SC.RunLoop.begin();
    undoManager.redo();
    SC.RunLoop.end();
    
    equals(view.get('foo'), 'monkey', "foo went back to monkey after redo");
    
    SC.RunLoop.begin();
    undoManager.redo();
    SC.RunLoop.end();
    
    equals(view.get('bar'), 'foot', "bar went back to foot after redo");
  });
})();