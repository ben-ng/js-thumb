$(function() {
  //Hide forms at launch
  $("#example_video_form").hide();
  $("#example_image_form").hide();
  
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
  var videoOpts = {
      sources: [
        {
          src: "media/lego.mp4"
        , type: "video/mp4"
        }
      , {
          src: "media/lego.webm"
        , type: "video/webm"
        }
      ]
    , attributes: {
        id: "example_video"
      , resize: true
      }
    };
  
  //Add the video
  jsthumb.loadVideo($("#example_video_pane")[0], videoOpts, function (err, element, player, supported) {
    var video = $(element).find("video")[0];
    
    if(err) {
      $("#example_video_pane").text("The video failed to load: " + err);
    }
    else {
      if(!supported) {
        player.dispose();
        $("#example_video").remove();
        $("#example_video_thumbnails").html('Your browser is not yet supported. <a href="https://github.com/ben-ng/js-thumb#broken">Why?</a>');
      }
      else {
        $("#example_video_form").submit(function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          var dims = getDimensions($("#video_thumb_size").val())
            , opts = {
                origWidth: player.width()
              , origHeight: player.height()
              }
            , resizingOpts = {
                origWidth: opts.origWidth
              , origHeight: opts.origHeight
              , maxWidth:dims.width
              , maxHeight:dims.height
              }
            , base64Data = jsthumb.screenshot(video, opts)
            , image = new Image()
            , thumbnailDiv = $("#example_video_thumbnails");
          
          //Resize the image
          jsthumb.resizeData(base64Data, resizingOpts, function(err, resizedData) {
            image.onload = function () {
              thumbnailDiv.prepend(image);
            };
            
            image.src=resizedData;
          });
        }).show();
      }
    }
  });
  
  /*
  * Image Demo Setup
  */
  $("#example_image_form").submit(function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    var iWidth = 640
      , iHeight = 468
      , dims = getDimensions($("#image_thumb_size").val())
      , image = $("#example_image")
      , opts = {
          maxWidth: dims.width
        , maxHeight: dims.height
        , origWidth: iWidth
        , origHeight: iHeight
        }
      , base64Data = jsthumb.resize(image[0], opts)
      , outputImage = new Image()
      , thumbnailDiv = $("#example_image_thumbnails");
    
    outputImage.onload = function () {
      thumbnailDiv.prepend(outputImage);
    };
    
    outputImage.src = base64Data;
  }).show();
});
