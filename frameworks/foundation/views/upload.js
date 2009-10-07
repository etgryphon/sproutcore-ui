// ==========================================================================
// Project:   Scui.Upload
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals SCUI */

/** @class

  View that allows the user to upload a file to a specific service
  
  TODO: [MT] currently this doesn't do any error checking. The service has
  to be updated first
  
  @extends SC.View
  @author Mohammed Taher
*/
SCUI.Upload = SC.View.extend(
/** @scope Scui.Upload.prototype */ {
  
  /*
    URI of Restful service
  */
  formAction: null,
  
  /*
    Private variable that's updated based on the values of uploadStartMessage and
    uploadCompleteMessage.
  */
  _uploadStatus: '',
  
  /*
    String to be displayed when the the upload starts
  */
  uploadStartMessage: 'Uploading...',
  
  /*
    String to be displayed when the upload is done
  */
  uploadCompleteMessage: 'Upload Complete',
  
  /*
    Specify these to allow for any extra action to be taken once the upload
    is done (e.g. state transition)
  */
  uploadSuccessfullTarget: null,
  uploadSuccessfullAction: null,
  
  displayProperties: 'action _uploadStatus'.w(),

  render: function(context, firstTime) {
    
    var frameId = this.get('layerId') + 'Frame';
    var formAction = this.get('formAction');
    var uploadStatus = this.get('_uploadStatus');
    
    if (firstTime) {
      
      context.push('<form method="post" enctype="multipart/form-data" target="' + frameId + '" action="' + formAction + '">');
      context.push('File: <input type="file" name="Filedata" />');
      context.push('</form>');
      
      context.push('<iframe frameBorder="0" src="#" id="' + frameId + '" name="' + frameId + '" style="width:0; height:0;"></iframe>');
      
      context.push('<br>');
      context.push('<br>');
      
      context.push('<span class="upload-status">' + uploadStatus + '</span>');
      
    } else {
      this.$('.upload-status').text(uploadStatus);
    }
    
    sc_super();
  },
  
  createChildViews: function() {
    var childViews = [], view;
    
    view = this.createChildView(
      SC.ButtonView.design({
        theme: 'capsule',
        layout: { left: 20, width: 80, top: 30, height: 24 },
        title: 'Upload',
        target: this,
        action: function() {
          this.get('parentView').$('form').get(0).submit();
        }
      }),
      { rootElementPath: [0] }
    );
    childViews.push(view);
    
    this.set('childViews', childViews);
  },
  
  didCreateLayer: function() {
    sc_super();
    
    var frame = this.$('iframe');
    SC.Event.add(frame, 'load', this, this.iframeDidLoad);
    
    var form = this.$('form');
    SC.Event.add(form, 'submit', this, this.formDidSubmit);

    // in IE the frame load event is fired when the frame first loads and 
    // when the iframe is redirected to the servcie, while in firefox, it's only
    // fired when the iframe is redirected. This ensures that the load is not
    // fired the first time around in IE.
    if (SC.browser.msie) {
      this._ignoreFrameDidLoadCallback = YES;
    } else {
      this._ignoreFrameDidLoadCallback = NO;
    }
  },
  
  willDestroyLayer: function() {
    var frame = this.$('iframe');
    SC.Event.remove(frame, 'load', this, this.iframeDidLoad);
    
    var form = this.$('form');
    SC.Event.remove(form, 'submit', this, this.formDidSubmit);
    
    sc_super();
  },
  
  formDidSubmit: function() {
    var uploadStartMessage = this.get('uploadStartMessage');
    this.set('_uploadStatus', uploadStartMessage);
  },
  
  iframeDidLoad: function() {
    if (!this._ignoreFrameDidLoadCallback) {
      var uploadCompleteMessage = this.get('uploadCompleteMessage');

      this.set('_uploadStatus', uploadCompleteMessage);

      var action = this.get('uploadSuccessfullAction');
      var target = this.get('uploadSuccessfullTarget');
      if (action && target) {
        this.getPath('pane.rootResponder').sendAction(action, target, this, this.get('pane'));
      }      
    } else {
      this._ignoreFrameDidLoadCallback = NO;
    }
  } 

});
