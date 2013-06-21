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
    
    /*
    * Just some helpers from the underscore library
    */
    var _videoJs
      , videoJsAliases = ['videojs', 'vjs', '_V_']
      , resizeList = []
      , breaker = {}
      , has = function(obj, key) {
          return hasOwnProperty.call(obj, key);
        }
      , each = function(obj, iterator, context) {
          if (obj == null) return;
          if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
            obj.forEach(iterator, context);
          } else if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
              if (iterator.call(context, obj[i], i, obj) === breaker) return;
            }
          } else {
            for (var key in obj) {
              if (has(obj, key)) {
                if (iterator.call(context, obj[key], key, obj) === breaker) return;
              }
            }
          }
        }
      , extend = function(obj) {
          each(Array.prototype.slice.call(arguments, 1), function(source) {
            if (source) {
              for (var prop in source) {
                obj[prop] = source[prop];
              }
            }
          });
          return obj;
        };
    
    each(videoJsAliases, function (alias) {
      if(window[alias] !== undefined) {
        _videoJs = window[alias];
        return false;
      }
    });
    
    /**
    * Resizes a video to fit it's parent element
    * @param player - The Video.js instance
    */
    this.resizeVideos = function(e) {
      if(e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      each(resizeList, function (entry) {
        var element = document.getElementById(entry.id)
          , player = _videoJs(entry.id)
          , newWidth
          , newHeight;
        
        if(element && element.parentNode) {
          newWidth = element.parentNode.offsetWidth
          newHeight = entry.height * (newWidth/entry.width);
          player.width(newWidth);
          player.height(newHeight);
        }
      });
    };
    
    /**
    * Loads a video and gets it set up for thumbnailing
    * @param {object} opts - The video options. {sources:[{src:"",type:""}],attributes:{id:""}}
    * @param {loadedCallback} [cb] - The callback to execute when the video is ready to be thumbnailed
    */
    this.loadVideo = function (opts, cb) {
      var self = this
        , videoElement
        , defaultAttributes
        , i
        , ii
        , expect
        , videoDims
        , afterVideoLoad
        , hider
        , complete;
      
      //Prep settings
      opts.sources = opts.sources || [];
      opts.attributes = opts.attributes || {};
      
      //Default attributes
      defaultAttributes = {
        id: "js_thumb_video"
      , class: "video-js vjs-default-skin"
      , controls: "controls"
      , preload: "auto"
      , resize: false
      };
      
      //Check if we can go on
      if(!_videoJs) {
        cb("Please include Video.js to use this function");
        return;
      }
      
      //We need at least one source
      if(!opts.sources.length) {
        cb("Videos require at least one source");
        return;
      }
      
      //Copy and extend stuff
      opts.sources = extend([], opts.sources);
      opts.attributes = extend({}, defaultAttributes, opts.attributes);
      
      /*
      * Remove old object from the players hash, otherwise vjs won't re-init our video
      * You probably should call `Player.dispose()` yourself instead of depending on this...
      */
      each(_videoJs.players, function(player, identifier) {
        if(identifier === opts.attributes.id) {
          player.dispose();
          return false;
        }
      });
      
      //# Callbacks to expect
      expect = 2;
      
      //Save dimensions of video from the loadedmetadata event
      videoDims = {};
      
      //We'll hide the video element in this div while it loads
      hider = document.createElement("div");
      hider.style.display = "none";
      hider.style.visibility = "hidden";
      
      //This function is called after the video element and video.js have both loaded
      afterVideoLoad = function(e) {
        var player
          , element;
        
        expect--;
        
        //This is the loadedmetadata event
        if(e) {
          videoDims = {height:this.videoHeight, width:this.videoWidth};
        }
        
        //All callbacks fired
        if(expect<=0) {
          player = _videoJs(opts.attributes.id);
          element = hider.childNodes[0];
          
          //Remove the hidden div
          hider.removeChild(hider.childNodes[0]);
          document.body.removeChild(hider);
          
          //Set the *actual* dimensions of the video
          player.width(videoDims.width);
          player.height(videoDims.height);
          
          if(opts.attributes.resize) {
            //Prevent rounding errors by storing original aspect ratio
            resizeList.push({
              id: element.attributes.id.value
            , width: player.width()
            , height: player.height()
            });
            
            self.resizeVideos();
          }
          
          //Give a completion function for the client to call
          complete = function () {
            self.resizeVideos();
          }
          
          cb(null, element, player, complete);
        }
      };
      
      //Create video element
      videoElement = document.createElement("video");
      
      each(opts.attributes, function (value, key) {
        videoElement.setAttribute(key, value);
      });
      
      //Bind to the loadedmetadata event
      videoElement.loadedmetadata = afterVideoLoad;
      
      //Create source elements
      each(opts.sources, function (source) {
        var sourceElement = document.createElement("source");
        sourceElement.setAttribute("src", source.src);
        sourceElement.setAttribute("type", source.type);
        
        //Append to the video element
        videoElement.appendChild(sourceElement);
      });
      
      hider.appendChild(videoElement);
      document.body.appendChild(hider);
      
      //Init video.js
      _videoJs(videoElement,{},afterVideoLoad);
    };
    
    /**
    * Capture a screenshot from a video
    * @param {Node} video - The video element in your DOM
    * @param {object} opts - Output options. e.g. {origWidth:400, origHeight:400}
    */
    this.screenshot = function (video, opts) {
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
    this.resize = function (image, opts) {
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
    this.resizeData = function (imageData, opts, cb) {
      opts = opts || {};
      
      var self = this
        , image = new Image();
      
      image.onload = function()
      {
        cb(null, self.resize(image, opts));
      };
      
      image.src = imageData;
    };
    
    /**
     * Called after a successful thumbnailing operation
     * @callback jsthumbCallback
     * @param {null|string} err - null if no error
     * @param {string} data - Base64 Encoded Data
     */
    
    /**
     * Called after loading a video or image
     * @callback loadedCallback
     * @param {null|string} err - null if no error
     * @param {Node} media - The Image object or Video.js player
     * @param {Node} element - The image or video element
     */
  };
  
  var jst = new JSThumb();
  
  // if we've got a window and we don't have a module
  // create a global;
  if ((typeof window != 'undefined') && (typeof module == 'undefined')) {
    window.jsthumb = jst;
    
    window.onresize = jst.resizeVideos;
  }
  // otherwise, export it.
  else {
    module.exports = jst;
  }
}());