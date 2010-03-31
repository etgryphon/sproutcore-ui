// ==========================================================================
// SCUI.Statechart Unit Test
// ==========================================================================
/**
  @author Mike Ball
*/
var basic;

// ..........................................................
// CONTENT CHANGING
// 

module("SCUI.Statechart Mixin", {
  setup: function() {
    basic = SC.Object.create(SCUI.Statechart,{
     
      foo: SCUI.Statechart.registerState({
        parentState: 'bar',

        enterState: function(){

        },

        exitState: function(){

        },
        
        
        blah: function(){
          this.goState('bar');
        },
        
        whatever: function(){
          basic.set('whateverWasCalled', YES);
        }
      }),
      
      bar: SCUI.Statechart.registerState({
        
        enterState: function(){

        },

        exitState: function(){

        },

        blah: function(){
          this.goState('bar');
        }

      })     
    });
  },
  
  teardown: function() {
    basic.destroy();
  }
});

test("basic state transition", function() {
  basic.foo.goState('foo');
  equals(basic.foo, basic.foo.state(), "should be in state foo");
  basic.foo.goState('bar');
  equals(basic.bar, basic.bar.state(), "should be in state bar");
  equals(basic.bar, basic.foo.state(), "should be in state bar");
});

test("basic sendEvent", function(){
  basic.foo.goState('foo');
  equals(basic.get('whateverWasCalled'), null, "nothing to report");
  basic.sendEvent("whatever");
  equals(basic.get("whateverWasCalled"), YES, "whatever method was called");
});

test("test method alias", function(){
  equals(basic.sendAction, basic.sendEvent, "these methods are the same");
});



