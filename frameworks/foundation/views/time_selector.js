//============================================================================
// SCUI.TimeSelectorFieldView
//============================================================================
/*globals SCUI*/

/**

  TODO
  @extends SC.View
  @author Jason Dooley
  @author Jonathan Lewis
  @version GA
  @since GA

  Example:

  timeSelector: SCUI.TimeSelectorFieldView.design({
   layout: { left: 0, top: 0, height: 24 },
   valueBinding: 'App.yourController.timeField'
  })

  {@value expects SC.DateTime}


*/

SCUI.TimeSelectorFieldView = SC.View.extend({
   
  // PUBLIC PROPERTIES

  classNames: ['scui-timeselector'],

  // this can be styled, but for the time being, need a
  // min width and height to fit everything in conveniently
  layout: { minHeight: 24, minWidth: 100 },
  
  /*
    The SC.DateTime instance being manipulated by this view.  If not set to anything,
    the view will be empty.  If someone tries to enter a time value in the view when
    'value' is null, the view will create an SC.DateTime instance and set it here.  Otherwise
    it will just modify the value already set here.
  */
  value: null,

  /*
    Hour component of 'value', in 12-hour format.  Non-numeric data will be ignored.
  */
  hour: function(key, value) {
    var time = this.get('value');
    var newHour, lastHour, lastMinute, meridian;

    if (value !== undefined) {
      if (!time) { // only create from scratch if we have to, to avoid losing any time zone data already stored in an existing value
        time = SC.DateTime.create();
        time = time.adjust({hour: 12, minute: 0});
      }

      lastHour = time.toFormattedString('%i') * 1; // in 12 hour format, as if someone typed it in
      lastMinute = time.get('minute') * 1;
      meridian = time.toFormattedString('%p');

      newHour = (isNaN(value * 1) || value === '') ? lastHour : Math.abs(value * 1); // revert to last hour if invalid input

      if (newHour > 12) {
        newHour = newHour % 10; // just take the last digit
      }
      
      if (meridian === 'PM') {
        if (newHour < 12) { // convert to 24-hour time
          newHour = newHour + 12;
        }
      }
      else { // AM
        if (newHour === 12) { // special case for entering 12AM
          newHour = 0;
        }
      }

      // wrap this set call to make sure that every change causes a notification
      // for proper formatting, even if two equivalent time values are entered.
      this.propertyWillChange('value');
      this.set('value', time.adjust({ hour: newHour, minute: lastMinute })); // have to preserve minute as well -- setting hour resets minute
      this.propertyDidChange('value');
    }
    else {
      value = time ? time.toFormattedString('%i') : null; // 12-hour format
    }
    
    return value;
  }.property('value').cacheable(),

  /*
    Minute component of 'value'.  Non-numeric data will be ignored.
  */
  minute: function(key, value) {
    var time = this.get('value');
    var lastMinute, newMinute;
    
    if (value !== undefined) {
      if (!time) { // only create from scratch if we have to, to avoid losing any time zone data already stored in an existing value
        time = SC.DateTime.create();
        time = time.adjust({hour: 12, minute: 0});
      }

      lastMinute = time.get('minute') * 1;
      newMinute = (isNaN(value * 1) || value === '') ? lastMinute : Math.abs(value * 1); // revert to last minute value if input is invalid

      if (newMinute > 59) {
        newMinute = newMinute % 10; // just take the last digit
      }

      this.propertyWillChange('value');
      this.set('value', time.adjust({ minute: newMinute }));
      this.propertyDidChange('value');
    }
    else {
      value = time ? time.toFormattedString('%M') : null; // two-digit minute format
    }
    
    return value;
  }.property('value').cacheable(),
  
  /*
    Meridian component of 'value', either 'AM' or 'PM'.  If set to any string containing
    an 'a', it will switch to 'AM', otherwise defaults to 'PM'.
  */
  meridian: function(key, value) {
    var time = this.get('value');
    var hour, minute, newMeridian;

    if (value !== undefined) {
      if (!time) {
        time = SC.DateTime.create();
        time = time.adjust({hour: 12, minute: 0});
      }

      hour = time.toFormattedString('%H') * 1; // in 24-hour format
      minute = time.get('minute') * 1;
      newMeridian = (SC.typeOf(value) === SC.T_STRING) && (value.search(/a/i) >= 0) ? 'AM' : 'PM';

      if (hour < 12 && newMeridian === 'PM') {
        time = time.adjust({ hour: hour + 12, minute: minute });
      }
      else if (hour >= 12 && newMeridian === 'AM') {
        time = time.adjust({ hour: hour - 12, minute: minute });
      }

      this.propertyWillChange('value');
      this.set('value', time);
      this.propertyDidChange('value');
    }
    else {
      value = time ? time.toFormattedString('%p') : null;
    }

    return value;
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
    layout: { width: 5, top: 0, bottom: 0, left: 26},
    textAlign: SC.ALIGN_CENTER,
    value: ':'
  }),
  
  // base minute text field settings
  minuteView: SC.TextFieldView.design({
    classNames: ['scui-timeselector-minute'],
    layout: { width: 24, top: 0, bottom: 0, left: 28},
    textAlign: SC.ALIGN_RIGHT
  }),
  
  // base 'AM' 'PM'
  meridianView: SC.TextFieldView.design({
    classNames: ['scui-timeselector-meridian'],
    layout: { width: 30, top: 0,bottom: 0, left: 58},
    textAlign: SC.ALIGN_CENTER,
    hint: 'PM'
  }),
  
  // PUBLIC METHODS
  
  // setup the entire view
  createChildViews: function () {
    var childViews = [], view;
    var that = this;
    
    // Hour view
    view = this.get('hourView');
    if (SC.kindOf(view, SC.View)) {
      view = this.createChildView(view, {
        valueBinding: SC.Binding.from('hour', this),
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
        valueBinding: SC.Binding.from('minute', this),
        isEnabledBinding: SC.Binding.from('isEnabled', this)
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
        valueBinding: SC.Binding.from('meridian', this),
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
  },

  // PRIVATE METHODS
  
  // convenience function to toggle meridian on click
  _toggleMeridian: function () {
    if (this.get('meridian') === 'AM') {
      this.set('meridian', 'PM');
    }
    else {
      this.set('meridian', 'AM');
    }
  }

});

