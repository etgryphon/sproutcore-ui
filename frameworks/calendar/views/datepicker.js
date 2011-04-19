// ==========================================================================
// SCUI.DatePickerView
// ==========================================================================
/*globals SCUI */

/** @class

  This is the Date Chooser View that creates a text field, a button that launches a calendar chooser

  @extends SC.View
  @author Evin Grano
  @version 0.1
  @since 0.1
*/

SCUI.DatePickerView = SC.View.extend(  
/** @scope SCUI.DatePickerView.prototype */ {
  classNames: ['scui-datepicker-view'],
  
  // Necessary Elements
  date: null,
  dateString: "",
  isShowingCalendar: NO,
  // Params for the textfield
  hint: "Click to choose...",
  dateFormat: null,
  calendarLayout: null,
  hasHelperButtons: YES,
  
  isEditing: NO,
  
  /** 
    The isTextFieldEnabled property determines if the textfield view is enabled
    
    @property {Boolean}
  */
  isTextFieldEnabled: YES,
  
  // @private
  _textfield: null,
  _date_button: null,
  _calendar_popup: null,
  _calendar: null,
  _layout: {width: 195, height: 25},
  
  // display properties that should automatically cause a refresh.
  displayProperties: ['date', 'isEditing'],
  
  init: function(){
    sc_super();
    
    // Setup default layout values
    var layout = this.get('layout'), that = this;
    layout = SC.merge(this._layout, layout);
    this.set('layout', layout);
  },
  
  createChildViews: function(){
    var view, childViews = [];
    var that = this;
    
    // init the dateString to whatever date we're starting with (if present)
    this.set('dateString', this._genDateString(this.get('date')));
    
    var textFieldDesign = {
      layout: {left: 0, top: 0, right: 0, bottom: 0},
      classNames: ['scui-datechooser-text'],
      isEnabled: YES,
      valueBinding: SC.Binding.from('.dateString', that),
      hintBinding: SC.Binding.from('hint', that),
      mouseDown: function (evt) {
        that.toggle();
        sc_super();
      }
    };
    
    if (this.get('isTextFieldEnabled')) {
      textFieldDesign.isEnabledBinding = SC.binding('isEnabled', that);
    } else {
      textFieldDesign.isEnabled = NO;
    }
    
    // First, Build the Textfield for the date chooser
    view = this._textfield = this.createChildView( 
      SC.TextFieldView.design(textFieldDesign)
    );
    childViews.push(view);
    this.bind('isEditing', SC.Binding.from('isEditing', view).oneWay());
        
    // Now, set up the button to launch the Calendar Datepicker
    view = this._date_button = this.createChildView( 
      SC.View.design( SCUI.SimpleButton, {
        classNames: ['scui-datechooser-button', 'calendar-icon'],
        layout: {right: 5, top: 4, width: 16, height: 16},
        target: this,
        action: 'toggle',
        isEnabledBinding: SC.binding('isEnabled', that)
      })
    );
    childViews.push(view);
    
    this.set('childViews', childViews);
    this._createCalendarPopup();
    sc_super();
  },
  
  _createCalendarPopup: function(){
    var that = this,
        cl = this.get('calendarLayout'),
        hb = this.get('hasHelperButtons');
    hb = SC.none(hb) ? YES : hb;
    // Create the reference to the calendar
    this._calendar_popup = SC.PickerPane.create({
      classNames: ['scui-calendar'],
      layout: cl || { width: 205, height: 244 },
      contentView: SC.View.design({
        childViews: 'calendar todayButton noneButton'.w(),
        calendar: SCUI.CalendarView.design({
          layout: { left: 0, top: 0, bottom: 0, right: 0 },
          selectedDateBinding: SC.Binding.from('date', that)
        }),
        todayButton: SC.View.extend(SCUI.SimpleButton, {
          classNames: ['date-today'],
          layout: {left: 11, bottom: 7, width: 50, height: 16 },
          target: this,
          action: 'selectToday',
          isVisible: hb,
          render: function(context, firstTime) {
            if (firstTime) {
              context.push('Today');
            }
          }
        }),
        noneButton: SC.View.design( SCUI.SimpleButton, {
          classNames: ['date-none'],
          layout: {right: 11, bottom: 7, width: 50, height: 16 },
          target: this,
          action: 'clearSelection',
          isVisible: hb,
          render: function(context, firstTime) {
            if (firstTime) {
              context.push('None');
            }
          }       
        })
      })
    });
    
    // Setup the Binding to the SelectedDate
    if (this._calendar_popup) {
      this.bind('isShowingCalendar', '._calendar_popup.isPaneAttached');
      this._calendar = this._calendar_popup.getPath('contentView.calendar');
    }
  },
  
  render: function(context, firstTime) {
    sc_super();
    context.setClass('focus', this.get('isEditing'));
  },

  /**  
    Hides the attached menu if present.  This is called automatically when
    the button gets toggled off.
  */
  hideCalendar: function() {
    if (this._calendar_popup && this.get('isShowingCalendar')) {
      this._calendar_popup.remove();
      this.set('isShowingCalendar', NO);
    }
  },

  /**
    Shows the menu.  This is called automatically when the button is toggled on.
  */
  showCalendar: function() {
    // Now show the menu
    if (this._calendar_popup) {
      this._calendar_popup.popup(this._textfield); // show the menu
      this._calendar.resetToSelectedDate();
      this.set('isShowingCalendar', YES);
    }
  },
  
  toggle: function(){
    if (this.isShowingCalendar){
      this.hideCalendar();
    }
    else{
      this.showCalendar();
    }
  },
  
  selectToday: function(){
    this._calendar.set('selectedDate', SC.DateTime.create());
    this.hideCalendar();
  },
  
  clearSelection: function(){
    this._calendar.set('selectedDate', null);
    this.hideCalendar();
  },
  
  /**
    Standard way to generate the date string
  */
  _genDateString: function(date) {
    var fmt = this.get('dateFormat') || '%a %m/%d/%Y';
    var dateString = date ? date.toFormattedString(fmt) : "";
    return dateString;
  },
  
  _dateDidChange: function(){
    this.set('dateString', this._genDateString(this.get('date')));
    this.hideCalendar();
  }.observes('date')

}) ;

