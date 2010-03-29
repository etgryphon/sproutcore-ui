/** @class

  A simple extension of SC.ListItemView to allow for string localization.

  @extends SC.ListItemView
  @author Jonathan Lewis
*/

SCUI.LocalizableListItemView = SC.ListItemView.extend({

  /**
    We'll just override render to intercept the value and localize it
    just prior to rendering it.  This method should be identical to
    SC.ListItemView.render() except for the addition of a few lines
    prior to the call to renderLabel().

    Fills the passed html-array with strings that can be joined to form the
    innerHTML of the receiver element.  Also populates an array of classNames
    to set on the outer element.
    
    @param {SC.RenderContext} context
    @param {Boolean} firstTime
    @returns {void}
  */
  render: function(context, firstTime) {
    var content = this.get('content'),
        del     = this.displayDelegate,
        level   = this.get('outlineLevel'),
        indent  = this.get('outlineIndent'),
        key, value, working ;
    
    // add alternating row classes
    context.addClass((this.get('contentIndex')%2 === 0) ? 'even' : 'odd');
    context.setClass('disabled', !this.get('isEnabled'));

    // outline level wrapper
    working = context.begin("div").addClass("sc-outline");
    if (level>=0 && indent>0) working.addStyle("left", indent*(level+1));

    // handle disclosure triangle
    value = this.get('disclosureState');
    if (value !== SC.LEAF_NODE) {
      this.renderDisclosure(working, value);
      context.addClass('has-disclosure');
    }
    
    // handle checkbox
    key = this.getDelegateProperty('contentCheckboxKey', content, del) ;
    if (key) {
      value = content ? (content.get ? content.get(key) : content[key]) : NO ;
      this.renderCheckbox(working, value);
      context.addClass('has-checkbox');
    }
    
    // handle icon
    if (this.getDelegateProperty('hasContentIcon', content, del)) {
      key = this.getDelegateProperty('contentIconKey', del) ;
      value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
      
      this.renderIcon(working, value);
      context.addClass('has-icon');
    }
    
    // handle label -- always invoke
    key = this.getDelegateProperty('contentValueKey', content, del) ;
    value = (key && content) ? (content.get ? content.get(key) : content[key]) : content ;
    if (value && SC.typeOf(value) !== SC.T_STRING) value = value.toString();

    // localize the value if specified on the owner list view
    if (del && del.get('localize') && value && value.loc) {
      value = value.loc();
    }

    if (this.get('escapeHTML')) value = SC.RenderContext.escapeHTML(value);
    this.renderLabel(working, value);

    // handle right icon
    if (this.getDelegateProperty('hasContentRightIcon', del)) {
      key = this.getDelegateProperty('contentRightIconKey', del) ;
      value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
      
      this.renderRightIcon(working, value);
      context.addClass('has-right-icon');
    }
    
    // handle unread count
    key = this.getDelegateProperty('contentUnreadCountKey', content, del) ;
    value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
    if (!SC.none(value) && (value !== 0)) {
      this.renderCount(working, value) ;
      var digits = ['zero', 'one', 'two', 'three', 'four', 'five'];
      var digit = (value.toString().length < digits.length) ? digits[value.toString().length] : digits[digits.length-1];
      context.addClass('has-count '+digit+'-digit');
    }
    
    // handle action 
    key = this.getDelegateProperty('listItemActionProperty', content, del) ;
    value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
    if (value) {
      this.renderAction(working, value);
      context.addClass('has-action');
    }
    
    // handle branch
    if (this.getDelegateProperty('hasContentBranch', content, del)) {
      key = this.getDelegateProperty('contentIsBranchKey', content, del);
      value = (key && content) ? (content.get ? content.get(key) : content[key]) : NO ;
      this.renderBranch(working, value);
      context.addClass('has-branch');
    }
    
    context = working.end();
  }
  
});
