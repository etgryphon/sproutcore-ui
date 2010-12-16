/*globals SCUI*/

/*
  Defines an enumerable hash-table-like set data structure that stores key-value pairs, enumerates
  over values, and where addition, removal, and lookup are constant time operations.  It's a useful
  data structure when enumeration is required along with fast searching, or when a set must allow
  no duplication on a certain property.

  Insertion, removal, and lookup are done via keys.  A key may only be mapped to one value,
  so inserting a key-value pair a second time will be refused.  Calling set(key, value) will
  allow overwriting of the value associated with that key, however.  Supports get(key) for
  value retrieval.

  @class
  @extends SC.Object, SC.Enumerable
  @author Jonathan Lewis
*/
SCUI.Dictionary = SC.Object.extend(SC.Enumerable, {

  // PUBLIC PROPERTIES

  /**
    @read-only
  */
  length: 0,
  
  /*
    @read-only
  */
  keys: null,
  
  // PUBLIC METHODS

  init: function() {
    sc_super();
    this._index = {};
    this.set('keys', SC.Set.create());
  },

  nextObject: function(index, previousObject, context) {
    var value, node;

    if (this.get('length') > 0) {
      if (index === 0) {
        node = this._root;
      }
      else {
        node = context.previousNode ? context.previousNode.nextNode : null;
      }

      value = node ? node.value : undefined;
      context.previousNode = node;
    }

    return value;
  },
  
  /**
    Does nothing and returns false if the key already exists.
  */
  add: function(key, value) {
    var node, ret = NO;

    if (!this._index[key]) {
      // make a new node for the linked list
      node = {
        key: key,
        value: value
      };

      // add to the index
      this._index[key] = node;
      this.get('keys').add(key);
      
      if (!this._tail) { // if this is the first node
        this._root = node; // this node becomes the root and the tail
      }
      else { // otherwise append to the tail
        node.previousNode = this._tail;
        this._tail.nextNode = node;
      }
      this._tail = node; // becomes tail
      
      this.set('length', (this.get('length') || 0) + 1); // increment length
      this.enumerableContentDidChange(); // notify observers
      ret = YES;
    }
    
    return ret;
  },
  
  remove: function(key) {
    var node = this._index[key];
    var prev, next;
    var ret = NO;
    
    if (node) {
      prev = node.previousNode;
      next = node.nextNode;

      if (prev) { // skip over the deleted node
        prev.nextNode = next;
      }
      
      if (next) { // skip over the deleted node going the other direction too
        next.previousNode = prev;
      }
      
      if (node === this._root) { // if node was the root, set a new root
        this._root = next;
      }

      if (node === this._tail) { // if node was the tail, set a new tail
        this._tail = prev;
      }

      delete this._index[key]; // remove from the index
      this.get('keys').remove(key);
      
      this.set('length', this.get('length') - 1); // decrement length
      this.enumerableContentDidChange(); // notify observers
      ret = YES;
    }

    return ret;
  },
  
  clear: function() {
    this._index = {};
    this.get('keys').clear();
    this._root = null;
    this._tail = null;
    this.set('length', 0);
    this.enumerableContentDidChange(); // notify observers
  },

  contains: function(key) {
    return this._index[key] ? YES : NO;
  },

  unknownProperty: function(key, value) {
    if (value !== undefined) {
      if (this.contains(key)) {
        this._index[key].value = value; // reassign value mapped to this key
        this.enumerableContentDidChange(); // notify observers
      }
      else {
        this.add(key, value);
      }
    }
    else {
      value = this._index[key] ? this._index[key].value : undefined;
    }
    
    return value;
  },

  isEqual: function(dictionary) {
    var nodeA = this._root;
    var nodeB = dictionary._root;
    var ret = NO, count = 0, length = this.get('length');
    
    if (length === dictionary.get('length')) {

      // compare each pair of nodes for same key and value
      while(nodeA && nodeB && (nodeA.value === nodeB.value) && (nodeA.key === nodeB.key)) {
        nodeA = nodeA.nextNode;
        nodeB = nodeB.nextNode;
        count = count + 1;
      }
      
      // If we traversed the whole chain without stopping, the chains were the same.
      // Note this also holds for length === 0.
      ret = (count === length) ? YES : NO;
    }
    
    return ret;
  },

  diff: function(dictionary, toAdd, toRemove) {
    var node;

    toAdd = (SC.typeOf(toAdd) === SC.T_ARRAY) ? toAdd : [];
    toRemove = (SC.typeOf(toRemove) === SC.T_ARRAY) ? toRemove : [];

    if (dictionary) {
      node = dictionary._root;

      while (node) {
        if (!this.contains(node.key)) {
          toAdd.push(node.value);
        }

        node = node.nextNode;
      }
    }

    node = this._root;
    while (node) {
      if (!dictionary.contains(node.key)) {
        toRemove.push(node.value);
      }
      
      node = node.nextNode;
    }
  },

  // PRIVATE PROPERTIES
  
  _index: null,
  _root: null,
  _tail: null
  
});

SCUI.Dictionary.mixin({

  createFromEnumerable: function(enumerable, keyGenerator) {
    var ret = SCUI.Dictionary.create();

    if (enumerable && enumerable.isEnumerable && (SC.typeOf(keyGenerator) === SC.T_FUNCTION)) {
      enumerable.forEach(function(item) {
        ret.add(keyGenerator(item), item);
      });
    }

    return ret;
  }
  
});
