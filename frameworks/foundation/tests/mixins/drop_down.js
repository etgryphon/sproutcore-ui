// ==========================================================================
// SCUI.DropDown Unit Test
// ==========================================================================
/**
  @author Brandon Blatnick
*/

var buttonView = 
SC.ButtonView.design(SCUI.DropDown, {
  layout: { right: 116, centerY: -1, height: 22, width: 94 },
  title: "_Actions".loc(),
  menu: SC.MenuPane.design({
    contentView: SC.View.design({}), /* blank view; sproutcore will take care of this automatically */
    layout: { width: 116, height: 0 }, /* height gets set automatically */
    itemTitleKey: 'title',
    itemTargetKey: 'target',
    itemActionKey: 'action',
    itemSeparatorKey: 'isSeparator',
    itemIsEnabledKey: NO,
    items: [
      { title: "_New".loc() },
      { title: "_Copy".loc() },
      { title: "_Save".loc() },
      { title: "_Delete".loc() },
      { isSeparator: YES },
      { title: "_Settings".loc() },
      { isSeparator: YES },
      { title: "_Test".loc() },
      { title: "_Deploy".loc() }
    ]
  })
});

var simpleButton = 
SC.View.design(SCUI.SimpleButton, SCUI.DropDown, {
  layout: { left: 0, top: 0, height: 25, width: 62 },
  title: "_Assets".loc(),
  menu: SC.MenuPane.design({
    contentView: SC.View.design({}), /* blank view; sproutcore will take care of this automatically */
    layout: { width: 116, height: 0 }, /* height gets set automatically */
    itemTitleKey: 'title',
    itemTargetKey: 'target',
    itemActionKey: 'action',
    itemIconKey: 'icon',
    itemSeparatorKey: 'isSeparator',
    itemIsEnabledKey: NO,
    items: [
      { title: "_Landing Pages".loc() },
      { title: "_Emails".loc() },
      { title: "_Forms".loc() },
      { isSeparator: YES },
      { title: "_Global Sections".loc() },
      { title: "_Email Headers".loc() },
      { title: "_Email Footers".loc() },
      { title: "_Hyperlinks".loc() },
      { title: "_Images".loc() }
    ]
  })
});

var invalidView = 
SC.View.design(SCUI.DropDown, {
  layout: { right: 116, centerY: -1, height: 22, width: 94 },
  title: "_Actions".loc(),
  menu: SC.MenuPane.design({
    contentView: SC.View.design({}), /* blank view; sproutcore will take care of this automatically */
    layout: { width: 116, height: 0 }, /* height gets set automatically */
    itemTitleKey: 'title',
    itemTargetKey: 'target',
    itemActionKey: 'action',
    itemSeparatorKey: 'isSeparator',
    itemIsEnabledKey: NO,
    items: [
      { title: "_New".loc() },
      { title: "_Copy".loc() },
      { title: "_Save".loc() },
      { title: "_Delete".loc() },
      { isSeparator: YES },
      { title: "_Settings".loc() },
      { isSeparator: YES },
      { title: "_Test".loc() },
      { title: "_Deploy".loc() }
    ]
  })  
});


var pane = SC.ControlTestPane.design()
.add("buttonView", buttonView)

.add("simpleButton", simpleButton)

.add("invalidView", invalidView);
      
pane.show(); // add a test to show the test pane
window.pane = pane ;

// ..........................................................
// TEST CASES
// 
module("SCUI.DropDown", pane.standardSetup());

test("Check basic visibility", function() {
  ok(pane.view('buttonView').get('isVisibleInWindow'), 'buttonView.isVisibleInWindow should be YES');
  ok(pane.view('simpleButton').get('isVisibleInWindow'), 'simpleButton.isVisibleInWindow should be YES');
  ok(pane.view('invalidView').get('isVisibleInWindow'), 'invalidView.isVisibleInWindow should be YES');
});

test("Check toggle functionality", function() {
  equals(pane.view('buttonView').get('isShowingDropDown'), NO, 'buttonView.isShowingDropDown should be NO');
  equals(pane.view('simpleButton').get('isShowingDropDown'), NO, 'simpleButton.isShowingDropDown should be NO');
  equals(pane.view('invalidView').get('isShowingDropDown'), NO , 'invalidView.isShowingDropDown should be NO');
  
  // replicate mouse clicking
  if (pane.view('buttonView')._triggerActionAfterDelay) {
    pane.view('buttonView')._triggerActionAfterDelay(); // SC 14
  } else {
    pane.view('buttonView').triggerAction(); // SC 10
  }
  equals(pane.view('buttonView').get('isShowingDropDown'), YES, 'buttonView.isShowingDropDown should be YES');
  
  pane.view('simpleButton').mouseDown();
  pane.view('simpleButton').mouseUp();
  equals(pane.view('simpleButton').get('isShowingDropDown'), YES, 'simpleButton.isShowingDropDown should be YES');
  
  if (pane.view('buttonView')._triggerActionAfterDelay) {
    pane.view('buttonView')._triggerActionAfterDelay(); // SC 14
  } else {
    pane.view('buttonView').triggerAction(); // SC 10
  }
  equals(pane.view('buttonView').get('isShowingDropDown'), NO, 'buttonView.isShowingDropDown should be NO');
  
  pane.view('simpleButton').mouseDown();
  pane.view('simpleButton').mouseUp();
  equals(pane.view('simpleButton').get('isShowingDropDown'), NO, 'simpleButton.isShowingDropDown should be NO');
});

