/*globals SCUI */

/** @class

  Adds multi select capability to SC.SelectFieldView

  @extends SC.SelectFieldView
*/


SCUI.SelectFieldView = SC.SelectFieldView.extend({
  
  multiple: NO,
  
  render: function(context, firstTime) {
    if (this.get('cpDidChange')) 
    {
      this.set('cpDidChange', NO);
      
      var nameKey = this.get('nameKey') ;
      var valueKey = this.get('valueKey') ;
      var objects = this.get('objects') ;
      var fieldValue = this.get('value') ;
      var el, selectElement;
      var multiple = this.get('multiple');
      var shouldLocalize = this.get('localize');

      if (multiple) 
      {
        context.attr('multiple', NO);
      }
      
      if (!valueKey && fieldValue) 
      {
        fieldValue = (fieldValue.get && fieldValue.get('primaryKey') && fieldValue.get(fieldValue.get('primaryKey'))) ? fieldValue.get(fieldValue.get('primaryKey')) : SC.guidFor(fieldValue) ;
      }
      if ((fieldValue === null) || (fieldValue === '')) fieldValue = '***' ;

      if (objects) 
      {
        objects = this.sortObjects(objects);
      
        if(!firstTime) 
        {
          selectElement=this.$input()[0];
          selectElement.innerHTML='';
        }
        var emptyName = this.get('emptyName') ;
        if (emptyName) 
        {
          if (shouldLocalize) emptyName = emptyName.loc() ;
          if (firstTime)
          {
            context.push('<option value="***">'+emptyName+'</option><option disabled="disabled"></option>') ;
          } 
          else
          {
            el = document.createElement('option');
            el.value = "***";
            el.innerHTML = emptyName;
            selectElement.appendChild(el);
            el=document.createElement('option');
            el.disabled = "disabled";
            selectElement.appendChild(el);
          }
        }
        objects.forEach(function(object) {
        if (object) 
        {
          var name = nameKey ? (object.get ? object.get(nameKey) : object[nameKey]) : object.toString();
          if (shouldLocalize) 
          {
            name = name.loc();
          }
          var value = (valueKey) ? (object.get ? object.get(valueKey) : object[valueKey]) : object ;
          if (value) 
          {
            value = SC.guidFor(value) ? SC.guidFor(value) : value.toString() ;
          } 

          var disable = (this.validateMenuItem && this.validateMenuItem(value, name)) ? '' : 'disabled="disabled" ' ;
          if (firstTime)
          {
            context.push('<option '+disable+'value="'+value+'">'+name+'</option>') ;
          } else
          {
            el = document.createElement('option');
            el.value = value;
            el.innerHTML = name;
            if (disable.length > 0) el.disable="disabled";
            selectElement.appendChild(el);
          }
        } else 
        {
          if (firstTime) 
          {
            context.push('<option disabled="disabled"></option>') ;
          } 
          else
          {
            el = document.createElement('option');
            el.disabled = "disabled";
            selectElement.appendChild(el);
          }
        }
      }, this);
      
      this.setFieldValue(fieldValue);
      
      } 
      else 
      {
        this.set('value',null);
        
      }
    }
  },
  
  getFieldValue: function() {
    var value = this.$input().val();
    var valueKey = this.get('valueKey');
    var objects = this.get('objects');
    var found, object;
    var multiple = this.get('multiple');

    if (multiple) 
    {
      found = [];
    }

    if (value === '***') 
    {
      value = null;
      
    } 
    else 
    if (value && objects) 
    {
      var loc = (SC.typeOf(objects.length) === SC.T_FUNCTION) ? objects.length() : objects.length;

      if (!multiple) 
      { 
        found = null;
      }

      while (--loc >= 0) 
      {
        object = objects.objectAt? objects.objectAt(loc) : objects[loc] ;

        if (valueKey) object = (object.get) ? object.get(valueKey) : object[valueKey];
        var ov;
        if (object && object.get && object.get('primaryKey') && object.get(object.get('primaryKey'))) 
        {
          ov = SC.guidFor(object.get(object.get('primaryKey')));
        } 
        else 
        if (object && SC.guidFor(object)) 
        {
            ov = SC.guidFor(object);
        } 
        else 
        if(object)
        {
            ov = object.toString();
        } 
        else 
        {
          ov = null;
        }
        
        if (multiple) 
        {
          for (var i = 0, j = value.length; i < j; i++) 
          {
            if (value[i] === ov) 
            {
              found.push(object);
            }
          }
        } else 
        {
          if (value === ov) 
          {
            found = object;
          }
        } 
      }
    }
    
    return (valueKey || found) ? found : value;
  },

  setFieldValue: function(newValue) {
    if (this.get('multiple')) 
    {
      if (SC.none(newValue)) { newValue = '' ; }
      else 
      {
        if (SC.typeOf(newValue) === 'string') 
        {
          newValue = newValue.split("::");
        }
          
        var currValue;
        var selected = [];
          
        for (var i = 0, j = newValue.length; i < j; i++) {
          currValue = newValue[i];

          if(currValue && currValue.get && currValue.get('primaryKey') && currValue.get(currValue.get('primaryKey')))
          {
            currValue = SC.guidFor(currValue.get(currValue.get('primaryKey')));
            selected.push(currValue);
          }
          else 
          if (currValue && SC.guidFor(currValue) && currValue !== '***') 
          {
            currValue = SC.guidFor(currValue);
            selected.push(currValue);
          } 
          else 
          if (currValue) 
          {
            currValue = currValue.toString();
            selected.push(currValue);
          } 
          else 
          {
            currValue = null;
          }
        }
        this.$input().val(selected);
        return this ;
      }
    } else 
    {
      if (SC.none(newValue)) { newValue = '' ; }
      else 
      {
        if (newValue && newValue.get && newValue.get('primaryKey') && newValue.get(newValue.get('primaryKey'))) 
        {
          newValue = SC.guidFor(newValue.get(newValue.get('primaryKey')));
        } 
        else 
        if (newValue && SC.guidFor(newValue) && newValue !== '***') 
        {
          newValue = SC.guidFor(newValue);
        } 
        else 
        if (newValue)
        {
          newValue = newValue.toString();
        } 
        else 
        {
          newValue = null;
        }
      }
      this.$input().val(newValue);
      return this ;
    }
  }
});