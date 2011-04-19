// ==========================================================================
// SCUI.CollapsibleView
// ==========================================================================

/** @class

  This is a really simple view that toggles between two view for an expanded and a collapsed view

  @extends SC.ContainerView
  @author Evin Grano
  @version 0.1
  @since 0.1
*/

SCUI.CollapsibleView = SC.ContainerView.extend(
/** @scope SCUI.CollapsibleView.prototype */ {
  
  classNames: ['scui-collapsible-view'],
  
  /**
    This is the reference to the expanded view...
    This view will show when the CollapsedView is expanded
    
    @field {String, SC.View}
  */
  expandedView: null,
  /**
    This is the reference to the collapsed view...
    This view will show when the CollapsedView is collapsed
    
    @field {String, SC.View}
  */
  collapsedView: null,
  
  // Private Elements
  _isCollapsed: NO,
  _expandedView: null,
  _collapsedView: null,
  
  displayProperties: ['expandedView', 'collapsedView'],
  
  createChildViews: function(){
    var expandedView = this.get('expandedView');
    this._expandedView = this._createChildViewIfNeeded(expandedView);
    
    var collapsedView = this.get('collapsedView');
    this._collapsedView = this._createChildViewIfNeeded(collapsedView);
    
    // On Init show the expandedView
    this.set('nowShowing', this._expandedView);
    var view = this.get('contentView');
    this._adjustView(view);
  },
  
  // Actions
  expand: function(){
    if (this._expandedView){
      this.set('nowShowing', this._expandedView);
      var view = this.get('contentView');
      this._isCollapsed = NO;
      this.displayDidChange();
      this._adjustView(view);
    }
  },
  
  collapse: function(){
    if (this._collapsedView){
      this.set('nowShowing', this._collapsedView);
      var view = this.get('contentView');
      this._isCollapsed = YES;
      this.displayDidChange();
      this._adjustView(view);
    }
  },
  
  toggle: function(){
    if (this._isCollapsed){
      this.expand();
    }
    else{
      this.collapse();
    }
  },
  
  /**
    Invoked whenever expandedView is changed and changes out the view if necessary...
  */
  _expandedViewDidChange: function() {
    var expandedView = this.get('expandedView');
    console.log('%@._expandableViewDidChange(%@)'.fmt(this, expandedView));
    this._expandedView = this._createChildViewIfNeeded(expandedView);
    if (!this._isCollapsed) this.expand();
  }.observes('expandedView'),
  
  /**
    Invoked whenever collapsedView is changed and changes out the view if necessary...
  */
  _collapsedViewDidChange: function() {
    var collapsedView = this.get('collapsedView');
    console.log('%@._collapsedViewDidChange(%@)'.fmt(this, collapsedView));
    this._collapsedView = this._createChildViewIfNeeded(collapsedView);
    if (this._isCollapsed) this.collapse();
  }.observes('collapsedView'),
  
  // Private functions
  _adjustView: function(view){
    if (view){
      var frame = view.get('frame');
      var layout = this.get('layout');
      console.log('CollapsibleView: Frame for (%@): width: %@, height: %@'.fmt(view, frame.height, frame.width));
      layout = SC.merge(layout, {height: frame.height, width: frame.width});
      this.adjust(layout);
    }
  },
  
  _createChildViewIfNeeded: function(view){
    if (SC.typeOf(view) === SC.T_CLASS){
      return this.createChildView(view);
    }
    else{
      return view;
    }
  }
});

