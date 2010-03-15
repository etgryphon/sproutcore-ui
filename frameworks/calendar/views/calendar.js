// ==========================================================================
// SCUI.CalendarView
// ==========================================================================

sc_require('core');
sc_require('views/date');

/** @class

  This is the calendar view that creates the calendar block with the dates

  @extends SC.View
  @author Evin Grano
  @version 0.1
  @since 0.1
*/

SCUI.CalendarView = SC.View.extend(
/** @scope SCUI.CalendarView.prototype */ {
  classNames: ['scui-calendar'],
  
  // Necessary Elements
  monthStartOn: null,
  content: null,
  titleKey: 'title',
  dateKey: 'date',
  dateSize: {width: 100, height: 100},
  dateBorderWidth: 0,
  headerHeight: null,
  weekdayHeight: 20,
  exampleDateView: SCUI.DateView,
  selectedDate: null,
  
  // Optional Parameters
  weekdayStrings: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  monthStrings: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  
  _dateGrid: [],
  
  init: function(){
    var monthStartOn = this.get('monthStartOn') || SC.DateTime.create({day: 1});
    this.set('monthStartOn', monthStartOn);
    // Size stuff
    var dateSize = this.get('dateSize');
    var dateWidth = dateSize.width || 100;
    var dateHeight = dateSize.height || 100;
    var headerHeight = this.get('headerHeight') || dateHeight/4;
    if (headerHeight < 20) headerHeight = 20;
    this.set('dateSize', {width: dateWidth, height: dateHeight});
    this.set('headerHeight', headerHeight);
    this._dateGrid = []; 
    sc_super();
  },
  
  awake: function(){
    this.resetToSelectedDate();
    sc_super();
  },
  
  resetToSelectedDate: function(){
    var selectedDate = this.get('selectedDate');
    if (selectedDate) this.set('monthStartOn', selectedDate.adjust({day: 1}));
  },
  
  // display properties that should automatically cause a refresh.
  displayProperties: ['monthStartOn', 'selectedDate', 'titleKey', 'dateKey', 'content', 'content.[]'],
  
  render: function(context, firstTime){
    //console.log('Render called');
    var borderWidth = this.get('dateBorderWidth');
    var dateSize = this.get('dateSize');
    var trueWidth = (2*borderWidth)+dateSize.width;
    var trueHeight = (2*borderWidth)+dateSize.height;
    var headerHeight = this.get('headerHeight');
    var weekdayHeight = this.get('weekdayHeight');
    var totalWidth = trueWidth*7;
    var totalHeight = (trueHeight*6) + (headerHeight+weekdayHeight);
    var layout = this.get('layout');
    layout = SC.merge(layout, {width: totalWidth, height: totalHeight});
    this.set('layout', layout);
    // Date stuff
    var monthStartOn = this.get('monthStartOn');
    var weekdayStrings = this.get('weekdayStrings');
    var monthStrings = this.get('monthStrings');
    var currMonth = monthStartOn.get('month');
    var currYear = monthStartOn.get('year');
    if (firstTime){
      var headerStr = '<div class="month_header" style="position: absolute; left: %@1px; right: %@1px; height: %@2px;">%@3 %@4</div>';
      context.push( headerStr.fmt(trueWidth, headerHeight, monthStrings[currMonth-1].loc(), currYear) );
      // Construct the Date Strings
      var startLeft = 0;
      for( var i = 0; i < 7; i++){
        context.push(
          '<div class="weekday" style="position: absolute; left: %@1px; top: %@2px; width: %@3px; height: 20px;">%@4</div>'.fmt( 
            startLeft,
            headerHeight,
            dateSize.width,
            weekdayStrings[i].loc()
          )
        );
        startLeft += trueWidth;
      }
    }
    else {
      this.$('.month_header').text('%@ %@'.fmt( monthStrings[currMonth-1].loc(), currYear ));
    }
    this._updateDates();
    sc_super();
  },
  
  /**
    Create the main childviews
  */
  createChildViews: function() {
    var childViews = [], view=null;
    
    var borderWidth = this.get('dateBorderWidth');
    var dateSize = this.get('dateSize');
    var trueWidth = (2*borderWidth)+dateSize.width;
    var trueHeight = (2*borderWidth)+dateSize.height;
    var headerHeight = this.get('headerHeight');
    
    // Create the Next And Previous Month Buttons
    view = this.createChildView( 
      SC.View.design( SCUI.SimpleButton, {
        classNames: ['scui-cal-button', 'previous-month-icon'],
        layout: {left: 5, top: 2, width: 16, height: 16},
        target: this,
        action: 'previousMonth'
      }),
      { rootElementPath: [0] }
    );
    childViews.push(view);
    
    // Next Month Button
    view = this.createChildView( 
      SC.View.design(SCUI.SimpleButton, {
        classNames: ['scui-cal-button', 'next-month-icon'],
        layout: {right: 5, top: 2, width: 16, height: 16},
        target: this,
        action: 'nextMonth'
      }),
      { rootElementPath: [1] }
    );
    childViews.push(view);
    
    // Now, loop and make the date grid
    var startLeft = borderWidth;
    var startTop = headerHeight + this.get('weekdayHeight');
    var exampleView = this.get('exampleDateView');
    for( var i = 0; i < 42; i++){
      view = this.createChildView( 
        exampleView.design({
          layout: {left: startLeft, top: startTop, width: dateSize.width, height: dateSize.height},
          timing: SCUI.PAST,
          calendarView: this,
          date: i
        }),
        { rootElementPath: [i+2] }
      );
      this._dateGrid.push(view);
      childViews.push(view);
      
      // Increment the position
      if (((i+1) % 7) === 0) {
        startTop += trueHeight;
        startLeft = borderWidth;
      }
      else {
        startLeft += trueWidth;
      }
    }
    this.set('childViews', childViews);
    return this;
  },
  
  nextMonth: function() {
    var monthStartOn = this.get('monthStartOn');
    var nextMonth = monthStartOn.advance({month: 1});
    this.set('monthStartOn', nextMonth);
    this.displayDidChange();
  },
  
  previousMonth: function() {
    var monthStartOn = this.get('monthStartOn');
    var prevMonth = monthStartOn.advance({month: -1});
    this.set('monthStartOn', prevMonth);
    this.displayDidChange();
  },
  
  _updateDates: function(){
    var monthStartOn = this.get('monthStartOn');
    var month = monthStartOn.get('month');
    var startDay = monthStartOn.get('dayOfWeek');
    var currDate = monthStartOn.advance({day: -startDay});
    var today = SC.DateTime.create();
    var selectedDate = this.get('selectedDate');
    var isSelected, timing;
    for (var gIdx = 0; gIdx < 42; gIdx++)
    {
      if (gIdx < startDay){
        this._dateGrid[gIdx].set('timing', SCUI.PAST);
      }
      else if(currDate.get('month') === month){
        
        // First Check to see if the Date is selected
        if (selectedDate) {
          isSelected = SC.DateTime.compareDate(currDate, selectedDate) === 0 ? YES : NO;
          this._dateGrid[gIdx].set('isSelected', isSelected);
        }
        
        // Check to see if the current date is to day
        // or in the present month
        timing = SC.DateTime.compareDate(currDate, today) === 0 ? SCUI.TODAY : SCUI.PRESENT;
        this._dateGrid[gIdx].set('timing', timing);
      }
      else {
        this._dateGrid[gIdx].set('timing', SCUI.FUTURE);
      }
      this._dateGrid[gIdx].set('date', currDate);
      currDate = currDate.advance({day: 1});
    } 
  }
});

