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
      2. 'IN-PROGRESS'
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
      this.$('form').get(0).action = uploadTarget;
      
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
    Starts the file upload (by submitting the form) and alters the status from READY to IN-PROGRESS.
  */
  startUpload: function() {
    this.$('form').get(0).submit();
    this.set('status', 'IN-PROGRESS');
  },
  
  /**
    Clears the file upload by regenerating the HTML. This is guaranateed
    to work across all browsers. Also resets the status to READY.
  */
  clearFileUpload: function() {
    if (this.$('form').length > 0) {
      this.$('form').get(0).innerHTML = this.$('form').get(0).innerHTML;
      this.set('status', 'READY');
    }
  },
  
  /**
    This function is called when the upload is done and the iframe loads. It'll
    execute the uploadSuccessfullAction/uploadSuccessfullTarget function and change
    the status from IN-PROGRESS to DONE.
  */
  _uploadDone: function() {
    this.set('status', 'DONE');

    var action = this.get('uploadSuccessfullAction');
    var target = this.get('uploadSuccessfullTarget');
    if (action && target) {
      this.getPath('pane.rootResponder').sendAction(action, target, this, this.get('pane'));
    }
  } 

});
