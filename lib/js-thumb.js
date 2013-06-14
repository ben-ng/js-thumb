/**
 * Creates a new JSThumb object.
 * @constructor 
 */ 
 var jsthumb = function() {
  function err(msg) {
    if(window.console) {
      console.log(msg);
    }
  };
  
  /**
  * Capture a screenshot from a video
  * @param {Node} video - The video element in your DOM
  * @param {object} opts - Output options. e.g. {maxWidth:200, maxHeight:200, origWidth:400, origHeight:400}
  */
  function screenshot(video, opts) {
      var ctx
        , canvas = document.createElement('canvas');
      
      opts = opts || {};
      
      var origWidth = video.videoWidth || opts.origWidth;
      var origHeight = video.videoHeight || opts.origHeight;
      
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
  * @param {object} opts - Output options. e.g. {maxWidth:200, maxHeight:200}
  */
  function resize(image, opts) {
    var maxWidth = opts.maxWidth || 50
      , maxHeight = opts.maxHeight || 50
      , canvasOut = document.createElement('canvas')
      , canvasIn = document.createElement("canvas")
      , ctxOut = canvasOut.getContext("2d")
      , ctxIn = canvasIn.getContext("2d")
      , ratio = 1;
    
    //Limited by width
    if (image.width > maxWidth) {
      ratio = maxWidth / image.width;
    }
    //Limited by height
    else if (image.height > maxHeight) {
      ratio = maxHeight / image.height;
    }
    
    canvasIn.width = image.width;
    canvasIn.height = image.height;
    ctxIn.drawImage(image, 0, 0);
    
    canvasOut.width = image.width * ratio;
    canvasOut.height = image.height * ratio;
    ctxOut.drawImage(canvasIn, 0, 0, canvasIn.width, canvasIn.height, 0, 0, canvasOut.width, canvasOut.height);
    
    return canvasOut.toDataURL();
  };
  
  /**
  * Thumbnails base64 encoded image data
  * @param {string} imageData - Base64 encoded image data
  * @param {object} opts - Output options. e.g. {maxWidth:200, maxHeight:200}
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
