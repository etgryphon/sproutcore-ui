// ==========================================================================
// SCUI.StepperView
// ==========================================================================

/** @class

  This view renders a stepper control button for incrementing/decrementing 
  values in a bound text field.
  
  To use bind the value of this view to the value of text field or label.

  @extends SC.View
  @author Brandon Blatnick
*/

SCUI.StepperView = SC.View.extend(
  /** @scope SC.CheckboxView.prototype */ {

  layout: { top: 0, left: 0, width: 19, height: 27 },
  
  /* Value to be binded to apprioprate label or text field */
  value: 0,
  
  /* amount to increment or decrement upon clicking stepper */
  increment: 1,
  
  /* max value allowed */
  max: 10,
  
  /* min value allowed */
  min: 0,
  
  /* if value should wraparound to the min if max is reached (and vise versa) */
  valueWraps: NO,

  createChildViews: function() {
    var childViews = [];
    var value = this.get('value');
    var increment = this.get('increment');
    var that = this;

    var view = this.createChildView(SC.ButtonView.design({
      classNames: ['scui-stepper-view-top'],
      layout: { top: 0, left: 0, width: 19, height: 13 },
      mouseUp: function() {
        sc_super();
        var value = that.get('value');
        var max = that.get('max');
        value = value + increment;
        var wraps = that.get('valueWraps');
        
        if (value <= max) that.set('value', value);
        else if (wraps) {
          var min = that.get('min');
          value = value - max - increment;
          value = value + min;
          that.set('value', value);
        }
      }
    }));
    childViews.push(view);

    view = this.createChildView(SC.ButtonView.design({
      classNames: ['scui-stepper-view-bottom'],
      layout: { top: 14, left: 0, width: 19, height: 13 },
      mouseUp: function() {
        sc_super();
        var value = that.get('value');
        var min = that.get('min');
        value = value - increment;
        var wraps = that.get('valueWraps');
        
        if (value >= min) that.set('value', value);
        else if (wraps) {
          var max = that.get('max');
          value = min - value - increment;
          value = max - value;
          that.set('value', value);
        }
      }
    }));
    childViews.push(view);

    this.set('childViews', childViews);
  }
});