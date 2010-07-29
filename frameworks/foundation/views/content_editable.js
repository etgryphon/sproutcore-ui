// ==========================================================================
// SCUI.ContentEditableView
// ==========================================================================
/*globals NodeFilter*/

sc_require('core');
sc_require('panes/context_menu_pane');

/** @class

  This view provides rich text editor functionality (RTE). It's a variation of
  the SC webView. It works be setting the body of the iframe to be 
  ContentEditable as well as attaching a mouseup, keyup and paste events on the 
  body of the iframe to detect the current state of text at the current mouse 
  position.

  @extends SC.WebView
  @author Mohammed Taher
  @version 0.914
  
  ==========
  = v.920 =
  ==========
  - Added new functionality related to images. Users can bind to the currently
  selected image's width, height or alt/label property. I also added a function
  to reset the dimensions of the (selected) image.
  
  ==========
  = v.914 =
  ==========
  - Added indentOnTab option. This works by inserting white space
  according to the value on the tabSize option
  - Commented out querying indent/outdent as it's a buggy implemention.
  Querying them now will always return NO
  
  ==========
  = v.9131 =
  ==========
  - No longer explicity setting the scrolling attribute if allowScrolling is 
  YES (scroll bars were being rendered at all times) - COMMIT HAS BEEN REVERTED
  
  ==========
  = v0.913 =
  ==========
  - Improved inserHTML() function
  - Improved focus() function
  - New selectContent() function
  - Ability to attach a stylesheet to editor

  ==========
  = v0.912 =
  ==========
  - Better variable names
  - Querying indent/outdent values now works in FF
  - Slightly more optimized. (In the selectionXXXX properties, 
    this._document/this._editor was being accessed multiple times, 
    now it happens once at the beginning).
  - New helper functions. Trying to push browser code branching to such 
    functions.
    a. _getFrame
    b. _getDocument
    c. _getSelection
    d. _getSelectedElement
  - Reversed isOpaque value
    
*/

SCUI.ContentEditableView = SC.WebView.extend(SC.Editable,
/** @scope SCUI.ContentEditableView.prototype */ {
  
  /**
    Value of the HTML inside the body of the iframe.
  */
  value: '',
  
  /** @private */
  valueBindingDefault: SC.Binding.single(),
  
  /**
    Set to NO to prevent scrolling in the iframe.
  */  
  allowScrolling: YES,
  
  /**
    Set to NO when the view needs to be transparent.
  */
  isOpaque: YES,

  /**
    Current selected content in the iframe.
  */
  selection: '',
  
  /**
    Read-only value
    The currently selected image
  */
  selectedImage: null,
  
  /**
    Read-only value
    The currently selected hyperlink
  */  

  selectedHyperlink: null,
  
  /**
    A view can be passed that grows/shrinks in dimensions as the ContentEditableView
    changes dimensions.
  */  
  attachedView: null,
  
  /**
    Read-only value
    OffsetWidth of the body of the iframe.
  */
  offsetWidth: null,
  
  /**
    Read-only value.
    OffsetHeight of the body of the iframe.
  */
  offsetHeight: null,
  
  /**
    Set to NO to allow dimensions of the view to change according to the HTML.
  */
  hasFixedDimensions: YES,
  
  /**
    A set of values to be applied to the editor when it loads up.
    Styles can be dashed or camelCase, both are acceptable.
    
    For example,
    
    { 'color': 'blue',
      'background-color': 'red' }
    
    OR
    
    { 'color': 'orange',
      'backgroundColor': 'green' }
  */
  inlineStyle: {},
  
  /**
    If set to YES, then HTML from iframe will be saved everytime isEditing is set
    to YES
  */  
  autoCommit: NO,
  
  /**
    Set to NO to prevent automatic cleaning of text inserted into editor
  */
  cleanInsertedText: YES,
  
  /**
    Replaces '\n' with '&#13;' and '\r' with '&#10;'
  */
  encodeNewLine: NO,
  
  /**
    CSS to style the edit content
  */
  styleSheetCSS: '',
  
  /**
    List of menu options to display on right click
  */
	rightClickMenuOptionsWithoutSelection: [],
	
	/**
    List of menu options to display on right click with selection
  */
	rightClickMenuOptionsWithSelection: [],
	
	/*
	  returns right click menu options
	*/
	rightClickMenuOptions: function(){
    //get
    var ret = [];
    var wos = this.get('rightClickMenuOptionsWithoutSelection'), ws = this.get('rightClickMenuOptionsWithSelection');
    if(this.get('selection') && this.get('selection').length > 0){
      ws.forEach(function(j){
        ret.pushObject(j);
      });
    }
    wos.forEach(function(i){
      ret.pushObject(i);
    });

    return ret;
	}.property('rightClickMenuOptionsWithoutSelection', 'rightClickMenuOptionsWithSelection', 'selection').cacheable(),
	/**
	  Used specifically for encoding special characters in an anchor tag's
	  href attribute. This is mostly an edge case.
	    (<) - %3C
	    (>) - %3E
	    ( ) - %20
	    (&) - &amp;
	    (') - %27
	*/
	encodeContent: YES,
	
	/**
	  Tab options
	*/
	indentOnTab: YES,
	tabSize: 2,

	/*
	  receives actions on click to insert event...
	*/
	insertTarget: null,

	isFocused: NO,
	
  selectionSaved: NO,
	
	displayProperties: ['value'],
	
	render: function(context, firstTime) {
    var value = this.get('value');
    var isOpaque = !this.get('isOpaque');
    var allowScrolling = this.get('allowScrolling') ? 'yes' : 'no';
    var frameBorder = isOpaque ? '0' : '1';
    var styleString = 'position: absolute; width: 100%; height: 100%; border: 0px; margin: 0px; padding: 0p;';
    
    if (firstTime) {
      context.push( '<iframe frameBorder="', frameBorder,
                    '" name="', this.get('frameName') );
        
      context.push( '" scrolling="', allowScrolling );
        
      context.push( '" src="" allowTransparency="', isOpaque, 
                    '" style="', styleString,
                    '"></iframe>' );
      
    } else if (this._document) {
      var html = this._document.body.innerHTML;
      
      if (this.get('encodeContent')) {
        html = this._encodeValues(html);
      }
      
      if(this.get('encodeNewLine')){
        html = html.replace(/\r/g, '&#13;');
        html = html.replace(/\n/g, '&#10;');
      }
      
      if (value !== html) {
        this._document.body.innerHTML = value;
        
      }
    }
  },
  
  didCreateLayer: function() {
    sc_super();
    var f = this.$('iframe');
    SC.Event.add(f, 'load', this, this.editorSetup);
  },
  
  displayDidChange: function() {
    var doc = this._document;
    if (doc) {
      doc.body.contentEditable = this.get('isEnabled');
    }
    sc_super();
  },
  
  willDestroyLayer: function() {         
    var doc = this._document;
    var docBody = doc.body;
    
    if (this.get('indentOnTab')) SC.Event.remove(docBody, 'keydown', this, this.keyDown);
    SC.Event.remove(docBody, 'focus', this, this.bodyDidFocus);
    SC.Event.remove(docBody, 'blur', this, this.bodyDidBlur);
    SC.Event.remove(docBody, 'mouseup', this, this.mouseUp);
    SC.Event.remove(docBody, 'keyup', this, this.keyUp);
    SC.Event.remove(docBody, 'paste', this, this.paste);
    SC.Event.remove(docBody, 'dblclick', this, this.doubleClick);
    SC.Event.remove(doc, 'click', this, this.focus);
    SC.Event.remove(this.$('iframe'), 'load', this, this.editorSetup);
    SC.Event.remove(doc, 'mouseup', this, this.docMouseUp);
    SC.Event.remove(doc, 'contextmenu', this, this.contextmenu);
    
    sc_super();
  },
  
  editorSetup: function() {     
    // store the document property in a local variable for easy access
    this._iframe = this._getFrame();
    this._document = this._getDocument();
    if (SC.none(this._document)) {
      console.error('Curse your sudden but inevitable betrayal! Can\'t find a reference to the document object!');
      return;
    }

    var doc = this._document;
    var styleSheetCSS = this.get('styleSheetCSS');
    if (!(SC.none(styleSheetCSS) || styleSheetCSS === '')) {
      var head = doc.getElementsByTagName('head')[0];
      if (head) {
        var el = doc.createElement("style");
        el['type'] = "text/css";
        head.appendChild(el);
        if (SC.browser.msie) {
          el.styleSheet.cssText = styleSheetCSS;
        } else {
          el.innerHTML = styleSheetCSS;
        }
        el = head = null; //clean up memory
      }
    }
    
    // set contentEditable to true... this is the heart and soul of the editor
    var value = this.get('value');
    var docBody = doc.body;
    docBody.contentEditable = true;
    
    if (!SC.browser.msie) {
      doc.execCommand('styleWithCSS', false, false);
    }
    
    if (!this.get('isOpaque')) {
      docBody.style.background = 'transparent';       
      // the sc-web-view adds a gray background to the WebView... removing in the
      // case isOpaque is NO
      this.$().setClass('sc-web-view', NO);
    }

    var inlineStyle = this.get('inlineStyle');
    var docBodyStyle = this._document.body.style;
    for (var key in inlineStyle) {
      if (inlineStyle.hasOwnProperty(key)) {  
        docBodyStyle[key.toString().camelize()] = inlineStyle[key];
      }
    }
    
    // we have to do this differently in FF and IE... execCommand('inserthtml', false, val) fails
    // in IE and frameBody.innerHTML is resulting in a FF bug
    if (SC.browser.msie || SC.browser.safari) {
      docBody.innerHTML = value;
    } else {
      this.insertHTML(value, NO);
    }

    // set min height beyond which ContentEditableView can't shrink if hasFixedDimensions is set to false
    if (!this.get('hasFixedDimensions')) {
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
    SC.Event.add(docBody, 'focus', this, this.bodyDidFocus);
    SC.Event.add(docBody, 'blur', this, this.bodyDidBlur);
    SC.Event.add(docBody, 'mouseup', this, this.mouseUp);
    SC.Event.add(docBody, 'keyup', this, this.keyUp);
    SC.Event.add(docBody, 'paste', this, this.paste);
    SC.Event.add(docBody, 'dblclick', this, this.doubleClick);
    if (this.get('indentOnTab')) SC.Event.add(docBody, 'keydown', this, this.keyDown);
    // there are certian cases where the body of the iframe won't have focus
    // but the user will be able to type... this happens when the user clicks on
    // the white space where there's no content. This event handler 
    // ensures that the body will receive focus when the user clicks on that area.
    SC.Event.add(doc, 'click', this, this.focus);
		SC.Event.add(doc, 'mouseup', this, this.docMouseUp);
		SC.Event.add(doc, 'contextmenu', this, this.contextmenu);
    
    // call the SC.WebView iframeDidLoad function to finish setting up
    this.iframeDidLoad();
    this.focus();
  },
  
  bodyDidFocus: function (evt) {
    this.set('isFocused', YES);
    
  },
  
  bodyDidBlur: function (evt) {
    this.set('isFocused', NO);
  },
	
	contextmenu: function(evt) {
	  var menuOptions = this.get('rightClickMenuOptions');
		var numOptions = menuOptions.get('length');
		
		if (menuOptions.length > 0) {
		  
			var pane = this.contextMenuView.create({
			  defaultResponder: this.get('rightClickMenuDefaultResponder'),
	      layout: { width: 200},
	      itemTitleKey: 'title',
	      itemTargetKey: 'target',
	      itemActionKey: 'action',
	      itemSeparatorKey: 'isSeparator',
	      itemIsEnabledKey: 'isEnabled',
	      items: menuOptions
	    });

	    pane.popup(this, evt);

  	  if (evt.preventDefault) {
        evt.preventDefault();
      } else { 
        evt.stop();
      }
      evt.returnValue = false;
      evt.stopPropagation();
      return NO;
    }
	},
	
  // Can't do this on the body mouseup function (The body mouse
  // function is not always triggered, e.g, when the mouse cursor is behind
  // a border)
	docMouseUp: function(evt) {
    var that = this;
	  this.invokeLast(function() {
	    var image = that.get('selectedImage');
	    if (image) {
	      image.style.width = image.width + 'px';
	      image.style.height = image.height + 'px';
	      that.set('isEditing', YES);
	    }
	  });
	},
	
	/**
	  Override this method to execute an action on double click. This was done
	  this way (as opposed to passing target/action) to be able to pass down
	  the evt parameter to the event handler.
	  
	  @params evt
  */
  doubleClick: function(evt) {
    SC.RunLoop.begin();
    // do your thing...
    SC.RunLoop.end();
  },
	
	contextMenuView: SCUI.ContextMenuPane.extend({
		popup: function(anchorView, evt) {
      if ((!anchorView || !anchorView.isView) && !this.get('usingStaticLayout')) return NO;
      
      var anchor = anchorView.isView ? anchorView.get('layer') : anchorView;

      // prevent the browsers context meuns (if it has one...). (SC does not handle oncontextmenu event.)
      document.oncontextmenu = function(e) {
        var menuOptions = anchorView.get('rightClickMenuOptions');
    		var numOptions = menuOptions.get('length');

    		if (menuOptions.length > 0) {
          if (evt.preventDefault) {
            evt.preventDefault();
          } else { 
            evt.stop();
          }
          evt.returnValue = false;
          evt.stopPropagation();
          return false;
        }
      };
      
      // Popup the menu pane
      this.beginPropertyChanges();
      var it = this.get('displayItems');
      this.set('anchorElement', anchor) ;
      this.set('anchor', anchorView);
      this.set('preferType', SC.PICKER_MENU) ;
      this.endPropertyChanges();

      return arguments.callee.base.base.apply(this,[anchorView, [evt.pageX + 5, evt.pageY + 5, 1]]);
    },
    
    exampleView: SC.MenuItemView.extend({
      renderLabel: function(context, label) {
        if (this.get('escapeHTML')) {
          label = SC.RenderContext.escapeHTML(label) ;
        }
        context.push("<span class='value ellipsis' unselectable='on'>"+label+"</span>") ;
      }
    })
    
	}),

  keyUp: function(event) {
    SC.RunLoop.begin();

    switch (SC.FUNCTION_KEYS[event.keyCode]) {
      case 'left':
      case 'right':
      case 'up':
      case 'down':
      case 'return':
        this.querySelection();
        break;
    } 
    
    if (!this.get('hasFixedDimensions')) {
      this.invokeLast(this._updateLayout);
    }
    this.set('isEditing', YES);
    
    SC.RunLoop.end();
  },
  
  keyDown: function(event) {
    SC.RunLoop.begin();
    
    var tabSize = this.get('tabSize');
    if (SC.typeOf(tabSize) !== SC.T_NUMBER) {
      // tabSize is not a number. Bail out and recover gracefully
      return;
    }
    
    var spaces = [];
    for (var i = 0; i < tabSize; i++) {
      spaces.push('\u00a0');
    }
    
    if (SC.FUNCTION_KEYS[event.keyCode] === 'tab') {
      event.preventDefault();
      this.insertHTML(spaces.join(''), NO);
    }
    
    if (SC.browser.msie) {
      var doc = this._document;
      if (SC.FUNCTION_KEYS[event.keyCode] === 'return') {
        // this.insertHTML('<br><wbr></wbr>', NO);
        // // doc.execCommand('paste', null, unescape("%0A"));
        // event.preventDefault();
      }
    }
    
    SC.RunLoop.end();
  },

  mouseUp: function() {
    this._mouseUp = true;
    SC.RunLoop.begin();
    if(this.get('insertInProgress')){
      this.set('insertInProgress', NO);
      this.get('insertTarget').sendAction('insert');
    }
    this.querySelection();
    if (!this.get('hasFixedDimensions')) {
      this.invokeLast(this._updateLayout);
    }
    
    this.set('isEditing', YES);
    SC.RunLoop.end();
  },

  paste: function() {
    SC.RunLoop.begin();

    this.querySelection();
    if (!this.get('hasFixedDimensions')) {
      this.invokeLast(this._updateLayout);
    }
    this.set('isEditing', YES);
    
    SC.RunLoop.end();
    return YES;
  },
  
  /** @property String */
  frameName: function() {
    return this.get('layerId') + '_frame' ;
  }.property('layerId').cacheable(),
  
  editorHTML: function(key, value) {
    var doc = this._document;
    if (!doc) return NO;
    
    if (value !== undefined) {
      doc.body.innerHTML = value;
      return YES;
    } else {
      if (this.get('cleanInsertedText')) {
        return this.cleanWordHTML(doc.body.innerHTML);
      } else {
        return doc.body.innerHTML;
      }
    }
  }.property(),
  
  selectionIsBold: function(key, val) {
    var editor = this._document ;
    if (!editor) return NO;
    
    if (val !== undefined) {
      if (editor.execCommand('bold', false, val)) {
        this.set('isEditing', YES);
      }
    }
    
    return this._document.queryCommandState('bold');
  }.property('selection').cacheable(),
  
  selectionIsItalicized: function(key, val) {
    var doc = this._document ;
    if (!doc) return NO;
    
    if (val !== undefined) {
      if (doc.execCommand('italic', false, val)) {
        this.set('isEditing', YES);
      }
    }
    
    return doc.queryCommandState('italic');
  }.property('selection').cacheable(),
  
  selectionIsUnderlined: function(key, val) {
    var doc = this._document ;
    if (!doc) return NO;
    
    if (val !== undefined) {
      if (doc.execCommand('underline', false, val)) {
        this.set('isEditing', YES);
      }
    }
    
    return doc.queryCommandState('underline');
  }.property('selection').cacheable(),
  
  // FIXME: [MT] queryCommandState('justifyXXXX') always returns fasle in safari...
  // find a workaround
  selectionIsCenterJustified: function(key, val) {
    var doc = this._document ;
    if (!doc) return NO;
    
    if (val !== undefined) {
      if (doc.execCommand('justifycenter', false, val)) {
        this.querySelection();
        this.set('isEditing', YES);
      }
    }
    
    return doc.queryCommandState('justifycenter');
  }.property('selection').cacheable(),
  
  selectionIsRightJustified: function(key, val) {
    var doc = this._document ;
    if (!doc) return NO;
    
    if (val !== undefined) {
      if (doc.execCommand('justifyright', false, val)) {
        this.querySelection();
        this.set('isEditing', YES);
      }
    }
    
    return doc.queryCommandState('justifyright');
  }.property('selection').cacheable(),
  
  selectionIsLeftJustified: function(key, val) {
    var doc = this._document ;
    if (!doc) return NO;
    
    if (val !== undefined) {
      if (doc.execCommand('justifyleft', false, val)) {
        this.querySelection();
        this.set('isEditing', YES);
      }
    }
    
    return doc.queryCommandState('justifyleft');
  }.property('selection').cacheable(),
  
  selectionIsFullJustified: function(key, val) {
    var doc = this._document ;
    if (!doc) return NO;
    
    if (val !== undefined) {
      if (doc.execCommand('justifyfull', false, val)) {
        this.querySelection();
        this.set('isEditing', YES);
      }
    }
    
    return doc.queryCommandState('justifyfull');
  }.property('selection').cacheable(),
  
  selectionIsOrderedList: function(key, val) {
    var doc = this._document ;
    if (!doc) return NO;
    
    if (val !== undefined) {
      if (SC.browser.msie && val === YES) {
        this._createListForIE('ol');
      } else {
        if (doc.execCommand('insertorderedlist', false, val)) {
          this.querySelection();
        }
      }
      this.set('isEditing', YES);
    }
    
    return doc.queryCommandState('insertorderedlist');
  }.property('selection').cacheable(),
  
  selectionIsUnorderedList: function(key, val) {
    var doc = this._document ;
    if (!doc) return NO;
    
    if (val !== undefined) {      
      if (SC.browser.msie && val === YES) {
        this._createListForIE('ul');
      } else {
        if (doc.execCommand('insertunorderedlist', false, val)) {
          this.querySelection();
        }
      }
      this.set('isEditing', YES);
    }
    
    return doc.queryCommandState('insertunorderedlist');
  }.property('selection').cacheable(),
  
  _createListForIE: function(tag) {
    var html = '';
    var range = this._iframe.document.selection.createRange();
    var text = range.text;
    var textArray = text.split('\n');

    if (textArray.length > 1) {
      for (var i = 0; i < textArray.length; i++) {
        html += '<li>%@</li>'.fmt(textArray[i]);
      }
    } else {
      html = '<li>%@<li>'.fmt(text);
    }
    range.pasteHTML('<%@>%@<%@>'.fmt(tag, html, tag));
  },

  // indent/outdent have some sort of problem with every
  // browser. Check,
  // 
  // http://www.quirksmode.org/dom/execCommand.html
  // 
  // I would avoid using these for now and go with
  // indentOnTab
  selectionIsIndented: function(key, val) {
    var doc = this._document ;
    if (!doc) return NO;
    
    if (val !== undefined) {
      if (doc.execCommand('indent', false, val)) {
        this.set('isEditing', YES);
      }
    }
    
    if (SC.browser.msie) {
      return doc.queryCommandState('indent');
    } else {
      /*
      [MT] - Buggy... commeting out for now
      var elem = this._getSelectedElemented();
      if (!SC.none(elem)) {
        if (elem.style['marginLeft'] !== '') {
          return YES;
        }
      }
      */
      return NO;
    }
  }.property('selection').cacheable(),
  
  selectionIsOutdented: function(key, val) {
    var doc = this._document ;
    if (!doc) return NO;
    
    if (val !== undefined) {
      if (doc.execCommand('outdent', false, val)) {
        this.set('isEditing', YES);
      }
    }
    
    if (SC.browser.msie) {
      return doc.queryCommandState('outdent');
    } else {
      /*
      [MT] - Buggy... commeting out for now
      var elem = this._getSelectedElemented();
      if (!SC.none(elem)) {
        if (elem.style['marginLeft'] === '') {
          return YES;
        }
      }
      */
      return NO;
    }
  }.property('selection').cacheable(),
  
  selectionIsSubscript: function(key, val) {
    var doc = this._document ;
    if (!doc) return NO;
    
    if (val !== undefined) {
      if (doc.execCommand('subscript', false, val)) {
        this.set('isEditing', YES);
      }
    }

    return doc.queryCommandState('subscript');
  }.property('selection').cacheable(),
  
  selectionIsSuperscript: function(key, val) {
    var doc = this._document ;
    if (!doc) return NO;
    
    if (val !== undefined) {
      if (doc.execCommand('superscript', false, val)) {
        this.set('isEditing', YES);
      }
    }

    return doc.queryCommandState('superscript');
  }.property('selection').cacheable(),
  
  selectionFontName: function(key, val) {
    var doc = this._document ;
    if (!doc) return '';
    var ret;
    
    if (val !== undefined) {
       var identifier = '%@%@'.fmt(this.get('layerId'), '-ce-font-temp');
       
      if (doc.execCommand('fontname', false, identifier)) {
        var fontTags = doc.getElementsByTagName('font');
        for (var i = 0, j = fontTags.length; i < j; i++) {
          var fontTag = fontTags[i];
          if (fontTag.face === identifier) {
            fontTag.face = '';
            fontTag.style.fontFamily = val;
          }
        }
        
        this.set('isEditing', YES);
      }
    } else {
      var elm = this._findFontTag(this._getSelectedElement());
      if (elm && elm.nodeName.toLowerCase() === 'font') {
        ret = elm.style.fontFamily;
      } else {
        ret = null;
      }
      return ret;
    }
  }.property('selection').cacheable(),
  
  selectionFontSize: function(key, value) {
    var frame = this._iframe;
    var doc = this._document;
    if (!doc) return '';
    var ret;
    
    if (value !== undefined) {
      var identifier = '%@%@'.fmt(this.get('layerId'), '-ce-size-temp');
      
      // apply unique string to font size to act as identifier
      if (doc.execCommand('fontname', false, identifier)) {

        // get all newly created font tags
        var fontTags = doc.getElementsByTagName('font');
        for (var i = 0, j = fontTags.length; i < j; i++) {
          var fontTag = fontTags[i];
          if (fontTag.face === identifier) {
            fontTag.face = '';
            fontTag.style.fontSize = value;
          }
        }
        this.set('isEditing', YES);
        return value;
      }
    } else {
      var elm = this._findFontTag(this._getSelectedElement());
      if (elm && elm.nodeName.toLowerCase() === 'font') {
        ret  = elm.style.fontSize;
      } else {
        ret = null;
      }
      return ret;
    }
  }.property('selection').cacheable(),
  
  _findFontTag: function(elem) {
    while (elem.nodeName !== 'BODY') {
      if (elem.nodeName === 'FONT') {
        return elem;
      } else {
        elem = elem.parentNode;
      }
    }
  },
  
  selectionFontColor: function(key, value) {
    var doc = this._document ;
    if (!doc) return '';
    

    if (value !== undefined) { 
      if (this.get('selectionSaved') === YES) {
        this.restoreSelection();
      }
      if (doc.execCommand('forecolor', false, value)) {
        this.saveSelection();
        this.set('isEditing', YES);
        this._last_font_color_cache = value;
      }
    }
    
    if (this._last_font_color_cache) {
      return this._last_font_color_cache;
    } else {
      this._last_font_color_cache = SC.parseColor(doc.queryCommandValue('forecolor')) || '';
      return this._last_font_color_cache;
    }
    
  }.property('selection').cacheable(),
  
  selectionBackgroundColor: function(key, value) {
    var doc = this._document ;
    if (!doc) return '';
    
    var prop;
    if (SC.browser.msie) prop = 'backcolor';
    else prop = 'hilitecolor';

    if (!SC.browser.msie) doc.execCommand('styleWithCSS', false, true);

    if (value !== undefined) {
      if (this.get('selectionSaved') === YES) {
        this.restoreSelection();
      }
      if (doc.execCommand(prop, false, value)) {
        this.saveSelection();
        this.set('isEditing', YES);
        this._last_background_color_cache = value;
      }
    }
    
    if (this._last_background_color_cache) {
      return this._last_background_color_cache;
    } else {
      var color = doc.queryCommandValue(prop);
      if (!SC.browser.msie)  doc.execCommand('styleWithCSS', false, false);
      if (color !== 'transparent') {
        if (SC.parseColor(color)) {
          this._last_background_color_cache = SC.parseColor(color);
          return this._last_background_color_cache;
        }
      }
    }
    
    return '';
  }.property('selection').cacheable(),
  
  hyperlinkValue: function(key, value) {
    var hyperlink = this.get('selectedHyperlink');
    if (!hyperlink) return '';
        
    if (!SC.none(value)) {
      hyperlink.href = value;
      this.set('isEditing', YES);
      return value;
      
    } else {
      return hyperlink.href;
      
    }
  }.property('selectedHyperlink').cacheable(),
  
  hyperlinkHoverValue: function(key, value) {
    var hyperlink = this.get('selectedHyperlink');
    if (!hyperlink) return '';
        
    if (value !== undefined) {
      hyperlink.title = value;
      this.set('isEditing', YES);
      return value;
      
    } else {
      return hyperlink.title;
      
    }
  }.property('selectedHyperlink').cacheable(),
  
  /**
    imageAlignment doesn't need to be updated everytime the selection changes... only 
    when the current selection is an image
  */
  imageAlignment: function(key, value) {
    var image = this.get('selectedImage');
    if (!image) return '';
    
    if (value !== undefined) {
      image.align = value;
      this.set('isEditing', YES);
      return value;
      
    } else { 
      return image.align;
      
    }
  }.property('selectedImage').cacheable(),
  
  imageWidth: function(key, value) {
    var image = this.get('selectedImage');
    if (!image) return '';
    
    if (value !== undefined) {
      this.set('isEditing', YES);
      image.width = value;
      image.style.width = value;
      return value;
      
    } else { 
      return image.clientWidth;
      
    }
  }.property('selectedImage').cacheable(),
  
  imageHeight: function(key, value) {
    var image = this.get('selectedImage');
    if (!image) return '';
    
    if (value !== undefined) {
      this.set('isEditing', YES);
      image.height = value;
      image.style.height = value;
      return value;
      
    } else { 
      return image.clientHeight;
      
    }
  }.property('selectedImage').cacheable(),
  
  imageDescription: function(key, value) {
    var image = this.get('selectedImage');
    if (!image) return '';
    
    if (value !== undefined) {
      this.set('isEditing', YES);
      image.title = value;
      image.alt = value;
      return value;
      
    } else { 
      return image.alt;
      
    }
  }.property('selectedImage').cacheable(),
  
  imageBorderWidth: function(key, value) {
    var image = this.get('selectedImage');
    if (!image) return '';
    
    if (value !== undefined) {
      this.set('isEditing', YES);
      image.style.borderWidth = value;
      return value;
      
    } else { 
      return image.style.borderWidth;
      
    }
  }.property('selectedImage').cacheable(),
  
  imageBorderColor: function(key, value) {
    var image = this.get('selectedImage');
    if (!image) return '';
    
    if (value !== undefined) {
      this.set('isEditing', YES);
      
      image.style.borderColor = value;
      return value;
      
    } else { 
      var color = image.style.borderColor;
      if (color !== '') {
        return SC.parseColor(color);
      } else {
        return '';
      }
      
    }
  }.property('selectedImage').cacheable(),
  
  imageBorderStyle: function(key, value) {
    var image = this.get('selectedImage');
    if (!image) return '';
    
    if (value !== undefined) {
      this.set('isEditing', YES);
      image.style.borderStyle = value;
      return value;
      
    } else { 
      return image.style.borderStyle;
      
    }
  }.property('selectedImage').cacheable(),
  
  resetImageDimensions: function() {
    var image = this.get('selectedImage');
    if (!image) return NO;
    
    image.style.width = '';
    image.style.height = '';
    image.removeAttribute('width');
    image.removeAttribute('height');
    
    this.set('isEditing', YES);
    this.notifyPropertyChange('selectedImage');
    
    return image;
  },

  focus: function(){
    if (!SC.none(this._document)) {
      this._document.body.focus();
      this.set('selection', '');
      this.querySelection();
    }
  },
  
  querySelection: function() {
    var frame = this._iframe;
    if (!frame) return;
    
    var selection = '';
    if (SC.browser.msie) {
      selection = this._iframe.document.selection.createRange().text;
      if (SC.none(selection)) {
        selection = '';
      }
    } else {
      var frameWindow = frame.contentWindow;
      selection = frameWindow.getSelection();
    }
    
    this._resetColorCache();
    
    this.propertyWillChange('selection');
    this.set('selection', selection.toString());
    this.propertyDidChange('selection');
  },
  
  createLink: function(value) {
    var doc = this._document;
    var frame = this._iframe;
    if (!(doc && frame)) return NO;
    if (SC.none(value) || value === '') return NO;
    
    /*
      HACK: [MT] - This is an interesting hack... The problem with 
      execCommand('createlink') is it only tells you if hyperlink 
      creation was successful... it doesn't return the hyperlink that 
      was created. 
      
      To counter this problem, I'm creating a random string and
      assigning it as the href. If the frame.contentWindow.getSelection()
      method fails, I iterate over the children of the currently selected
      node and find the anchor tag with the crazy url and assign it as the
      currently selected hyperlink, after which I do a bit of cleanup
      and set value to the href property.
    */
    
    var radomUrl = '%@%@%@%@%@'.fmt('http://',
                                    this.get('frameName'),
                                    new Date().getTime(), 
                                    parseInt(Math.random()*100000, 0),
                                    '.com/');
    
    if (doc.execCommand('createlink', false, radomUrl)) {
      var aTags = doc.getElementsByTagName('A'), hyperlink, child;
      
      for (var x = 0, y = aTags.length; x < y; x++) {
        child = aTags[x];

        if (child.href === radomUrl) {
          hyperlink = child;
          break;
        }
      }
    }
    
    if (hyperlink) {
      hyperlink.href = value;
      this.set('selectedHyperlink', hyperlink);
      this.set('isEditing', YES);
      return YES;
      
    } else {
      return NO;
      
    }
  },
  
  removeLink: function() {
    var doc = this._document;
    if (!doc) return NO;
    
    if (doc.execCommand('unlink', false, null)) {
      this.set('selectedHyperlink', null);
      this.set('isEditing', YES);
      return YES;
    }
    
    return NO;
  },
  
  // FIXME: [MT] Should do something similar to what's being done on
  // image creation (Assigning the newly created image to the selectedImage
  // property)
  insertImage: function(value) {
    var doc = this._document;
    if (!doc) return NO;
    if (SC.none(value) || value === '') return NO;
    
    if (doc.execCommand('insertimage', false, value)) {
      this.set('isEditing', YES);
      return YES;
    }

    return NO;
  },
  
  /**
    Inserts a snippet of HTML into the editor at the cursor location. If the
    editor is not in focus then it appens the HTML at the end of the document.
    
    @param {String} HTML to be inserted
    @param {Boolean} Optional boolean to determine if a single white space is to be 
    inserted after the HTML snippet. Defaults to YES. This is enabled to protect
    against certain FF bugs (e.g. If a user inserts HTML then presses space right
    away, the HTML will be removed.)
  */
  insertHTML: function(value, insertWhiteSpaceAfter) {
    var doc = this._document;
    if (!doc) return NO;
    if (SC.none(value) || value === '') return NO;
    
    if (SC.none(insertWhiteSpaceAfter) || insertWhiteSpaceAfter) {
      value += '\u00a0';
    }
        
    if (SC.browser.msie) {
      if (!this.get('isFocused')) {
        this.focus();
      }
      doc.selection.createRange().pasteHTML(value);       
      this.set('isEditing', YES);  
      return YES;
         
    } else {
      if (doc.execCommand('inserthtml', false, value)) {
        this.set('isEditing', YES);
        return YES;
      }
      return NO;
    }
  },
  
  /**
    Inserts a SC view into the editor by first converting the view into html
    then inserting it using insertHTML(). View objects, classes
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
  */
  insertView: function(view) {
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

    this.insertHTML(html);
  },
  
  /**  
    Filters out junk tags when copying/pasting from MS word. This function is called
    automatically everytime the users paste into the editor. 

    To prevent this, set cleanInsertedText to NO/false.

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
    Persists HTML from editor back to value property and sets
    the isEditing flag to false
    
    @returns {Boolean} if the operation was successul or not
  */
  commitEditing: function() {
    var doc = this._document;
    if (!doc) return NO;
    
    var value = doc.body.innerHTML;
    if (this.get('cleanInsertedText')) {
      value = this.cleanWordHTML(value);
    }

    if(this.get('encodeNewLine')){
      value = value.replace(/\r/g, '&#13;');
      value = value.replace(/\n/g, '&#10;');
    }
    
    if (this.get('encodeContent')) {
      value = this._encodeValues(value);
    }
    
    this.set('value', value);
    this.set('isEditing', NO);
    return YES;
  },
  
  /**
    Selects the current content in editor
    
    @returns {Boolean} if the operation was successul or not
  */
  selectContent: function() {
    var doc = this._document;
    if (!doc) return NO;
    
    return doc.execCommand('selectall', false, null);
  },

  /**
    Adding an observer that checks if the current selection is an image
    or a hyperlink.
  */  
  selectionDidChange: function() {
    var node, 
        range, 
        currentImage = null, 
        currentHyperlink = null;
    
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
        
        if (range.startContainer.parentNode.nodeName === 'A' && range.commonAncestorContiner !== node) {
          currentHyperlink = range.startContainer.parentNode;
        } else {
          currentHyperlink = null;
        }
                
      } else {
        currentHyperlink = null;
        
      }
    }
    
    if (node) {
      if (node.nodeName === 'IMG') {
        currentImage = node;
        
        if(node.parentNode.nodeName === 'A') currentHyperlink = node.parentNode;
        
      } else if (node.nodeName === 'A') {
        currentHyperlink = node;
        
      } else {
        currentImage = null;
        currentHyperlink = null;
        
      }
    }
    
    this.set('selectedImage', currentImage);
    this.set('selectedHyperlink', currentHyperlink);
    
  }.observes('selection'),

  isEditingDidChange: function() {
   if (this.get('autoCommit')) {
     this.commitEditing();
   }
  }.observes('isEditing'),
  
  /** @private */
  _updateAttachedViewLayout: function() {
    var width = this.get('offsetWidth');
    var height = this.get('offsetHeight');

    var view = this.get('attachedView');
    var layout = view.get('layout');
    layout = SC.merge(layout, { width: width, height: height });
    view.adjust(layout);
  },
  
  /** @private */
  _updateLayout: function() {
    var doc = this._document;
    if (!doc) return;
    
    var width, height;
    if (SC.browser.msie) {
      width = doc.body.scrollWidth;
      height = doc.body.scrollHeight;
    } else {
      width = doc.body.offsetWidth;
      height = doc.body.offsetHeight;
    }

    // make sure height/width doesn't shrink beyond the initial value when the
    // ContentEditableView is first created
    if (height < this._minHeight) height = this._minHeight;
    if (width < this._minWidth) width = this._minWidth;

    this.set('offsetWidth', width);
    this.set('offsetHeight', height);

    if (this.get('attachedView')) {
      this._updateAttachedViewLayout();
    }

    if (!this.get('hasFixedDimensions')) {
      var layout = this.get('layout');
      layout = SC.merge(layout, { width: width, height: height });

      this.propertyWillChange('layout');
      this.adjust(layout);
      this.propertyDidChange('layout');
    }
  },
  
  /** @private */
  _getFrame: function() {
    var frame;
    if (SC.browser.msie) {
      frame = document.frames(this.get('frameName'));
    } else {
      frame = this.$('iframe').firstObject();
    }
    
    if (!SC.none(frame)) return frame;
    return null;
  },
  
  /** @private */
  _getDocument: function() {
    var frame = this._getFrame();
    if (SC.none(frame)) return null;
    
    var editor;
    if (SC.browser.msie) {
      editor = frame.document;
    } else {
      editor = frame.contentDocument;
    }
    
    if (SC.none(editor)) return null;
    return editor;
  },
  
  /** @private */
  _getSelection: function() {
    var selection;
    if (SC.browser.msie) {
      selection = this._getDocument().selection;
    } else {
      selection = this._getFrame().contentWindow.getSelection();
    }
    return selection;
  },
  
  /** @private */
  _getSelectedElemented: function() {
    var selection = this._getSelection();
    var selectedElement;
    
    if (SC.browser.msie) {
      selectedElement = selection.createRange().parentElement();
    } else {
      var anchorNode = selection.anchorNode;
      var focusNode = selection.focusNode;
        
      if (anchorNode && focusNode) {
        if (anchorNode.nodeType === 3 && focusNode.nodeType === 3) {
          if (anchorNode.parentNode === focusNode.parentNode) {
            selectedElement = anchorNode.parentNode;
          }
        }
      }
    }
    
    return selectedElement;
  },
  
  _encodeValues: function(html) {
    var hrefs = html.match(/href=".*?"/gi);
    if (hrefs) {
      var href, decodedHref;
      
      for (var i = 0, j = hrefs.length; i < j; i++) {
        href = decodedHref = hrefs[i];
        
        html = html.replace(/\%3C/gi, '<');
        html = html.replace(/\%3E/gi, '>');
        html = html.replace(/\%20/g, ' ');
        html = html.replace(/\&amp;/gi, '&');
        html = html.replace(/\%27/g, "'");
        
        html = html.replace(href, decodedHref);
      }
    }
    return html;
  },
  
  _getSelectedElement: function() {
    var sel = this._getSelection(), range, elm;
    var doc = this._document;
           
    if (SC.browser.msie) {
      range = doc.selection.createRange();
      if (range) {
        elm = range.item ? range.item(0) : range.parentElement();
      }
    } else {
      if (sel.rangeCount > 0) {
        range = sel.getRangeAt(0);
      }  
      
      if (range) {
        if (sel.anchorNode && (sel.anchorNode.nodeType == 3)) {
          if (sel.anchorNode.parentNode) { //next check parentNode
            elm = sel.anchorNode.parentNode;
          }
          if (sel.anchorNode.nextSibling != sel.focusNode.nextSibling) {
            elm = sel.anchorNode.nextSibling;
          }
        }

        if (!elm) {
          elm = range.commonAncestorContainer;

          if (!range.collapsed) {
            if (range.startContainer == range.endContainer) {
              if (range.startOffset - range.endOffset < 2) {
                if (range.startContainer.hasChildNodes()) {
                  elm = range.startContainer.childNodes[range.startOffset];
                }
              }
            }
          }
        }
      }      
    }
    
    return elm;
  },
  
  _resetColorCache: function() {
    this._last_font_color_cache = null;
    this._last_background_color_cache = null;
    this.set('selectionSaved', NO);
  },
  
  saveSelection: function() {
    this.set('selectionSaved', YES);
    
    if (SC.browser.msie) {
      var win = this._getFrame().window;
      var doc = win.document;
      var sel = win.getSelection ? win.getSelection() : doc.selection;
      var range;

      if (sel) {
        if (sel.createRange) {
          range = sel.createRange();
        } else if (sel.getRangeAt) {
          range = sel.getRangeAt(0);
        } else if (sel.anchorNode && sel.focusNode && doc.createRange) {
          // Older WebKit browsers
          range = doc.createRange();
          range.setStart(sel.anchorNode, sel.anchorOffset);
          range.setEnd(sel.focusNode, sel.focusOffset);

          // Handle the case when the selection was selected backwards (from the end to the start in the
          // document)
          if (range.collapsed !== sel.isCollapsed) {
            range.setStart(sel.focusNode, sel.focusOffset);
            range.setEnd(sel.anchorNode, sel.anchorOffset);
          }
        }
      }
      this._range = range;
    }
  },

  restoreSelection: function() {
    this.set('selectionSaved', NO);
    
    if (SC.browser.msie) {
      var win = this._getFrame().window;
      var doc = win.document;
      var sel = win.getSelection ? win.getSelection() : doc.selection;
      var range = this._range;

      if (sel && range) {
        if (range.select) {
          range.select();
        } else if (sel.removeAllRanges && sel.addRange) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
    
  }
  
});
