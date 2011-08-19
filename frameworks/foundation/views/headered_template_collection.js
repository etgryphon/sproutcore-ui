sc_require('views/template_collection');

SCUI.HeaderedTemplateCollectionView = SC.TemplateCollectionView.extend({
  groupByPropertyPath: 'header',
  headerView: 'SC.TemplateView',

  /**
  The template used to render each header in the collection.

  This should be a function that takes a content object and returns
  a string of HTML that will be inserted into the DOM.

  In general, you should set the `headerViewTemplateName` property instead of
  setting the `headerViewTemplate` property yourself.

  @type Function
  */
  headerViewTemplate: null,

  /**
  The name of the template to lookup if no header view template is provided.

  The collection will look for a template with this name in the global
  `SC.TEMPLATES` hash. Usually this hash will be populated for you
  automatically when you include `.handlebars` files in your project.

  @type String
  */
  headerViewTemplateName: null,

  headerContext: null,

  headerViewClass: function() {
    var headerView = this.get('headerView');
    var headerViewTemplate = this.get('headerViewTemplate');
    var headerViewTemplateName = this.get('headerViewTemplateName');

    // hash of properties to override in our
    // header view class
    var extensions = {};

    if (SC.typeOf(headerView) === SC.T_STRING) {
      headerView = SC.objectForPropertyPath(headerView);
    }

    if (!headerViewTemplate && headerViewTemplateName) {
      headerViewTemplate = this.get('templates').get(headerViewTemplateName);
    }

    if (headerViewTemplate) {
      extensions.template = headerViewTemplate;
    }

    if (this.get('tagName') === 'ul' || this.get('tagName') === 'ol') {
      extensions.tagName = 'li';
    } else if (this.get('tagName') === 'table' || this.get('tagName') === 'thead' || this.get('tagName') === 'tbody') {
      extensions.tagName = 'tr';
    }

    return headerView.extend(extensions);
  }.property('headerView').cacheable(),

  arrayContentWillChange: function(start, removedCount, addedCount) {
    // Currently ignoring counts and removing everything each time

    if (!this.get('layer')) { return; }

    // If the contents were empty before and this template collection has an empty view
    // remove it now.
    var emptyView = this.get('emptyView');
    if (emptyView) { emptyView.$().remove(); emptyView.removeFromParent(); }

    // Loop through child views that correspond with the removed items.
    // Note that we loop from the end of the array to the beginning because
    // we are mutating it as we go.
    var childViews = this.get('childViews'), childView, idx, len;

    len = childViews.get('length');
    for (idx = len - 1; idx >= 0; idx--) {
      childView = childViews[idx];
      childView.$().remove();
      childView.removeFromParent();
      childView.destroy();
    }
  },
  
  /**
  Called when a mutation to the underlying content array occurs.

  This method will replay that mutation against the views that compose the
  SC.HeaderedTemplateCollectionView, ensuring that the view reflects the model.

  This enumerable observer is added in SC.TemplateView's contentDidChange.

  @param {Array} addedObjects the objects that were added to the content
  @param {Array} removedObjects the objects that were removed from the content
  @param {Number} start the index at which the changes occurred
  */
  arrayContentDidChange: function(start, removedCount, addedCount) {
    // Currently ignoring counts and adding everything each time
    
    if (!this.get('layer')) {
      return;
    }

    var content = this.get('content'),
    itemViewClass = this.get('itemViewClass'),
    headerViewClass = this.get('headerViewClass'),
    childViews = this.get('childViews'),
    addedViews = [],
    itemRenderFunc,
    headerRenderFunc,
    childView,
    itemOptions,
    elem,
    insertAtElement,
    item,
    itemElem,
    idx,
    len,
    previousHeaderValue,
    headerValue;

    if (content) {
      // If we have content to display, create a view for
      // each item.
      itemOptions = this.get('itemViewOptions') || {};

      elem = this.$();
      insertAtElement = null;
      len = content.get('length');

      // TODO: This logic is duplicated from the view helper. Refactor
      // it so we can share logic.
      var itemAttrs = {
        "id": itemOptions.id,
        "class": itemOptions['class'],
        "classBinding": itemOptions.classBinding
      };

      var headerAttrs = {
        "class": itemOptions['headerClass'],
        "classBinding": itemOptions.headerClassBinding
      };

      itemRenderFunc = function(context) {
        sc_super();
        SC.Handlebars.ViewHelper.applyAttributes(itemAttrs, this, context);
      };

      headerRenderFunc = function(context) {
        sc_super();
        SC.Handlebars.ViewHelper.applyAttributes(headerAttrs, this, context);
      };

      itemOptions = SC.clone(itemOptions);
      delete itemOptions.id;
      delete itemOptions['class'];
      delete itemOptions.classBinding;
      
      var insertChildView = function(childView) {
        itemElem = childView.createLayer().$();
        if (!insertAtElement) {
          elem.append(itemElem);
        } else {
          itemElem.insertAfter(insertAtElement);
        }
        insertAtElement = itemElem;
        addedViews.push(childView);
      };

      for (idx = 0; idx < len; idx++) {
        item = content.objectAt(idx);
        previousHeaderValue = headerValue;
        if (item.get) {
          headerValue = item.getPath(this.get('groupByPropertyPath'));
        } else {
          throw "items must have a property path '" + this.get('groupByPropertyPath') + "'";
        }
        if (previousHeaderValue !== headerValue) {
          // Add header row
          childView = this._createTemplatedChildView(headerViewClass, itemOptions, item, headerRenderFunc);
          insertChildView(childView);
        }
        childView = this._createTemplatedChildView(itemViewClass, itemOptions, item, itemRenderFunc);
        insertChildView(childView);
      }

      childViews.replace(0, 0, addedViews);
    }

    var inverseTemplate = this.get('inverseTemplate');
    if (childViews.get('length') === 0 && inverseTemplate) {
      childView = this.createChildView(SC.TemplateView.extend({
        template: inverseTemplate,
        content: this
      }));
      this.set('emptyView', childView);
      childView.createLayer().$().appendTo(elem);
      this.childViews = [childView];
    }

    // Because the layer has been modified, we need to invalidate the frame
    // property, if it exists, at the end of the run loop. This allows it to
    // be used inside of SC.ScrollView.
    this.invokeLast('invalidateFrame');
  },
  _createTemplatedChildView: function(viewClass, viewOptions, contentItem, renderFunc){
    var childView = this.createChildView(viewClass.extend(viewOptions, {
      content: contentItem,
      render: renderFunc,
      tagName: viewClass.prototype.tagName || this.get('itemTagName')
    }));
    var contextProperty = childView.get('contextProperty');
    if (contextProperty) {
      childView.set('context', childView.get(contextProperty));
    }
    return childView;
  }
  

});
