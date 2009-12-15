// ==========================================================================
// SCUI.WidgetView
// ==========================================================================

sc_require('core');

/** @class

  Provides a widget container view used by the SCUI.DashboardView.  It holds
  one widget, overlays widget button views, and swaps between widget face and
  widget edit views.

  This widget container adjust its layout to fit the widget views it contains.

  @extends SC.View
  @author Jonathan Lewis
*/

SCUI.WidgetView = SC.View.extend( SC.Control, {

  // PUBLIC PROPERTIES
  
  classNames: ['scui-widget-view'],

  /**
    Should be an object mixing in SCUI.Widget
  */
  content: null,

  /**
    Controls whether or not we are showing the delete handle over this widget.
  */
  canDeleteWidget: NO,
  
  /**
    Controls whether we are showing the widget face or the widget edit view.
  */
  isEditing: NO,

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

  displayProperties: ['canDeleteWidget', 'isEditing'],
  
  // PUBLIC METHODS

  init: function() {
    sc_super();
    this.bind('canDeleteWidget', SC.Binding.from('*owner.canDeleteContent', this).oneWay());
    this.bind('isEditing', SC.Binding.from('*content.isEditing', this));
  },

  createChildViews: function() {
    var childViews = [], viewClass;
    var isEditing = this.get('isEditing');
    var canDeleteWidget = this.get('canDeleteWidget');
    var content = this.get('content');
    var frame;
    
    // create the widget view
    viewClass = this._getViewClass('widgetViewClass');
    if (!viewClass) {
      viewClass = SC.LabelView.design( SC.Border, {
        value: "Widget view is missing.".loc(),
        backgroundColor: 'blue',
        borderStyle: SC.BORDER_BLACK,
        textAlign: SC.ALIGN_CENTER
      });
    }

    this._widgetView = this.createChildView(viewClass.design(), { content: content });
    frame = this._widgetView.get('frame');
    this._widgetView.set('layout', { left: 0, top: 0, width: frame.width, height: frame.height });
    
    // create the edit view
    viewClass = this._getViewClass('widgetEditViewClass');
    if (!viewClass) {
      viewClass = SC.LabelView.design( SC.Border, {
        value: "Widget's edit view is missing.".loc(),
        backgroundColor: 'yellow',
        borderStyle: SC.BORDER_BLACK,
        textAlign: SC.ALIGN_CENTER
      });
    }
    
    this._editView = this.createChildView(viewClass.design(), { content: content });
    frame = this._editView.get('frame');
    this._editView.set('layout', { left: 0, top: 0, width: frame.width, height: frame.height });
    
    if (isEditing) {
      childViews.push(this._editView);
      this._activeView = this._editView;
      
      // add the done button if needed
      if (content && content.get('showDoneButton')) {
        this._doneButtonView = this._createDoneButtonView();
        childViews.push(this._doneButtonView);
      }
    }
    else {
      childViews.push(this._widgetView);
      this._activeView = this._widgetView;

      if (this.getPath('content.isEditable')) {
        this._editHandleView = this._createEditHandleView();
        childViews.push(this._editHandleView);
      }
    }
    
    if (canDeleteWidget) {
      this._deleteHandleView = this._createDeleteHandleView();
      childViews.push(this._deleteHandleView);
    }

    this.set('childViews', childViews);
  },

  didCreateLayer: function() {
    sc_super();
    this._adjustLayoutToFitContent();
  },
  
  beginEditing: function() {
    var content;

    if (this.getPath('content.isEditable')) {
      this.setIfChanged('isEditing', YES);

      content = this.get('content');
      if (content && content.beginEditing) {
        content.beginEditing();
      }
    }
  },
  
  // TODO: [JL] Make this into 'commitEditing' to match SC.Editable pattern
  endEditing: function() {
    var content;
    
    this.setIfChanged('isEditing', NO);

    content = this.get('content');
    if (content && content.commitEditing) {
      content.commitEditing();
    }
  },
  
  deleteWidget: function() {
    var owner = this.get('owner');
    if (owner && owner.deleteWidget) {
      owner.deleteWidget(this.get('content'));
    }
  },
  
  // PRIVATE METHODS
  
  _adjustLayoutToFitContent: function() {
    var contentView = this.get('isEditing') ? this._editView : this._widgetView;
    var frame;
    
    if (contentView) {
      frame = contentView.get('frame');
      this.adjust({ width: frame.width, height: frame.height });
    }
  },
  
  _isEditingDidChange: function() {
    //console.log('%@._isEditingDidChange(isEditing: %@)'.fmt(this, this.get('isEditing')));
    if (this.get('isEditing')) {
      if (this._activeView === this._widgetView) {
        this.replaceChild(this._editView, this._widgetView);
        this._activeView = this._editView;
      }
      
      if (this._editHandleView) {
        this.removeChild(this._editHandleView);
        this._editHandleView.destroy();
        this._editHandleView = null;
      }
      
      if (!this._doneButtonView && this.getPath('content.showDoneButton')) {
        this._doneButtonView = this._createDoneButtonView();
        this.insertBefore(this._doneButtonView, this._deleteHandleView);
      }
    }
    else {
      if (this._activeView === this._editView) {
        this.replaceChild(this._widgetView, this._editView);
        this._activeView = this._widgetView;
      }

      if (this._doneButtonView) {
        this.removeChild(this._doneButtonView);
        this._doneButtonView.destroy();
        this._doneButtonView = null;
      }

      if (this.getPath('content.isEditable')) { // if editable, show the edit handle
        if (!this._editHandleView) {
          this._editHandleView = this._createEditHandleView();
          this.insertBefore(this._editHandleView, this._deleteHandleView);
        }
      }
      else { // if not editable, make sure it has no edit handle
        if (this._editHandleView) {
          this.removeChild(this._editHandleView);
          this._editHandleView.destroy();
          this._editHandleView = null;
        }
      }
    }
    
    this._adjustLayoutToFitContent();
  }.observes('isEditing'),
  
  _canDeleteWidgetDidChange: function() {
    //console.log('%@._canDeleteWidgetDidChange(canDeleteWidget: %@)'.fmt(this, this.get('canDeleteWidget')));
    if (this.get('canDeleteWidget')) {
      if (!this._deleteHandleView) {
        this._deleteHandleView = this._createDeleteHandleView();
        this.appendChild(this._deleteHandleView);
      }
    }
    else {
      if (this._deleteHandleView) {
        this.removeChild(this._deleteHandleView);
        this._deleteHandleView.destroy();
        this._deleteHandleView = null;
      }
    }
  }.observes('canDeleteWidget'),
  
  _createDeleteHandleView: function() {
    return this.createChildView(
      SC.View.design( SCUI.SimpleButton, {
        classNames: ['orion-dashboard-manage-button-view','showing-palette'],
        layout: { left: -10, top: -10, width: 28, height: 28 },
        target: this,
        action: 'deleteWidget'
      })
    );
  },
  
  _createDoneButtonView: function() {
    return this.createChildView(
      SC.ButtonView.design({
        classNames: ['scui-widget-done-button-view'],
        layout: { right: 10, bottom: 10, width: 80, height: 24 },
        title: "Done".loc(),
        target: this,
        action: 'endEditing'
      })
    );
  },
  
  _createEditHandleView: function() {
    return this.createChildView(
      SC.View.design( SCUI.SimpleButton, {
        classNames: ['scui-widget-edit-handle-view'],
        layout: { right: 0, top: 0, width: 24, height: 24 },
        target: this,
        action: 'beginEditing'
      })
    );
  },
  
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
