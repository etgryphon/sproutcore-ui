// ========================================================================
// SCUI.ContextMenuPane
// ========================================================================

sc_require('core');

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
    If evt is a right-click, this method pops up a context menu next to the mouse click.
    Returns YES if we popped up a context menu, otherwise NO.
    
    AnchorView must be a valid SC.View object.
  */
  popup: function(anchorView, evt) {
    if (!anchorView || !anchorView.isView) return NO;
  
    if (evt && evt.button && (evt.which === 3 || (evt.ctrlKey && evt.which === 1))) {
  
      // FIXME [JH2] This is sooo nasty. We should register this event with SC's rootResponder?
      // After talking with charles we need to handle oncontextmenu events when we want to block
      // the browsers context meuns. (SC does not handle oncontextmenu event.)
      document.oncontextmenu = function() { return false; };
  
      // calculate offset needed from top-left of anchorViewOrElement to position the menu
      // pane next to the mouse click location
      var offsetX = 0, offsetY = 0;
      var pv = anchorView.get('parentView');
      var frame = anchorView.get('frame');
      var globalFrame = pv ? pv.convertFrameToView(frame, null) : frame;
      if(globalFrame){
        offsetX = evt.pageX - globalFrame.x;
        offsetY = evt.pageY - globalFrame.y;
      }
  
      var anchor = anchorView.isView ? anchorView.get('layer') : anchorView;
  
      // Popup the menu pane
      this.beginPropertyChanges();
      var it = this.get('displayItems');
      this.set('anchorElement', anchor) ;
      this.set('anchor', anchorView);
      this.set('preferType', SC.PICKER_MENU) ;
      this.set('preferMatrix', [offsetX + 5, offsetY + 5, 1]) ;
      this.endPropertyChanges();
      this.append();
      this.positionPane();
      this.becomeKeyPane();
  
      return YES;
    }
    else {
      document.oncontextmenu = ""; // restore default browser context menu handling
    }
    return NO;
  },
  
  /**
    Override remove() to restore the default browser context menus when this pane goes away.
  */
  remove: function() {
    document.oncontextmenu = "";
    return sc_super();
  }

});
