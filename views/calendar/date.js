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

SCUI.PAST = 'past';
SCUI.PRESENT = 'present';
SCUI.TODAY = 'today';
SCUI.FUTURE = 'future';

SCUI.DateView = SC.View.extend(
/** @scope SCUI.DateView.prototype */ {
  classNames: ['scui-date'],
  
  // Necessary Elements
  date: 1,
  timing: SCUI.PRESENT,
  content: null,
  datePosition: SCUI.TOP_LEFT,
  
  // display properties that should automatically cause a refresh.
  displayProperties: ['date', 'datePosition', 'timing', 'content', 'content.[]'],
  
  render: function(context, firstTime){
    //console.log('Render called');
    var date = this.get('date');
    var timing = this.get('timing');
    var posString = this._formatPosition();
    if (firstTime){
      context.addClass(timing);
      context.push('<div class="date_number" style="position: absolute; %@">%@</div>'.fmt( posString, date ));
    }
    else {
      // First, Set the right timing classes
      context.setClass(SCUI.PAST, SCUI.PAST === timing); // addClass if YES, removeClass if NO
      context.setClass(SCUI.PRESENT, SCUI.PRESENT === timing); // addClass if YES, removeClass if NO
      context.setClass(SCUI.TODAY, SCUI.TODAY === timing); // addClass if YES, removeClass if NO
      context.setClass(SCUI.FUTURE, SCUI.FUTURE === timing); // addClass if YES, removeClass if NO
      
      // Set the right date number
      this.$('.date_number').replaceWith('<div class="date_number" style="position: absolute; %@">%@</div>'.fmt( posString, date ));
    }
  },
  
  _formatPosition: function(){
    var datePos = this.get('datePosition');
    if (datePos === SCUI.TOP_LEFT){
      return 'left: 5px; top: 5px;';
    }
    else{
      return 'left: 5px; top: 5px;';
    }
  }
  
}) ;
