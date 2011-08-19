// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TemplateTests */

module("SCUI.HeaderedTemplateCollectionView ui");

TemplateTests = {};

test("creating a headered collection view works", function() {
  var CollectionChildView = SC.TemplateView.extend({
    template: SC.Handlebars.compile('<b>{{content.title}}</b>')
  });
  var CollectionHeaderView = SC.TemplateView.extend({
    template: SC.Handlebars.compile('<b><u>{{content.category}}</u></b>')
  });

  var ListItemChildView = CollectionChildView.extend({ tagName: "li" });
  var DefinitionTermChildView = CollectionChildView.extend({ tagName: "dt" });

  var CollectionView = SCUI.HeaderedTemplateCollectionView.extend({
    groupByProperty: 'category',
    content: [
              SC.Object.create({title: 'Hello', category: 'Greetings'}),
              SC.Object.create({title: 'Hola', category: 'Greetings'}),
              SC.Object.create({title: 'Goodbye', category: 'Signoffs'}),
              SC.Object.create({title: 'Adios', category: 'Signoffs'})
             ]
  });
  
  var defaultCollectionView = CollectionView.create();
  var ulCollectionView  = CollectionView.create({ tagName: "ul",
                                                  itemViewOptions: { headerClass: 'header' },
                                                  itemView: ListItemChildView,
                                                  headerView: CollectionHeaderView });
  var olCollectionView  = CollectionView.create({ tagName: "ol",
                                                  itemViewOptions: { headerClass: 'subhead' },
                                                  headerView: CollectionHeaderView,
                                                  itemView: ListItemChildView
                                                });
  var dlCollectionView  = CollectionView.create({ tagName: "dl", itemView: DefinitionTermChildView });
  var customTagCollectionView = CollectionView.create({ tagName: "p" });
  
  defaultCollectionView.createLayer();
  ulCollectionView.createLayer();
  olCollectionView.createLayer();
  dlCollectionView.createLayer();
  customTagCollectionView.createLayer();
  
  ok(defaultCollectionView.$().is("ul"), "Unordered list collection view was rendered (Default)");
  equals(defaultCollectionView.$('li').length, 6, "List item and headers view were rendered (Default)");

  ok(ulCollectionView.$().is("ul"), "Unordered list collection view was rendered");
  equals(ulCollectionView.$('li').not('.header').length, 4, "List item view was rendered");
  equals(ulCollectionView.$('li.header').length, 2, "List item header was rendered");

  console.log(olCollectionView.$().html());
  ok(olCollectionView.$().is("ol"), "Ordered collection collection view was rendered");
  equals(olCollectionView.$('li').not('.subhead').length, 4, "List item view was rendered");
  equals(olCollectionView.$('li.subhead').length, 2, "List item header was rendered");
});

test("should include an id attribute if id is set in the options hash", function() {
  TemplateTests.CollectionTestView = SCUI.HeaderedTemplateCollectionView.extend({
    content: [
              SC.Object.create({title: 'Hello', category: 'Greetings'}),
              SC.Object.create({title: 'Hola', category: 'Greetings'}),
              SC.Object.create({title: 'Goodbye', category: 'Signoffs'})
             ]
  });
  var view = SC.TemplateView.create({
    template: SC.Handlebars.compile('{{#collection "TemplateTests.CollectionTestView" id="baz" groupByProperty="category"}}foo{{/collection}}')
  });

  view.createLayer();
  equals(view.$('ul#baz').length, 1, "adds an id attribute");
});

test("should give its item views the class specified by itemClass", function() {
  TemplateTests.itemClassTestCollectionView = SCUI.HeaderedTemplateCollectionView.create({
    content: [
              SC.Object.create({title: 'Hello', header: 'Greetings'}),
              SC.Object.create({title: 'Hola', header: 'Greetings'}),
              SC.Object.create({title: 'Goodbye', header: 'Signoffs'})
             ]
  });
  var view = SC.TemplateView.create({
    template: SC.Handlebars.compile('{{#collection "TemplateTests.itemClassTestCollectionView" itemHeaderClass="baz"}}foo{{/collection}}')
  });

  view.createLayer();
  equals(view.$('ul li.baz').length, 2, "adds class attribute to headers");
});

test("should give its item views the classBinding specified by itemClassBinding", function() {
  TemplateTests.itemClassBindingTestCollectionView = SCUI.HeaderedTemplateCollectionView.create({
    content: [
              SC.Object.create({title: 'Hello', header: 'Greetings', isBaz: true}),
              SC.Object.create({title: 'Hola', header: 'Greetings', isBaz: true}),
              SC.Object.create({title: 'Goodbye', header: 'Signoffs', isBaz: false})
             ]
  });
  var view = SC.TemplateView.create({
    template: SC.Handlebars.compile('{{#collection "TemplateTests.itemClassBindingTestCollectionView" itemHeaderClassBinding="content.isBaz"}}foo{{/collection}}')
  });

  view.createLayer();
  equals(view.$('ul li.is-baz').length, 1, "adds class to header on initial rendering");

  SC.run(function() {
    TemplateTests.itemClassBindingTestCollectionView.setPath('content.2.isBaz', true);
  });

  equals(view.$('ul li.is-baz').length, 2, "adds class to header when property changes");

  SC.run(function() {
    TemplateTests.itemClassBindingTestCollectionView.setPath('content.2.isBaz', false);
  });

  equals(view.$('ul li.is-baz').length, 1, "removes class from header when property changes");
});

test("should re-render when the content object changes", function() {
  TemplateTests.RerenderTest = SCUI.HeaderedTemplateCollectionView.extend({
    content: [],
    headerView: SC.TemplateView.extend({
      template: SC.Handlebars.compile('<b><u>{{content.header}}</u></b>')
    })
  });

  var view = SC.TemplateView.create({
    template: SC.Handlebars.compile('{{#collection TemplateTests.RerenderTest}}{{content.title}}{{/collection}}')
  });

  view.createLayer();

  SC.run(function() {
    view.childViews[0].set('content', [
                                        SC.Object.create({title: 'Hello', header: 'Greetings'}),
                                        SC.Object.create({title: 'Hola', header: 'Greetings'}),
                                        SC.Object.create({title: 'Goodbye', header: 'Signoffs'})
                                       ]
    );
  });

  SC.run(function() {
    view.childViews[0].set('content', [
                                        SC.Object.create({title: 'Ramalamadingdong', header: 'Greetings'})
                                       ]);
  });

  equals(view.$('li').length, 2, "rerenders with correct number of items");
  equals(view.$('li:eq(0)').text(), "Greetings");
  equals(view.$('li:eq(1)').text(), "Ramalamadingdong");
});
