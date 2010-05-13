// ==========================================================================
// SCUI.ColorWell
// ==========================================================================

/** @class

  click on this view and get the color picker...
  
  @extends SC.View
  @author Mike Ball
*/

SCUI.ColorWell = SC.View.extend(
/** @scope SC.CheckboxView.prototype */ {
  
  classNames: ['color-well'],
  
  value: '#eee',

  activeClass: 'active',
    
  displayProperties: 'value'.w(),

  render: function(context, firstTime){
    context.addStyle({backgroundColor: this.get('value')}).setClass(this.get('activeClass'), this._isMouseDown);
  },
  
  mouseDown: function(evt){
    if(!this.get('isEnabledInPane')) return NO;
    this.set('isActive', YES);
    this.displayDidChange();
    return YES ;
  },
  
  mouseUp: function(evt){
    if(!this.get('isEnabledInPane')) return NO;
    this._isMouseDown = false;
    this.displayDidChange();
    this._popupColorPicker();
    return YES ;
  },
  
  _popupColorPicker: function(){
    var that = this;
    if(!this._pickerPane){
      this._pickerPane = SC.PickerPane.create({
        layout: {width: 180, height: 240},
        classNames: ['color-picker', 'picker'],
        contentView: SC.View.design({
          childViews: 'picker textBox'.w(),
          
          picker: SCUI.ColorPicker.design({
            layout: {centerX: 0, top: 10, width: 160, height: 185},
            valueBinding: SC.binding('value', that)
          }),
          textBox: SC.TextFieldView.design({
            layout: { width: 160, height: 24, bottom: 10, left: 10 },
            valueBinding: SC.binding('value', that)
          })
        })
      });
    }
    this._pickerPane.popup(this, SC.PICKER_POINTER);
  }

});

