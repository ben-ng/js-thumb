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
  var videoOpts = {
      sources: [
        {
          src: "media/lego.mp4"
        , type: "video/mp4"
        }
      ]
    , attributes: {
        id: "example_video"
      , resize: true
      }
    };
  
  //Add the video
  jsthumb.loadVideo(videoOpts, function (err, element, player, complete) {
    var video = $(element).find("video")[0];
    
    if(err) {
      $("#example_video_pane").text("The video failed to load: " + err);
    }
    else {
      $("#example_video_pane").append(element);
      
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
          , image = $("<image />")
          , thumbnailDiv = $("#example_video_thumbnails");
        
        //Resize the image
        jsthumb.resizeData(base64Data, resizingOpts, function(err, resizedData) {
          image.attr("src",resizedData);
          thumbnailDiv.prepend(image);
        });
      });
      
      complete();
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
      , outputImage = $("<image />").attr("src",base64Data)
      , thumbnailDiv = $("#example_image_thumbnails");
    
    thumbnailDiv.prepend(outputImage);
  });
});
