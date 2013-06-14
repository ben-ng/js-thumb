#JS-Thumb
Thumbnail all the things, client-side!

##Demo
[Live demo](http://ben-ng.github.io/js-thumb)

##Usage
```javascript
var thumber = new jsthumb()
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
  , videoThumbnail = thumber.screenshot(document.getElementById("my_video_tag"), screenshotOpts)
  , imageThumbnail = thumber.resize(document.getElementById("my_image_tag"), resizingOpts);


//You can also directly resize Base64 encoded data, but you'll need to provide a callback for that
thumber.resizeData(imageData, opts, function(err, base64Data) {
  //Do something with base64Data
});

//To load thumbnails in the browser
var myImage = new Image();
myImage.src = videoThumbnail;
```

Or read the [JSDoc](http://ben-ng.github.io/js-thumb/docs/jsthumb.html) if that floats your boat.