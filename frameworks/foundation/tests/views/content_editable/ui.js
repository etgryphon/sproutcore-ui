// ========================================================================
// SCUI.ContentEditableView Tests
// ========================================================================

/* Test SCUI.ContentEditableView */

var pane = SC.ControlTestPane.design()

  .add("text", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    frameName: 'TextFrame'
  })
  
  .add("text,bold", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    frameName: 'TextBoldFrame'
  })
  
  .add("text,italic", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    frameName: 'TextItalicFrame'
  })
  
  .add("text,underlined", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    frameName: 'TextUnderlinedFrame'
  })
  
  .add("text,justifiedleft", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    frameName: 'TextJustifyLeftFrame'
  })
  
  .add("text,justifiedcenter", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    frameName: 'TextJustifyCenterFrame'
  })
  
  .add("text,justifiedright", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    frameName: 'TextJustifyRightFrame'
  })  
  
  .add("text,justifiedfull", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam adipiscing' +
    'urna eget quam suscipit ut semper turpis consectetur.',
    frameName: 'TextJustifyFullFrame'
  })
  
  .add("text,orderedlist", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    frameName: 'TextOrderedListFrame'
  })
  
  .add("text,unorderedist", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    frameName: 'TextUnorderedListFrame'
  })
  
  .add("text,subscript", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    frameName: 'TextSubscriptFrame'
  })
  
  .add("text,superscript", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    frameName: 'TextSuperscriptFrame'
  })
  
  .add("text,fontname", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    frameName: 'TextFontNameFrame'
  })
  
  .add("text,fontsize", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    frameName: 'TextFontSizeName'
  })
  
  .add("image", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    frameName: 'ImageFrame'
  })
    
  .add("hyperlink", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: 'Google link',
    frameName: 'HyperlinkFrame'
  })   
  
  .add("hyperlink,value", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: '<a href="http://www.google.com">Link with changing href</a>',
    frameName: 'HyperlinkValueFrame'
  })
  
  .add("hyperlink,value,remove", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: '<a href="http://www.google.com">Started as a link, ended as text</a>',
    frameName: 'HyperlinkValueRemoveFrame'
  })
  
  .add("image,align", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: '<img src="http://www.google.ca/intl/en_ca/images/logo.gif">',
    frameName: 'ImageAlignFrame'
  })
  
  .add("cleanword", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    frameName: 'CleanWordFrame'
  })
  
  .add("get,set,save", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    frameName: 'HelperMethodsFrame'
  })
  
  .add("inlinestyles", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    frameName: 'InlineStylesFrame'
  })
  
  .add("viewinsertion", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 50 },
    value: 'lorem ipsum',
    frameName: 'ViewInsertionFrame'
  });
  
pane.show();

module("SCUI.ContentEditableView");

test("Check text content of editor is set correctly", function() {
  
  function f() {
    var webView = pane.view('text');
    var editor = webView.$('iframe')[0].contentDocument;
    var textContent = editor.body.innerHTML;

    equals(textContent, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Text is set correctly');
    window.start();
  }  
  
  stop();  
  setTimeout(f, 500);
});

test("Check that text content of editor is bold", function() {
    
  var webView = pane.view('text,bold');  
  var editor = webView.$('iframe')[0].contentDocument;
  editor.execCommand('selectall', false, null);    

  webView.set('selectionIsBold', null);
  var val = webView.get('selectionIsBold');
  
  equals(val, true, 'Text content of iframe is bold');
});

test("Check that text content of editor is bold", function() {

  var webView = pane.view('text,italic');  
  var editor = webView.$('iframe')[0].contentDocument;

  editor.execCommand('selectall', false, null);    
  editor.execCommand('italic', false, null);
  var val = editor.queryCommandState('italic');
  equals(val, true, 'Text content of iframe is italic');
});

test("Check that text content of editor is underlined", function() {

  var webView = pane.view('text,underlined');  
  var editor = webView.$('iframe')[0].contentDocument;
  editor.execCommand('selectall', false, null);
  
  webView.set('selectionIsUnderlined', null);
  var val = webView.get('selectionIsUnderlined');
  
  equals(val, true, 'Text content of iframe is underlined');
});

test("Check that text content of editor is justified left", function() {
  
  var webView = pane.view('text,justifiedleft');  
  var editor = webView.$('iframe')[0].contentDocument;
  editor.execCommand('selectall', false, null);   
  
  webView.set('selectionIsJustifiedLeft', null);
  var val = webView.get('selectionIsJustifiedLeft'); 
  
  equals(val, true, 'Text content of iframe is justified left');
});

test("Check that text content of editor is justified center", function() {

  var webView = pane.view('text,justifiedcenter');  
  var editor = webView.$('iframe')[0].contentDocument;
  editor.execCommand('selectall', false, null);    
  
  webView.set('selectionIsJustifiedCenter', null);
  var val = webView.get('selectionIsJustifiedCenter');
  
  equals(val, true, 'Text content of iframe is justified center');
});

test("Check that text content of editor is justified right", function() {

  var webView = pane.view('text,justifiedright');  
  var editor = webView.$('iframe')[0].contentDocument;
  editor.execCommand('selectall', false, null);    
  
  webView.set('selectionIsJustifiedRight', null);
  var val = webView.get('selectionIsJustifiedRight');
  
  equals(val, true, 'Text content of iframe is justified right');
});

test("Check that text content of editor is justified full", function() {

  var webView = pane.view('text,justifiedfull');  
  var editor = webView.$('iframe')[0].contentDocument;
  editor.execCommand('selectall', false, null);    
  
  webView.set('selectionIsJustifiedFull', null);
  var val = webView.get('selectionIsJustifiedFull');    
  
  equals(val, true, 'Text content of iframe is justified full');
});

test("Check that text content of editor is an ordered list", function() {

  var webView = pane.view('text,orderedlist');  
  var editor = webView.$('iframe')[0].contentDocument;
  editor.execCommand('selectall', false, null);    
  
  webView.set('selectionIsOrderedList', null);
  var val = webView.get('selectionIsOrderedList');
  
  equals(val, true, 'Text content of iframe is an ordered list'); 
});


test("Check that text content of editor is an unordered list", function() {

  var webView = pane.view('text,unorderedist');  
  var editor = webView.$('iframe')[0].contentDocument;
  editor.execCommand('selectall', false, null);    

  webView.set('selectionIsUnorderedList', null);
  var val = webView.get('selectionIsUnorderedList');

  equals(val, true, 'Text content of iframe is an unordered list'); 
});

test("Check that text content of editor is subscript", function() {

  var webView = pane.view('text,subscript');  
  var editor = webView.$('iframe')[0].contentDocument;    
  editor.execCommand('selectall', false, null);    
  
  webView.set('selectionIsSubscript', null);
  var val = webView.get('selectionIsSubscript');
  
  equals(val, true, 'Text content of iframe is subscript');
});

test("Check that text content of editor is superscript", function() {

  var webView = pane.view('text,superscript');  
  var editor = webView.$('iframe')[0].contentDocument;
  editor.execCommand('selectall', false, null);    
  
  webView.set('selectionIsSuperscript', null);
  var val = webView.get('selectionIsSuperscript');
  
  equals(val, true, 'Text content of iframe is superscript');
});


test("Check that text content of editor has font Verdana", function() {
  
  var webView = pane.view('text,fontname');  
  var editor = webView.$('iframe')[0].contentDocument;
  editor.execCommand('selectall', false, null);    
  
  webView.set('selectionFontName', 'verdana');
  var val = webView.get('selectionFontName').toLowerCase();
  
  equals(val, 'verdana', 'Text content font name is verdana');
});

test("Check that text content of editor has size 4", function() {

  var webView = pane.view('text,fontsize');  
  var editor = webView.$('iframe')[0].contentDocument;
  editor.execCommand('selectall', false, null);    
  
  webView.set('selectionFontSize', 4);
  var val = webView.get('selectionFontSize');
  
  equals(val, '4', 'Text content size is 4');
});


test("Check that image insertion works", function() {
  
  var webView = pane.view('image');  
  var editor = webView.$('iframe')[0].contentDocument;
  editor.execCommand('selectall', false, null);   
  
  webView.selectionInsertImage('http://www.google.ca/intl/en_ca/images/logo.gif');
  
  var nodeName = editor.body.childNodes[0].nodeName;

  equals(nodeName, 'IMG', 'Contnet of editor is an image');
});

test("Check that hyperlink insertion and URL setting works", function() {
  
  var webView = pane.view('hyperlink');  
  var editor = webView.$('iframe')[0].contentDocument;
  editor.execCommand('selectall', false, null);  
  
  webView.selectionCreateLink('http://www.google.com');
  
  var nodeName = editor.body.childNodes[0].nodeName;
  var href = editor.body.childNodes[0].href;

  equals(nodeName, 'A', 'Contnet of editor is a hyperlink');
  equals(href, 'http://www.google.com/', 'Hyperlink href value is http://www.google.com/');
});

test("Check that changing the value of the selected hyperlink works", function() {
  
  var webView = pane.view('hyperlink,value');  
  var editor = webView.$('iframe')[0].contentDocument;
  editor.execCommand('selectall', false, null);    

  webView.querySelection();    
  webView.set('hyperlinkValue', 'http://www.eloqua.com');
  
  var nodeName = '', href = '';
  nodeName = editor.body.childNodes[0].nodeName;
  href = editor.body.childNodes[0].href;
  
  equals(nodeName, 'A', 'Contnet of editor is a hyperlink');
  equals(href, 'http://www.eloqua.com/', 'Hyperlink href value is http://www.eloqua.com/');
});



test("Check that removing a hyperlink works", function() {
  
  var webView = pane.view('hyperlink,value,remove');  
  var editor = webView.$('iframe')[0].contentDocument;
  editor.execCommand('selectall', false, null);        

  webView.selectionRemoveLink();
  
  var nodeName = editor.body.childNodes[0].nodeName;
  var href = editor.body.childNodes[0].href;

  equals(nodeName, '#text', 'Contnet of editor is text');
});

test("Check that changing image alignment works", function() {
  
  var webView = pane.view('image,align');  
  var editor = webView.$('iframe')[0].contentDocument;
  editor.execCommand('selectall', false, null);        

  webView.querySelection();    
  
  webView.set('imageAlignment', 'left');
  var val = webView.get('imageAlignment');
  
  equals(val, 'left', 'Image is aligned left');
});

test("Check that cleanWordHTML function correctly removes all word tags", function() {

  var webView = pane.view('cleanword');  
  
  var html = webView.cleanWordHTML('<span style="color: red;">Lorem Ipsum<o:p></o:p></span>');
  equals(html, '<span style="color: red;">Lorem Ipsum</span>', 'All o tags have been removed');
  
  html = webView.cleanWordHTML('<w:View>Normal</w:View> <w:Zoom>0</w:Zoom> <w:TrackMoves/> <w:TrackFormatting/> <w:PunctuationKerning/>');
  equals(html, '', 'All w tags have been removed');
  
  html = webView.cleanWordHTML('<m:mathPr> <m:mathFont m:vail="Cambria Math"/><m:brkBin m:val="before"/> <m:brkBinSub m:val="&#45;-"/> <m:smallFrac m:val="off"/> <m:dispDef/> <m:lMargin m:val="0"/> <m:rMargin m:val="0"/> <m:defJc m:val="centerGroup"/> <m:wrapIndent m:val="1440"/> <m:intLim m:val="subSup"/> <m:naryLim m:val="undOvr"/> </m:mathPr>');
  equals(html, '', 'All m tags have been removed');
  
  html = webView.cleanWordHTML('<meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="ProgId" content="Word.Document"><meta name="Generator" content="Microsoft Word 12"><meta name="Originator" content="Microsoft Word 12"><link rel="File-List" href="file:///C:%5CDOCUME%7E1%5Cmtaher%5CLOCALS%7E1%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_filelist.xml"><link rel="themeData" href="file:///C:%5CDOCUME%7E1%5Cmtaher%5CLOCALS%7E1%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_themedata.thmx"><link rel="colorSchemeMapping" href="file:///C:%5CDOCUME%7E1%5Cmtaher%5CLOCALS%7E1%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_colorschememapping.xml">');
  equals(html, '', 'All meta and link tags have been removed');
  
  html = webView.cleanWordHTML('<p class="MsoNormal" style="margin: 0cm 0cm 0pt; text-indent: 0.5in;">Lorem Ipsum</p>');
  equals(html, '<p class="MsoNormal" style=" text-indent: 0.5in;">Lorem Ipsum</p>', 'Empty margins have been removed');
  
  html = webView.cleanWordHTML('<?xml version="1.0" encoding="|ISO-8859-1|"?>');
  equals(html, '', 'All xml declarations have been removed');

});

test("Check that the get, set and save unctions are working correctly", function() {

  var webView = pane.view('get,set,save');  
  var html = webView.getEditorHTML();
  
  equals(html, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'getHTML correct returns editor\'s html content');
  
  webView.setEditorHTML('<span>Proin ut nibh nec ante tristique ultricies</span>');
  html = webView.getEditorHTML();
  
  equals(html.toLowerCase(), '<span>Proin ut nibh nec ante tristique ultricies</span>'.toLowerCase(), 'setHTML is correctly setting the editor\'s HTML content');
  
  webView.saveHTML();
  var value = webView.get('value');
  
  equals(value.toLowerCase(), '<span>Proin ut nibh nec ante tristique ultricies</span>'.toLowerCase(), 'saveHTML is correctly saving the content of the editor');
});

test("Check that the inline styles are being set correctly", function() {
  
  // pass object with dashed keys
  var styles = {
    'color': 'blue',
    'background-color': 'red'
  };
  
  var webView = pane.view('inlinestyles');  
  webView.setFrameInlineStyle(styles);
  
  var style = webView.$('iframe')[0].contentDocument.body.style;

  var color = style.color;
  var backgroundColor = style.backgroundColor;

  equals(color, 'blue', 'dashed keys - font color is blue');
  equals(backgroundColor, 'red', 'dashed keys - background color is red');

  // pass object with dashed keys
  styles = {
    'color': 'green',
    'backgroundColor': 'orange'
  };
  
  webView.setFrameInlineStyle(styles);

  color = style.color;
  backgroundColor = style.backgroundColor;

  equals(color, 'green', 'camelized keys - font color is green');
  equals(backgroundColor, 'orange', 'camelized keys - background color is orange');

});

test("Check that SC view insertion works correctly", function() {
  
  var view = SC.LabelView.design({
    value: 'lorem ipsum'
  });
  
  var webView = pane.view('viewinsertion');  
  var editor = webView.$('iframe')[0].contentDocument;
  // editor.execCommand('selectall', false, null);
  
  webView.selectionInsertView(view);
  var frameHTML = webView.getEditorHTML();
  
  // removing the SC generated id for easier comparison
  frameHTML = frameHTML.replace(/id="sc\d*?"\s/gi, '');
  
  var viewHTML = 'lorem ipsum<span style=\"-moz-user-select: all;\" contenteditable=\"false\"><span class="sc-view sc-label-view sc-regular-size" style="left: 0px; right: 0px; top: 0px; bottom: 0px; text-align: left; font-weight: normal;">lorem ipsum</span></span>';
  
  equals(frameHTML, viewHTML, 'view class insertion works');
  
});


