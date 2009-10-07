// ==========================================================================
// SCUI.DateView
// ==========================================================================

sc_require('core');

/** @class

  This is the date view that creates the date block with the number and status of the date

  @extends SC.View
  @author Evin Grano
  @version 0.1
  @since 0.1
*/

SCUI.DateView = SC.View.extend( SCUI.SimpleButton, 
/** @scope SCUI.DateView.prototype */ {
  classNames: ['scui-date'],
  
  // Necessary Elements
  date: null,
  calendarView: null,
  timing: SCUI.PRESENT,
  content: null,
  isSelected: NO,
  
  init: function(){
    this.set('target', this);
    this.set('action', '_selectedDate');
    sc_super();
  },
  
  // display properties that should automatically cause a refresh.
  displayProperties: ['date', 'isSelected', 'timing'],
  
  render: function(context, firstTime){
    //console.log('Render called');
    var date = this.get('date') || SC.DateTime.create();
    var timing = this.get('timing');
    var isSelected = this.get('isSelected');
   
    // First, Set the right timing classes
    context.setClass(SCUI.PAST, SCUI.PAST === timing); // addClass if YES, removeClass if NO
    context.setClass(SCUI.PRESENT, SCUI.PRESENT === timing); // addClass if YES, removeClass if NO
    context.setClass(SCUI.TODAY, SCUI.TODAY === timing); // addClass if YES, removeClass if NO
    context.setClass(SCUI.FUTURE, SCUI.FUTURE === timing); // addClass if YES, removeClass if NO
    context.setClass('sel', isSelected); // addClass if YES, removeClass if NO
    // Set the right date number
    context.begin('div').attr('class', 'date_number').push(date.get('day')).end();
  },
  
  _selectedDate: function(){
    var cv = this.get('calendarView');
    var date = this.get('date');
    if (cv) cv.set('selectedDate', date);
  }

}) ;
