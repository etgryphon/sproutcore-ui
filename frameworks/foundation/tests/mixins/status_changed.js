// ==========================================================================
// SCUI.StatusChanged Unit Test
// ==========================================================================
/**
  @author Mike Ball
*/
var content, controller, statusChangeCount;

// ..........................................................
// CONTENT CHANGING
// 

module("SCUI.StatusChanged Mixin", {
  setup: function() {
    content = null;
    statusChangeCount = 0;
    controller = SC.ObjectController.create(SCUI.StatusChanged,{ 
                                        content: content, 
                                        contentStatusDidChange: function(){
                                          statusChangeCount+=1;
                                        }});
  },
  
  teardown: function() {
    statusChangeCount = 0;
    content = null;
    controller.destroy();
  }
});

test("setting a content object without a status shouldn't call statusDidChange", function() {
  controller.set('content', SC.Object.create({}));
  equals(statusChangeCount, 0, 'statusChanged shouldnt fire');
  controller.set('content', {});
  equals(statusChangeCount, 0, 'statusChanged shouldnt fire');
  controller.set('content', []);
  equals(statusChangeCount, 0, 'statusChanged shouldnt fire');
});

test("setting content with status should change status", function() {
  content = SC.Object.create({status: 'what now'});
  
  SC.RunLoop.begin();
  controller.set('content', content);
  SC.RunLoop.end();
  
  equals(statusChangeCount, 1, 'statusChanged should fire count is 1');
  
  SC.RunLoop.begin();
  content.set('status', "hello nurse");
  SC.RunLoop.end();
  
  equals(statusChangeCount, 2, 'statusChanged should fire count is 2');
  
});


