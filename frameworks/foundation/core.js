// ==========================================================================
// SCUI Framework - Buildfile
// copyright (c) 2009 - Evin Grano, and contributors
// ==========================================================================

// ........................................
// BOOTSTRAP
// 
// The root namespace and some common utility methods are defined here. The
// rest of the methods go into the mixin defined below.

/**
  @namespace
  
  The SCUI namespace.  All SCUI methods and functions are defined
  inside of this namespace.  You generally should not add new properties to
  this namespace as it may be overwritten by future versions of SCUI.
  
  You can also use the shorthand "SCUI" instead of "Scui".
*/
window.Scui = window.Scui || SC.Object.create();
window.SCUI = window.SCUI || window.Scui ;

// Upload Constants
SCUI.READY = 'READY';
SCUI.BUSY = 'BUSY';
SCUI.DONE = 'DONE';
SCUI.ERROR = 'ERROR'; // has to be set manually depending on the response written to the iframe


// ..........................................................
// Disclosed View Constants
// 
SCUI.DISCLOSED_STAND_ALONE    = 'standAlone';
SCUI.DISCLOSED_LIST_DEPENDENT = 'listDependent';
SCUI.DISCLOSED_OPEN = 'open';
SCUI.DISCLOSED_CLOSED = 'closed';
// ..........................................................
// State Constants
// 
SCUI.DEFAULT_TREE = 'default';

