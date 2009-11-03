SCUI.testView1 = SC.View.design({
  layout: { top: 0, bottom: 0, right: 0, left: 0 },
  backgroundColor: 'red'
});

SCUI.testView2 = SC.View.design({
  layout: { top: 0, bottom: 0, right: 0, left: 0 },
  backgroundColor: 'green'
});

SCUI.testView3 = SC.View.create({
  layout: { top: 0, bottom: 0, right: 0, left: 0 },
  backgroundColor: 'blue'
});

SCUI.testView4 = SC.View.create({
  layout: { top: 0, bottom: 0, right: 0, left: 0 },
  backgroundColor: 'yellow'
});

SCUI.TestController = SC.Object.create({
  
  value: null,
  
  leftAccessoryWidth: 10,
  
  rightAccessoryWidth: 10,
  
  leftAccessoryView: SCUI.testView1,
  
  rightAccessoryView: SCUI.testView2,
  
  displayTextFieldValue: function() {
    console.log('text field value: %@'.fmt(this.get('value')));
  },
  
  toggleLeftAccessoryView: function() {
    if (!this._nextLeft) {
      this.set('leftAccessoryWidth', 10);
      this.set('leftAccessoryView', SCUI.testView1);
      this._nextLeft = YES;
    } else {
      this.set('leftAccessoryWidth', 100);
      this.set('leftAccessoryView', SCUI.testView3);
      this._nextLeft = NO;
    }
  },
  
  toggleRightAccessoryView: function() {
    if (!this._nextRight) {
      this.set('rightAccessoryWidth', 10);
      this.set('rightAccessoryView', SCUI.testView2);
      this._nextRight = YES;
    } else {
      this.set('rightAccessoryWidth', 100);
      this.set('rightAccessoryView', SCUI.testView4);
      this._nextRight = NO;
    }
  }
  
});

var pane = SC.ControlTestPane.design()

.add("default", SCUI.TextFieldView, {
  classNames: 'unit-test'.w(),
  layout: { height: 25 }
})

.add("value", SCUI.TextFieldView, {
  classNames: 'unit-test'.w(),
  layout: { height: 25 },
  value: 'foobar'
})

.add("value2", SCUI.TextFieldView, {
  classNames: 'unit-test'.w(),
  layout: { height: 21 },
  value: 'foobar'
})

.add("disabled", SCUI.TextFieldView, {
  classNames: 'unit-test'.w(),
  layout: { height: 25 },
  value: 'foobar',
  isEnabled: NO
})

.add("hint", SCUI.TextFieldView, {
  classNames: 'unit-test'.w(),
  layout: { height: 25 },
  hint: 'Search for contacts'
})

.add("hint and value", SCUI.TextFieldView, {
  classNames: 'unit-test'.w(),
  layout: { height: 25 },
  hint: 'Search for contacts',
  value: 'foo'
})

.add("key delegate", SCUI.TextFieldView, {
  classNames: 'unit-test'.w(),
  layout: { height: 25 },
  valueBinding: 'Orion.TestController.value',
  keyDelegate: SC.Object.create({
    keyUp: function(evt) {
      console.log('delegate: key up');
      if (evt.keyCode === 13) {
        Orion.TestController.displayTextFieldValue();
        return YES;
      }
      return NO;
    },
    keyDown: function(evt) {
      console.log('delegate: key down');
      return NO;
    }
  })
})

.add("left accessory view", SCUI.TextFieldView, {
  classNames: 'unit-test'.w(),
  layout: { height: 25 },
  leftAccessoryView: SC.View.design({
    layout: { top: 0, bottom: 0, right: 0, left: 0 },
    backgroundColor: 'blue'
  })
})

.add("right accessory view", SCUI.TextFieldView, {
  classNames: 'unit-test'.w(),
  layout: { height: 25 },
  rightAccessoryView: SC.View.design({
    layout: { top: 0, bottom: 0, right: 0, left: 0 },
    backgroundColor: 'orange'
  })
})

.add("left and right accessory views", SCUI.TextFieldView, {
  classNames: 'unit-test'.w(),
  layout: { height: 25 },
  leftAccessoryView: SC.View.design({
    layout: { top: 0, bottom: 0, right: 0, left: 0 },
    backgroundColor: 'blue'
  }),
  rightAccessoryView: SC.View.design({
    layout: { top: 0, bottom: 0, right: 0, left: 0 },
    backgroundColor: 'orange'
  })
})

.add("text field layout", SCUI.TextFieldView, {
  classNames: 'unit-test'.w(),
  layout: { height: 25 },
  textFieldLayout: { top: 2, bottom: 2, right: 2, left: 2 },
  backgroundColor: 'green',
  leftAccessoryView: SC.View.design({
    layout: { top: 0, bottom: 0, right: 0, left: 0 },
    backgroundColor: 'blue'
  }),
  rightAccessoryView: SC.View.design({
    layout: { top: 0, bottom: 0, right: 0, left: 0 },
    backgroundColor: 'orange'
  })
})

.add("left and right accessory widths", SCUI.TextFieldView, {
  classNames: 'unit-test'.w(),
  layout: { height: 25 },
  leftAccessoryWidth: 50,
  rightAccessoryWidth: 10,
  textFieldLayout: { top: 2, bottom: 2, right: 2, left: 2 },
  leftAccessoryView: SC.View.design({
    layout: { top: 0, bottom: 0, right: 0, left: 0 },
    backgroundColor: 'blue'
  }),
  rightAccessoryView: SC.View.design({
    layout: { top: 0, bottom: 0, right: 0, left: 0 },
    backgroundColor: 'orange'
  })
})

.add("accessory view binding", SC.View, {
  layout: { height: 60 },
  classNames: 'unit-test'.w(),
  childViews: 'header textField'.w(),
  header: SC.View.design({
    layout: { left: 0, right: 0, top: 0, height: 30 },
    childViews: 'left right'.w(),
    left: SC.ButtonView.design({
      layout: { left: 0, centerY: 0, height: 25, width: 100 },
      title: 'Toggle Left',
      target: SCUI.TestController,
      action: 'toggleLeftAccessoryView'
    }),
    right: SC.ButtonView.design({
      layout: { right: 0, centerY: 0, height: 25, width: 100 },
      title: 'Toggle Right',
      target: SCUI.TestController,
      action: 'toggleRightAccessoryView'
    })
  }),
  textField: SCUI.TextFieldView.design({
    layout: { left: 0, right: 0, bottom: 0, height: 25 },
    leftAccessoryViewBinding: 'SCUI.TestController.leftAccessoryView',
    leftAccessoryWidthBinding: 'SCUI.TestController.leftAccessoryWidth',
    rightAccessoryViewBinding: 'SCUI.TestController.rightAccessoryView',
    rightAccessoryWidthBinding: 'SCUI.TestController.rightAccessoryWidth'
  })
});
 
pane.show(); // add a test to show the test pane
window.pane = pane;


 
// ..........................................................
// TEST CASES
//
module('SCUI.TextFieldView ui', pane.standardSetup());
 
test("Check basic visibility", function() {

});