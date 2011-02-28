
/**
 The SCUI.CustomActions mixin allows actions and custom mouse events for any
 element that has an id or class on it.
 Useful for when you have a custom render method.

 Example:

 {{{
   SC.View.extend(SCUI.classActions, {

     actions: {
       "#my-search": {  // Match on ID
         target: 'Orion.globalSearchRecord',
         action: 'show'
       },
       // Or match on Class
       ".help":   {target: 'Orion.helpController', action: 'show'},
       ".logout": {
         action: 'logout',
         mouseMoved: function(evt) {
           // We can also have any of the mouse actions too
           // mouseUp,mouseDown,mouseEntered,mouseExited,mouseMoved
         }
       }
     },

     render: function(context, firstTime) {
       context.push(
         "<div id='my-search' class='search' title='", "_Search".loc(),"'></div>",
         "<div class='help' "_Help".loc(),"'></div>",
         "<div class='logout' "_Logout".loc(),"'></div>"
       );
     }

   })
 }}}

 */
SCUI.CustomActions = {
  actions:{},

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

    actions = this.actions;
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
        if (el.is(classNames[i])) ret = classNames[i] ;
      }
      el = el.parent() ;
    }
    el = layer = null; //avoid memory leaks
    return ret ;
  },

  _setDetails: function(classDetails) {
    if(classDetails.set) {classDetails.set('layer', this);}
    else {classDetails['layer'] = this;}
  },

  mouseDown: function(evt) {
    var className = this._isInsideNamedClass(evt),
        classDetails = this.actions[className];

    if(classDetails) {
      this._mouseDown(className, evt, classDetails);
      return YES;
    }
  },

  mouseUp: function(evt) {
    var className = this._isInsideNamedClass(evt),
        classDetails = this.actions[className];

    if(classDetails) {
      this._mouseUp(className, evt, classDetails);
      return YES;
    }
  },

//  mouseEntered: function(evt) {
//    console.log("Entered!");
//  },

  mouseExited: function(evt) {
    var overClass = this._mouseDownClass;
    if(overClass) {
      this._mouseExited(overClass, evt);
    }
    this._mouseDownClass = null;
  },

  /**
   * Event Dispatchers to subviews.
   */
  _mouseDown: function(className, evt, classDetails) {
    if(!classDetails) classDetails = this.actions[className];
    this._setDetails(classDetails);
    this._isContinuedMouseDown = YES;
    this._mouseDownClass = className;
    this.$(className).addClass(this.activeClass);
    if (classDetails.mouseDown) classDetails.mouseDown(evt);
  },

  _mouseUp: function(className, evt, classDetails) {
    var target, action;
    if(!classDetails) classDetails = this.actions[className];
    if (this._mouseDownClass == className) {
      // Trigger the action
      if (classDetails.get){
        target = classDetails.get('target') || null;
        action = classDetails.get('action');
      } else {
        target = classDetails['target'] || null;
        action = classDetails['action'];
      }
      console.log("Calling Action ", action, "on target", target);
      if (target === undefined && SC.typeOf(action) === SC.T_FUNCTION) {
        action.call(this, evt);
      }
      else if (target !== undefined && SC.typeOf(action) === SC.T_FUNCTION) {
        action.apply(target, [evt]);
      } else {
        this.getPath('pane.rootResponder')
            .sendAction(action, target, this, this.get('pane'));
      }

    }
    this.$(className).removeClass(this.activeClass);
    this._isContinuedMouseDown = NO;
    this._mouseDownClass = null;
  },

  _mouseEntered: function(className, evt, classDetails) {
    if(!classDetails) classDetails = this.actions[className];

    this.$(className).addClass(this.hoverClass);
    if (this._isContinuedMouseDown && this._mouseDownClass == className) {
      this.$(className).addClass(this.activeClass);
    }
    if (classDetails.mouseEntered) classDetails.mouseEntered(evt);
    this._mouseOverClass = className;
  },

  _mouseExited: function(className, evt, classDetails) {
    if(!classDetails) classDetails = this.actions[className];

    this.$(className).removeClass(this.hoverClass).removeClass(this.activeClass);
    if (classDetails.mouseExited) classDetails.mouseExited(evt);
    this._mouseOverClass = null;
  },

  _mouseMoved:function(className, evt, classDetails) {
    if(!classDetails) classDetails = this.actions[className];
    if (classDetails.mouseMoved) classDetails.mouseMoved(evt);
  },

  mouseMoved: function(evt) {
    var className = this._isInsideNamedClass(evt),
        classDetails = this.actions[className],
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