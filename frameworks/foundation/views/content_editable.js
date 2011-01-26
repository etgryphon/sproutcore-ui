// ==========================================================================
// SCUI.ContentEditableView
// ==========================================================================
/*globals NodeFilter SC SCUI sc_require */

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
  @author Joe Shelby
  @version 0.930

  ==========
  = v.930 =
  ==========
  - siginificant fixes to selection, architecture, bug fixes
  - selected image src now available as calculated property
  - ctrl-a / cmd-a triggers querySelection

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
/** @scope SCUI.ContentEditableView.prototype */
{

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
    Read-only value
    The currently selected hyperlink
  */

  selectedText: null,

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
    An array of link strings. Each string is expected to be a fully formed link tag, eg.

      '<link href="http://link/to/stylshee.css" rel="stylesheet" type="text/css" />'
  */
  styleSheetsLinks: [],

  /**
    List of menu options to display on right click
  */
  rightClickMenuOptionsWithoutSelection: [],

  /**
    List of menu options to display on right click with selection
  */
  rightClickMenuOptionsWithSelection: [],

  docType: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',

  /*
	  returns right click menu options
	*/
  rightClickMenuOptions: function() {
    //get
    var ret = [];
    var wos = this.get('rightClickMenuOptionsWithoutSelection'),
    ws = this.get('rightClickMenuOptionsWithSelection');
    if (this.get('selectedText') && this.get('selectedText').length > 0) {
      ws.forEach(function(j) {
        ret.pushObject(j);
      });
    }
    wos.forEach(function(i) {
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

  /*
    permits right-click menu when no menu options provided
  */
  allowsDefaultRightClickMenu: YES,

  isFocused: NO,

  selectionSaved: NO,

  displayProperties: ['value'],

  render: function(context, firstTime) {
    var value = this.get('value');
    var isOpaque = !this.get('isOpaque');
    var allowScrolling = this.get('allowScrolling') ? 'yes': 'no';
    var frameBorder = isOpaque ? '0': '1';
    var styleString = 'position: absolute; width: 100%; height: 100%; border: 0px; margin: 0px; padding: 0p;';

    if (firstTime) {
      context.push('<iframe frameBorder="', frameBorder, '" name="', this.get('frameName'));
      context.push('" scrolling="', allowScrolling);
      context.push('" src="" allowTransparency="', isOpaque, '" style="', styleString, '"></iframe>');
    } else if (this._document) {
      var html = this._document.body.innerHTML;

      if (this.get('encodeContent')) {
        html = this._encodeValues(html);
      }

      if (this.get('encodeNewLine')) {
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

  _attachEventHandlers: function(doc, docBody) {
    SC.Event.add(docBody, 'focus', this, this.bodyDidFocus);
    SC.Event.add(docBody, 'blur', this, this.bodyDidBlur);
    SC.Event.add(docBody, 'mouseup', this, this.mouseUp);
    SC.Event.add(docBody, 'keyup', this, this.keyUp);
    SC.Event.add(docBody, 'paste', this, this.paste);
    SC.Event.add(docBody, 'dblclick', this, this.doubleClick);
    SC.Event.add(docBody, 'mouseout', this, this.mouseOut);
    if (this.get('indentOnTab')) SC.Event.add(docBody, 'keydown', this, this.keyDown);
    // there are certian cases where the body of the iframe won't have focus
    // but the user will be able to type... this happens when the user clicks on
    // the white space where there's no content. This event handler
    // ensures that the body will receive focus when the user clicks on that area.
    SC.Event.add(doc, 'click', this, this.focus);
    SC.Event.add(doc, 'mouseup', this, this.docMouseUp);
    SC.Event.add(doc, 'contextmenu', this, this.contextmenu);
  },

  _removeEventHandlers: function(doc, docBody) {
    if (this.get('indentOnTab')) SC.Event.remove(docBody, 'keydown', this, this.keyDown);
    SC.Event.remove(docBody, 'focus', this, this.bodyDidFocus);
    SC.Event.remove(docBody, 'blur', this, this.bodyDidBlur);
    SC.Event.remove(docBody, 'mouseup', this, this.mouseUp);
    SC.Event.remove(docBody, 'keyup', this, this.keyUp);
    SC.Event.remove(docBody, 'paste', this, this.paste);
    SC.Event.remove(docBody, 'dblclick', this, this.doubleClick);
    SC.Event.remove(docBody, 'mouseout', this, this.mouseOut);
    SC.Event.remove(doc, 'click', this, this.focus);
    SC.Event.remove(doc, 'mouseup', this, this.docMouseUp);
    SC.Event.remove(doc, 'contextmenu', this, this.contextmenu);
    SC.Event.remove(this.$('iframe'), 'load', this, this.editorSetup);
  },

  willDestroyLayer: function() {
    var doc = this._document;
    var docBody = doc.body;
    this._removeEventHandlers(doc, docBody);
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

    doc.open();
    doc.write(this.get('docType'));
    doc.write('<html><head>');

    var styleSheetsLinks = this.get('styleSheetsLinks'),
    styleSheetLink;
    if (styleSheetsLinks.length && styleSheetsLinks.length > 0) {
      for (var i = 0,
      j = styleSheetsLinks.length; i < j; i++) {
        styleSheetLink = styleSheetsLinks[i];
        if (styleSheetLink.match(/\<link.*?>/)) {
          doc.write(styleSheetsLinks[i]);
        }
      }
    }

    doc.write('</head><body></body></html>');
    doc.close();

    var styleSheetCSS = this.get('styleSheetCSS');
    if (! (SC.none(styleSheetCSS) || styleSheetCSS === '')) {
      var head = doc.getElementsByTagName('head')[0];
      if (head) {
        var el = doc.createElement("style");
        el.type = "text/css";
        head.appendChild(el);
        if (SC.browser.msie) {
          el.styleSheet.cssText = styleSheetCSS;
        } else {
          el.innerHTML = styleSheetCSS;
        }
        el = head = null;
        //clean up memory
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

    docBody.innerHTML = value;

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

    this._attachEventHandlers(doc, docBody);

    // call the SC.WebView iframeDidLoad function to finish setting up
    this.iframeDidLoad();
    this.focus();

    // When body.innerHTML is used to insert HTML into the iframe, it results in a bug
    // (if you select-all then try and delete, it won't have any effect). This
    // is a hack for that problem
    doc.execCommand('inserthtml', false, ' ');
    doc.execCommand('undo', false, null);
  },

  bodyDidFocus: function(evt) {
    this.set('isFocused', YES);

  },

  bodyDidBlur: function(evt) {
    this.set('isFocused', NO);
  },

  contextmenu: function(evt) {
    var menuOptions = this.get('rightClickMenuOptions');
    var numOptions = menuOptions.get('length');

    if (menuOptions.length > 0) {

      var pane = this.contextMenuView.create({
        defaultResponder: this.get('rightClickMenuDefaultResponder'),
        layout: {
          width: 200
        },
        itemTitleKey: 'title',
        itemTargetKey: 'target',
        itemActionKey: 'action',
        itemSeparatorKey: 'isSeparator',
        itemIsEnabledKey: 'isEnabled',
        items: menuOptions
      });

      pane.popup(this, evt);
    }

    if ((menuOptions.length > 0) || (!this.get('allowsDefaultRightClickMenu'))) {
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
      this.set('anchorElement', anchor);
      this.set('anchor', anchorView);
      this.set('preferType', SC.PICKER_MENU);
      this.endPropertyChanges();
// TODO [JS]: this is putting the pop-up at quite a distance from the click, OR-7463
      return arguments.callee.base.base.apply(this, [anchorView, [evt.pageX + 5, evt.pageY + 5, 1]]);
    },

    exampleView: SC.MenuItemView.extend({
      renderLabel: function(context, label) {
        if (this.get('escapeHTML')) {
          label = SC.RenderContext.escapeHTML(label);
        }
        context.push("<span class='value ellipsis' unselectable='on'>" + label + "</span>");
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
    case 'home':
    case 'end':
    case 'return':
      this.querySelection();
      break;
    }
    // [JS] control-A on windows/linux, or cmd-a on mac, selects all automatically, and should update selection
    // jquery hack send meta AND ctrl if ctrl was pressed, which means we'd get triggered on ctrl even if select-all didn't happen, so look for meta without control
    // complaint reported in 2008, but it is still there in jquery now, and in sproutcore's corequery base
    if (event.keyCode === 65 && ((SC.browser.mac && event.metaKey && !event.ctrlKey) || (!SC.browser.mac && event.ctrlKey))) {
      this.querySelection();
    }

    if (!this.get('hasFixedDimensions')) {
      this.invokeLast(this._updateLayout);
    }
    this.set('isEditing', YES);

    SC.RunLoop.end();
  },

  _tabKeyDown: function(event) {
    // insert spaces instead of actual tab character
    var tabSize = this.get('tabSize'),
    spaces = [];
    if (SC.typeOf(tabSize) !== SC.T_NUMBER) {
      // tabSize is not a number. Bail out and recover gracefully
      return;
    }

    for (var i = 0; i < tabSize; i++) {
      spaces.push('\u00a0');
    }

    event.preventDefault();
    this.insertHTML(spaces.join(''), NO);
  },

  keyDown: function(event) {
    SC.RunLoop.begin();
    if ((SC.FUNCTION_KEYS[event.keyCode] === 'tab') && this.get('indentOnTab')) {
      this._tabKeyDown(event);
    }

    if (SC.browser.msie) {
      // IE workaround - return key might do the wrong thing
      var element = this._getSelectedElement();

      if (SC.FUNCTION_KEYS[event.keyCode] === 'return' && element.nodeName !== 'LI') {
        var range = this._iframe.document.selection.createRange();
        range.pasteHTML('<br>');
        range.collapse(false);
        range.select();
        event.preventDefault();
      }
    }

    SC.RunLoop.end();
  },

  mouseOut: function(evt) {
    this.querySelection();
  },

  mouseUp: function(evt) {
    this._mouseUp = true;
    SC.RunLoop.begin();
    if (this.get('insertInProgress')) {
      this.set('insertInProgress', NO);
      this.get('insertTarget').sendAction('insert');
    }
    this.querySelection();

    //attempting to help webkit select images...
    if (evt.target && evt.target.nodeName === "IMG") {
      var sel = this._iframe.contentWindow.getSelection(),
      range = this._iframe.contentWindow.document.createRange();

      range.selectNode(evt.target);
      sel.removeAllRanges();
      sel.addRange(range);
    }

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
    return this.get('layerId') + '_frame';
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

  selectionRange: function() {
    var selection = this.get('selection'),
    range = null;
    if (SC.none(selection)) {
      return null;
    }
    if (SC.browser.msie) {
      range = selection.createRange();
    } else {
      // *should* never be 0 if there's a selection active
      range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    }
    return range;
  }.property('selection'),

  selectionPlainText: function() {
    var selection = this.get('selection');
    return SC.none(selection) ? '': selection.toString();
  }.property('selection').cacheable(),

  _selectionIsSomething: function(key, val, something) {
    var editor = this._document;
    if (!editor) return NO;

    if (val !== undefined) {
      if (editor.execCommand(something, false, val)) {
        this.set('isEditing', YES);
      }
    }

    return editor.queryCommandState(something);
  },

  selectionIsBold: function(key, val) {
    return this._selectionIsSomething(key, val, 'bold');
  }.property('selection').cacheable(),

  selectionIsItalicized: function(key, val) {
    return this._selectionIsSomething(key, val, 'italic');
  }.property('selection').cacheable(),

  selectionIsUnderlined: function(key, val) {
    return this._selectionIsSomething(key, val, 'underline');
  }.property('selection').cacheable(),

  selectionIsStrikedThrough: function(key, val) {
    return this._selectionIsSomething(key, val, 'strikeThrough');
  }.property('selection').cacheable(),

  _selectionIsJustified: function(key, val, justify) {
    var doc = this._document, e = null;
    if (!doc) return NO;

    if (val !== undefined) {
      if (SC.browser.msie) {
        this._alignContentForIE(justify);
      } else {
        doc.execCommand(justify, false, val);
      }
      // since DOM is significantly altered, selection needs to be refreshed
      this.querySelection();
      this.set('isEditing', YES);
    }
    // [JS]: Firefox throws exception if this is called while the iframe is hidden
    // this happens when transitioning from full to regular edit in dynamic content
    // and sometimes when transitioning from src view to content-editable view in the other editors
    try {
      return doc.queryCommandState(justify);
    } catch (e) {
      return NO;
    }
  },

  selectionIsCenterJustified: function(key, val) {
    this._selectionIsJustified(key, val, 'justifycenter');
  }.property('selection').cacheable(),

  selectionIsRightJustified: function(key, val) {
    this._selectionIsJustified(key, val, 'justifyright');
  }.property('selection').cacheable(),

  selectionIsLeftJustified: function(key, val) {
    this._selectionIsJustified(key, val, 'justifyleft');
  }.property('selection').cacheable(),

  selectionIsFullJustified: function(key, val) {
    this._selectionIsJustified(key, val, 'justifyfull');
  }.property('selection').cacheable(),

  // TODO: [JS] - Clean some of this code up
  _alignContentForIE: function(justify) {
    var doc = this._document;
    var elem = this._getSelectedElement();
    var range = doc.selection.createRange();
    var html, newHTML;
    var alignment;
    switch (justify) {
    case 'justifycenter':
      alignment = 'center';
      break;
    case 'justifyleft':
      alignment = 'left';
      break;
    case 'justifyright':
      alignment = 'right';
      break;
    case 'justifyfull':
      alignment = 'justify';
      break;
    }

    // if it's an image, use the native execcommand for alignment for consistent
    // behaviour with FF
    if (elem.nodeName === 'IMG') {
      doc.execCommand(justify, false, null);
    } else if (elem.nodeName !== 'DIV' || elem.innerText !== range.text) {
      html = range.htmlText;
      newHTML = '<div align="%@" style="text-align: %@">%@</div>'.fmt(alignment, alignment, html);
      range.pasteHTML(newHTML);
    } else {
      elem.style.textAlign = alignment;
      elem.align = alignment;
    }
  },

  selectionIsOrderedList: function(key, val) {
    var doc = this._document;
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
    var doc = this._document;
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
    var doc = this._document;
    var range = this._iframe.document.selection.createRange();
    var text = range.text;
    var textArray = text.split('\n');
    var elem = this._getSelectedElement();

    if (elem.nodeName === 'LI') {
      elem = elem.parentNode;
    }

    if (elem.nodeName === 'OL' || elem.nodeName === 'UL') {
      var newEl = doc.createElement(tag);
      newEl.innerHTML = elem.innerHTML;
      elem.parentNode.replaceChild(newEl, elem);
      this.querySelection();
      return;
    }

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
    var doc = this._document;
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
    var doc = this._document;
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
    return this._selectionIsSomething(key, val, 'subscript');
  }.property('selection').cacheable(),

  selectionIsSuperscript: function(key, val) {
    return this._selectionIsSomething(key, val, 'superscript');
  }.property('selection').cacheable(),

  selectionFontName: function(key, val) {
    var doc = this._document;
    if (!doc) return '';
    var ret;

    if (val !== undefined) {
      var identifier = '%@%@'.fmt(this.get('layerId'), '-ce-font-temp');

      if (doc.execCommand('fontname', false, identifier)) {
        var fontTags = doc.getElementsByTagName('font');
        for (var i = 0,
        j = fontTags.length; i < j; i++) {
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
        for (var i = 0,
        j = fontTags.length; i < j; i++) {
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
        ret = elm.style.fontSize;
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
    if (!this.get('isVisibleInWindow')) return '';

    var doc = this._document;
    if (!doc) return '';

    if (!SC.browser.msie) {
      doc.execCommand('styleWithCSS', false, true);
    }

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

    if (!SC.browser.msie) {
      doc.execCommand('styleWithCSS', false, false);
    }

    if (this._last_font_color_cache) {
      return this._last_font_color_cache;
    } else {
      var color = doc.queryCommandValue('forecolor');
      if (color) {
        this._last_font_color_cache = SC.browser.msie ? this.convertBgrToHex(color) : SC.parseColor(color);
        return this._last_font_color_cache;
      }
    }

    return '';
  }.property('selection').cacheable(),

  selectionBackgroundColor: function(key, value) {
    if (!this.get('isVisibleInWindow')) return '';

    var doc = this._document;
    if (!doc) return '';

    var prop = SC.browser.msie ? 'backcolor': 'hilitecolor';
    if (!SC.browser.msie) {
      doc.execCommand('styleWithCSS', false, true);
    }

    if (value !== undefined) {
      if (this.get('selectionSaved') === YES) {
        this.restoreSelection();
      }
      // TODO: this sets it on the whole DIV block, if the object is inside a DIV for alignment reasons
      // fix by inserting a span into the div around the div's contents, if the selection is only one div element
      // setting THAT to the selection, and then execute the command.  ick.
      // BTW, this is a BUG in FF, where the spec says it should NOT update the whole div
      // only do this on FF because WebKit gets it right.
      if (doc.execCommand(prop, false, value)) {
        this.saveSelection();
        this.set('isEditing', YES);
        this._last_background_color_cache = value;
      }
    }

    if (!SC.browser.msie) {
      doc.execCommand('styleWithCSS', false, false);
    }
    if (this._last_background_color_cache) {
      return this._last_background_color_cache;
    } else {
      var color = doc.queryCommandValue(prop);
      if (color !== 'transparent') {
        color = SC.browser.msie ? this.convertBgrToHex(color) : SC.parseColor(color);
        if (color) {
          this._last_background_color_cache = color;
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
      image.width = value * 1;
      image.style.width = value + "px";
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
      image.height = value * 1;
      image.style.height = value + "px";
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

  imageSource: function(key, value) {
    var image = this.get('selectedImage');
    if (!image) return '';

    if (value !== undefined) {
      image.src = value;
      this.set('isEditing', YES);      
      return value;

    } else {
      return image.src;

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

  focus: function() {
    if (!SC.none(this._document)) {
      this._document.body.focus();
      this.querySelection();
    }
  },

  querySelection: function() {
    var selection = this._getSelection();

    this._resetColorCache();

    // The DOM actually only has one selection object (per document) that never really changes, so
    // SproutCore's detection of whether or not the selection changed won't actually work - the object is the same
    // hence, why this code explicitly calls will and did change
    this.propertyWillChange('selection');
    this.set('selection', selection);
    this.propertyDidChange('selection');
  },

  canCreateLink: function() {
    var selectedText = this.get('selectedText');
    var rv = (selectedText && selectedText.length > 0) || !SC.none(this.get('selectedImage'));
    return rv;
  }.property('selectedText', 'selectedImage'),

  createLink: function(value) {
    var doc = this._document;
    var frame = this._iframe;
    if (! (doc && frame)) return NO;
    if (SC.none(value) || value === '') return NO;
    
    if (!this.get('selectedText').length && !this.get('selectedImage')) {
      return NO;
    }

    if (doc.execCommand('createlink', false, value)) {
      this.querySelection();
      this.set('isEditing', YES);
      return YES;
    } else {
      return NO;
    }

  },

  _removeLinkCompletely: function(doc) {
    // taken from an older DOJO's editor code
		var selection = this.get('selection');
		var selectionRange = selection.getRangeAt(0);
		var selectionStartContainer = selectionRange.startContainer;
		var selectionStartOffset = selectionRange.startOffset;
		var selectionEndContainer = selectionRange.endContainer;
		var selectionEndOffset = selectionRange.endOffset;
		
		// select our link and unlink
		var range = doc.createRange();
		var a = this._getSelectedElement();
		while (a.nodeName != "A") { a = a.parentNode; }
		range.selectNode(a);
		selection.removeAllRanges();
		selection.addRange(range);
		
		var returnValue = doc.execCommand("unlink", false, null);
		
    // restore original selection
		/*		  
		// HACK [JS] - this doesn't work when the link is around an IMG (and nothing else
    		var selectionRange = doc.createRange();
    		selectionRange.setStart(selectionStartContainer, selectionStartOffset);
    		selectionRange.setEnd(selectionEndContainer, selectionEndOffset);		
    		selection.removeAllRanges();
    		selection.addRange(selectionRange);
    */
    // right now, with that commented out, the selection will likely clear after an unlink
    // in some oddball cases, it MAY end up selecting more
		this.querySelection();
    this.set('isEditing', YES);

    return returnValue;
  },

  removeLink: function() {
    var doc = this._document;
    if (!doc) return NO;

    if (SC.browser.mozilla || SC.browser.chrome) {
      // issue - it should unlink, but it only unlinks correctly if you selected the WHOLE link
      return this._removeLinkCompletely(doc);
    }
    if (doc.execCommand('unlink', false, null)) {
      this.set('selectedHyperlink', null);
      this.set('isEditing', YES);
      return YES;
    }

    return NO;
  },

  // HACK: [MT] Should do something similar to what's being done on
  // image creation (Assigning the newly created image to the selectedImage
  // property)
  // "fixed"? [JS] if no real selection, then selection returns next element
  // so if the image is inserted after the cursor, it should be the selectedImage now
  insertImage: function(value) {
    var doc = this._document;
    if (!doc) return NO;
    if (SC.none(value) || value === '') return NO;

    if (doc.execCommand('insertimage', false, value)) {
      this.set('isEditing', YES);
      this.querySelection();
      return YES;
    }

    return NO;
  },

  /**
    Inserts a snippet of HTML into the editor at the cursor location. If the
    editor is not in focus then it appens the HTML at the end of the document.

    @param {String} HTML to be inserted
  */
  insertHTML: function(value) {
    var doc = this._document;
    if (!doc) return NO;
    if (SC.none(value) || value === '') return NO;

    if (SC.browser.msie) {
      if (!this.get('isFocused')) {
        this.focus();
      }
      doc.selection.createRange().pasteHTML(value);
      this.set('isEditing', YES);
      return YES;

    } else {
      // Firefox bug workaround - add a space so the cursor is outside of the inserted selection (field_merge) else the next user action might delete it
      value += '\u00a0';
      if (doc.execCommand('inserthtml', false, value)) {
        // Firefox bug workaround pt 2 - remove that added space
        doc.execCommand('delete', false, null);
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
    if (SC.typeOf(view) === SC.T_STRING) {
      // if nowShowing was set because the content was set directly, then
      // do nothing.
      if (view === SC.CONTENT_SET_DIRECTLY) return;

      // otherwise, if nowShowing is a non-empty string, try to find it...
      if (view && view.length > 0) {
        if (view.indexOf('.') > 0) {
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
      html = '<span contenteditable=false style="-moz-user-select: all; -webkit-user-select: all;">' + context + '</span>';
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
    html = html.replace(/\s*FONT-VARIANT: [^\s;]+;?"/gi, "\"");
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

    // remove xstr non-xml attribute in table tags
    html = html.replace(/\<(\w[^>]*) xstr([^>]*)/gi, "<$1$2");

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

    if (this.get('encodeNewLine')) {
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

    @returns {Boolean} if the operation was successful or not
  */
  selectContent: function() {
    var doc = this._document,
    rv;
    if (!doc) return NO;
    rv = doc.execCommand('selectall', false, null);
    if (rv) {
      this.querySelection();
    }
    return rv;
  },

  _findAncestor: function(o, tag) {
    for (tag = tag.toLowerCase(); o = o.parentNode;)
    if (o.tagName && o.tagName.toLowerCase() === tag) {
      return o;
    }
    return null;
  },

  /**
    Adding an observer that checks if the current selection is an image
    or within a hyperlink.
  */
  selectionDidChange: function() {

    //SC.Logger.warn('selectionDidChange');

    var node, range, currentImage = null,
    currentHyperlink = null,
    currentText = '',
    selection = this.get('selection');
    if (SC.none(selection)) {
      this.set('selectedImage', currentImage);
      this.set('selectedHyperlink', currentHyperlink);
      this.set('selectedText', currentText);
      return;
    }
    range = this.get('selectionRange');
    
    /*
    
    The quest for the selected hyperlink is a nasty one, all based on whether or not you just created the link, because
    it manipulates the selection range in different ways depending on what was selected.
    
    If you only selected an image, the IMG is the node unless it is wrapped in an A, in which case the A is the node and you have
    to look for its child to get the image.
    
    If you selected a range of text, then several different things are possible
    * if you did not just create a link, then you are in a text node and the link is
    ** the range's common ancestor
    ** or an ancestor of it
    
    * if you DID just create a link, the range may be
    ** the start/end container (this is what it usually is on Chrome/Webkit)
    ** the one and only object between the start and end nodes - (beginning and middle of a line) this was REALLY tricky
    *** it happens to be the next node of the start (which is the previous text block or node)
    *** and an ancestor of the end (which is itself the actual content inside the link)
    *** but ONLY if those two are the same.  otherwise, it'll likely be one of the above cases
    ** the previous child to a <BR> tag if the BR tag is at the end of the selection
    
    * TODO [JS] still to test/fix:
    ** fix link colors (handle with fixing the rest of the firefox color problems)

    BTW if a link failure happened (create link when you shouldn't have, as in there's no text selected or the browser thought there wasn't)
    that is a MAJOR KISS YOUR ASS GOODBYE BUG - the content editable ceases to react properly, and selections are just hosed from that point on.

    * TODO [JS] fix image border when image is inside link
    when an image is inside a link, the border needs to be set to 0.  
    HOWEVER, when the border is set to 0, you can't change it to 0 (SC doesn't detect a change)
    Workaround set the border to 1, then to 0, and it goes away.

    */
    if (SC.browser.msie) {
      // [JS] I'm concerned that this doesn't do "the right thing", but we're not focusing on IE in great detail yet.
      if (range.length === 1) node = range.item();
      if (range.parentElement) node = range.parentElement();
      currentHyperlink = this._findAncestor(node, 'A');

    } else {
      // TODO [JS]: remove all logging statements when i'm finally sure it is all working right
      /*
      SC.Logger.log(range.startContainer);
      SC.Logger.log(range.startOffset);
      SC.Logger.log(range.endContainer);
      SC.Logger.log(range.endOffset);
      
      SC.Logger.log(range.startContainer.childNodes[range.startOffset]);
      SC.Logger.log(range.endContainer.childNodes[range.endOffset]);
      */
      node = range.startContainer.childNodes[range.startOffset];
      if (!node && (range.startContainer === range.endContainer)) {
        node = range.startContainer;
      }
      // this situation happens when in the beginning and middle of a line
      // startContainer is modified to being the text node BEFORE the link
      // endContainer is the deepest textnode at the end of the selection, so you need to climb up it to find the 'A' 
      if (!node && (range.startContainer.nextSibling === this._findAncestor(range.endContainer, 'A'))) {
        node = range.startContainer.nextSibling;
      }
      // this situation happens when at the END of a line, in front of the BR tag
      // endContainer is the BODY, endContainer's offset child is the BR tag, the previous sibling from that is your 'A'
      // also works for end of the document, where there's an implicit BR created automatically for you
      // fortunately, this works even if the selected range was styled, because the a tag went around the styles
      if (!node && (range.endContainer.childNodes[range.endOffset] && range.endContainer.childNodes[range.endOffset].previousSibling.tagName === 'A')) {
        node = range.endContainer.childNodes[range.endOffset].previousSibling;
      }
    }

    if (node) {
      //SC.Logger.log("node " + node);
      currentImage = node.nodeName === 'IMG' ? node: null;
      currentHyperlink = node.nodeName === 'A' ? node : this._findAncestor(node, 'A');
      
      // immediately after a selection & link of an IMG, the A tag becomes the node so we have to dig to find the IMG
      if (currentHyperlink && currentHyperlink.childNodes.length === 1) {
        currentImage = currentHyperlink.firstChild.nodeName === 'IMG' ? currentHyperlink.firstChild : null;
      }
    } else {
      //SC.Logger.log("commonAncestor " + range.commonAncestorContainer);
      currentHyperlink = range.commonAncestorContainer.nodeName === 'A' ? range.commonAncestorContainer : this._findAncestor(range.commonAncestorContainer, 'A');
    }

    try {
      currentText = selection.toString();
    } catch (e) {
      SC.Logger.dir(e);
    }
    
    //SC.Logger.log(currentImage);
    //SC.Logger.log(currentHyperlink);
    //SC.Logger.log(currentText);
    
    this.set('selectedImage', currentImage);
    this.set('selectedHyperlink', currentHyperlink);
    this.set('selectedText', currentText);
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
    layout = SC.merge(layout, {
      width: width,
      height: height
    });
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
      layout = SC.merge(layout, {
        width: width,
        height: height
      });

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
    var frame = this._getFrame();
    if (SC.none(frame)) return null;

    var selection;
    if (SC.browser.msie) {
      selection = this._getDocument().selection;
    } else if(frame.contentWindow){
      selection = frame.contentWindow.getSelection();
    }
    return selection;
  },

  _encodeValues: function(html) {
    var hrefs = html.match(/href=".*?"/gi);
    if (hrefs) {
      var href, decodedHref;

      for (var i = 0,
      j = hrefs.length; i < j; i++) {
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
    var sel = this.get('selection'),
    range = this.get('selectionRange'),
    elm;
    var doc = this._document;

    if (range) {
      if (SC.browser.msie) {
        elm = range.item ? range.item(0) : range.parentElement();
      } else {
        if (sel.anchorNode && (sel.anchorNode.nodeType === 3)) {
          if (sel.anchorNode.parentNode) {
            //next check parentNode
            elm = sel.anchorNode.parentNode;
          }
          if (sel.anchorNode.nextSibling !== sel.focusNode.nextSibling) {
            elm = sel.anchorNode.nextSibling;
          }
        }

        if (!elm) {
          elm = range.commonAncestorContainer;

          if (!range.collapsed) {
            if (range.startContainer === range.endContainer) {
              if (range.startOffset - range.endOffset < 2) {
                if (range.startContainer.hasChildNodes()) {
                  elm = range.startContainer.childNodes[range.startOffset];
                }
              }
            }
          }
        }
      }
      return elm;
    }
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
  },

  convertBgrToHex: function(value) {
    value = ((value & 0x0000ff) << 16) | (value & 0x00ff00) | ((value & 0xff0000) >>> 16);
    value = value.toString(16);
    return "#000000".slice(0, 7 - value.length) + value;
  }

});
