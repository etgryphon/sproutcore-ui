// ==========================================================================
// Project:   SCUI - Framework
// Copyright: ©2009 Evin Grano
//
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*globals throws */

var content, controller, extra;

var TestObject = SC.Object.extend({
  title: "test",  
  toString: function() { return "TestObject(%@)".fmt(this.get("title")); }
});


// ..........................................................
// EMPTY
// 

module("SCUI.SearchableArrayController - search term", {
  setup: function() {
    content = [
      TestObject.create({ title: "Blue Object 1" }),
      TestObject.create({ title: "Red Object 1" }),
      TestObject.create({ title: "Green Object 1" }),
      TestObject.create({ title: "Object Blue 2" }),
      TestObject.create({ title: "Object Red 2" }),
      TestObject.create({ title: "Object Green 2" }),
      TestObject.create({ title: "Object 3 Blue" }),
      TestObject.create({ title: "Object 3 Red" }),
      TestObject.create({ title: "Object 3 Green" })
    ];
    controller = SCUI.SearchableArrayController.create({ content: content, searchKey: 'title' });
    controller.searchPause = null;
  },
  
  teardown: function() {
    controller.destroy();
  }
});

test("search term - EMPTY", function() {
  controller.set('search', '');
  var c = controller.get('content');
  var contentLen = c.get('length');
  var sr = controller.get('searchResults');
  var searchLen = sr.get('length');
  equals(searchLen, contentLen, 'searchResults are the same length as content');
  equals(c[0], sr[0], 'searchResults[0] matches content[0]');
});

test("search term - NULL", function() {
  // [JS] search is "null" out of the box, so set doesn't call searchDidChange
  controller.notifyPropertyChange('search', null);
  var c = controller.get('content');
  var contentLen = c.get('length');
  var sr = controller.get('searchResults');
  var searchLen = sr.get('length');
  equals(searchLen, contentLen, 'searchResults are the same length as content');
  equals(c[0], sr[0], 'searchResults[0] matches content[0]');
});

test("search term - UNDEFINED", function() {
  controller.set('search', undefined);
  var c = controller.get('content');
  var contentLen = c.get('length');
  var sr = controller.get('searchResults');
  var searchLen = sr.get('length');
  equals(searchLen, contentLen, 'searchResults are the same length as content');
  equals(c[0], sr[0], 'searchResults[0] matches content[0]');
});

test("search term - Blue", function() {
  controller.set('search', 'Blue');
  var c = controller.get('content');
  var contentLen = c.get('length');
  var sr = controller.get('searchResults');
  var searchLen = sr.get('length');
  equals(searchLen, 3, 'there are 3 searchResults');
  equals(c[0], sr[0], 'searchResults[0] matches content[0]');
  equals(c[3], sr[1], 'searchResults[1] matches content[3]');
  equals(c[6], sr[2], 'searchResults[2] matches content[6]');
});

