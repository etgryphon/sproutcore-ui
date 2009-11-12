// ========================================================================
// SCUI.Upload
// ========================================================================

/** @class

  A simple view that allows the user to upload a file to a specific service.
  
  @extends SC.View
  @author Mohammed Taher
*/

SCUI.Upload = SC.View.extend(
/** @scope Scui.Upload.prototype */ {
  
  /*
    URI of Restful service
  */
  uploadTarget: null,
  
  /**
    Status of the current upload. Can be one of 3 values,
      1. 'READY'
      2. 'BUSY'
      3. 'DONE'
  */
  status: '',
  
  /*
    Specify these to allow for any extra action to be taken once the upload
    is done (e.g. state transition)
  */
  uploadSuccessfullTarget: null,
  uploadSuccessfullAction: null,
  
  /**
    The input's preceding label
  */
  label: 'File: ',
  
  displayProperties: 'uploadTarget'.w(),

  render: function(context, firstTime) {
    var frameId = this.get('layerId') + 'Frame';
    var uploadTarget = this.get('uploadTarget');
    var label = this.get('label');
    
    if (firstTime) {
      context.push('<form method="post" enctype="multipart/form-data" target="' + frameId + '" action="' + uploadTarget + '">');
      context.push(label + '<input type="file" name="Filedata" />');
      context.push('</form>');
      context.push('<iframe frameBorder="0" src="#" id="' + frameId + '" name="' + frameId + '" style="width:0; height:0;"></iframe>');
      
    } else {
      var f = this._getForm();
      if (f) f.action = uploadTarget;
    }
    sc_super();
  },
  
  didCreateLayer: function() {
    sc_super();
    var frame = this.$('iframe');
    SC.Event.add(frame, 'load', this, this._uploadDone);

  },
  
  willDestroyLayer: function() {
    var frame = this.$('iframe');
    SC.Event.remove(frame, 'load', this, this._uploadDone);
    sc_super();
  },
  
  /**
    Starts the file upload (by submitting the form) and alters the status from READY to BUSY.
  */
  startUpload: function() {
    var f = this._getForm();
    if (f) {
      f.submit();
      this.set('status', SCUI.BUSY);
    }
  },
  
  /**
    Clears the file upload by regenerating the HTML. This is guaranateed
    to work across all browsers. Also resets the status to READY.
  */
  clearFileUpload: function() {
    var f = this._getForm();
    if (f) {
      f.innerHTML = f.innerHTML;
      this.set('status', SCUI.READY);
    }
  },
  
  /**
    This function is called when the upload is done and the iframe loads. It'll
    execute the uploadSuccessfullAction/uploadSuccessfullTarget function and change
    the status from BUSY to DONE.
  */
  _uploadDone: function() {
    this.set('status', SCUI.DONE);

    var action = this.get('uploadSuccessfullAction');
    var target = this.get('uploadSuccessfullTarget');
    if (action && target) {
      this.getPath('pane.rootResponder').sendAction(action, target, this, this.get('pane'));
    }
  },
  
  _getForm: function(){
    var forms = this.$('form');
    if (forms && forms.length > 0) return forms.get(0);
    return null;
  } 

});
