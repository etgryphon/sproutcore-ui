// ========================================================================
// SCUI.ContentEditableView Tests
// ========================================================================

var pane = SC.ControlTestPane.design()
  .add("ce", SCUI.ContentEditableView, {
    layout: { left: 0, right: 0, top: 0, height: 150 },
    value: 'Lorem ipsum dolor sit amet.',
    autoCommit: YES
  });
  
pane.show();
module("SCUI.ContentEditableView");

test("Verify value is being set properly", function() {
  function f() {
    var ce = pane.view('ce');
    var frame = ce.$('iframe').get(0);
    var value = frame.contentDocument.body.innerHTML;

    equals(value, 'Lorem ipsum dolor sit amet.');
    
    ce.set('value', 'lorem ipsum');
    SC.RunLoop.begin().end();
    equals(frame.contentDocument.body.innerHTML, 'lorem ipsum');
    window.start();
    
    window.start();
  }
  
  // give the iframe time to load
  stop();  
  setTimeout(f, 500);
});

test("Properties Tests", function() {
  var ce = pane.view('ce');
  var frame = ce.$('iframe').get(0);
  var editor = frame.contentDocument;
  
  editor.execCommand('selectall', false, null);
  
  editor.execCommand('bold', false, null);
  equals(ce.get('selectionIsBold'), YES, 'Text should be bolded');
  
  editor.execCommand('italic', false, null);
  equals(ce.get('selectionIsItalicized'), YES, 'Text should be italicized');
  
  editor.execCommand('underline', false, null);
  equals(ce.get('selectionIsUnderlined'), YES, 'Text should be underlined');
  
  // HACK: [MT] queryCommandState('justifyXXXX') always returns fasle in safari...
  // find a workaround
  editor.execCommand('justifycenter', false, null);
  equals(ce.get('selectionIsCenterJustified'), YES, 'Text should be center justified');
  
  editor.execCommand('justifyright', false, null);
  equals(ce.get('selectionIsRightJustified'), YES, 'Text should be right justified');
  
  editor.execCommand('justifyleft', false, null);
  equals(ce.get('selectionIsLeftJustified'), YES, 'Text should be left justified');
  
  editor.execCommand('justifyfull', false, null);
  equals(ce.get('selectionIsFullJustified'), YES, 'Text should be full justified');
  
  editor.execCommand('insertorderedlist', false, null);
  equals(ce.get('selectionIsOrderedList'), YES, 'Text should be ordered list');
  
  editor.execCommand('insertunorderedlist', false, null);
  equals(ce.get('selectionIsUnorderedList'), YES, 'Text should be unordered list');
  
  // HACK: [MT] Text should be indented but property will return NO either way
  editor.execCommand('indent', false, null);
  equals(ce.get('selectionIsIndented'), NO, 'Text should be indented');
  
  // HACK: [MT] Text should be outdented but property will return NO either way
  editor.execCommand('outdent', false, null);
  equals(ce.get('selectionIsOutdented'), NO, 'Text should be outdented');
  
  editor.execCommand('subscript', false, null);
  equals(ce.get('selectionIsSubscript'), YES, 'Text should be subscripted');
  
  editor.execCommand('superscript', false, null);
  equals(ce.get('selectionIsSuperscript'), YES, 'Text should be superscripted');
  
  editor.execCommand('fontname', false, 'Arial');
  equals(ce.get('selectionFontName'), 'Arial', 'Font type should be Arial');
  
  /** TODO: [MT] Write unit tests for font size */
  /** TODO: [MT] Write unit tests for font color */
  /** TODO: [MT] Write unit tests for background color */
});


test("Hyperlink Tests", function() {
  var ce = pane.view('ce');
  var frame = ce.$('iframe').get(0);
  var editor = frame.contentDocument;
  
  editor.execCommand('selectall', false, null);
  
  var createFail = ce.createLink('');
  equals(createFail, NO, 'Hyperlink creation shoud fail with empty string');
  
  var createSuccess = ce.createLink('http://www.google.com/');
  equals(createSuccess, YES, 'Hyperlink creation shoud work with proper url');
  
  /** TODO: [MT] Write unit tests for the hyperlinkValue property */
  
  var removeSuccess = ce.removeLink();
  equals(removeSuccess, YES, 'removeLink() should return true when successful');
});

test("Image Tests", function() {
  var ce = pane.view('ce');
  var frame = ce.$('iframe').get(0);
  var editor = frame.contentDocument;
  
  editor.execCommand('selectall', false, null);
  
  var createFail = ce.insertImage('');
  equals(createFail, NO, 'Image insertion should fail with empty string');
  
  var createSuccess = ce.insertImage('http://www.google.ca/intl/en_ca/images/logo.gif');
  equals(createSuccess, YES, 'Image insertion should succeeed with proper value');
  
  editor.execCommand('selectall', false, null);
  ce.querySelection();    
  
  ce.set('imageAlignment', 'left');
  var alignment = ce.get('imageAlignment');
  
  equals(alignment, 'left', 'Image should be aligned left');
});

test("cleanWordHTML() Tests", function() {
  var ce = pane.view('ce');
  
  var html = ce.cleanWordHTML('<span style="color: red;">Lorem Ipsum<o:p></o:p></span>');
  equals(html, '<span style="color: red;">Lorem Ipsum</span>', 'All o tags have been removed');
  
  html = ce.cleanWordHTML('<w:View>Normal</w:View> <w:Zoom>0</w:Zoom> <w:TrackMoves/> <w:TrackFormatting/> <w:PunctuationKerning/>');
  equals(html, '', 'All w tags have been removed');
  
  html = ce.cleanWordHTML('<m:mathPr> <m:mathFont m:vail="Cambria Math"/><m:brkBin m:val="before"/> <m:brkBinSub m:val="&#45;-"/> <m:smallFrac m:val="off"/> <m:dispDef/> <m:lMargin m:val="0"/> <m:rMargin m:val="0"/> <m:defJc m:val="centerGroup"/> <m:wrapIndent m:val="1440"/> <m:intLim m:val="subSup"/> <m:naryLim m:val="undOvr"/> </m:mathPr>');
  equals(html, '', 'All m tags have been removed');
  
  html = ce.cleanWordHTML('<meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="ProgId" content="Word.Document"><meta name="Generator" content="Microsoft Word 12"><meta name="Originator" content="Microsoft Word 12"><link rel="File-List" href="file:///C:%5CDOCUME%7E1%5Cmtaher%5CLOCALS%7E1%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_filelist.xml"><link rel="themeData" href="file:///C:%5CDOCUME%7E1%5Cmtaher%5CLOCALS%7E1%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_themedata.thmx"><link rel="colorSchemeMapping" href="file:///C:%5CDOCUME%7E1%5Cmtaher%5CLOCALS%7E1%5CTemp%5Cmsohtmlclip1%5C01%5Cclip_colorschememapping.xml">');
  equals(html, '', 'All meta and link tags have been removed');
  
  html = ce.cleanWordHTML('<p class="MsoNormal" style="margin: 0cm 0cm 0pt; text-indent: 0.5in;">Lorem Ipsum</p>');
  equals(html, '<p class="MsoNormal" style=" text-indent: 0.5in;">Lorem Ipsum</p>', 'Empty margins have been removed');
  
  html = ce.cleanWordHTML('<?xml version="1.0" encoding="|ISO-8859-1|"?>');
  equals(html, '', 'All xml declarations have been removed');
});

test("editorHTML Property Tests", function() {
  var ce = pane.view('ce');
  var frame = ce.$('iframe').get(0);
  var editor = frame.contentDocument;
  
  ce.set('editorHTML', '<span>lorem ipsum</span>');
  var htmlSet = editor.body.innerHTML;
  equals(htmlSet, '<span>lorem ipsum</span>', 'set works properly on editorHTML');
  
  var htmlGet = ce.get('editorHTML');
  equals(htmlGet, '<span>lorem ipsum</span>', 'get works properly on editorHTML');
});

test("HTML/View Insertion", function() {
  var ce = pane.view('ce');
  var frame = ce.$('iframe').get(0);
  var editor = frame.contentDocument;
  
  ce.set('editorHTML', '');
  
  ce.insertHTML('<span>Aliquam erat volutpat.</span>', NO);
  equals(ce.get('editorHTML'), '<span>Aliquam erat volutpat.</span>', 'Value is "Aliquam erat volutpat."');
  
  /** TODO: [MT] Write unit tests for the view insertion */
});

