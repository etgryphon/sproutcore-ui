// ==========================================================================
// SCUI.CalendarView
// ==========================================================================

SCUI.CalendarView = SC.View.extend({
  
  weekdayStrings: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  
  monthStartOn: SC.DateTime.create({day: 1}),
  selectedDate: null,
  
  displayProperties: ['monthStartOn'],
  
  mouseDown: function(evt) {
     if (evt.target.className === 'button previous') {
       this.$('.button.previous').addClass('active');
      } else if (evt.target.className === 'button next') {
        this.$('.button.next').addClass('active');
      }
      return YES;
  },
  
  mouseUp: function(evt) {
    
    var monthStartOn = this.get('monthStartOn');
    
    if (evt.target.className === 'button previous') {
      this.set('monthStartOn', monthStartOn.advance({month: -1}));
      this.$('.button.previous').removeClass('active');
    } else if (evt.target.className === 'button next') {
      this.set('monthStartOn', monthStartOn.advance({month: 1}));
      this.$('.button.next').removeClass('active');
    }
    return YES;
  },
  
  render: function(context, firstTime) {
    
    var monthStartOn = this.get('monthStartOn');
    var startDay = monthStartOn.get('dayOfWeek');
    var currDate = monthStartOn.advance({day: -startDay});
    var selDate = this.get('selectedDate');
    var todaysDate = SC.DateTime.create();
    var classNames;
    
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
        
        classNames = ['present'];
        
        if (currDate.get('day') === todaysDate.get('day') && currDate.get('month') === todaysDate.get('month') && currDate.get('year') === todaysDate.get('year')) {
          classNames.push('today');
        } 
        
        if (selDate && currDate.get('day') === selDate.get('day') && currDate.get('month') === selDate.get('month') && currDate.get('year') === selDate.get('year')) {
          classNames.push('selected');
        }
        
        context.push('<div class="day %@"> %@ </div>'.fmt(classNames.join(' '), currDate.get('day')));
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