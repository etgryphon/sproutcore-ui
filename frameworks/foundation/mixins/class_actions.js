
/**
 The SCUI.classActions mixin allows actions and custom mouse events for any
 element that has a class on it. Useful for when you have a custom render method.

 Class names that you want to attach an action to should be unique

 Example:

 {{{
   SC.View.extend(SCUI.classActions, {

     classActions: {
       "search": {
         target: 'Orion.globalSearchRecord',
         action: 'show'
       },
       "help":   {target: 'Orion.helpController',     action: 'show'},
       "logout": {
         action: 'logout',
         mouseMoved: function(evt) {

         }
       }
     },

     render: function(context, firstTime) {
       context.push(
         "<div class='sc-view search' title='", "_Search".loc(),"'><div></div></div>",
         "<div class='sc-view help' "_Help".loc(),"'><div></div></div>",
         "<div class='sc-view logout' "_Logout".loc(),"'><div></div></div>"
       );
     }

   })
 }}}

 */
SCUI.classActions = {
  classActions:{},

  hoverClass: 'hover',
  activeClass: 'active',
  _isContinuedMouseDown: NO,
  _mouseDownClass: null,
  _mouseOverClass: null,

  /**
   * Loop through the classActions object to get the keys, which will be class
   * names that need actions.
   */
  _getClassNames: function() {
    var classNames = this._classNames,
        actions, name;
    if(classNames) {
      return classNames;
    }

    classNames = this._classNames = [];

    actions = this.classActions;
    for(name in actions){
      if(actions.hasOwnProperty(name)) {
        classNames.push(name);
      }
    }
    return classNames;
  },

  _isInsideNamedClass: function(evt) {
    var layer = this.get('layer');
    if (!layer) return NO ; // no layer yet -- nothing to do

    var classNames = this._getClassNames(),
        el = SC.$(evt.target), i,
        clength = classNames.length,
        ret = NO ;

    while(!ret && el.length>0 && (el[0] !== layer)) {
      i = clength;
      while(!ret && ((i--)>=0) ) {
        if (el.hasClass(classNames[i])) ret = classNames[i] ;
      }
      el = el.parent() ;
    }
    el = layer = null; //avoid memory leaks
    return ret ;
  },

  mouseDown: function(evt) {
    var className = this._isInsideNamedClass(evt),
        classDetails = this.classActions[className];

    if(classDetails) {
      this._mouseDown(className, evt, classDetails);
      return YES;
    }
  },

  mouseUp: function(evt) {
    var className = this._isInsideNamedClass(evt),
        classDetails = this.classActions[className];

    if(classDetails) {
      this._mouseUp(className, evt, classDetails);
      return YES;
    }
  },

//  mouseEntered: function(evt) {
//
//  },

  mouseExited: function(evt) {
    var overClass = this._mouseDownClass;
    if(overClass) {
      this._mouseExited(overClass, evt);
    }
  },

  /**
   * Event Dispatchers to subviews.
   */
  _mouseDown: function(className, evt, classDetails) {
    if(!classDetails) classDetails = this.classActions[className];
    this._isContinuedMouseDown = YES;
    this._mouseDownClass = className;
    this.$('.'+className).addClass(this.activeClass);
    if (classDetails.mouseDown) classDetails.mouseDown(evt);
  },

  _mouseUp: function(className, evt, classDetails) {
    var target, action;
    if(!classDetails) classDetails = this.classActions[className];
    console.log("Mouse Up ", this._mouseDownClass, className);
    if (this._mouseDownClass == className) {
      console.log('Run Action');
      // Trigger the action
      target = classDetails['target'] || null;
      action = classDetails['action'];

      this.getPath('pane.rootResponder')
          .sendAction(action, target, this, this.get('pane'));
    } else {
      console.log('No Action!');
    }
    this.$('.'+className).removeClass(this.activeClass);
    this._isContinuedMouseDown = NO;
    this._mouseDownClass = null;
  },

  _mouseEntered: function(className, evt, classDetails) {
    if(!classDetails) classDetails = this.classActions[className];

    this.$('.'+className).addClass(this.hoverClass);
    if (this._isContinuedMouseDown && this._mouseDownClass == className) {
      this.$('.'+className).addClass(this.activeClass);
    }
    if (classDetails.mouseEntered) classDetails.mouseEntered(evt);
    this._mouseOverClass = className;
  },

  _mouseExited: function(className, evt, classDetails) {
    if(!classDetails) classDetails = this.classActions[className];

    this.$('.'+className).removeClass(this.hoverClass).removeClass(this.activeClass);
    if (classDetails.mouseExited) classDetails.mouseExited(evt);
    this._mouseOverClass = null;
  },

  _mouseMoved:function(className, evt, classDetails) {
    if(!classDetails) classDetails = this.classActions[className];
    if (classDetails.mouseMoved) classDetails.mouseMoved(evt);
  },

  mouseMoved: function(evt) {
    var className = this._isInsideNamedClass(evt),
        classDetails = this.classActions[className],
        overClass = this._mouseOverClass;
    if(classDetails) {
      if(className !== overClass) {
        if(overClass) this._mouseExited(overClass, evt, classDetails);
        this._mouseEntered(className, evt, classDetails);
      }
      this._mouseMoved(className, evt, classDetails);
    } else if(overClass) {
      this._mouseExited(overClass, evt, classDetails);
    }
  },

//  mouseDragged: function(evt) {
//    console.log('mouseDragged');
//  },

  // ..........................................................
  // touch support
  //
  touchStart: function(evt){
    return this.mouseDown(evt);
  },

  touchEnd: function(evt){
    return this.mouseUp(evt);
  },

  touchEntered: function(evt){
    return this.mouseEntered(evt);
  },

  touchExited: function(evt){
    return this.mouseExited(evt);
  }

};