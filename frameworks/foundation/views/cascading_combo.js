//============================================================================
// SCUI.MasterDetailComboView
//============================================================================

/**

  This view will display two combo boxes with labels.
  One combo box feeds off of the other, hence the master/detail...
  
  To use this view you will need to supply a settings hash combo boxes.
  The hash should follow the following example:
  
  {{{
  
    propertiesHash: {
      contentPath: 'path.to.some.arraycontroller.contnet', // *** REQUIRED ***
      filterPath: 'path.to.some.external.source', // OPTIONAL
      useExternalFilter: YES | NO // OPTIONAL  (set to use if you supplied the filter path.)
      masterValueKey: 'name', // *** REQUIRED ***
      detailValueKey: 'name', // *** REQUIRED ***
      rootItemKey: 'someKey', // *** REQUIERD *** (the property on the model that should be set by the selection of the first combo box)
      childItemKey: 'someKey', // *** REQUIERD *** (the property on the model that should be set by the selection of the second combo box)
      relationKey: 'parentModelKey.childModelKey' // *** REQUIRED *** How to get the relation between the two models.
    }
    
  
  }}}
  
  @extends SC.View
  @author Josh Holt [JH2], Jonathan Lewis [JL]
  @version Beta1.1
  @since FR4

*/

SCUI.CascadingComboView = SC.View.extend({
  
  // PUBLIC PROPERTIES

  /*
    This is a reference to the model object that you are using this
    master detail view to set properties.
  */
  content: null,
  
  propertiesHash: null,
  
  masterLabel: null,
  
  detailLabel: null,

  // PUBLIC METHODS  
  createChildViews: function() {
    var childViews = [], view;
    var required = ['contentPath', 'masterValueKey', 'detailValueKey', 
                    'rootItemKey', 'childItemKey', 'relationKey'];
    var meetsRequirements = null;
    var props = this.get('propertiesHash');
    var content = this.get('content');
    
    
    // make sure the required props are there or complain.
    if (props) {
      required.forEach(function(key){
      if (!SC.none(props[key]) && props[key] !== '') {
        meetsRequirements = YES;
      }else{
        meetsRequirements = null;
      }});
    }
    
    if (meetsRequirements) {    
      view = this.createChildView(
        SC.LabelView.design({
          layout: { left: 20, top: 10, right: 20, height: 22 },
          isEditable: NO,
          value: this.get('masterLabel').loc()
        })
      );
      childViews.push(view);

      var str = '*content.%@'.fmt(props.rootItemKey);

      this.masterCombo = view = this.createChildView(
        SCUI.ComboBoxView.design({
          layout: { left: 20 , right: 20, top: 32, height: 22 },
          objectsBinding: props.contentPath,
          nameKey: props.masterValueKey,
          valueBinding: SC.Binding.from('*content.%@'.fmt(props.rootItemKey), this)
        })
      );
      childViews.push(view);

      view = this.createChildView(
        SC.LabelView.design({
          layout: { left: 50, top: 64, right: 20, height: 22 },
          isEditable: NO,
          value: this.get('detailLabel').loc(),
          isEnabled: NO,
          isEnabledBinding: SC.Binding.from('*masterCombo.selectedObject', this).oneWay()
        })
      );
      childViews.push(view);

      view = this.createChildView(
        SCUI.ComboBoxView.design({
          layout: { left: 50, right: 20, top: 86, height: 22 },
          objectsBinding: SC.Binding.from('*content.%@'.fmt(props.relationKey), this).oneWay(),
          nameKey: props.detailValueKey,
          isEnabled: NO,
          isEnabledBinding: SC.Binding.from('*masterCombo.selectedObject', this).oneWay(),
          valueBinding: SC.Binding.from('*content.%@'.fmt(props.childItemKey), this)
        })
      );
      childViews.push(view);
      this.set('childViews', childViews);
    } else {
      view = this.createChildView(SC.View.design({
        layout: { top: 0, left: 0, bottom: 0, right: 0},
        childViews: [
          SC.LabelView.design({
            layout: { centerX: 0 , centerY: 0, width: 300, height: 18 },
            value: meetsRequirements ? "No Content." : 'Setup did not meet requirements.'
          })
        ]
      }));
      childViews.push(view);
      this.set('childViews',childViews);
    }
  }
  
});

