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

//Appends the video to the body of the page
jsthumb.loadVideo(document.body, videoOpts, function (err, element, player, supported) {
  var video = $(element).find("video")[0];
  
  //This is the container div with all the Video.js controls
  ok(element, "Video container exists");
  
  //This is the actual video tag
  ok(video, "Video element exists");
  
  //This is the Video.js player
  ok(player, "Player exists");
  
  //This tells you whether or not thumbnailing is supported
  ok(supported, "Thumbnailing is available");
});
```

You can use `.loadVideo` to load the same video file multiple times on your page, just remember to set a different `id` attribute for each one.

##Broken?

###HTML5 Video
JS-Thumb relies on the HTML5 `<video>` tag. Firefox and Opera at this time of writing do not support playing `.mp4` videos with the `<video>` tag. If you use `.loadVideo` then these browsers will fall back to the flash player, which does not support thumbnailing.

###Mobile
Thumbnailing on iOS and Android devices is not supported at this time due to browser limitations. `.loadVideo` will still create a playable video, however.

##CI
We're [broken](https://travis-ci.org/ben-ng/js-thumb) on Travis-CI because PhantomJS does not yet support media like video and audio. If you have an idea of how to overcome this, I'm all ears!
