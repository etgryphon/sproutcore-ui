sc_require('core');

SCUI.WidgetOverlay = {

  // PUBLIC PROPERTIES
  
  isWidgetOverlay: YES,
  
  deleteHandleIsVisible: NO,

  // PUBLIC METHODS

  initMixin: function() {
    console.log('%@.initMixin()'.fmt(this));
  },
  
  renderMixin: function(context, firstTime) {
  },
  
  // PRIVATE METHODS
  
  _wo_deleteHandleIsVisibleDidChange: function() {
    var isVisible = this.get('deleteHandleIsVisible');
  
    console.log('%@._wo_deleteHandleIsVisibleDidChange(%@)'.fmt(this, isVisible));
  
    if (isVisible) {
      if (!this._wo_deleteHandleView) {
        this._wo_deleteHandleView = SC.LabelView.create( SC.Border, {
          layout: { left: 0, top: 0, width: 24, height: 24 },
          borderStyle: SC.BORDER_BLACK,
          backgroundColor: 'white',
          value: 'X'
        });
        this.appendChild(this._wo_deleteHandleView);
      }
    }
    else {
      if (this._wo_deleteHandleView) {
        this.removeChild(this._wo_deleteHandleView);
        this._wo_deleteHandleView = null;
      }
    }
  }.observes('deleteHandleIsVisible'),
  
  // PRIVATE PROPERTIES

  _wo_deleteHandleView: null
  
};
