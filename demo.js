$(function() {
  /*
  * Helper function that gets dimensions from dropdown box
  */
  var getDimensions = function(str) {
    var splitted = str.split('x')
      , out = {
          width: splitted[0]
        , height: splitted[1]
        };
    
    return out;
  };
  
  /*
  * Video Demo Setup
  */
  
  //Create the video element
  var vWidth = 560
    , vHeight = 320
    , source = $("<source />").attr({
      src: "media/lego.mp4"
    , type: "video/mp4"
    })
  , video = $("<video />").attr({
      id: "example_video"
    , class: "video-js vjs-default-skin"
    , controls: "controls"
    , preload: "auto"
    , width: vWidth
    , height: vHeight
    }).append(source); //Append source to video element
  
  //Add the video
  $("#example_video_pane").append(video);
  
  //This resizes the video to fit the pane
  var resizeExampleVideo = function(e) {
    if(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    var newWidth = $("#example_video_pane").innerWidth()
      , newHeight = vHeight * (newWidth/vWidth)
      , player = _V_("example_video");
    
    player.width(newWidth);
    player.height(newHeight);
  };
  
  //Trigger the resize whenever the window changes
  $(window).resize(resizeExampleVideo);
  
  //Init with video.js
  _V_("example_video", {}, function(){
    var player = _V_("example_video")
      , video = $("#example_video").find("video")[0];
    
    
    //Resize to fit
    resizeExampleVideo();
    
    $("#example_video_form").submit(function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      var dims = getDimensions($("#video_thumb_size").val())
        , thumber = new jsthumb()
        , opts = {
            origWidth: player.width()
          , origHeight: player.height()
          , maxWidth: dims.width
          , maxHeight: dims.height
          }
        , base64Data = thumber.screenshot(video, opts)
        , image = $("<image />").attr("src",base64Data)
        , thumbnailDiv = $("#example_video_thumbnails");
      
      thumbnailDiv.prepend(image);
    });
  });
  
  
  /*
  * Image Demo Setup
  */
  $("#example_image_form").submit(function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    var dims = getDimensions($("#image_thumb_size").val())
      , thumber = new jsthumb()
      , image = $("#example_image")
      , opts = {
          maxWidth: dims.width
        , maxHeight: dims.height
        }
      , base64Data = thumber.resize(image[0], opts)
      , outputImage = $("<image />").attr("src",base64Data)
      , thumbnailDiv = $("#example_image_thumbnails");
    
    thumbnailDiv.prepend(outputImage);
  });
});
