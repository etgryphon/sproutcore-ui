// ========================================================================
// SCUI.Upload
// ========================================================================

/** @class

  A simple view that allows the user to upload a file to a specific service.
  
  @extends SC.View
  @author Mohammed Taher
  @author Evin Grano
*/

SCUI.Upload = SC.View.extend(
/** @scope Scui.Upload.prototype */ {
  
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
  
  displayProperties: 'uploadTarget'.w(),

  render: function(context, firstTime) {
    var frameId = this.get('layerId') + 'Frame';
    var uploadTarget = this.get('uploadTarget');
    var label = this.get('label');
    var inputName = this.get('inputName');
    
    if (firstTime) {
      context.push('<form method="post" enctype="multipart/form-data" target="' + frameId + '" action="' + uploadTarget + '">');
      context.push('<input type="file" name="' + inputName + '" />');
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
    
    this.set('status', SCUI.READY);
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
    change the status from BUSY to DONE.
  */
  _uploadDone: function() {
    this.set('status', SCUI.DONE);
  },
  
  _getForm: function(){
    var forms = this.$('form');
    if (forms && forms.length > 0) return forms.get(0);
    return null;
  } 

});
