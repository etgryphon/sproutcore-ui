// ==========================================================================
// SCUI.Recurrent Unit Test
// ==========================================================================
/**
  @author Evin Grano
*/
var testObj, functionCount;

// ..........................................................
// CONTENT CHANGING
// 

module("SCUI.Recurrent Mixin", {
  setup: function() {
    functionCount = 0;
    testObj = SC.Object.create(SCUI.Recurrent,{ 
      specialFunction: function(){
        functionCount+=1;
      },
                  
      validate: function(){
        return YES;
      }
    });
  },
  
  teardown: function() {
    functionCount = 0;
    testObj.destroy();
  }
});

test("single fire mode should work", function() {
  testObj.fireOnce('special', 1, 'validate');
  equals(functionCount, 1, 'functionCount should fire count is 1');
});


