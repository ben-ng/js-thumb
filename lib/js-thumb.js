(function(){
  /**
  * Creates a new JSThumb object.
  * @constructor 
  */ 
  var JSThumb = function() {
    function err(msg) {
      if(window.console) {
        console.log(msg);
      }
    };
    
    /**
    * Capture a screenshot from a video
    * @param {Node} video - The video element in your DOM
    * @param {object} opts - Output options. e.g. {origWidth:400, origHeight:400}
    */
    function screenshot(video, opts) {
        var ctx
          , canvas = document.createElement('canvas');
        
        opts = opts || {};
        
        var origWidth = opts.origWidth || video.videoWidth;
        var origHeight = opts.origHeight || video.videoHeight;
        
        //Check for metadata not yet loaded
        if(!origWidth || !origHeight) {
          err("Video has invalid dimensions or metadata has not yet loaded.");
          return false;
        }
        
        canvas.width = origWidth;
        canvas.height = origHeight;
        
        ctx = canvas.getContext("2d");
        
        ctx.drawImage(video, 0, 0, origWidth, origHeight);
        
        return canvas.toDataURL("image/png");
    };
    
    /**
    * Thumbnails an image
    * @param {node} image - The image element in your DOM
    * @param {object} opts - Output options. e.g. {maxWidth:200, maxHeight:200, origWidth:400, origHeight:400}
    */
    function resize(image, opts) {
      var maxWidth = opts.maxWidth || 50
        , maxHeight = opts.maxHeight || 50
        , canvasOut = document.createElement('canvas')
        , canvasIn = document.createElement("canvas")
        , ctxOut = canvasOut.getContext("2d")
        , ctxIn = canvasIn.getContext("2d")
        , ratio = 1;
        
      var origWidth = opts.origWidth || image.width;
      var origHeight = opts.origHeight || image.height;
      
      //Limited by width
      if (origWidth > maxWidth) {
        ratio = maxWidth / origWidth;
      }
      //Limited by height
      else if (origHeight > maxHeight) {
        ratio = maxHeight / origHeight;
      }
      
      canvasIn.width = origWidth;
      canvasIn.height = origHeight;
      ctxIn.drawImage(image, 0, 0);
      
      canvasOut.width = origWidth * ratio;
      canvasOut.height = origHeight * ratio;
      ctxOut.drawImage(canvasIn, 0, 0, canvasIn.width, canvasIn.height, 0, 0, canvasOut.width, canvasOut.height);
      
      return canvasOut.toDataURL();
    };
    
    /**
    * Thumbnails base64 encoded image data
    * @param {string} imageData - Base64 encoded image data
    * @param {object} opts - Output options. e.g. {maxWidth:200, maxHeight:200, origWidth:400, origHeight:400}
    * @param {jsthumbCallback} cb - Called after processing is complete
    */
    function resizeData(imageData, opts, cb) {
      opts = opts || {};
      
      var image = new Image();
      
      image.onload = function()
      {
        cb(null, resize(image, opts));
      };
      
      image.src = imageData;
    };
    
    return {
      screenshot: screenshot
    , resize: resize
    , resizeData: resizeData
    };
    
    /**
     * This callback is displayed as a global member.
     * @callback jsthumbCallback
     * @param {null|string} err - null if no error
     * @param {string} data - Base64 Encoded Data
     */
  };
  
  var jst = new JSThumb();
  
  // if we've got a window and we don't have a module
  // create a global;
  if ((typeof window != 'undefined') && (typeof module == 'undefined')) {
    window.jsthumb = jst;
  }
  // otherwise, export it.
  else {
    module.exports = jst;
  }
}());