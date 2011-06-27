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
SCUI.TimePickerDateTimeWrapper = SC.Object.extend({
  dateTime: null,
  show24HourTime: YES,
  separator: ':',
  formatString: function(){
    if (this.get('show24HourTime')) {
      return '%H' + this.get('separator') + '%M';
    } else {  // use 12-hour format
      return '%i' + this.get('separator') + '%M %p';
    }   
  }.property('show24HourTime', 'separator'),
  toString: function(){
    return this.get('dateTime').toFormattedString(this.get('formatString'));
  },
  stringified: function(){
    return this.toString();
  }.property('dateTime'),
  isEqual: function(other) {
    return this.get('dateTime').isEqual(other.get('dateTime'));
  }
});

SCUI.TimePickerView = SCUI.ComboBoxView.extend(  
/** @scope SCUI.TimePickerView.prototype */ {
  classNames: ['scui-timepicker-view'],
  step:30,
  startTime: SC.DateTime.create({hour:0}),
  endTime: SC.DateTime.create({hour:23, minute:30}),
  separator: ':',
  show24HourTime: YES,
  canDeleteValue: YES,

  disableSort: YES,
  dropDownButtonView: null,
  nameKey: 'stringified',
  valueKey: 'dateTime',
  
  init: function() {
    sc_super();
    var _this = this;
    this.set('objects', this.get('timeChoices'));
  },
  textFieldView: SC.TextFieldView.extend({
    classNames: 'scui-timepicker-text-field-view'.w(),
    layout: { top: 0, left: 0, height: 22, right: 0 },
    spellCheckEnabled: NO,
    fieldDidFocus: function() {
      sc_super();
      this.parentView.showList();
    }
  }),
  setFromString: function(timeString, format) {
    if (SC.empty(timeString)) {
      this.set('value', null);
    } else {
      var parsedDateTime = SC.DateTime.parse(timeString, format),
          matchingObject = this.get('objects').find(function(item){
        return (item.get('dateTime') === parsedDateTime) ? YES : NO;
      });
      this.setIfChanged('value', this._getObjectValue(matchingObject, this.get('valueKey')));
    }
  },
  timeChoices: function(){
    var times = [],
        time = this.get('startTime'),
        endTime = this.get('endTime');
    if (!(SC.DateTime.compare(time, endTime) < 0)) {
      throw "startTime must be less than endTime";
    }
    while(SC.DateTime.compare(time, endTime) <= 0) {
      times.pushObject(SCUI.TimePickerDateTimeWrapper.create({
        dateTime:time,
        show24HourTime: this.get('show24HourTime'),
        separator: this.get('separator')
      }));
      time = time.advance({minute: this.get('step')});
    }
    return times;
  }.property('startTime', 'endTime', 'step')
});
