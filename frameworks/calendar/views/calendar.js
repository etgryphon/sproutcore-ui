// ==========================================================================
// SCUI.CalendarView
// ==========================================================================

SCUI.CalendarView = SC.View.extend({
  
  weekdayStrings: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  
  monthStartOn: SC.DateTime.create({day: 1}),
  selectedDate: null,
  showYearButtons: YES,
  
  displayProperties: ['monthStartOn', 'selectedDate'],
  
  resetToSelectedDate: function(){
    var selectedDate = this.get('selectedDate');
    if (selectedDate) this.set('monthStartOn', selectedDate.adjust({ day: 1 }));
  },
  
  mouseDown: function(evt) {
    var date = this._parseSelectedDate(evt.target.id);
    if (date) this.set('selectedDate', date);
    var target = evt.target;
    var className = target.className;
    
    if (className.match('button')) { this.$(target).addClass('active'); }
    
    return YES;
  },
  
  mouseUp: function(evt) {
    var monthStartOn = this.get('monthStartOn');
    
    var className = evt.target.className,
        param;
    
    if (className.match('button')) {
      var unit = className.match('previous') ? -1 : 1;    
    
      if (className.match('year')) {
        param = {year: unit};
      } else {
        param = {month: unit};
      }
    
      this.set('monthStartOn', monthStartOn.advance(param));
      this.$('.button.active').removeClass('active');
      return YES;
    } else {
      return NO;
    }
    
  },
  
  render: function(context, firstTime) {
    var monthStartOn = this.get('monthStartOn');
    var startDay = monthStartOn.get('dayOfWeek');
    var currDate = monthStartOn.advance({day: -startDay});
    var selDate = this.get('selectedDate');
    var todaysDate = SC.DateTime.create();
    var weekdayStrings = this.get('weekdayStrings');
    var classNames, uniqueDayIdentifier;
    
    context = context .begin('div').addClass('header')
                        .begin('div').addClass('month').text(monthStartOn.toFormattedString('%B %Y')).end()
                        .begin('div').addClass('button previous').end()
                        .begin('div').addClass('button next').end();

    if (this.get('showYearButtons')) {
      context = context .begin('div').addClass('button previous year').end()
                        .begin('div').addClass('button next year').end();
    }  
                        
    context = context .end()
                      .begin('div').addClass('body');
    
    for (var i = 0; i < 7; i++) {
      context = context.begin('div').addClass('day name').text(weekdayStrings[i]).end();
    }
    
    context = context.begin('div').addClass('grid');
    
    for (var gIdx = 0; gIdx < 42; gIdx++) {
      uniqueDayIdentifier = this._createUniqueDayIdentifier(currDate);
      
      if (currDate.get('month') < monthStartOn.get('month') || currDate.get('month') > monthStartOn.get('month')) {
        context =  context.begin('div').attr('id', uniqueDayIdentifier).addClass('day past').text(currDate.get('day')).end();
        
      } else {
        classNames = ['present'];
        
        if (currDate.get('day') === todaysDate.get('day') && currDate.get('month') === todaysDate.get('month') && currDate.get('year') === todaysDate.get('year')) {
          classNames.push('today');
        } 
        
        if (selDate && currDate.get('day') === selDate.get('day') && currDate.get('month') === selDate.get('month') && currDate.get('year') === selDate.get('year')) {
          classNames.push('sel');
        }
        
        context = context.begin('div').attr('id', uniqueDayIdentifier).addClass('day').addClass(classNames.join(' ')).text(currDate.get('day')).end();
      }
      currDate = currDate.advance({ day: 1 });
    }
    
    context = context.end().end();
  },
  
  _createUniqueDayIdentifier: function(currDate) {
    var day = currDate.get('day');
    var month = currDate.get('month');
    var year = currDate.get('year');
    return 'scuidate-%@-%@-%@-%@'.fmt(this.get('layerId'), day, month, year);
  },
  
  _parseSelectedDate: function(dateIdentifier) {
    if (!SC.empty(dateIdentifier)) {
      var dataArray = dateIdentifier.split('-');
      if (dataArray.length === 5 && dataArray[0] === 'scuidate' && dataArray[1] === this.get('layerId')) {
        var day = dataArray[2];
        var month = dataArray[3];
        var year = dataArray[4];
        return SC.DateTime.create({ day: day, month: month, year: year });
      }
    }
    return null;
  }
  
});

