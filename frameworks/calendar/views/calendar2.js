// ==========================================================================
// SCUI.CalendarView
// ==========================================================================

SCUI.CalendarView = SC.View.extend({
  
  weekdayStrings: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  
  monthStartOn: SC.DateTime.create({day: 1}),
  
  mouseDown: function(evt) {
    if (evt.target.className === 'button previous') {
      
    } else if (evt.target.className === 'button next') {
      
    }
  },
  
  render: function(context, firstTime) {
    
    var monthStartOn = this.get('monthStartOn');
    var startDay = monthStartOn.get('dayOfWeek');
    var currDate = monthStartOn.advance({day: -startDay});
    var todaysDate = SC.DateTime.create();
    
    context.push(
      '<div class="calendar" style="width: 205px; height: 198px; position: absolute; top: 50px; left: 50px;">',
      '<div class="calendar-header">',
      '<div class="month">%@</div>'.fmt(monthStartOn.toFormattedString('%B %Y')),
      '<div class="button previous"></div>',
      '<div class="button next"></div>',
      '</div>',
      '<div class="calendar-body">'
    );
    
    var weekdayStrings = this.get('weekdayStrings');
    
    for (var i = 0; i < 7; i++) {
      context.push('<div class="day header">%@</div>'.fmt(weekdayStrings[i]));
    }
    
    context.push('<div class="grid">');
    
    for (var gIdx = 0; gIdx < 42; gIdx++) {
      if(currDate.get('month')< monthStartOn.get('month') || currDate.get('month') > monthStartOn.get('month')) {
        context.push('<div class="day previous">'+currDate.get('day')+'</div>');
      } else {
        if (currDate.get('day') === todaysDate.get('day') && currDate.get('month') === todaysDate.get('month') && currDate.get('year') === todaysDate.get('year')) {
          context.push('<div class="day today">'+currDate.get('day')+'</div>');
        } else {
          context.push('<div class="day present">'+currDate.get('day')+'</div>');
        }
      }
      currDate = currDate.advance({day: 1});
    }
    
    context.push(
      '</div>',
      '</div>',
      '<div class="pointer perfectBottom"></div>',
      '</div>'
    );
  }
});