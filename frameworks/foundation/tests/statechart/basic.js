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
      init: function(){
        sc_super();
        this.foo = (this.foo);
        this.bar = SCUI.Statechart.registerState(this.bar);
        
      },
      fooState: SCUI.Statechart.registerState({
        name: 'foo',
        
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
      
      bar: {
        name: 'bar',
        
        enterState: function(){

        },

        exitState: function(){

        },

        blah: function(){
          this.goState('bar');
        }

      }     
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

test("basic sendAction", function(){
  basic.foo.goState('foo');
  equals(null, basic.get('whateverWasCalled'), "nothing to report");
  basic.sendAction("whatever");
  equals(YES, basic.get("whateverWasCalled"), "whatever method was called");
  
  
});



