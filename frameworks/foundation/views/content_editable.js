// ==========================================================================
// Orion.ContentEditableView
// ==========================================================================

require('core');
require('panes/context_menu_pane');

/** @class

  This view provides rich text editor functionality (RTE). It's a variation of the 
  SC webView. It works be setting the body of the iframe to be ContentEditable as well
  as attaching a mouseup, keyup and paste events on the body of the iframe to detect
  the current state of text at the current mouse position

  @extends SC.View
  @author Mohammed Taher
  @version 0.1
  
*/
SCUI.ContentEditableView = SC.WebView.extend(
/** @scope SCUI.ContentEditableView.prototype */ {
  
  /**
    Value of the HTML inside the body of the iframe.
  */
  value: '',
  
  /**
    Set to NO to prevent scrolling in the iframe.
  */  
  allowScrolling: YES,
  
  /**
    Set to YES when the view needs to be transparent.
  */
  allowTransparency: NO,

  /**
    Current selected content in the iframe.
  */
  selection: '',
  
  /**
    Read-only values
  
    isImageSelected is set to YES when an image is 
    selected in the iframe (and NO when an image is no selected).
    
    _imageNode will point to that image.
  */  
  isImageSelected: NO,
  _imageNode: null,
  
  /**
    Read-only values
  
    isHyperlinkSelected is set to YES when a hyperlink is 
    selected in the iframe (and NO when a hyperlink is not selected).
    
    _hyperlinkNode will point to that image.
  */  
  isHyperlinkSelected: NO,
  _hyperlinkNode: null,
  
  /**
    A view can be passed that grows/shrinks in dimensions as the ContentEditableView
    changes dimensions. If an attachedView is passed, isAttachedView has to be set to 
    true.        
  */  
  isAttachedView: NO,
  attachedView: null,
  
  /**
    offsetWidth/offsetHeight of the body of the iframe. These values are read-only.
  */
  offsetWidth: null,  
  offsetHeight: null,
  
  /**
    Set to NO to allow dimensions of the view to change according to the HTML.
  */
  fixedDimensions: YES,  
  
  /**
    Set to YES to pass CSS styles from the inlineStyle object to the body of the iframe
  */  
  useInlineStyle: NO,
  inlineStyle: {},
  
  /**
    Necessary in explorer to be able to access the iframes through the document.frames
    collection
  */
  frameName: '',
  
  /**
    This is set to true everytime the user changes the state of the html and set
    to false only when the user saves the content
  */
  isDirty: NO,
  
  /**
    If set to YES, then HTML from iframe will be saved everytime isDirty is set
    to YES
  */  
  commitInstantly: NO,
  
  /**
    Set to NO to prevent automatic cleaning of text inserted into editor
  */
  filterWordOnSave: YES,
  
  /**
    A pointer to the document/contentDocument of the iframe
  */
  _editor: null,
  
  displayProperties: ['value'],
  
  /**
    List of menu options to display on right click
  */
	rightClickMenuOptions: [],

  render: function(context, firstTime) {
    var value = this.get('value');
    var allowTransparency = this.get('allowTransparency');
    var allowScrolling = this.get('allowScrolling') ? 'yes' : 'no';
    var frameBorder = allowTransparency ? '0' : '1';
    var styleString = 'position: absolute; width: 100%; height: 100%; border: 0px; margin: 0px; padding: 0p;';
    var commitInstantly = this.get('commitInstantly');
    
    if (firstTime) {
      context.push('<iframe frameBorder="'+ frameBorder + '" name="' + this.get('frameName') + '" scrolling="' + allowScrolling + '" src="" allowTransparency="' + allowTransparency + '" style="' + styleString + '"></iframe>');
      
    } else if(commitInstantly === NO && this._editor){
      this._editor.body.innerHTML = value;
    }
  },
  

  didCreateLayer: function() {
    sc_super();
    var f = this.$('iframe');
    SC.Event.add(f, 'load', this, this.editorSetup);
  },
  
  
  editorSetup: function() {     
    // store the document property in a local variable for easy access
    if (SC.browser.msie) {
      var frameName = this.get('frameName');
      if (SC.none(frameName)) throw "frameName property not provided";
      this._iframe = document.frames(frameName);
      this._editor = this._iframe.document;
    } else {
      this._iframe = this.$('iframe').firstObject();
      this._editor = this._iframe.contentDocument;
    }
    
    // set contentEditable to true... this is the heart and soul of the editor
    var value = this.get('value');
    var iframeBody = this._editor.body;
    iframeBody.contentEditable = true;
    
    if (this.get('allowTransparency') === YES) {
      iframeBody.style.background = 'transparent';       
      // the sc-web-view adds a gray background to the WebView... removing in the
      // case allowTransparency is YES
      this.$().setClass('sc-web-view', NO);
    }

    if (this.get('useInlineStyle')) {
      var inlineStyle = this.get('inlineStyle');
      this.setFrameInlineStyle(inlineStyle);
    }
    
    // we have to do this differently in FF and IE... execCommand('inserthtml', false, val) fails
    // in IE and iframeBody.innerHTML is resulting in a FF bug
    if (SC.browser.msie || SC.browser.safari) {
      iframeBody.innerHTML = value;
    } else {
      this.selectionInsertHTML(value);
    }

    // set min height beyond which ContentEditableView can't shrink if fixedDimensions is set to false
    if (!this.get('fixedDimensions')) {
      var height = this.get('layout').height;
      if (height) {
        this._minHeight = height;
      }
      
      var width = this.get('layout').width;
      if (width) {
        this._minWidth = width;
      }
    }

    // attach the required events
    SC.Event.add(iframeBody, 'mouseup', this, this.mouseUpCaught);
    SC.Event.add(iframeBody, 'keyup', this, this.keyUpCaught);
    SC.Event.add(iframeBody, 'paste', this, this.pasteCaught);    
    
    // there are certian cases where the body of the iframe won't have focus
    // but the user will be able to type... this happens when the user clicks on
    // the white space where there's no content. This event handler 
    // ensures that the body will receive focus when the user clicks on that area.
    SC.Event.add(this._editor, 'click', this, this.focus);

		SC.Event.add(this._editor, 'mousedown', this, this.mouseDownHandler);
    
    // call the SC.WebView iframeDidLoad function to finish setting up
    this.iframeDidLoad();
    this.focus();
  },

	mouseDownHandler: function(evt) {
	  
		
		var menuOptions = this.get('rightClickMenuOptions');
		var numOptions = menuOptions.get('length');
		
		if (menuOptions.length > 0) {
			var pane = this.contextMenuView.create({
	      contentView: SC.View.design({}),
	      layout: { width: 200, height: (20 * numOptions) },
	      itemTitleKey: 'title',
	      itemTargetKey: 'target',
	      itemActionKey: 'action',
	      itemSeparatorKey: 'isSeparator',
	      itemIsEnabledKey: 'isEnabled',
	      items: menuOptions
	    });

	    pane.popup(this, evt);
		}
	},
	
	contextMenuView: SCUI.ContextMenuPane.extend({
		popup: function(anchorView, evt) {
	    if (!anchorView || !anchorView.isView) return NO;

	    if (evt && evt.button && (evt.which === 3 || (evt.ctrlKey && evt.which === 1))) {

	      // FIXME [JH2] This is sooo nasty. We should register this event with SC's rootResponder?
	      // After talking with charles we need to handle oncontextmenu events when we want to block
	      // the browsers context meuns. (SC does not handle oncontextmenu event.)
	      document.oncontextmenu = function() { return false; };
        
        // The way the MenuPane was being positioned didn't work when working in the context
        // of an iframe. Instead of calculating,
        //
        //          offsetX = evt.pageX - globalFrame.x;
        //          offsetY = evt.pageY - globalFrame.y;
        //
        // I'm using evt.pageX and evt.pageY only.
        //
        
	      var anchor = anchorView.isView ? anchorView.get('layer') : anchorView;

	      // Popup the menu pane
	      this.beginPropertyChanges();
	      var it = this.get('displayItems');
	      this.set('anchorElement', anchor) ;
	      this.set('anchor', anchorView);
	      this.set('preferType', SC.PICKER_MENU) ;
	      this.set('preferMatrix', [evt.pageX + 5, evt.pageY + 5, 1]) ;
	      this.endPropertyChanges();
	      this.append();
	      this.positionPane();
	      this.becomeKeyPane();

	      return YES;
	    }
	    else {
	      document.oncontextmenu = ""; // restore default browser context menu handling
	    }
	    return NO;
	  }
	}),
  
  displayDidChange: function(){
    if(this._editor){
      var iframeBody = this._editor.body;
      iframeBody.contentEditable = this.get('isEnabled');
    }
    sc_super();
  },

  // FIXME [MT] - this is never called??
  willDestroyLayer: function() {         
    var iframeBody = this._editor.body;
    SC.Event.remove(iframeBody, 'mouseup', this, this.mouseUpCaught);
    SC.Event.remove(iframeBody, 'keyup', this, this.keyUpCaught);
    SC.Event.remove(iframeBody, 'paste', this, this.pasteCaught);    
    
    SC.Event.remove(this._editor, 'click', this, this.focus);
     
    SC.Event.remove(this.$('iframe'), 'load', this, this.makeContentEditable); 
    
    sc_super();
  },
  
  focus: function(){
    this._editor.body.focus();
  },

  /**
    The 3 events handlers monitor for any change in user selection and update the
    selection property accordingly
  */
  keyUpCaught: function(event) {
    SC.RunLoop.begin();
    var keyCode = event.keyCode;
    if (keyCode === 37 || keyCode === 38 || keyCode === 39 || keyCode === 40) {
      this.querySelection();
    }
    
    if (!this.get('fixedDimensions')) {
      this.invokeLast(this._updateLayout);
    }
    
    this.set('isDirty', YES);
    SC.RunLoop.end();
  },


  mouseUpCaught: function() {
    SC.RunLoop.begin();
    this.querySelection();
    if (!this.get('fixedDimensions')) {
      this.invokeLast(this._updateLayout);
    }
    
    this.set('isDirty', YES);
    SC.RunLoop.end();
  },


  pasteCaught: function() {
    SC.RunLoop.begin();

    this.querySelection();
    if (!this.get('fixedDimensions')) {
      this.invokeLast(this._updateLayout);
    }
    this.set('isDirty', YES);
    
    SC.RunLoop.end();
    return YES;
  },
  
  
  querySelection: function() {
    var selection = '';
    
    if (SC.browser.msie) {
      selection = this._iframe.document.selection.createRange().text;
      if (SC.none(selection)) selection = '';
      
    } else {
      var targetIframe = this._iframe;
      var targetIframeWindow = targetIframe.contentWindow;
      selection = targetIframeWindow.getSelection();
    }
    
    this.propertyWillChange('selection');
    this.set('selection', selection.toString());
    this.propertyDidChange('selection');
  },
  
  
  selectionIsBold: function(key, val) {
    if (!this._editor) return false;
    var ret = false;

    if (val !== undefined) {        
      this.propertyWillChange('selectionIsBold');
      var x = this._editor.execCommand('bold', false, val);      
      this.propertyDidChange('selectionIsBold');        
      
      if (x) this.set('isDirty', YES);
      
      ret = this._editor.queryCommandState('bold');
      
    } else {
      ret = this._editor.queryCommandState('bold');
    }
    return ret;

  }.property('selection').cacheable(),
  
  
  selectionIsItalicized: function(key, val) {
    if (!this._editor) return false;
    var ret = false;

    if (val !== undefined) {
      this.propertyWillChange('selectionIsItalicized');
      var x = this._editor.execCommand('italic', false, val);
      this.propertyDidChange('selectionIsItalicized'); 
      
      if (x) this.set('isDirty', YES);
      
      ret = this._editor.queryCommandState('italic');
      
    } else {
      ret = this._editor.queryCommandState('italic');
    }
    
    return ret;

  }.property('selection').cacheable(),  
  
  
  selectionIsUnderlined: function(key, val) {    
    if (!this._editor) return false;
    var ret = false;

    if (val !== undefined) {        
      this.propertyWillChange('selectionIsUnderlined');
      var x = this._editor.execCommand('underline', false, val);
      this.propertyDidChange('selectionIsUnderlined');   
      
      if (x) this.set('isDirty', YES);
      
      ret = this._editor.queryCommandState('underline');         
      
    } else {
      ret = this._editor.queryCommandState('underline');         
    }
    
    return ret;

  }.property('selection').cacheable(),  
  
  
  selectionIsJustifiedCenter: function(key, val) {
    if (!this._editor) return false;
    var ret = false;

    if (val !== undefined) {
      this.propertyWillChange('selectionIsJustifiedCenter');
      var x = this._editor.execCommand('justifycenter', false, val);
      this.propertyDidChange('selectionIsJustifiedCenter');   
      
      if (x) this.set('isDirty', YES);
      
      ret = this._editor.queryCommandState('justifycenter');        
      
    } else {
      ret = this._editor.queryCommandState('justifycenter');        
    }
    return ret;

  }.property('selection').cacheable(),  
  
  
  selectionIsJustifiedRight: function(key, val) {
    if (!this._editor) return false;
    var ret = false;

    if (val !== undefined) {
      this.propertyWillChange('selectionIsJustifiedRight');
      var x = this._editor.execCommand('justifyright', false, val);
      this.propertyDidChange('selectionIsJustifiedRight');    
      
      if (x) this.set('isDirty', YES);
      
      ret = this._editor.queryCommandState('justifyright');
      
    } else {      
      ret = this._editor.queryCommandState('justifyright');        
    }
    
    return ret;

  }.property('selection').cacheable(),  
  
  
  selectionIsJustifiedLeft: function(key, val) {
    if (!this._editor) return false;
    var ret = false;
    
   if (val !== undefined) {        
      this.propertyWillChange('selectionIsJustifiedLeft');
      var x = this._editor.execCommand('justifyleft', false, val);
      this.propertyDidChange('selectionIsJustifiedLeft');     
      
      if (x) this.set('isDirty', YES);
      
      ret = this._editor.queryCommandState('justifyleft');
      
    } else {
      ret = this._editor.queryCommandState('justifyleft');
    }

    return ret;

  }.property('selection').cacheable(),  
  
  
  selectionIsJustifiedFull: function(key, val) {
    if (!this._editor) return false;
    var ret = false;

    if (val !== undefined) { 
      this.propertyWillChange('selectionIsJustifiedFull');
      var x = this._editor.execCommand('justifyfull', false, val);
      this.propertyDidChange('selectionIsJustifiedFull');     
      
      if (x) this.set('isDirty', YES);
      
      ret = this._editor.queryCommandState('justifyfull');              

    } else {      
      ret = this._editor.queryCommandState('justifyfull');              
    }
    
    return ret;

  }.property('selection').cacheable(),  
  
  
  selectionIsOrderedList: function(key, val) {
    if (!this._editor) return false;
    var ret;

    if (val !== undefined) {
      this.propertyWillChange('selectionIsOrderedList');
      var x = this._editor.execCommand('insertorderedlist', false, val);
      this.propertyDidChange('selectionIsOrderedList');      
      
      if (x) this.set('isDirty', YES);
      
      ret = this._editor.queryCommandState('insertorderedlist');        
      
    } else {
      ret = this._editor.queryCommandState('insertorderedlist');        
    }
    
    return ret;

  }.property('selection').cacheable(),  
  
  
  selectionIsUnorderedList: function(key, val) {
    if (!this._editor) return false;
    var ret;

    if (val !== undefined) {
      this.propertyWillChange('selectionIsUnorderedList');
      var x = this._editor.execCommand('insertunorderedlist', false, val);
      this.propertyDidChange('selectionIsUnorderedList');    
      
      if (x) this.set('isDirty', YES);
      
      ret = this._editor.queryCommandState('insertunorderedlist');        
      
    } else {
      ret = this._editor.queryCommandState('insertunorderedlist');
    }

    return ret;

  }.property('selection').cacheable(),  
  
  
  selectionIsIndented: function(key, val) {
    if (!this._editor) return false;
    var ret = false;    

    if (val !== undefined) {        
      this.propertyWillChange('selectionIsIndented');
      var x = this._editor.execCommand('indent', false, val);
      this.propertyDidChange('selectionIsIndented');
    
      if (x) this.set('isDirty', YES);

      // queryCommandState('indent') buggy in none IE browsers
      if (SC.browser.msie) {
        ret = this._editor.queryCommandState('indent');
      }
    
    } else {
      // queryCommandState('indent') buggy in none IE browsers
      if (SC.browser.msie) {
        ret = this._editor.queryCommandState('indent');
      }
    }
    
    return ret;
    
  }.property('selection').cacheable(),  


  selectionIsOutdented: function(key, val) {
    if (!this._editor) return false;
    var ret = false;
    
    if (val !== undefined) {
      this.propertyWillChange('selectionIsOutdented');
      var x = this._editor.execCommand('outdent', false, val);
      this.propertyDidChange('selectionIsOutdented');
      
      if (x) this.set('isDirty', YES);

      // queryCommandState('outdent') buggy in none IE browsers
      if (SC.browser.msie) {
        ret = this._editor.queryCommandState('outdent');
      }
      
    } else {
      // queryCommandState('outdent') buggy in none IE browsers
      if (SC.browser.msie) {
        ret = this._editor.queryCommandState('outdent');
      }
    }
    
    return ret;

  }.property('selection').cacheable(),  
  
  
  selectionIsSubscript: function(key, val) {
    if (!this._editor) return false;    
    var ret = false;
    
    if (val !== undefined) {
      this.propertyWillChange('selectionIsSubscript');
      var x = this._editor.execCommand('subscript', false, val);
      this.propertyDidChange('selectionIsSubscript');   
      
      if (x) this.set('isDirty', YES);
       
      ret = this._editor.queryCommandState('subscript');
      
    } else {    
      ret = this._editor.queryCommandState('subscript');        
    }
    
    return ret;
    
  }.property('selection').cacheable(),  


  selectionIsSuperscript: function(key, val) {
    if (!this._editor) return false;
    var ret = false;
    
    if (val !== undefined) {
      this.propertyWillChange('selectionIsSuperscript');
      var x = this._editor.execCommand('superscript', false, val);
      this.propertyDidChange('selectionIsSuperscript');   
      
      if (x) this.set('isDirty', YES);
      
      ret = this._editor.queryCommandState('superscript');
      
    } else {      
      ret = this._editor.queryCommandState('superscript');         
    }
    
    return ret;
    
  }.property('selection').cacheable(),  
  
  
  selectionFontName: function(key, val) {
    if (!this._editor) return '';
    var ret = '';
    
    if (val !== undefined) {
      this.propertyWillChange('selectionFontName');
      var x = this._editor.execCommand('fontname', false, val);
      this.propertyDidChange('selectionFontName');
      
      if (x) this.set('isDirty', YES);
      
      ret = this._editor.queryCommandValue('fontname');
      
    } else {   
      ret = this._editor.queryCommandValue('fontname');
    }
    
    return ret;
    
  }.property('selection').cacheable(),  
  
  
  selectionFontSize: function(key, val) {
    if (!this._editor) return '';
    var ret = '';

    if (val !== undefined) {
      this.propertyWillChange('selectionFontSize');
      var x = this._editor.execCommand('fontsize', false, val);
      this.propertyDidChange('selectionFontSize');  
      
      if (x) this.set('isDirty', YES);
         
      ret = this._editor.queryCommandValue('fontsize');
      
    } else {
      ret = this._editor.queryCommandValue('fontsize');
    }
    
    return ret;

  }.property('selection').cacheable(),  
  
  
  selectionFontColor: function(key, val) {
    if (!this._editor) return '';
    var ret = '';

    // for now execute this in non IE browsers...
    if (!SC.browser.msie) {
      if (val !== undefined) {
        this.propertyWillChange('selectionFontColor');
        var x = this._editor.execCommand('forecolor', false, val);
        this.propertyDidChange('selectionFontColor');
        
        if (x) this.set('isDirty', YES);
        
        ret = val;
        
      } else {      
        ret = this._editor.queryCommandValue('forecolor');    
        ret = SC.parseColor(ret);
      }
    }
    
    return ret;

  }.property('selection').cacheable(),
  

  selectionBackgroundColor: function(key, val) {
    if (!this._editor) return '';
    if (val === '') val = 'transparent';
    var ret = '';
    
    // for now execute this in non IE browsers...
    if (!SC.browser.msie) {
      if (val !== undefined) {
        this.propertyWillChange('selectionBackgroundColor');
        var x = this._editor.execCommand('hilitecolor', false, val);
        this.propertyDidChange('selectionBackgroundColor');
        
        if (x) this.set('isDirty', YES);
        
        ret = this._editor.queryCommandValue('hilitecolor');         
      } else {      
        ret = this._editor.queryCommandValue('hilitecolor');         
      }

      if (ret !== 'transparent') {
        ret = SC.parseColor(ret);

      } else {
        ret = '';
      }
    }
  
    return ret;
    
  }.property('selection').cacheable(),
  
  
  /**
    imageAlignment doesn't need to be updated everytime the selection changes... only 
    when the current selection is an image
  */
  imageAlignment: function(key, val) {
    if (!this.get('isImageSelected') === YES) return '';        
    var node = this._imageNode;
    
    if (val !== undefined) {
      this.propertyWillChange('imageAlignment');
      var x;
      x = node.align = val;
      this.propertyDidChange('imageAlignment');    
      
      this.set('isDirty', YES);
        
      return x;
      
    } else { 
      return node.align;        
    }   
     
  }.property('isImageSelected').cacheable(),  
  
  
  /**
    imageAlignment doesn't need to be updated everytime the selection changes... only 
    when the current selection is an image
  */
  hyperlinkValue: function(key, val) {
    if (!this.get('isHyperlinkSelected') === YES) return '';  
    var node = this._hyperlinkNode;
        
    if (val !== undefined) {
      var hyperlinkVal = '';      
      this.propertyWillChange('hyperlinkValue');
      hyperlinkVal = node.href = val;      
      this.propertyDidChange('hyperlinkValue');   
      
      this.set('isDirty', YES);
      
      return hyperlinkVal;
      
    } else {
      return node.href;
    } 
       
  }.property('isHyperlinkSelected').cacheable(),  

  
  selectionCreateLink: function(val) {
    if (!SC.none(val) && val !== '') {
      if (this._editor) {
        var x = this._editor.execCommand('createlink', false, val); 
        if (x) this.set('isDirty', YES);
        return x;
      }
      return false;
    }
    return false;
  },
  
  
  selectionRemoveLink: function() {
    if (this._editor) {
      var x = this._editor.execCommand('unlink', false, null);
      if (x) this.set('isDirty', YES);
      return x;
    }
    return false;
  },
  
  
  selectionInsertImage: function(val) {
    if (!SC.none(val) && val !== '') {  
      if (this._editor) {
        var x = this._editor.execCommand('insertimage', false, val);
        if (x) this.set('isDirty', YES);     
        return x;
      }
      return false;
    }
    return false;
  },
  
  // FIXME: [MT] - execCommand('inserthml') occassionaly throws an error in FF,
  // have to find a better way to insert HTML snippets
  selectionInsertHTML: function(val) {
    if (!SC.none(val) && val !== '') {
      if (this._editor) {
        
        if (SC.browser.msie) {
          this._editor.selection.createRange().pasteHTML(val);       
          this.set('isDirty', YES);  
          return true;
             
        } else {          
          var x = this._editor.execCommand('inserthtml', false, val);   
          if (x) this.set('isDirty', YES);  
          return x;
        }

      }
      return false;
    }
    return false;
  },
  
  
  /**
    Persists HTML from editor back to value property and sets
    the isDirty flag to false
    
    @returns {Boolean} if the operation was successul or not
  */
  saveHTML: function() {
    if (this._editor) {
      var value = this._editor.body.innerHTML;
      
      if (this.get('filterWordOnSave')) {
        value = this.cleanWordHTML(value);
      }
      
      // Any line feed character (\n), and carriage return (\r) characters have to be encoded as &#10;
      // and &#13; so that the awesome editors rendering wouldn't break.
      value = value.replace(/\r/g, '&#13;');
      value = value.replace(/\n/g, '&#10;');
      
      this.set('value', value);
      this.set('isDirty', NO);
      return true;
    }
    return false;
  },
  
  
  /**
    Returns the HTML content of the editor
    
    @returns {String} the html content of the editor
  */
  getEditorHTML: function() {
    if (this._editor) {
      if (this.get('filterWordOnSave')) {
        return this.cleanWordHTML(this._editor.body.innerHTML);
      } else {
        return this._editor.body.innerHTML;
      }
    }
  },
  
  
  /**
    Sets the HTML content of the editor
    
    @param {String} html html to bet set
    @returns {Boolean} if the operation was successful or not
  */
  setEditorHTML: function(html) {
    if (!SC.none(html) && html !== '') {
      if (this._editor) {
        this._editor.body.innerHTML = html;
        return true;
      }
      return false;
    }
    return false;
  },
  
  /**
    This function takes a style object of keys/values and sets the style
    property on the body of the editor's iframe. Dashed or CamelCase keys are both
    acceptable. 
    
    For example,
    
    {
      'color': 'blue',
      'background-color': 'red'
    }
    
    or
    
    {
      'color': 'blue',
      'backgroundColor': 'red'
    }
  
    @param {Object} inlineStyle object containing key/value pa
    @returns void
  */
  setFrameInlineStyle: function(inlineStyle) {
    var inlineCss = '';
    var editorBodyStyle = this._editor.body.style;
    for (var key in inlineStyle) {
      if (inlineStyle.hasOwnProperty(key)) {  
        editorBodyStyle[key.toString().camelize()] = inlineStyle[key];
      }
    }
  },
  
  
  /**  
    Filters out junk tags when copying/pasting from MS word. This function is called
    automatically everytime the users paste into the editor. 
    
    To prevent this, set filterWordOnSave to NO/false.
    
    @param {String} html html to be cleaned up and pasted into editor
    @returns {Boolean} if operation was successul or not 

  */  
  cleanWordHTML: function(html) {
    
    // remove o tags
    html = html.replace(/\<o:p>\s*<\/o:p>/g, '');
    html = html.replace(/\<o:p>[\s\S]*?<\/o:p>/g, '&nbsp;');

    // remove w tags
    html = html.replace(/\s*<w:[^>]*>[\s\S]*?<\/w:[^>]*>/gi, '');
    html = html.replace(/\s*<w:[^>]*\/?>/gi, '');
    html = html.replace(/\s*<\/w:[^>]+>/gi, '');
    
    // remove m tags
    html = html.replace(/\s*<m:[^>]*>[\s\S]*?<\/m:[^>]*>/gi, '');
    html = html.replace(/\s*<m:[^>]*\/?>/gi, '');
    html = html.replace(/\s*<\/m:[^>]+>/gi, '');

    // remove mso- styles
    html = html.replace(/\s*mso-[^:]+:[^;"]+;?/gi, '');
    html = html.replace(/\s*mso-[^:]+:[^;]+"?/gi, '');

    // remove crappy MS styles
    html = html.replace(/\s*MARGIN: 0cm 0cm 0pt\s*;/gi, '');
    html = html.replace(/\s*MARGIN: 0cm 0cm 0pt\s*"/gi, "\"");
    html = html.replace(/\s*TEXT-INDENT: 0cm\s*;/gi, '');
    html = html.replace(/\s*TEXT-INDENT: 0cm\s*"/gi, "\"");
    html = html.replace(/\s*PAGE-BREAK-BEFORE: [^\s;]+;?"/gi, "\"");
    html = html.replace(/\s*FONT-VARIANT: [^\s;]+;?"/gi, "\"" );
    html = html.replace(/\s*tab-stops:[^;"]*;?/gi, '');
    html = html.replace(/\s*tab-stops:[^"]*/gi, '');

    // remove xml declarations
    html = html.replace(/\<\\?\?xml[^>]*>/gi, '');

    // remove lang and language tags
    html = html.replace(/\<(\w[^>]*) lang=([^ |>]*)([^>]*)/gi, "<$1$3");
    html = html.replace(/\<(\w[^>]*) language=([^ |>]*)([^>]*)/gi, "<$1$3");

    // remove onmouseover and onmouseout events
    html = html.replace(/\<(\w[^>]*) onmouseover="([^\"]*)"([^>]*)/gi, "<$1$3");
    html = html.replace(/\<(\w[^>]*) onmouseout="([^\"]*)"([^>]*)/gi, "<$1$3");
    
    // remove meta and link tags
    html = html.replace(/\<(meta|link)[^>]+>\s*/gi, '');
   
   	return html;
  },
  
  /**
    Inserts a SC view into the editor by first converting the view into html
    then inserting it using selectionInsertHTML(). View objects, classes
    or path are all acceptable.
    
    For example,
    
    SC.View.design({
    })
    
    OR
    
    SC.View.create({
    })
    
    OR
    
    appName.pageName.viewName
    
    @param {View} SC view to be inserted
    
    TODO: [MT] possibly allow the user to pass an object to style the view
  */
  selectionInsertView: function(view) {
    
    if(SC.typeOf(view) === SC.T_STRING){
      // if nowShowing was set because the content was set directly, then 
      // do nothing.
      if (view === SC.CONTENT_SET_DIRECTLY) return ;

      // otherwise, if nowShowing is a non-empty string, try to find it...
      if (view && view.length>0) {
        if (view.indexOf('.')>0) {
          view = SC.objectForPropertyPath(view, null);
        } else {
          view = SC.objectForPropertyPath(view, this.get('page'));
        }
      }
    } else if (SC.typeOf(view) === SC.T_CLASS) {
      view = view.create();
    }

    var context = SC.RenderContext(view);
    context = context.begin('span');
    view.prepareContext(context, YES);
    context = context.end();
    context = context.join();
    
    var html;
    if (SC.browser.msie) {
      html = '<span contenteditable=false unselectable="on">' + context + '</span>';      
    } else {
      html = '<span contenteditable=false style="-moz-user-select: all">' + context + '</span>';
    }
    
    this.selectionInsertHTML(html);
  },
  
  _updateLayout: function() {
     var width, height;
     
     if (SC.browser.msie) {
       width = this._editor.body.scrollWidth;
       height = this._editor.body.scrollHeight;
     } else {
       width = this._editor.body.offsetWidth;
       height = this._editor.body.offsetHeight;
     }

     // make sure height/width doesn't shrink beyond the initial value when the
     // ContentEditableView is first created
     if (height < this._minHeight) height = this._minHeight;
     if (width < this._minWidth) width = this._minWidth;

     this.set('offsetWidth', width);
     this.set('offsetHeight', height);

     if (this.get('isAttachedView')) {
       this._updateAttachedViewLayout();
     }

     if (!this.get('fixedDimensions')) {
       var layout = this.get('layout');
       layout = SC.merge(layout, { width: width, height: height });

       this.propertyWillChange('layout');
       this.adjust(layout);
       this.propertyDidChange('layout');
     }
   },

   _updateAttachedViewLayout: function() {
     var width = this.get('offsetWidth');
     var height = this.get('offsetHeight');

     var view = this.get('attachedView');
     var layout = view.get('layout');
     layout = SC.merge(layout, { width: width, height: height });

     view.propertyWillChange('layout');
     view.adjust(layout);
     view.propertyDidChange('layout');
   },
   

   _isDirty_observer: function() {
     if (this.get('commitInstantly')) {
       this.saveHTML();
     }
   }.observes('isDirty'),
   

  /**
    Adding an observer that checks if the current selection is an image
    or a hyperlink.
  */  
  _selection_observer: function() {  
    var range;
    var node;
    
    if (SC.browser.msie) {
      var selection = this._iframe.document.selection;
      range = selection.createRange();
      
      if (range.length === 1) node = range.item();
      if (range.parentElement) node = range.parentElement(); 
      
    } else {            
      var targetIframeWindow = this._iframe.contentWindow;
      selection = targetIframeWindow.getSelection();    
      range = selection.getRangeAt(0);      
      node = range.startContainer.childNodes[range.startOffset] ;
      
      if (range.startContainer === range.endContainer) {      
        if (range.startContainer.parentNode.nodeName === 'A') {
          this._hyperlinkNode = range.startContainer.parentNode;
          this.set('isHyperlinkSelected', YES);        
        } else {
          this._hyperlinkNode = null;
          this.set('isHyperlinkSelected', NO);         
        }        
      } else {
        this._hyperlinkNode = null;
        this.set('isHyperlinkSelected', NO); 
      }
    }
    
    if (node) {
      if (node.nodeName === 'IMG') {
        this._imageNode = node;
        this.set('isImageSelected', YES);
      } else if (node.nodeName === 'A') {
        this._hyperlinkNode = node;
        this.set('isHyperlinkSelected', YES);
      } else {
        this._imageNode = null;
        this.set('isImageSelected', NO);
        
        this._hyperlinkNode = null;
        this.set('isHyperlinkSelected', NO);
      }
    }

  }.observes('selection')

}) ;
