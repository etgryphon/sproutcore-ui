// ===========================================================================
// SCUI.DisclosedView
// ===========================================================================
require('core');
/** @class

  This is a view that gives you the ability to collapse a containerView with a 
  slim disclosure titlebar.
  
  @author Josh Holt [JH2]

*/

SCUI.DisclosedView = SC.View.extend({
  /** @scope SCUI.DisclosedView.prototype */ 
  
  // ..........................................................
  //  KEY PROPERTIES
  // 
  
  classNames: ['scui-disclosed-view'],
  
  displayProperties: ['isOpen', 'statusIconName'],
  
  /* This is the view for the when we aren't collapsed. */
  contentView: null,
  
  /* The text displayed in the titlebar */
  title: '',
  
  /* The Description under the title */
  description: '',
  
  /* The Extra Icon that will sit beside the disclosure view */
  iconCSSName: '',
  
  /* The Extra Icon that will sit beside the disclosure view */
  statusIconName: '',
  
  // private version
  _contentView: null,
  
  /* This is the view for the when we are collapsed. */
  _collapsedView: SC.View,
  
  isOpen: YES,
  
  /* This is the default view for the titlebar */
  titleBar: SC.DisclosureView,
  
  /* The container to hold the content to be collapsed */
  containerView: SC.ContainerView,
  
  /* The default collapsed height (the titlebar will be set to the same height) */
  collapsedHeight: 44,
  
  /* The default expanded height */
  expandedHeight: 300,
  
  /* 
    The mode of operation for this view 
    You may specify one of the following modes:
    -- SCUI.DISCOLSED_STAND_ALONE * (Default)
    -- SCUI.DISCLOSED_LIST_DEPENDENT
  */
  mode: SCUI.DISCLOSED_STAND_ALONE,
  
  // ..........................................................
  // Methods
  // 
  
  init: function(){
    sc_super();
    // this._setupView();
  },
  
  createChildViews: function(){
    var views=[], view;
    var contentView = this.get('contentView');
    var collapsibleContainerView;
    var that = this;
    
    view = this._titleBar = this.createChildView(this.titleBar.extend({
      layout: {top:0, left:5, right:5, height: that.get('collapsedHeight')},
      titleBinding: SC.binding('.title',this),
      descriptionBinding: SC.binding('.description',this),
      iconCSSNameBinding: SC.binding('.iconCSSName',this),
      statusIconNameBinding: SC.binding('.statusIconName',this),
      value: this.get('isOpen'),
      displayProperties: 'statusIconName'.w(),
      render: function(context, firstTime){
          context = context.begin('div').addClass('disclosure-inner');
          context = context.begin('div').addClass('disclosure-label');
          context = context.begin('img').attr({ src: SC.BLANK_IMAGE_URL, alt: "" }).addClass('button').end();
          context = context.begin('img').attr({ src: SC.BLANK_IMAGE_URL, alt: "" }).addClass('icon').addClass(this.iconCSSName).end();
          context = context.begin('img').attr({src: SC.BLANK_IMAGE_URL, alt: ""}).addClass('status').addClass(this.statusIconName).end();
          context = context.begin('span').addClass('title').push(this.get('displayTitle')).end();
          context.attr('title', this.description);
          context.attr('alt', this.description);
          context = context.end();
          context = context.end();
      },
      
      mouseDown: function(evt){
        if (evt.target.className !== 'button') return NO;
        else return YES;
      },
      
      _valueObserver: function() {
        if (this.owner && this.owner.toggle) this.owner.toggle(this.get('value'));
      }.observes('value')
      
      // CHANGED [JH2] Leaving this here in the event that we want to auto close a disabled step.
      
      // _statusObserver: function() {
      //   if (this.get('statusIconName') === 'never') {
      //     this.set('value',NO);
      //   }
      // }.observes('statusIconName')
      
    }),{rootElementPath: [0]});
    views.push(view);
    
    // setup the containerview for the contentView
    contentView = this.createChildView(contentView, {
      classNames: 'processing-step-settings'.w(), 
      layout: {top: that.get('collapsedHeight')-5, left: 5, right: 5},
      render: function(context, firstTime){
        sc_super();
        if (firstTime) {
          context = context.begin('div').addClass('bottom-left-edge').push('').end();
          context = context.begin('div').addClass('bottom-right-edge').push('').end();
        }
      }
    });
    views.push(contentView);
    
    this.set('childViews',views);
    return this;
  },
  
  render: function(context, firstTime){
    this._setupView();
    sc_super();
  },
  
  // ..........................................................
  // Actions ( Used when this view is in standalone mode )
  // 
  
  /*
    This method toggles between expanded and collapsed and is fired
    by an observer inside the extended disclosure view.
    
  */
  toggle: function(toggleValue){
    if (!toggleValue){
      this.set('isOpen',NO);
      if (this.get('mode') === SCUI.DISCLOSED_STAND_ALONE) {
        this._updateHeight(YES);
      } else if (this.owner && this.owner.collapse) {
        this.owner.collapse();
      } 
    }else{
      this.set('isOpen',YES);
      if (this.get('mode') === SCUI.DISCLOSED_STAND_ALONE) { 
        this._updateHeight();
      } else if (this.owner && this.owner.expand){
        this.owner.expand();
      }
    }
  },
  
  updateHeight: function(immediately, forceDefault) {
    if (immediately) this._updateHeight(forceDefault);
    else this.invokeLast(this._updateHeight);
    return this;
  },
  
  _updateHeight: function(forceDefault) {
    var height;
    if (!forceDefault) {        
      height = this.get('expandedHeight');
    } else {
      height = this.get('collapsedHeight');
    }
    this.adjust('height', height);
  },
  
  /*
    Setup the contentView that you pass in as a child view of this view.
  */
  _createChildViewIfNeeded: function(view){
    if (SC.typeOf(view) === SC.T_CLASS){
      return this.createChildView(view);
    }
    else{
      return view;
    }
  },
  
  _setupView: function(){
    var isOpen = this.get('isOpen');
    var mode = this.get('mode');
    if (isOpen) {
      if (this.get('mode') === SCUI.DISCLOSED_STAND_ALONE) this.updateHeight();
    }else{
      if (this.get('mode') === SCUI.DISCLOSED_STAND_ALONE) this._updateHeight(YES);
    }
  }
  
});
