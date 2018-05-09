(function(window, videojs) {

    // Cross-compatibility for Video.js 5 and 6.
    var registerPlugin = videojs.registerPlugin || videojs.plugin;

    var listenForParents = function ( options ) {
        //console.log("Player listenForParent loaded");

        var myPlayer = this;
        // Send a message to the parent
        var sendMessage = function (msg) {
          try {
        window.parent.postMessage(msg, '*');
          } 
          catch (e) {       
              return;
          }
        };
     
        myPlayer.on("pause",function() {
          console.log("Player sends - pauseVideo");
          sendMessage('pauseVideo');
        });

        myPlayer.on("play",function() {
          console.log("Player sends - playVideo");
          sendMessage('playVideo');
        });

        myPlayer.on('ads-ad-started',function(evt){
          console.log('Player sends - ads-ad-started');
          sendMessage('ads-ad-started');
        });

        myPlayer.on('ads-pause',function(evt){
          console.log('Player sends - ads-pause');
          sendMessage('ads-pause');
        });

        myPlayer.on('ads-play',function(evt){
          console.log('Player sends - ads-play');
          sendMessage('ads-play');
        });

        myPlayer.on('ads-ad-ended',function(evt){
          console.log('Player sends - ads-ad-ended');
          sendMessage('ads-ad-ended');
        });

      function controlVideo(evt){

        //console.log('controlVideo: ', evt.data);
        if(evt.data === "playVideo") {

          //myPlayer.play();
          
        } else if (evt.data === 'pauseVideo') {
          var selection = document.querySelector('.vjs-ad-playing') !== null;
          if ( selection && typeof(myPlayer.ima3.adsManager) !== "undefined" && myPlayer.ima3.adsManager !== null) {  
              myPlayer.ima3.adsManager.pause(); 
          }else{
              myPlayer.pause(); 
          }
        }
      };
      // Listen for the message, then call controlVideo() method when received
        window.addEventListener('message', function (e) {
            if (e.origin !== (window.location.protocol + "//" + window.location.host)) return;
            controlVideo(e);
        });
    };

  // register the plugin
  registerPlugin('listenForParent', listenForParents);

})(window, window.videojs);