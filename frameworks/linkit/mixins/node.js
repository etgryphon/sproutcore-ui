// ==========================================================================
// LinkIt.Node 
// ==========================================================================

/** @class

  This is a Mixin that lives on the Model Object that are going to
  trigger the links and the structures

  @author Evin Grano
  @version: 0.1
*/

sc_require('core');

LinkIt.Node = {
/* Node Mixin */

  /**
  @public:  Properties that need to be set for the internal LinkIt Calls
  */
  isNode: YES,
  
  terminals: null,
  
  /**
    @public: 
    
    This is the property that is called on the node to get back an array of objects
  */
  linksKey: 'links',
  positionKey: 'position',
  
  /**
    @private: Invalidation delegate that should be notified when the links array changes.
  */
  _invalidationDelegate: null,

  /**
    @private: The method on the delegate that should be called
  */
  _invalidationAction: null,
  
  initMixin: function() {
    var terminals, key;

    // by this time we are in an object instance, so clone the terminals array
    // so that we won't be sharing this array memory (a by-product of using mixins)
    terminals = this.get('terminals');
    if (SC.typeOf(terminals) === SC.T_ARRAY) {
      this.set('terminals', SC.clone(terminals));
    }

    // We want to observe the links array but we don't know what it'll be called until runtime.
    key = this.get('linksKey');
    if (key) {
      this.addObserver(key, this, '_linksDidChange');
    }
  },
  
  /**
    @public: 
    
    Overwrite this function on your model object to validate the linking
    
    Always return YES or NO
  */
  canLink: function(link){
    return YES;
  },

  /**
    @public
    Overwrite this function on your model to validate unlinking.
    Always return YES or NO.
  */
  canDeleteLink: function(link) {
    return YES;
  },
  
  registerInvalidationDelegate: function(delegate, action){
    this._invalidationDelegate = delegate;
    this._invalidationAction = action;
  },
  
  /**
    Called after a link is added to this node
    Override on your node object to perform custom activity.
  */
  didCreateLink: function(link) {},

  /**
    Called before a link is deleted from this node
    Override on your node to perform custom activity.
  */
  willDeleteLink: function(link) {},
  
  createLink: function(link){
    // TODO: [EG] More create link functionality that is entirely depended in the internal API
    
    // Call the model specific functionality if needed
    if (this.didCreateLink) this.didCreateLink(link);
  },
  
  deleteLink: function(link){
    // TODO: [EG] More delete link functionality that is entirely depended in the internal API
    
    // Call the model specific functionality if needed
    if (this.willDeleteLink) this.willDeleteLink(link);
  },
  
  /**
    Fired by an observer on the links array that gets setup in initMixin.
  */
  _linksDidChange: function() {
    //console.log('%@._linksDidChange()'.fmt(this));
    // Call invalidate function
    if (this._invalidationDelegate) {
      var method = this._invalidationDelegate[this._invalidationAction];
      if (method) method.apply(this._invalidationDelegate);
    }
  }
  
};
