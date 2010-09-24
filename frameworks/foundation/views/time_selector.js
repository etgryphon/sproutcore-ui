//============================================================================
// SCUI.TimeSelectorFieldView
//============================================================================
/*globals SCUI*/

/**

 TODO
 @extends SC.View
 @author Jason Dooley
 @version GA
 @since GA
 
 Example:
 
 timeSelector: SCUI.TimeSelectorFieldView.design({
   layout: { left: 0, top: 0, height: 24 },
   valueBinding: 'App.yourController.timeField'
 })
 
 {@value expects SC.DateTime}
 

*/
SCUI.TimeSelectorFieldView = SC.View.extend(
 /** @scope SCUI.TimeSelectorFieldView.prototype */{
   
  classNames: ['scui-timeselector'],
  
  value: null,
  
  // this can be styled, but for the time being, need a
  // min width and height to fit everything in conveniently
  layout: {minHeight: 24, minWidth: 100},
  
  // need to have these available otherwise the values
  // you type in will be overwritten over and over
  _hour: null,
  _minute: null,
  _meridian: null,
  
  
  // grabs current time and converts to SC.DateTime if
  // no record exists
  _getCurrentTime: function () {
    var time = new Date();
    return SC.DateTime.create(time);
  },
  
  // convenience function to toggle meridian on click
  _toggleMeridian: function () {
    var mer = this.get('_meridian');
    mer = (mer == 'PM') ? 'AM' : 'PM';
    this.set('_meridian',mer);
    this._setTime();
  },
  
  _validNumber: function (n) {
    var ret,len;
    if (!parseInt(n,10)) {
      n = 1;
    }
    ret = String(n);
    len = ret.length;
    if (len>2) {
      ret = ret.substring(len-2,len);
    }
    return parseInt(ret,10);
  },
  
  // actually sets the value using the private values
  _setTime: function() {
    var hour = this.get('_hour'), minute = this.get('_minute'), meridian = this.get('_meridian'), time = new Date();
    
    minute = this._validNumber(minute);
    time = SC.DateTime.create(time);
    if (meridian === 'PM') {hour=hour+12;}
    this.set('value',time.adjust({hour: hour, minute: minute}));
  },
  
  
  // get or set hour
  getHour: function (k,v) {
    var hour,time = this.get('value');
    if (!time) { time = this._getCurrentTime(); }
    
    if (v !== undefined) {
      hour = this._validNumber(v);
      if (hour > 12 && hour < 24) {
        hour = hour - 12;
      }
      this.set('_hour',hour);
      this._setTime();
    } else {
      if (time) {
        hour = time.toFormattedString('%i');
      } else {
        hour = this.get('_hour');
      }
    }
    
    return hour;
  }.property('value').cacheable(),
  
  // get or set the minute
  getMinute: function (k,v) {
    var minute, time = this.get('value');
    if (!time) { time = this._getCurrentTime(); }
    
    if (v !== undefined) {
      minute = this._validNumber(v);
      this.set('_minute',minute);
      this._setTime();
    } else {
      if (time) {
        minute = time.toFormattedString('%M');
      } else {
        minute = this.get('_minute');
      }
    }
    return minute;
  }.property('value').cacheable(),
  
  // get or set 'AM' 'PM'
  getMeridian: function (k,v) {
    var meridian, time = this.get('value');
    if (v !== undefined) {
      meridian = v;
      this.set('_meridian',meridian);
      this._setTime();
    } else {
      if (time) {
        meridian = time.toFormattedString('%p');
      } else {
        meridian = this.get('_meridian');
      }
    }
    return meridian;
  }.property('value').cacheable(),
  
  // base hour text field settings
  hourView: SC.TextFieldView.design({
    classNames: ['scui-timeselector-hour'],
    layout: {width: 24,top: 0,bottom: 0,left: 0},
    textAlign: SC.ALIGN_right
  }),
  
  // the colon!
  colonView: SC.LabelView.design({
    classNames: ['scui-timeselector-colon'],
    layout: {width: 5,top: 0,bottom: 0,left: 26},
    textAlign: SC.ALIGN_CENTER,
    value: ':'
  }),
  
  // base minute text field settings
  minuteView: SC.TextFieldView.design({
    classNames: ['scui-timeselector-minute'],
    layout: {width: 24,top: 0,bottom: 0,left: 28},
    textAlign: SC.ALIGN_RIGHT
  }),
  
  // base 'AM' 'PM'
  meridianView: SC.TextFieldView.design({
    classNames: ['scui-timeselector-meridian'],
    layout: {width: 30,top: 0,bottom: 0,left: 58},
    textAlign: SC.ALIGN_CENTER,
    hint: 'PM'
  }),
  
  // setup the entire view
  createChildViews: function () {
    var childViews = [], view;
    var that = this;
    
    // Hour view
    view = this.get('hourView');
    if (SC.kindOf(view, SC.View)) {
      view = this.createChildView(view, {
        valueBinding: SC.Binding.from('getHour', this),
        isEnabledBinding: SC.Binding.from('isEnabled',this)
      });
      childViews.push(view);
    }
    else {
      view = null;
    }
    this.set('hourView', view);
    
    // Colon Label
    view = this.get('colonView');
    if (SC.kindOf(view, SC.View)) {
      view = this.createChildView(view, {
        isEnabledBinding: SC.Binding.from('isEnabled',this)
      });
      childViews.push(view);
    }
    else {
      view = null;
    }
    this.set('colonView', view);
    
    // Minute View
    view = this.get('minuteView');
    if (SC.kindOf(view, SC.View)) {
      view = this.createChildView(view, {
        valueBinding: SC.Binding.from('getMinute', this),
        isEnabledBinding: SC.Binding.from('isEnabled',this)
      });
      childViews.push(view);
    }
    else {
      view = null;
    }
    this.set('minuteView', view);
    
    // Meridian View
    view = this.get('meridianView');
    if (SC.kindOf(view, SC.View)) {
      view = this.createChildView(view, {
        valueBinding: SC.Binding.from('getMeridian', this),
        isEnabledBinding: SC.Binding.from('isEnabled',this),
        mouseDown: function () {
          that._toggleMeridian();
        }
      });
      childViews.push(view);
    }
    else {
      view = null;
    }
    this.set('meridianView', view);
    
    this.set('childViews', childViews);
  }
});

