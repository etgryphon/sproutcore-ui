// ==========================================================================
// SCUI.WidgetContainerView
// ==========================================================================

sc_require('views/missing_widget');

/** @class

  Provides a widget container view used by the SCUI.DashboardView.  It holds
  one widget, overlays widget button views, and swaps between widget face and
  widget edit views.

  This widget container adjust its layout to fit the widget views it contains.

  @extends SC.View
  @author Jonathan Lewis
*/

SCUI.WidgetContainerView = SC.View.extend( SC.Control, {

  // PUBLIC PROPERTIES
  
  classNames: ['scui-widget-container-view'],

  /**
    Controls whether or not we are showing the delete handle over this widget.
  */
  canDeleteWidget: NO,

  /**
    Default layout, only needed as a last resort
  */
  layout: { left: 0, top: 0, width: 400, height: 200 },
  
  /**
    The view class to be used as the widget face (set automatically by the dashboard)
  */
  widgetViewClass: null,

  /**
    The view class to be used as the widget's edit view (set automatically by the dashboard)
  */
  widgetEditViewClass: null,

  /**
    View class to use for each widget's delete button.  Whatever view class is used here
    should be capable of acting like a button, and should have 'target' and 'action' properties
    that get fired when it is clicked.  These will be assigned values automatically for you when
    the view is instantiated.
  */
  deleteHandleViewClass: SC.View.extend( SCUI.SimpleButton, {
    classNames: ['scui-widget-delete-handle-view'],
    layout: { left: 0, top: 0, width: 28, height: 28 }
  }),

  /**
    View class to use for each widget's optional edit button.  Whatever view class is used here
    should be capable of acting like a button, and should have 'target' and 'action' properties
    that get fired when it is clicked.  These will be assigned values automatically for you when
    the view is instantiated.
  */
  editHandleViewClass: SC.View.extend( SCUI.SimpleButton, {
    classNames: ['scui-widget-edit-handle-view'],
    layout: { right: 0, top: 0, width: 28, height: 28 }
  }),

  /**
    View class to use for each widget's optional "done editing" button.  Whatever view class is used here
    should be capable of acting like a button, and should have 'target' and 'action' properties
    that get fired when it is clicked.  These will be assigned values automatically for you when
    the view is instantiated.
  */
  doneButtonViewClass: SC.ButtonView.extend({
    classNames: ['scui-widget-done-button-view'],
    layout: { right: 10, bottom: 10, width: 80, height: 24 },
    title: "Done".loc()
  }),

  displayProperties: ['canDeleteWidget', 'isEditing'],
  
  // PUBLIC METHODS

  /**
    Note this method creates all the child views we will need, but does not add them
    all to the childViews array immediately.  We use didCreateLayer() to trigger adding the
    correct set of child views at run-time.
  */
  createChildViews: function() {
    var viewClass;
    var content = this.get('content');
    var frame;
    var childViews = [];

    // create the widget view
    viewClass = this._getViewClass('widgetViewClass');
    if (!viewClass) {
      viewClass = SCUI.MissingWidgetView;
    }
    this._widgetView = this.createChildView(viewClass.design(), { content: content });
    
    // create the edit view
    viewClass = this._getViewClass('widgetEditViewClass');
    if (!viewClass) {
      viewClass = SCUI.MissingWidgetView.extend({
        backgroundColor: '#729c5a',
        message: "Widget's edit view is missing.".loc()
      });
    }
    this._editView = this.createChildView(viewClass.design(), { content: content });
    
    // create the delete handle view
    viewClass = this._getViewClass('deleteHandleViewClass');
    if (viewClass) {
      this._deleteHandleView = this.createChildView(viewClass.design(), { target: this, action: 'deleteWidget' });
    }
    
    // create the edit handle view
    viewClass = this._getViewClass('editHandleViewClass');
    if (viewClass) {
      this._editHandleView = this.createChildView(viewClass.design(), { target: this, action: 'beginEditing' });
    }
    
    // create the done button
    viewClass = this._getViewClass('doneButtonViewClass');
    if (viewClass) {
      this._doneButtonView = this.createChildView(viewClass.design(), { target: this, action: 'commitEditing' });
    }
    
    this.set('childViews', childViews);
  },

  didCreateLayer: function() {
    sc_super();
    // console.log('%@.didCreateLayer()'.fmt(this));
    this._isEditingDidChange();
    this._canDeleteWidgetDidChange();
  },

  willDestroyLayer: function() {
    // console.log('%@.willDestroyLayer()'.fmt(this));
    this.set('content', null); // forces SC.Control to clean up content observers
    sc_super();
  },

  beginEditing: function() {
    if (this.getPath('content.canEdit')) {
      this.setPathIfChanged('content.isEditing', YES);
    }
  },

  commitEditing: function() {
    this.setPathIfChanged('content.isEditing', NO);
  },
  
  deleteWidget: function() {
    var owner = this.get('owner');
    if (owner && owner.deleteWidget) {
      owner.deleteWidget(this.get('content'));
    }
  },

  /**
    Overridden from SC.Control to observe a few properties on the widget model
    and adjust the view accordingly.
  */
  contentPropertyDidChange: function(target, key) {
    if (key === this.getPath('content.sizeKey')) {
      this._sizeDidChange();
    }
    else if (key === 'isEditing') {
      this._isEditingDidChange();
    }
  },
  
  // PRIVATE METHODS

  _sizeDidChange: function() {
    var sizeKey = this.getPath('content.sizeKey');
    var size = sizeKey ? this.getPath('content.%@'.fmt(sizeKey)) : null;

    //console.log('%@._sizeDidChange()'.fmt(this));

    if (size) {
      this.adjust({ width: (parseFloat(size.width) || 0), height: (parseFloat(size.height) || 0) });
    }
  },

  _isEditingDidChange: function() {
    var childViews = this.get('childViews') || [];
    var isEditing = this.getPath('content.isEditing');
    
    //console.log('%@._isEditingDidChange(isEditing: %@)'.fmt(this, isEditing));
    if (isEditing) {
      // swap to the widget's editing view
      if (this._editView && (this._editView !== this._activeView)) {
        if (childViews.indexOf(this._activeView) >= 0) {
          this.replaceChild(this._editView, this._activeView);
        }
        else {
          this.appendChild(this._editView);
        }
        this._activeView = this._editView;
      }
    
      // remove the edit handle
      if (childViews.indexOf(this._editHandleView) >= 0) {
        this.removeChild(this._editHandleView);
      }
    
      // add a done button if desired
      if (this._doneButtonView && this.getPath('content.showDoneButton') && (childViews.indexOf(this._doneButtonView) < 0)) {
        this.insertBefore(this._doneButtonView, this._deleteHandleView);
      }
    }
    else {
      // swap to the widget's face view
      if (this._widgetView && (this._widgetView !== this._activeView)) {
        if (childViews.indexOf(this._activeView) >= 0) {
          this.replaceChild(this._widgetView, this._activeView);
        }
        else {
          this.appendChild(this._widgetView);
        }
        this._activeView = this._widgetView;
      }
    
      // remove the done button
      if (childViews.indexOf(this._doneButtonView) >= 0) {
        this.removeChild(this._doneButtonView);
      }
    
      if (this.getPath('content.canEdit')) { // if editable, show the edit handle
        if (this._editHandleView && (childViews.indexOf(this._editHandleView) < 0)) {
          this.insertBefore(this._editHandleView, this._deleteHandleView);
        }
      }
      else { // if not editable, make sure it has no edit handle
        if (childViews.indexOf(this._editHandleView) >= 0) {
          this.removeChild(this._editHandleView);
        }
      }
    }
  },

  _canDeleteWidgetDidChange: function() {
    var childViews = this.get('childViews') || [];
    //console.log('%@._canDeleteWidgetDidChange(canDeleteWidget: %@)'.fmt(this, this.get('canDeleteWidget')));
    
    if (this.get('canDeleteWidget')) {
      if (this._deleteHandleView && childViews.indexOf(this._deleteHandleView) < 0) {
        this.appendChild(this._deleteHandleView);
      }
    }
    else {
      if (childViews.indexOf(this._deleteHandleView) >= 0) {
        this.removeChild(this._deleteHandleView);
      }
    }
  }.observes('canDeleteWidget'),

  _getViewClass: function(viewKey) {
    var c = this.get(viewKey); // hopefully the view class
    var t, root, key;

    // if it's a string class name, try to materialize it
    if (SC.typeOf(c) === SC.T_STRING) {
      t = SC.tupleForPropertyPath(c);
      if (t) {
        root = t[0];
        key = t[1];
        c = root.get ? root.get(key) : root[key];
      }
    }
    
    return (c && c.kindOf(SC.View)) ? c : null;
  },

  // PRIVATE PROPERTIES
  
  _widgetView: null,
  _editView: null,
  _activeView: null,

  _deleteHandleView: null,
  _editHandleView: null,
  _doneButtonView: null
  
});
