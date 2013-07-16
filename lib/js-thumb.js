(function(){
  /**
  * Creates a new JSThumb object.
  * @constructor 
  */ 
  var JSThumb = function() {
  var JSThumb = function(opts) {
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

    if(opts.vjs) {
      _videoJs = opts.vjs;
    }

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
    * @param {Node} target - The element to append the player to
    * @param {object} opts - The video options. {sources:[{src:"",type:""}],attributes:{id:""}}
    * @param {loadedCallback} [cb] - The callback to execute when the video is ready to be thumbnailed
    */
    this.loadVideo = function (target, opts, cb) {
      var self = this
        , videoElement
        , defaultAttributes
        , i
        , ii
        , complete
        , flash = false
        , afterLoad;
      
      //Prep settings
      opts.sources = opts.sources || [];
      opts.attributes = opts.attributes || {};
      
      //Default attributes
      defaultAttributes = {
        id: "js_thumb_video"
      , "class": "video-js vjs-default-skin"
      , controls: "controls"
      , preload: "auto"
      , resize: false
      , width: 560
      , height: 320
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
      
      //Save dimensions of video from the loadedmetadata event
      videoDims = {};
      
      //Create video element
      videoElement = document.createElement("video");
      
      each(opts.attributes, function (value, key) {
        videoElement.setAttribute(key, value);
      });
      
      //Create source elements
      each(opts.sources, function (source) {
        var sourceElement = document.createElement("source");
        sourceElement.setAttribute("src", source.src);
        sourceElement.setAttribute("type", source.type);
        
        //Append to the video element
        videoElement.appendChild(sourceElement);
      });
      
      target.appendChild(videoElement);
      
      //Init video.js
      _videoJs(videoElement,{},function() {
        //Find the container we added
        each(target.childNodes, function (childNode) {
          if(childNode.attributes
            && childNode.attributes.id
            && childNode.attributes.id.value === opts.attributes.id) {
            element = childNode;
            return false;
          }
        });
        
        //Now find out if flash was used
        each(element.childNodes, function (childNode) {
          if(childNode.tagName.toLowerCase() === "object") {
            flash = true;
            return false;
          }
        });
        
        //The function to call after the video is loaded
        onReady = function (e, notSupported) {
          cb(null, element, this, notSupported === undefined);
        };
        
        if(opts.attributes.resize) {
          //Prevent rounding errors by storing original aspect ratio
          resizeList.push({
            id: element.attributes.id.value
          , width: this.width()
          , height: this.height()
          });
          
          self.resizeVideos();
        }
        
        if(flash) {
          onReady(null, true);
        }
        else {
          // We're only ready to thumbnail after this is called
          _videoJs(opts.attributes.id).on('loadedmetadata', onReady);
        }
      });
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
        , origWidth = image.width || opts.origWidth
        , origHeight = image.height || opts.origHeight
        , cropWidth
        , cropHeight
        // The height the resulting thumbnail would be if we scaled the width to fit exactly the maxWidth
        , widthFirstRatio = (opts.maxWidth / origWidth)
        , widthFirstHeight = origHeight * widthFirstRatio
        // The width the resulting thumbnail would be if we scaled the height to fit exactly the maxHeight
        , heightFirstRatio = (opts.maxHeight / origHeight)
        , heightFirstWidth = origWidth * heightFirstRatio;
      
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
        cropWidth = (maxWidth - (canvasIn.width*heightFirstRatio))/2
        
        ctxOut.drawImage(canvasIn, 0, 0, canvasIn.width, canvasIn.height, cropWidth, 0, canvasIn.width*heightFirstRatio, canvasIn.height*heightFirstRatio);
      }
      else {
        cropHeight = (maxHeight - (canvasIn.height*widthFirstRatio))/2
        
        //Limit by the width -- crop the top/bottom edges
        ctxOut.drawImage(canvasIn, 0, 0, canvasIn.width, canvasIn.height, 0, cropHeight, canvasIn.width*widthFirstRatio, canvasIn.height*widthFirstRatio);
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