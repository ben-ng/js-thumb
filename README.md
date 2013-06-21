#JS-Thumb

Thumbnail all the things, client-side!


##Demo

[Live demo](http://ben-ng.github.io/js-thumb)


##Usage

```javascript
var jsthumb = require("jsthumb")
  //When taking a screenshot from a video, it's best to supply the original dimensions of the video
  , screenshotOpts = {
      origWidth: 400
    , origHeight: 400
    }
  //When resizing, you have to specify a maxWidth and maxHeight, and the original dimensions are recommended but optional
  , resizingOpts = {
      origWidth: 400
    , origHeight: 400
    , maxWidth:200
    , maxHeight:200
    }
  //All these methods return a Base64 encoded string
  , videoThumbnail = jsthumb.screenshot(document.getElementById("my_video_tag"), screenshotOpts)
  , imageThumbnail = jsthumb.resize(document.getElementById("my_image_tag"), resizingOpts);


//You can also directly resize Base64 encoded data, but you'll need to provide a callback for that
jsthumb.resizeData(imageData, opts, function(err, base64Data) {
  //Do something with base64Data
});

//To load thumbnails in the browser
var myImage = new Image();
myImage.src = videoThumbnail;
```


##Loading Media

It's not trivial figuring out when a video element is ready for thumbnailing. To remedy this problem, we provide a helper method that loads a video and fires a callback when it's ready for use.

```javascript
var videoOpts = {
    sources: [
      {
        src: "media/lego.mp4"
      , type: "video/mp4"
      }
    ]
  , attributes: {
      //Required, must be unique for each element
      id: "example_video"
      
      // Optional, will resize video to fit parent element, maintaining aspect ratio
    , resize: true
    }
  };

jsthumb.loadVideo(videoOpts, function (err, element, player, complete) {
  var video = $(element).find("video")[0];
  
  //This is the container div with all the Video.js controls
  ok(element, "Video container exists");
  
  //This is the actual video tag
  ok(video, "Video element exists");
  
  //This is the Video.js player
  ok(player, "Player exists");
  
  //You must add the video container to the DOM within this call if you want the resize option
  $("#my_app").append(element);
  
  //After adding the video to the container, call this method to trigger the initial resize
  complete();
  
  //We bind to window.onresize to keep your videos scaled correctly
});
```

You can use `.loadVideo` to load the same video file multiple times on your page, just remember to set a different `id` attribute for each one.