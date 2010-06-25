// ========================================================================
// SCUI.ContextMenuPane
// ========================================================================

/**

  Extends SC.MenuPane to position a right-click menu pane.

  How to use:
    
    In your view, override mouseDown() or mouseUp() like this:
  
    {{{
      mouseDown: function(evt) {
        var menuOptions = [
          { title: "Menu Item 1", target: null, 
            action: '', isEnabled: YES },
          { isSeparator: YES },
          { title: "Menu Item 2", 
            target: '', action: '', isEnabled: YES }
        ];    
  
        var pane = SCUI.ContextMenuPane.create({
          contentView: SC.View.design({}),
          layout: { width: 194, height: 0 },
          itemTitleKey: 'title',
          itemTargetKey: 'target',
          itemActionKey: 'action',
          itemSeparatorKey: 'isSeparator',
          itemIsEnabledKey: 'isEnabled',
          items: menuOptions
        });
  
        pane.popup(this, evt); // pass in the mouse event so the pane can figure out where to put itself

        return sc_super(); // or whatever you want to do
      }  
    }}}

  @extends SC.MenuPane
  @author Josh Holt
  @author Jonathan Lewis


*/

SCUI.ContextMenuPane = SC.MenuPane.extend({
  
  /**
    This flag is for the special case when the anchor view is using static
    layout, i.e ( SC.StackedView, or mixn SC.StaticLayout).
  */
  usingStaticLayout: NO,
  
  /**
    If evt is a right-click, this method pops up a context menu next to the mouse click.
    Returns YES if we popped up a context menu, otherwise NO.
    
    AnchorView must be a valid SC.View object.
  */
  popup: function(anchorView, evt) {
    var items = this.get('items');
    if (!items || items.get('length') <= 0) return NO;
    if ((!anchorView || !anchorView.isView) && !this.get('usingStaticLayout')) return NO;
  
    if (evt && evt.button && (evt.which === 3 || (evt.ctrlKey && evt.which === 1))) {
  
      
      // prevent the browsers context meuns (if it has one...). (SC does not handle oncontextmenu event.)
      document.oncontextmenu = function(e) {
        if (evt.preventDefault) {
          evt.preventDefault();
        } else { 
          evt.stop();
        }
        evt.returnValue = false;
        evt.stopPropagation();
        return false;
      };
      
      // calculate offset needed from top-left of anchorViewOrElement to position the menu
      // pane next to the mouse click location
      var anchor = anchorView.isView ? anchorView.get('layer') : anchorView;  
      var gFrame = SC.viewportOffset(anchor);
      var offsetX = evt.pageX - gFrame.x;
      var offsetY = evt.pageY - gFrame.y;

      // Popup the menu pane
      this.beginPropertyChanges();
      var it = this.get('displayItems');
      this.set('anchorElement', anchor) ;
      this.set('anchor', anchorView);
      this.set('preferType', SC.PICKER_MENU) ;
      this.endPropertyChanges();
      
      return arguments.callee.base.apply(this,[anchorView, [offsetX + 2, offsetY + 2, 1] ]);
    }
    else {
      //document.oncontextmenu = null; // restore default browser context menu handling
    }
    return NO;
  },

  /**
    Override remove() to restore the default browser context menus when this pane goes away.
  */
  remove: function() {
   //this.invokeLater(function(){document.oncontextmenu = null; console.log('removing contextmenu event');}); //invoke later to ensure the event is over...
    return sc_super();
  },
  
  
  /**
   * The following events are receiving the event argument as the second 
   * argument so we are capturing both args and then pass the evt on to the 
   * super (menu pane) to be handled or not.
   *  
   * This also handles the case where the the event is actually sent correctly
   * and thus pass on the sender as the event b/c in correct situations the 
   * sender argument is the event...
   */
  
  keyUp: function(sender, evt) {
    if (evt && evt.commandCodes) {
      return arguments.callee.base.apply(this,[evt]);
    }
    else if (sender && sender.commandCodes) {
      return arguments.callee.base.apply(this,[sender]);
    }
    else {
     return NO; 
    }
  },
  
  keyDown: function(sender, evt) {
    if (evt && evt.commandCodes) {
      return arguments.callee.base.apply(this,[evt]);
    }
    else if (sender && sender.commandCodes) {
      return arguments.callee.base.apply(this,[sender]);
    }
    else {
     return NO; 
    }

  },
  
  exampleView: SC.MenuItemView.extend({
    keyUp: function(sender, evt) {
      if (evt && evt.commandCodes) {
        return arguments.callee.base.apply(this,[evt]);
      }
      else if (sender && sender.commandCodes) {
        return arguments.callee.base.apply(this,[sender]);
      }
      else {
       return NO; 
      }
    },

    keyDown: function(sender, evt) {
      if (evt && evt.commandCodes) {
        return arguments.callee.base.apply(this,[evt]);
      }
      else if (sender && sender.commandCodes) {
        return arguments.callee.base.apply(this,[sender]);
      }
      else {
       return NO; 
      }
    }
  })
  

});

