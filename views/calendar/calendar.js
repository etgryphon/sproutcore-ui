// ==========================================================================
// SCUI.CalendarView
// ==========================================================================

sc_require('core');
sc_require('views/calendar/date');
sc_require('mixins/simple_button');

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
  dateBorderWidth: 1,
  headerHeight: null,
  weekdayHeight: 20,
  exampleDateView: SCUI.DateView,
  
  _dateGrid: [],
  
  init: function(){
    var monthStartOn = this.get('monthStartOn') || new Date();
    monthStartOn.setDate(1);
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
  
  // display properties that should automatically cause a refresh.
  displayProperties: ['monthStartOn', 'titleKey', 'dateKey', 'content', 'content.[]'],
  
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
    
    if (firstTime){
      context.push(
        '<div class="month_header" style="position: absolute; left: %@1px; right: %@1px; height: %@2px;">%@3 %@4</div>'.fmt( 
          trueWidth,
          headerHeight, 
          this._toMonthString(monthStartOn.getMonth()),
          monthStartOn.getFullYear()
        )
      );
      
      // Construct the Date Strings
      var startLeft = 0;
      for( var i = 0; i < 7; i++){
        context.push(
          '<div class="weekday" style="position: absolute; left: %@1px; top: %@2px; width: %@3px; height: 20px;">%@4</div>'.fmt( 
            startLeft,
            headerHeight,
            trueWidth,
            this._toWeekdayString(i)
          )
        );
        startLeft += trueWidth;
      }
    }
    else {
      this.$('.month_header').text('%@ %@'.fmt( this._toMonthString(monthStartOn.getMonth()), monthStartOn.getFullYear() ));
    }
    this._updateDates();
    sc_super();
  },
  
  /**
    Create the main childviews
  */
  createChildViews: function() {
    console.log('SCUI.CalendarView#createChildViews()');
    var childViews = [], view=null;
    
    var borderWidth = this.get('dateBorderWidth');
    var dateSize = this.get('dateSize');
    var trueWidth = (2*borderWidth)+dateSize.width;
    var trueHeight = (2*borderWidth)+dateSize.height;
    var headerHeight = this.get('headerHeight');
    
    // Create the Next And Previous Month Buttons
    view = this.createChildView( 
      SC.View.design( SCUI.SimpleButton, {
        classNames: ['scui-cal-button'],
        layout: {left: 0, top: 0, width: trueWidth, height: headerHeight},
        title: "<< Previous",
        target: this,
        action: 'previousMonth'
      }),
      { rootElementPath: [0] }
    );
    childViews.push(view);
    
    // Next Month Button
    view = this.createChildView( 
      SC.View.design(SCUI.SimpleButton, {
        classNames: ['scui-cal-button'],
        layout: {right: 0, top: 0, width: trueWidth, height: headerHeight},
        title: "Next >>",
        target: this,
        action: 'nextMonth'
      }),
      { rootElementPath: [1] }
    );
    childViews.push(view);
    
    // Now, loop and make the date grid
    var startLeft = 0;
    var startTop = headerHeight + this.get('weekdayHeight');
    var exampleView = this.get('exampleDateView');
    for( var i = 0; i < 42; i++){
      view = this.createChildView( 
        exampleView.design({
          layout: {left: startLeft, top: startTop, width: dateSize.width, height: dateSize.height},
          timing: SCUI.PAST,
          date: i
        }),
        { rootElementPath: [i+2] }
      );
      this._dateGrid.push(view);
      childViews.push(view);
      
      // Increment the position
      if (((i+1) % 7) === 0) {
        startTop += trueHeight;
        startLeft = 0;
      }
      else {
        startLeft += trueWidth;
      }
    }
    this.set('childViews', childViews);
    return this;
  },
  
  nextMonth: function() {
    var currMonthStartOn = this.get('monthStartOn');
    var year = currMonthStartOn.getFullYear();
    var month = currMonthStartOn.getMonth();
    if (month === 11){
      currMonthStartOn.setFullYear(year+1);
      currMonthStartOn.setMonth(0);
    }
    else{
      currMonthStartOn.setMonth(month+1);
    }
    currMonthStartOn.setDate(1);
    this.set('monthStartOn', currMonthStartOn);
    this.displayDidChange();
  },
  
  previousMonth: function() {
    var currMonthStartOn = this.get('monthStartOn');
    var year = currMonthStartOn.getFullYear();
    var month = currMonthStartOn.getMonth();
    if (month === 0){
      currMonthStartOn.setFullYear(year-1);
      currMonthStartOn.setMonth(11);
    }
    else{
      currMonthStartOn.setMonth(month-1);
    }
    currMonthStartOn.setDate(1);
    this.set('monthStartOn', currMonthStartOn);
    this.displayDidChange();
  },
  
  _updateDates: function(){
    var monthStartOn = this.get('monthStartOn');
    var month = monthStartOn.getMonth();
    var startDay = monthStartOn.getDay();
    var currDay = new Date(monthStartOn.getTime()-((startDay)*86400000));
    var today = new Date();
    for (var gIdx = 0; gIdx < 42; gIdx++)
    {
      if (gIdx < startDay){
        this._dateGrid[gIdx].set('timing', SCUI.PAST);
      }
      else if(currDay.getMonth() === month){
        // Start the Date Count
        if (this._checkForSameDate(today, currDay)) {
          this._dateGrid[gIdx].set('timing', SCUI.TODAY);
        }
        else {
          this._dateGrid[gIdx].set('timing', SCUI.PRESENT);
        }
      }
      else {
        this._dateGrid[gIdx].set('timing', SCUI.FUTURE);
      }
      this._dateGrid[gIdx].set('date', currDay.getDate());
      currDay = new Date(currDay.getTime() + 86400000);
    }
    
  },
  
  _checkForSameDate: function(date1, date2){
    var day1 = date1.getDate();
    var day2 = date2.getDate();
    var month1 = date1.getMonth();
    var month2 = date2.getMonth();
    var year1 = date1.getFullYear();
    var year2 = date2.getFullYear();
    if (day1 !== day2){ return NO; }
    else if (month1 !== month2){ return NO; }
    else if (year1 !== year2){ return NO; }
    
    return YES;
  },
  
  _toMonthString: function(month){
    switch(month){
      case 0:
        return "January".loc();
      case 1:
        return "February".loc();
      case 2:
        return "March".loc();
      case 3:
        return "April".loc();
      case 4:
        return "May".loc();
      case 5:
        return "June".loc();
      case 6:
        return "July".loc();
      case 7:
        return "August".loc();
      case 8:
        return "September".loc();
      case 9:
        return "October".loc();
      case 10:
        return "November".loc();
      case 11:
        return "December".loc();
      default:
        return "Unknown".loc();
    }
  },
  
  _toWeekdayString: function(day){
    switch(day){
      case 0:
        return "Sun".loc();
      case 1:
        return "Mon".loc();
      case 2:
        return "Tue".loc();
      case 3:
        return "Wed".loc();
      case 4:
        return "Thu".loc();
      case 5:
        return "Fri".loc();
      case 6:
        return "Sat".loc();
      default:
        return "Unk".loc();
    }
  }
  
});