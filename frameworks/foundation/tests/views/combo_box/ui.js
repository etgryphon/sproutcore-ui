/*globals SCUI*/

(function() {
  var pane = SC.ControlTestPane.design()
    .add('empty', SCUI.ComboBoxView, {
      hint: "this is the hint",
      valueKey: 'value',
      nameKey: 'name',
      objects: [
        SC.Object.create({ value: 'value 1', name: 'name 1' }),
        SC.Object.create({ value: 'value 2', name: 'name 2' }),
        SC.Object.create({ value: 'value 3', name: 'name 3' })
      ]
    })
    
    .add('with value', SCUI.ComboBoxView, {
      value: 'hello'
    })
    
    .add('disabled - empty', SCUI.ComboBoxView, {
      isEnabled: NO,
      hint: "this is the hint"
    })
    
    .add('disabled - with value', SCUI.ComboBoxView, {
      isEnabled: NO,
      value: 'hello'
    });

  pane.show();

  var textFieldClass = 'scui-combobox-text-field-view';
  var buttonClass = 'sc-button-view';
  var listPaneClass = 'scui-combobox-list-pane';
  var listScrollClass = 'scui-combobox-list-scroll-view';
  var listViewClass = 'scui-combobox-list-view';
  var spinnerClass = 'scui-combobox-spinner-view';

  pane.verifyDomStructure = function verifyDomStructure(view) {
    var layer = view.$();
    var textField = view.$('.%@'.fmt(textFieldClass));
    var dropDownButton = view.$('.%@'.fmt(buttonClass));

    ok(layer.hasClass('scui-combobox-view'), "Top div has class 'scui-combobox-view'");
    equals(layer.children().length, 2, "Top div has two children");
    ok(textField.length, "Has child with class %@".fmt(textFieldClass));
    ok(dropDownButton.length, "Has child with class %@".fmt(buttonClass));
  };

  pane.verifyEmpty = function verifyEmpty(view) {
    var textFieldView = view.$('.%@'.fmt(textFieldClass)).view()[0];
    ok(!textFieldView.get('value'), "Text field value is empty");
    ok(!view.get('selectedObject'), "'selectedObject' is empty");
    ok(!view.get('value'), "Combo box value is empty");
    equals(view.get('hint'), textFieldView.get('hint'), "Text field hint is combo box hint");
  };

  pane.verifyDisabled = function verifyDisabled(view) {
    var layer = view.$();
    var textField = view.$('.%@'.fmt(textFieldClass));
    var dropDownButton = view.$('.%@'.fmt(buttonClass));

    ok(layer.hasClass('disabled'), "Top div has class 'disabled'");
    ok(textField.hasClass('disabled'), "Text field has class 'disabled'");
    ok(dropDownButton.hasClass('disabled'), "Drop down button has class 'disabled'");
  };

  pane.verifyListVisibility = function verifyListVisibility(shouldBeVisible) {
    var list = SC.$('.%@'.fmt(listPaneClass));

    if (shouldBeVisible) {
      ok(list.length, "Drop down list is present");
    }
    else {
      ok(!list.length, "Drop down list is not present");
    }
  };
  
  pane.verifyStatusIndicator = function verifyStatusIndicator(comboBoxView, shouldBePresent) {
    var listPane = SC.$('.%@'.fmt(listPaneClass)).view()[0];
    var listScrollView = listPane.$('.%@'.fmt(listScrollClass)).view()[0];
    var spinnerLayer = listPane.$('.%@'.fmt(spinnerClass));
    var spinnerView = spinnerLayer.view()[0];

    if (shouldBePresent) {
      ok(comboBoxView.get('status') & SC.Record.BUSY, "'status' is busy");
      ok(comboBoxView.get('isBusy'), "'isBusy' returns true");
      ok(spinnerLayer.length, "spinner view is present");
      ok(spinnerView.get('isVisible'), "spinner view is visible");
      equals(spinnerView.get('frame').height, comboBoxView.get('statusIndicatorHeight'), "spinner view has specified height");
      equals(listScrollView.get('layout').bottom, comboBoxView.get('statusIndicatorHeight'), "list scroll view makes room for spinner");
    }
    else {
      ok(!(comboBoxView.get('status') & SC.Record.BUSY), "'status' is not busy");
      ok(!comboBoxView.get('isBusy'), "'isBusy' returns false");
      ok(spinnerLayer.length, "spinner view is present");
      ok(!spinnerView.get('isVisible'), "spinner view is not visible");
      equals(listScrollView.get('layout').bottom, 0, "list scroll view takes all available space");
    }
  };

  module('SCUI.ComboBoxView ui', pane.standardSetup());
  
  test('empty', function() {
    var view = pane.view('empty');
    pane.verifyDomStructure(view);
    pane.verifyEmpty(view);
  });
  
  test('disabled - empty', function() {
    var view = pane.view('disabled - empty');
    pane.verifyDomStructure(view);
    pane.verifyEmpty(view);
    pane.verifyDisabled(view);
  });

  test('with value', function() {
    var view = pane.view('with value');
    pane.verifyDomStructure(view);
  });
  
  test('disabled - with value', function() {
    var view = pane.view('disabled - with value');
    pane.verifyDomStructure(view);
    pane.verifyDisabled(view);
  });
  
  test('toggling drop down list', function() {
    var view = pane.view('empty');
    var list;
    
    // verify not visible
    pane.verifyListVisibility(NO);
    
    // show the list
    SC.RunLoop.begin();
    view.showList();
    SC.RunLoop.end();
    pane.verifyListVisibility(YES);

    // hide the list again
    SC.RunLoop.end();
    view.hideList();
    SC.RunLoop.end();
    pane.verifyListVisibility(NO);
  });

  test('begin/commit editing', function() {
    var view = pane.view('empty');
    var textField = view.$('.%@'.fmt(textFieldClass)).view()[0];
    
    // begin editing
    SC.RunLoop.begin();
    view.beginEditing();
    SC.RunLoop.end();
    ok(view.get('isEditing'), "Combo box is editing");
    ok(textField.get('isEditing'), "Text field is editing");

    // force list visible
    SC.RunLoop.begin();
    view.showList();
    SC.RunLoop.end();
    pane.verifyListVisibility(YES);
    
    // commit editing
    SC.RunLoop.end();
    view.commitEditing();
    SC.RunLoop.end();
    ok(!view.get('isEditing'), "Combo box is not editing");
    ok(!textField.get('isEditing'), "Text field is not editing");
    pane.verifyListVisibility(NO);
  });

  test('objects', function() {
    var view = pane.view('empty');
    var listPane, listView;
    
    SC.RunLoop.begin();
    view.beginEditing();
    view.showList();
    SC.RunLoop.end();

    listPane = SC.$('.%@'.fmt(listPaneClass)).view()[0];
    listView = listPane.$('.%@'.fmt(listViewClass)).view()[0];
    ok(view.get('filteredObjects').isEqual(listView.get('content')), "'content' in list view same as 'objects' in combo box");

    // clean up pane
    SC.RunLoop.begin();
    view.commitEditing();
    SC.RunLoop.end();
  });

  test('status', function() {
    var view = pane.view('empty');
    var listPane, listView, spinnerView, spinnerLayer;

    // set status of 'objects' to busy
    SC.RunLoop.begin();
    view.beginEditing();
    view.showList();
    view.setPath('objects.status', SC.Record.BUSY_REFRESH);
    SC.RunLoop.end();

    pane.verifyStatusIndicator(view, YES);

    // set status of 'objects' to not busy
    SC.RunLoop.begin();
    view.setPath('objects.status', SC.Record.READY);
    SC.RunLoop.end();

    pane.verifyStatusIndicator(view, NO);

    // clean up pane
    SC.RunLoop.end();
    view.commitEditing();
    SC.RunLoop.end();
  });

})();

