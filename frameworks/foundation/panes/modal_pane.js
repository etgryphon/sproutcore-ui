// ========================================================================
// SCUI.ModalPane
// ========================================================================

/**

  Picker pane with bottom right resizable thumb.

  @extends SC.PickerPane
  @author Josh Holt
  @author Jonathan Lewis


*/

SCUI.ModalPane = SC.PalettePane.extend({
  
  maxHeight: null,
  minHeight: null,
  maxWidth: null,
  minWidth: null,
  
  title: '',
  titleIcon: null,
  titleBarHeight: 24,
  
  footerHeight: 40,

  /**
    The footer view.  Override to provide a custom view, or set to null
    to exclude.  (Default is empty).
  */
  footerView: null,
  
  isResizable: YES,
  margin: 20, // override if you need to
  
  isModal: YES,
  
  nowShowing: null,
  
  /**
    The modal pane to place behind this pane if this pane is modal.  This 
    must be a subclass or an instance of SC.ModalPane.
  */
  modalPane: SC.ModalPane.extend({
    classNames: 'for-sc-panel'
  }),
  
  _containerView: null,
  
  _isFullscreened: NO,
  
  mouseDown: function(evt) { 
    if (this._titleBarClicked === YES) {
      sc_super();
    }
    return YES;
  },

  mouseDragged: function(evt) {
    if(this._titleBarClicked === YES) {
      sc_super();
    }
    return YES;
  },
  
  mouseUp: function(evt) {  
    this._titleBarClicked = NO;
    return sc_super();
  },
  
  replaceContent: function(newContent) {
    this._containerView.replaceContent(newContent);
  },
  
  _fullscreen: function() {
    if (this._isFullscreened === NO) {
      this._prevLayout = this.get('layout');
      
      var margin = this.get('margin');
      var layout = { top: margin, bottom: margin, left: margin, right: margin };
      layout = SC.View.convertLayoutToAnchoredLayout(layout, this.computeParentDimensions());
      
      var maxWidth = this.get('maxWidth');
      if (maxWidth && maxWidth < layout.width) {
        layout.width = maxWidth;
        delete layout.left;
        delete layout.right;
        layout.centerX = 0;
      }
      
      var maxHeight = this.get('maxHeight');
      if (maxHeight && maxHeight < layout.height) {
        layout.height = maxHeight;
        delete layout.top;
        delete layout.bottom;
        layout.centerY = 0;
      }

      this.set('layout', layout);
    }
    else {
     this.set('layout', this._prevLayout); 
    }
    
    this.updateLayout();
    
    this._isFullscreened = !this._isFullscreened;
  },
  
  createChildViews: function() {    
    var childViews = [];
    var view = null;
    
    var titleBarHeight = this.get('titleBarHeight');
    var that = this;

    // header
    view = this.createChildView(
      SC.View.design({
        classNames: ['header'],
        layout: { top: 0, left: 0, right: 0, height: titleBarHeight },
        mouseDown: function(evt) {
          that._titleBarClicked = YES;
          return NO;
        },
        childViews: 'closeButton fullScreenButton title'.w(),
        closeButton: SC.View.design(SCUI.SimpleButton, {
          layout: { left: 5, centerY: 0, width: 16, height: 16 },
          classNames: ['modal-close-icon'],
          target: this,
          action: 'remove'
        }),
        fullScreenButton: SC.View.design(SCUI.SimpleButton, {
          layout: { left: 25, centerY: 0, width: 16, height: 16 },
          classNames: ['modal-fullscreen-icon'],
          target: this,
          action: '_fullscreen',
          isVisibleBinding: SC.binding('.isResizable', this)
        }),
        title: SC.LabelView.design({
          layout: { left: 45, right: 45, top: 0, bottom: 0 },
          valueBinding: SC.Binding.from('title', this).oneWay(),
          textAlign: SC.ALIGN_CENTER,
          fontWeight: SC.BOLD_WEIGHT,
          classNames: ['modal-title'],
          icon: this.get('titleIcon')
        })
      })
    );
    childViews.push(view);
    
    var footerView = this.get('footerView');
    var footerHeight = this.get('footerHeight');
    
    // body
    view = this.createChildView(SC.ContainerView.design({
        layout: { top: titleBarHeight + 1, bottom: footerView ? (footerHeight + 1) : 0, left: 0, right: 0 },
        classNames: 'body',
        nowShowingBinding: SC.Binding.from('nowShowing', this),
        contentView: this.get('contentView')
      })
    );
    
    this._containerView = view;
    this.contentView = this._containerView.contentView;
    childViews.push(view);
    
    // footer
    if (SC.kindOf(footerView, SC.View) && footerView.isClass) {
      view = this.createChildView(footerView, {
        classNames: 'footer',
        layout: { left: 0, right: 0, bottom: 0, height: footerHeight }
      });
      this.set('footerView', view);
      childViews.push(view);
    }
    else {
      this.set('footerView', null);
    }

    // thumb
    view = this.createChildView(
      SC.View.design(SCUI.Resizable, {
        classNames: ['picker-resizable-handle'],
        layout: {bottom: 0, right: 0, height: 16, width: 16 },
        viewToResizeBinding: SC.Binding.oneWay('.parentView'),
        maxHeight: this.get('maxHeight'),
        maxWidth: this.get('maxWidth'),
        minHeight: this.get('minHeight'),
        minWidth: this.get('minWidth'),
        isVisibleBinding: SC.binding('.isResizable', this)
      })
    );
    childViews.push(view);
    this.set('childViews', childViews);
  }
});

