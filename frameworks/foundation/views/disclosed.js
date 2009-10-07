// ===========================================================================
// SCUI.DisclosedView
// ===========================================================================
require('core');
/** @class

  This is a view that gives you the ability to collapse a containerView with a 
  slim disclosure titlebar.
  
  @author Josh Holt [JH2]
  @version FR3
  @since FR1
*/

SCUI.DisclosedView = SC.View.extend({
  /** @scope SCUI.DisclosedView.prototype */ 
  
  /* Private Var for logging [On | Off] */
  
  _shouldLog: NO,
  
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
  
  // Exposing my height ( do I need to now ?)
  currentHeight: null,
  
  // private version
  _contentView: null,
  
  /* This is the view for the when we are collapsed. */
  _collapsedView: SC.View,
  
  isOpen: YES,
  
  /* This is the default view for the titlebar */
  titleBar: SC.DisclosureView,
  
  /* The container to hold the content to be collapsed */
  containerView: SC.ContainerView,
  
  defaultTitleBarHeight: 44,
  
  // ..........................................................
  // Methods
  // 
  
  init: function(){
    sc_super();
    this._setupView();
    //this._disclosedView_contentChanged();
  },
  
  createChildViews: function(){
    var views=[], view;
    var contentView = this.get('contentView');
    var collapsibleContainerView;
    
    collapsibleContainerView = this.containerView.extend({ 
      classNames: 'processing-step-settings'.w(), 
      layout: {top: 39, left: 5, right: 5},
      render: function(context, firstTime){
        sc_super();
        if (firstTime) {
          context = context.begin('div').addClass('bottom-left-edge').push('').end();
          context = context.begin('div').addClass('bottom-right-edge').push('').end();
        }
      }
    });
    
    // The content for the expanded view.
    this._contentView = this._createChildViewIfNeeded(contentView);

    this._collapsedView = this.createChildView(SC.View.design({
        layout: { left: 0, top: 0, height: 5, width: 0}
      })
    );
    
    view = this._titleBar = this.createChildView(this.titleBar.extend({
      layout: {top:0, left:5, right:5, height:44},
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
          context = context.begin('span').addClass('description').push(this.description).end();
          context = context.end();
          context = context.end();
      },
      
      mouseDown: function(evt){
        if (this._shouldLog === YES) {
          console.log('mouse down on disclosure title bar [%@]'.fmt(evt.target.className));
        }
        if (evt.target.className === 'button' && this.get('statusIconName') !== 'never') {
          return sc_super();
        } else {
          return NO;
        }
      },
      
      _valueObserver: function() {
        if (this.owner && this.owner.toggle) this.owner.toggle(this.get('value'));
      }.observes('value'),
      
      _statusObserver: function() {
        if (this.get('statusIconName') === 'never') {
          this.set('value',NO);
        }
      }.observes('statusIconName')
      
    }),{rootElementPath: [0]});
    views.push(view);
    
    // setup the containerview for the contentView
    view = this._container = this.createChildView(collapsibleContainerView, {rootElementPath: [1]});
    views.push(view);
    
    this.set('childViews',views);
    return this;
  },
  
  render: function(context, firstTime){
    sc_super();
  },
  
  // ..........................................................
  // Actions
  // 
  
  /*
    Collapse the content leaving only the titlebar w/disclosure
  */
  collapse: function(){
    this._container.$().hide();
    if (this.owner && this.owner.collapse) this.owner.collapse();
    this.set('isOpen',NO);
  },
  
  /*
    Expand the content below the titlebar
  */
  expand: function(){
    this._container.$().show();
    if (this.owner && this.owner.expand) this.owner.expand();
    this.set('isOpen',YES);
  },
  
  /*
    This method toggles between expanded and collapsed and is fired
    by an observer inside the extended disclosure view.
    
  */
  toggle: function(toggleValue){
    if (!toggleValue){
      this.collapse();
    }else{
      this.expand();
    }
  },
  
  updateHeight: function(immediately, forceDefault) {
    if (immediately) this._updateHeight(forceDefault);
    else this.invokeLast(this._updateHeight);
    // ^ use invokeLast() here because we need to wait until all rendering has 
    //   completed.
    return this;
  },
  
  _updateHeight: function(forceDefault) {
    var childViews = this.get('childViews'),
        len        = childViews.get('length'),
        view, layer, height;
        
    if (!forceDefault) {        
      if (len === 0) {
        height = this.get('defaultTitleBarHeight');
      } else {
        view = childViews.objectAt(len-1);
        layer = view ? view.get('layer') : null ;
        height = layer ? (layer.offsetTop + layer.offsetHeight) : this.get('defaultTitleBarHeight');
        layer = null ; // avoid memory leaks
      }
    } else {
      height = this.get('defaultTitleBarHeight');
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
    if (isOpen) {
      this.get('_container').set('nowShowing',this.get('_contentView'));
      this.updateHeight();
    }else{
      this.get('_container').set('nowShowing','');
      this._updateHeight(YES);
    }
  }
  
});
