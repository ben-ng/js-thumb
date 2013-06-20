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
        , origWidth = opts.origWidth || image.width
        , origHeight = opts.origHeight || image.height
        // The height the resulting thumbnail would be if we scaled the width to fit exactly the maxWidth
        , widthFirstRatio = (opts.maxWidth / opts.origWidth)
        , widthFirstHeight = opts.origHeight * widthFirstRatio
        // The width the resulting thumbnail would be if we scaled the height to fit exactly the maxHeight
        , heightFirstRatio = (opts.maxHeight / opts.origHeight)
        , heightFirstWidth = opts.origWidth * heightFirstRatio;
      
      //Draw onto first canvas
      canvasIn.width = origWidth;
      canvasIn.height = origHeight;
      ctxIn.drawImage(image, 0, 0);
      
      //Set up output canvas
      canvasOut.width = maxWidth;
      canvasOut.height = maxHeight;
      
      //Try to fit the width first, unless that causes black bars on the top and bottom. that's bad.
      if(widthFirstHeight < maxHeight) {
        //Limit by the height -- crop the left/right edges
        ctxOut.drawImage(canvasIn, 0, 0, canvasIn.width, canvasIn.height, -(canvasIn.width - (maxWidth/heightFirstRatio))/2, 0, canvasIn.width*heightFirstRatio, canvasIn.height*heightFirstRatio);
      }
      else {
        //Limit by the width -- crop the top/bottom edges
        ctxOut.drawImage(canvasIn, 0, 0, canvasIn.width, canvasIn.height, 0, -(canvasIn.height - (maxHeight/widthFirstRatio))/2, canvasIn.width*widthFirstRatio, canvasIn.height*widthFirstRatio);
      }
      
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