/*globals SCUI*/
// TODO: tests for canDeleteValue, setFromString
(function() {
  var pane = SC.ControlTestPane.design()
    .add('empty', SCUI.TimePickerView, {
      hint: "this is the hint"
    })
    
    .add('with value', SCUI.TimePickerView, {
      value: 'hello'
    })
    
    .add('disabled - empty', SCUI.TimePickerView, {
      isEnabled: NO,
      hint: "this is the hint"
    })
    
    .add('disabled - with value', SCUI.TimePickerView, {
      isEnabled: NO,
      value: 'hello'
    })
    
    .add('hourly', SCUI.TimePickerView, {
      step:60
    })
    
    .add('separator', SCUI.TimePickerView, {
      separator: '.'
    })
    
    .add('twelveHourTime', SCUI.TimePickerView, {
      show24HourTime: NO
    })
    
    .add('startTime, endTime', SCUI.TimePickerView, {
      startTime:SC.DateTime.create({hour:3, minute:15}),
      endTime:SC.DateTime.create({hour:20, minute:15})
    });

  pane.show();

  var textFieldClass = 'scui-timepicker-text-field-view',
      listPaneClass = 'scui-combobox-list-pane',
      listViewClass = 'scui-combobox-list-view';

  pane.verifyDomStructure = function verifyDomStructure(view) {
    var layer = view.$();
    var textField = view.$('.%@'.fmt(textFieldClass));

    ok(layer.hasClass('scui-timepicker-view'), "Top div has class 'scui-timepicker-view'");
    ok(textField.length, "Has child with class %@".fmt(textFieldClass));
  };

  pane.verifyEmpty = function verifyEmpty(view) {
    var textFieldView = view.$('.%@'.fmt(textFieldClass)).view()[0];
    ok(!textFieldView.get('value'), "Text field value is empty");
    ok(!view.get('selectedObject'), "'selectedObject' is empty");
    ok(!view.get('value'), "Timepicker value is empty");
    equals(view.get('hint'), textFieldView.get('hint'), "Text field hint is timepicker hint");
  };

  pane.verifyDisabled = function verifyDisabled(view) {
    var layer = view.$();
    var textField = view.$('.%@'.fmt(textFieldClass));

    ok(layer.hasClass('disabled'), "Top div has class 'disabled'");
    ok(textField.hasClass('disabled'), "Text field has class 'disabled'");
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

  module('SCUI.TimePickerView ui', pane.standardSetup());
  
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
    ok(view.get('isEditing'), "Timepicker is editing");
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
    ok(!view.get('isEditing'), "Timepicker is not editing");
    ok(!textField.get('isEditing'), "Text field is not editing");
    pane.verifyListVisibility(NO);
  });
  
  test('timeChoices based on step', function(){
    var view = pane.view('hourly');
    ok(view.get('timeChoices')[0].toString() === '00:00', "times in list should be once an hour on the hour");
    ok(view.get('timeChoices')[1].toString() === '01:00', "times in list should be once an hour on the hour");
  });
  
  test('timeChoices use specified separator', function(){
    var view = pane.view('separator');
    ok(view.get('timeChoices')[1].toString() === '00.30', "time representation should use a period instead of a colon");
  });
  
  test('timeChoices use specified separator', function(){
    var view = pane.view('twelveHourTime');
    ok(view.get('timeChoices')[1].toString() === '12:30 AM', "time representation should use twelve hour time with AM/PM");
    ok(view.get('timeChoices').lastObject().toString() === '11:30 PM', "time representation should use twelve hour time with AM/PM");
  });
  
  test('timeChoices based on startTime and endTime', function(){
    var view = pane.view('startTime, endTime');
    ok(view.get('timeChoices')[0].toString() === '03:15', "times in list should be every 30 minutes starting at 03:15 until 20:15");
    ok(view.get('timeChoices')[1].toString() === '03:45', "times in list should be every 30 minutes starting at 03:15 until 20:15");
    ok(view.get('timeChoices').lastObject().toString() === '20:15', "times in list should be every 30 minutes starting at 03:15 until 20:15");
  });
  
  test('timeChoices in list', function() {
    var view = pane.view('empty');
    var listPane, listView;
    
    SC.RunLoop.begin();
    view.beginEditing();
    view.showList();
    SC.RunLoop.end();
    
    listPane = SC.$('.%@'.fmt(listPaneClass)).view()[0];
    listView = listPane.$('.%@'.fmt(listViewClass)).view()[0];
    ok(view.get('timeChoices')[0].isEqual(listView.get('content')[0]), "'content' in the list view same as 'timeChoices' in the time picker");
    
    // clean up pane
    SC.RunLoop.begin();
    view.commitEditing();
    SC.RunLoop.end();
  });
  
  test('value is a SC.DateTime', function() {
    var view = pane.view('empty');
    var listPane, listView;
    
    SC.RunLoop.begin();
    view.beginEditing();
    SC.RunLoop.end();

    SC.RunLoop.begin();
    view.showList();
    SC.RunLoop.end();
    
    listPane = SC.$('.%@'.fmt(listPaneClass)).view()[0];
    listView = listPane.$('.%@'.fmt(listViewClass)).view()[0];
    
    SC.RunLoop.begin();
    listView.select(1);
    view._selectListItem();
    SC.RunLoop.end();
    
    SC.RunLoop.begin();
    view.commitEditing();
    SC.RunLoop.end();

    ok(view.get('value').instanceOf(SC.DateTime));
    equals(view.get('value').get('hour'), 0);
    equals(view.get('value').get('minute'), 30);
  });
  
  test('set from string', function(){
    var view = pane.view('empty');

    view.setFromString('12:30 AM', '%i:%M %p');
    
    ok(view.get('value').instanceOf(SC.DateTime));
    equals(view.get('value').get('hour'), 0);
    equals(view.get('value').get('minute'), 30);
  });
})();

