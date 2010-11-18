// ========================================================================
// SCUI.UploadView
// ========================================================================

/** @class

  A simple view that allows the user to upload a file to a specific service.
  
  @extends SC.View
  @author Mohammed Taher
  @author Evin Grano
*/

SCUI.UploadView = SC.View.extend(
/** @scope Scui.Upload.prototype */ {
  
  /**
    Read-only value of the current selected file. In IE, this will include
    the full path whereas with all other browsers, it will only be the name of 
    the file. If no file is selected, this will be set to null.
  */
  value: null,
  
  /**
    URI of service/page the file is being uploaded to
  */
  uploadTarget: null,
  
  /**
    A read-only status of the current upload. Can be one of 3 values,
      1. 'READY'
      2. 'BUSY'
      3. 'DONE'
  */
  status: '',
  
  /**
    The value that will be assigned to the name attribute of the input
  */
  inputName: "Filedata",

  /**
    An instance of an SC.Request object to use as a prototype.  If degradeList says use xhr, this property will be the request object to use, unless it is null.
  */
  requestPrototype: SC.Request,

  /**
    Array containing the upload approaches and the order in which to attempt them.  webkit based browsers will use xhr unless requestPrototype is set to null.
  */
  degradeList: ['xhr', 'iframe'],

  /**
    The server return value from the upload.  Will be set to null as the upload is started.
  */
  serverResponse: null,

  displayProperties: 'uploadTarget'.w(),
  
  /*
    If set to a value, then the view will attempt to use the CSS rule to style 
    the input=file. The CSS rule needs to define a,
      - width (pixels)
      - height (pixels)
      - background image
  */
  cssImageClass: null,

  render: function(context, firstTime) {
    var frameId = this.get('layerId') + 'Frame';
    var uploadTarget = this.get('uploadTarget');
    var label = this.get('label');
    var inputName = this.get('inputName');
    var cssImageClass = this.get('cssImageClass');
    
    if (firstTime) {
      // This hack is needed because the iframe onload event fires twice in IE, when the
      // view is first created and after the upload is done. Since I'm using the onload
      // event to signal when the upload is done, I want to suppress its action the first
      // time around
      this._firstTime = YES;
      
      if (cssImageClass) {
        context .begin('form')
                  .attr('method', 'post')
                  .attr('enctype', 'multipart/form-data')
                  .attr('action', uploadTarget)
                  .attr('target', frameId)
        
                  .begin('label')
                    .setClass(cssImageClass, YES)
                    .styles({ 'display': 'block',
                              'cursor': 'pointer',
                              'overflow': 'hidden'  })
        
                    .begin('input')
                      .attr('type', 'file')
                      .attr('name', inputName)
                      .styles({ 'position': 'relative',
                                'height': '100%',
                                'width': 'auto',
                                'opacity': '0',
                                '-moz-opacity': '0',
                                'filter': 'progid:DXImageTransform.Microsoft.Alpha(opacity=0)' })
        
                    .end()
                  .end()
                .end();
        // WebKit will load iframe with "/" if it is not supplied a src or any content, so better just not create it
        // avoids triggering onload as well, which was causing OR-8266
        if (!((SC.browser.safari || SC.browser.chrome) && this.get('requestPrototype'))) {
          context.begin('iframe')
                .attr('frameBorder', 0)
                .attr('src', '#')
                .attr('id', frameId)
                .attr('name', frameId)
                .styles({ 'width': 0, 'height': 0 })
              .end();
        }
      } else {
        context .begin('form')
                  .attr('method', 'post')
                  .attr('enctype', 'multipart/form-data')
                  .attr('action', uploadTarget)
                  .attr('target', frameId)
        
                  .begin('input')
                    .attr('type', 'file')
                    .attr('name', inputName)
                  .end()
                .end();
        // qv comment above
        if (!((SC.browser.safari || SC.browser.chrome) && this.get('requestPrototype'))) {
          context.begin('iframe')
                  .attr('frameBorder', 0)
                  .attr('src', '#')
                  .attr('id', frameId)
                  .attr('name', frameId)
                  .styles({ 'width': 0, 'height': 0 })
                .end();
        }
      }
      
    } else {
      var f = this._getForm();
      if (f) f.action = uploadTarget;
    }
    sc_super();
  },
  
  mouseMoved: function(evt) {
    if (evt.target.nodeName === 'LABEL') {
      var ox = 0;
      var oy = 0;
      var elem = evt.target;
      
      if (elem.offsetParent) {
        ox = elem.offsetLeft;
        oy = elem.offsetTop;
        
        while (elem = elem.offsetParent) {
          ox += elem.offsetLeft;
          oy += elem.offsetTop;
        }
      }
  
      var x = evt.pageX - ox;
      var y = evt.pageY - oy;
      var w = evt.target.file.offsetWidth;
      var h = evt.target.file.offsetHeight;
      
      var input = this.$('input').firstObject();
      input.style.top   = y - (h / 2)  + 'px';
      input.style.left  = x - (w - 30) + 'px';
    }
  },
  
  didCreateLayer: function() {
    sc_super();
    var frame = this.$('iframe');
    var input = this.$('input');
    
    SC.Event.add(frame, 'load', this, this._uploadFetchIFrameContent);
    SC.Event.add(input, 'change', this, this._checkInputValue);
    
    this.set('status', SCUI.READY);
  },
  
  willDestroyLayer: function() {
    var frame = this.$('iframe');
    var input = this.$('input');
    
    SC.Event.remove(frame, 'load', this, this._uploadFetchIFrameContent);
    SC.Event.remove(input, 'change', this, this._checkInputValue);
    sc_super();
  },
  
  _startUploadXHR: function(f) {
    SC.Logger.log("using XHR");
    var rp, input, file, fd, xhr;
    rp = this.get('requestPrototype');
    input = f[this.get('inputName')];
    file = input.files[0];
    fd = new FormData();
    fd.append(this.get('inputName'), file);
    xhr = rp.copy();
    xhr.set('isJSON', false);
    xhr.set('isXML', false);
    xhr.set('address', this.get('uploadTarget'));
    xhr.notify(this, this._uploadCheck, null).send(fd);
  },

  _startUploadIframe: function (f) {
    SC.Logger.log("Using iframe target");
    f.submit();
  },

  /**
    Starts the file upload (by submitting the form) and alters the status from READY to BUSY.
  */
  startUpload: function() {
    var i, listlen, handler, f;
    this.set('serverResponse', null);
    
    f = this._getForm();
    if (!f) {
      return;
    }
    for(i=0, listLen = this.degradeList.length; i<listLen; i++){
      switch(this.degradeList[i]){
        case 'xhr':
          if ((SC.browser.safari || SC.browser.chrome) && (this.get('requestPrototype'))) {
            handler = this._startUploadXHR.bind(this);
          }
        break;
        case 'iframe':
          handler = this._startUploadIframe.bind(this);
        break;
      }
      if (handler) {
        break;
      }
    }
    if (!handler) {
      SC.Logger.warn("No upload handler found!");
      return;
    }
    handler(f);
    this.set('status', SCUI.BUSY);
  },
  /**
    Clears the file upload by regenerating the HTML. This is guaranateed
    to work across all browsers. Also resets the status to READY.
  */
  clearFileUpload: function() {
    var f = this._getForm();
    if (f) {
      
      // remove event before calling f.innerHTML = f.innerHTML
      var input = this.$('input');
      SC.Event.remove(input, 'change', this, this._checkInputValue);
        
      f.innerHTML = f.innerHTML;
      this.set('status', SCUI.READY);
      this.set('value', null);
      
      // readd event
      input = this.$('input');
      SC.Event.add(input, 'change', this, this._checkInputValue);
    }
  },
  
  /**
    Returns true if a file has been chosen to be uploaded, otherwise returns
    false.
    
    @returns {Boolean} YES if a file is selected, NO if not
  */
  validateFileSelection: function() {
    var value = this.get('value');
    if (value) {
      return YES;
    }
    return NO;
  },

  _uploadCheck: function(response) {
    this.set('serverResponse', response.get('body'));
    this._uploadDone();
  },

  _uploadFetchIFrameContent: function() {
    var frame, response, win, doc;

    // get the json plain text from the iframe
    if (SC.browser.msie) {
      var frameId = '%@%@'.fmt(this.get('layerId'), 'Frame');
      frame = document.frames(frameId);
      doc = frame.document;
      if (doc) {
        if (doc.body.childNodes.length > 0) {
          response = frame.document.body.childNodes[0].innerHTML;
        }
      }
    } else {
      frame = this.$('iframe').get(0);
      win = frame.contentWindow;
      if (win) response = win.document.body.childNodes[0].innerHTML;
    }
    this.set('serverResponse', response);
    this._uploadDone();
  },

  /**
    This function is called when the upload is done and the iframe loads. It'll
    change the status from BUSY to DONE.
  */
  _uploadDone: function() {
    if (SC.browser.msie) {
      if (!this._firstTime) {
        SC.RunLoop.begin();
        this.set('status', SCUI.DONE);
        SC.RunLoop.end();
      }
      this._firstTime = NO;
    } else {
      SC.RunLoop.begin();
      this.set('status', SCUI.DONE);
      SC.RunLoop.end();
    }
  },
  
  /**
    This function is called when the value of the input changes (after the user hits the browse
    button and selects a file).
  */
  _checkInputValue: function() {
    SC.RunLoop.begin();
    var input = this._getInput();
    this.set('value', input.value);
    SC.RunLoop.end();
  },
  
  _getForm: function(){
    var forms = this.$('form');
    if (forms && forms.length > 0) return forms.get(0);
    return null;
  },
  
  _getInput: function() {
    var inputs = this.$('input');
    if (inputs && inputs.length > 0) return inputs.get(0);
    return null;
  }

});

