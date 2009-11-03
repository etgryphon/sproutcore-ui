// ==========================================================================
// SCUI JavaScript Framework - Buildfile
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
  
  You can also use the shorthand "SCUI" instead of "CoreUI".
*/
var CoreUI = CoreUI || {};
var CUI = CUI || CoreUI;
var SCUI = SCUI || CoreUI ;

// ..........................................................
// Disclosed View Constants
// 
SCUI.DISCOLSED_STAND_ALONE    = 'standAlone';
SCUI.DISCLOSED_LIST_DEPENDENT = 'listDependent';
SCUI.DISCLOSED_OPEN = 'open';
SCUI.DISCLOSED_CLOSED = 'closed';
