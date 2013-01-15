// ==========================================================================
// SCUI.TimePickerView
// ==========================================================================
/*globals SCUI */

/** @class

  This is a ComboBox specialized to choose a time.

  @extends SC.ComboBox
  @author Luke Melia
  @version 0.1
  @since 0.1
*/
SCUI.TimePickerView = SCUI.ComboBoxView.extend(  
/** @scope SCUI.TimePickerView.prototype */ {
  classNames: ['scui-timepicker-view'],
  step:30,
  startTime: SC.DateTime.create({year:1970, month:1, day:1, hour:7, minute: 0, millisecond:0}),
  endTime:   SC.DateTime.create({year:1970, month:1, day:2, hour:6, minute:30, millisecond:0}),
  separator: ':',
  show24HourTime: YES,
  canDeleteValue: YES,
  disableSort: YES,
  dropDownButtonView: null,
  nameKey: null,
  valueKey: null,

  textFieldView: SC.TextFieldView.extend({
    classNames: 'scui-timepicker-text-field-view'.w(),
    layout: { top: 0, left: 0, bottom: 0, right: 0 },
    spellCheckEnabled: NO,
    fieldDidFocus: function() {
      sc_super();
      var filteredObjects = this.parentView.get('filteredObjects');
      if (filteredObjects.length > 0) {
        this.parentView.showList();
      }
    }
  }),
  filteredObjectsDidChange: function () {
    var filteredObjects = this.get('filteredObjects');
    if (filteredObjects.length == 0) {
      this.hideList();
    }
  }.observes('filteredObjects'),


  setFromString: function(timeString) {
    var format = this.get('timeFormat'),
        dateTime;
    if (!SC.empty(timeString)) {
      try {
        dateTime = SC.DateTime.parse(timeString, format);
      } catch(exp){
      }
    }
    this.setFromDateTime(dateTime);
  },
  setFromDateTime: function(dateTime) {
    var format = this.get('timeFormat'),
        newValue = null;
    if (!SC.empty(dateTime)) {
      newValue = dateTime.toFormattedString(format);
    }
    this.setIfChanged('value', newValue);
    this.setIfChanged('selectedTime', dateTime);
  },

  objects: function(){
    var times = [],
        step = this.get('step'),
        format = this.get('timeFormat'),
        time = this.get('startTime'),
        endTime = this.get('endTime');
    if (!(SC.DateTime.compare(time, endTime) < 0)) {
      throw "startTime must be less than endTime";
    }
    while(SC.DateTime.compare(time, endTime) <= 0) {
      times.push(time.toFormattedString(format));
      time = time.advance({minute: step});
    }
    return times;
  }.property('startTime', 'endTime', 'step', 'timeFormat'),

  timeFormat: function(){
    var separator = this.get('separator'),
        format;
    if (this.get('show24HourTime')) {
      format = '%H' + separator + '%M';
    } else {
      format = '%i' + separator + '%M %p';
    }
    return format;
  }.property('separator', 'show24HourTime'),

  selectedTime: null,

  commitEditing: function() {
    var textField = this.get('textFieldView'),
        format = this.get('timeFormat'),
        value = textField.get('value'),
        dateTime = null;

    if (!SC.empty(value)) {
      try {
        dateTime = SC.DateTime.parse(value, format);
      } catch(exp){
      }
    }

    if (this.get('isEditing')) {
      this.set('isEditing', NO);

      // Only commit if the value is blank or a valid time
      // otherwise we revert back
      if (SC.empty(value) || dateTime) {
        this.setIfChanged('selectedTime', dateTime);
        this.setIfChanged('value', value);
      }
      // in IE, as soon as you the user browses through the results in the picker pane by 
      // clicking on the scroll bar or the scroll thumb, the textfield loses focus causing 
      // commitEditing to be called and subsequently hideList which makes for a very annoying 
      // experience. With this change, clicking outside the pane will hide it (same as original behavior), 
      // however, if the user directly shifts focus to another text field, then the pane 
      // won't be removed. This behavior is still buggy but less buggy than it was before.
      if (!SC.browser.msie) {
        this.hideList();
      }
    }

    if (textField && textField.get('isEditing')) {
      textField.commitEditing();
    }
    return YES;
  }
});

