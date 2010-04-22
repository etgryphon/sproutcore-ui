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
  
  
  
  value: '#eee',

  activeClass: 'active',
    
  displayProperties: 'value'.w(),

  render: function(context, firstTime){
    context.addStyle({backgroundColor: this.get('value')}).setClass(this.get('activeClass'), this._isMouseDown);
  },
  
  mouseDown: function(evt){
    this.set('isActive', YES);
    this.displayDidChange();
    return YES ;
  },
  
  mouseUp: function(evt){
    this._isMouseDown = false;
    this.displayDidChange();
    this._popupColorPicker();
    return YES ;
  },
  
  _popupColorPicker: function(){
    var that = this;
    if(!this._pickerPane){
      this._pickerPane = SC.PickerPane.create({
        layout: {width: 160, height: 205},
        contentView: SC.View.design({
          childViews: 'picker textBox'.w(),
          
          picker: SCUI.ColorPicker.design({
            layout: {top: 0, left: 0, width: 160, height: 185},
            valueBinding: SC.binding('value', that)
          }),
          textBox: SC.TextFieldView.design({
            layout: {left: 2, right: 2, bottom: 0, height: 24},
            valueBinding: SC.binding('value', that)
          })
        })
      });
    }
    this._pickerPane.popup(this, SC.PICKER_POINTER);
  }

});

