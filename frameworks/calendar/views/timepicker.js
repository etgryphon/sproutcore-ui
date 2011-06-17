// ==========================================================================
// SCUI.TimePickerView
// ==========================================================================
/*globals SCUI */

/** @class

  This is a ComboBox specialized to choose a time.

  @extends SC.View
  @author Luke Melia
  @version 0.1
  @since 0.1
*/
SCUI.TimePickerDateTimeWrapper = SC.Object.extend({
  dateTime: null,
  formattedTime: function(dateTime) {
    return dateTime.toFormattedString('%i:%M %p');
  },
  toString: function(){
    return this.formattedTime(this.get('dateTime'));
  },
  stringified: function(){
    return this.toString();
  }.property('dateTime')
});

SCUI.TimePickerView = SCUI.ComboBoxView.extend(  
/** @scope SCUI.TimePickerView.prototype */ {
  classNames: ['scui-timepicker-view'],
  step:30,
  startTime: SC.DateTime.create({hour:0}),
  endTime: SC.DateTime.create({hour:23, minute:30}),
  separator: ':',
  show24HourTime: true,
  canDeleteValue: YES,

  disableSort: YES,
  dropDownButtonView: null,
  nameKey: 'stringified',
  
  init: function() {
    sc_super();
    var _this = this;
    this.set('objects', this.get('timeChoices'));
  },
  textFieldView: SC.TextFieldView.extend({
    classNames: 'scui-combobox-text-field-view',
    layout: { top: 0, left: 0, height: 22, right: 0 },
    spellCheckEnabled: NO,
    fieldDidFocus: function() {
      sc_super();
      this.parentView.showList();
    }
  }),
  setFromString: function(timeString, format) {
    console.log('TimePickerView#setFromString', timeString, format);
    if (SC.empty(timeString)) {
      this.set('value', null);
    } else {
      var parsedDateTime = SC.DateTime.parse(timeString, format),
          matchingObject = this.get('objects').find(function(item){
        return (item.get('dateTime') === parsedDateTime) ? YES : NO;
      });
      this.setIfChanged('value', matchingObject);
    }
  },
  twelveHourFormatter: function(dateTime) {
    var formatString = '%i' + this.get('separator') + '%M %p';
    return dateTime.toFormattedString(formatString);
  },
  twentyFourHourFormatter: function(dateTime) {
    var formatString = '%H' + this.get('separator') + '%M';
    return dateTime.toFormattedString(formatString);
  },
  timeChoices: function(){
    var times = [],
        time = this.get('startTime'),
        formatter = this.get('show24HourTime') ? _.bind(this.twelveHourFormatter, this) : _.bind(this.twentyFourHourFormatter, this);
    while(time <= this.get('endTime')) {
      times.pushObject(SCUI.TimePickerDateTimeWrapper.create({
        dateTime:time,
        formattedTime: formatter
      }));
      time = time.advance({minute: this.get('step')});
    }
    return times;
  }.property('startTime', 'endTime', 'step')
});
