/*globals SCUI */

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
    var childViews = [];
    var viewClass;
    var content = this.get('content');
    var isEditing = content ? content.get('isEditing') : NO;
    var showDoneButton = content ? content.get('showDoneButton') : NO;
    var canEdit = content ? content.get('canEdit') : NO;

    // create the edit view
    viewClass = this._getViewClass('widgetEditViewClass');
    if (!viewClass) {
      viewClass = SCUI.MissingWidgetView.extend({
        message: "Widget's edit view is missing.".loc()
      });
    }
    this._editView = this.createChildView(viewClass, {
      content: content,
      isVisible: (canEdit && isEditing)
    });
    childViews.push(this._editView);

    // create the done button
    viewClass = this._getViewClass('doneButtonViewClass');
    if (viewClass) {
      this._doneButtonView = this.createChildView(viewClass, {
        target: this,
        action: 'commitEditing',
        isVisible: (canEdit && isEditing && showDoneButton)
      });
      childViews.push(this._doneButtonView);
    }

    // create the widget view
    viewClass = this._getViewClass('widgetViewClass');
    if (!viewClass) {
      viewClass = SCUI.MissingWidgetView;
    }
    this._widgetView = this.createChildView(viewClass, {
      content: content,
      isVisible: (!isEditing || !canEdit)
    });
    childViews.push(this._widgetView);

    // create the edit handle view
    viewClass = this._getViewClass('editHandleViewClass');
    if (viewClass) {
      this._editHandleView = this.createChildView(viewClass, {
        target: this,
        action: 'beginEditing',
        isVisible: (canEdit && !isEditing)
      });
      childViews.push(this._editHandleView);
    }
    
    // create the delete handle view
    viewClass = this._getViewClass('deleteHandleViewClass');
    if (viewClass) {
      this._deleteHandleView = this.createChildView(viewClass, {
        target: this,
        action: 'deleteWidget',
        isVisible: this.get('canDeleteWidget')
      });
      childViews.push(this._deleteHandleView);
    }
    
    this.set('childViews', childViews);
  },

  beginEditing: function() {
    if (this.getPath('content.canEdit')) {
      this.setPathIfChanged('content.isEditing', YES);
    }
  },

  commitEditing: function() {
    var c = this.get('content');
    var del = this.get('dashboardDelegate');
    
    this.setPathIfChanged('content.isEditing', NO);

    if (del && del.dashboardWidgetDidCommitEditing) {
      del.dashboardWidgetDidCommitEditing(this.get('owner'), c);
    }

    if (c && c.widgetDidCommitEditing) {
      c.widgetDidCommitEditing();
    }
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
    var content = this.get('content');
    var isEditing = content ? content.get('isEditing') : NO;
    var canEdit = content ? content.get('canEdit') : NO;
    var showDoneButton = content ? content.get('showDoneButton') : NO;

    if (this._editView) {
      this._editView.set('isVisible', (canEdit && isEditing));
    }

    if (this._doneButtonView) {
      this._doneButtonView.set('isVisible', (canEdit && isEditing && showDoneButton));
    }

    if (this._widgetView) {
      this._widgetView.set('isVisible', (!isEditing || !canEdit));
    }
    
    if (this._editHandleView) {
      this._editHandleView.set('isVisible', (canEdit && !isEditing));
    }
  },

  _canDeleteWidgetDidChange: function() {
    if (this._deleteHandleView) {
      this._deleteHandleView.set('isVisible', this.get('canDeleteWidget'));
    }
  }.observes('canDeleteWidget'),

  _contentDidChange: function() {
    var content = this.get('content');

    if (this._widgetView) {
      this._widgetView.set('content', content);
    }

    if (this._editView) {
      this._editView.set('content', content);
    }
  }.observes('content'),

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

