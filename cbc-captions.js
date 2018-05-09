(function(window, videojs) {
    // Cross-compatibility for Video.js 5 and 6.
    var registerPlugin = videojs.registerPlugin || videojs.plugin;
    
    var myBtn = function() {
        var myPlayer = this;
        
        myPlayer.ready(function() {
            this.on('loadedmetadata', function() {
              var tracks = myPlayer.textTracks();
              console.log('video metadata is loaded');
                myButton.addEventListener("click", function() {
                    for (var i = 0; i < tracks.length; i++) {
                        var track = tracks[i];
                        if(track.kind === "captions"){
                          //to do - if more than 1 language, show menu instead of toggle
                           if (track.mode === "disabled" || track.mode === "hidden") {
                                track.mode = "showing";
                                myButton.getElementsByTagName('span')[0].setAttribute('class', 'vjs-icon-placeholder ccButton');
                                console.log(track.kind+' on');
                            } else {
                                track.mode = "disabled";
                                myButton.getElementsByTagName('span')[0].setAttribute('class', 'vjs-icon-placeholder');
                                console.log(track.kind+' off');
                            } 
                        }
                    }
                });    
            });
        });
        this.one('loadstart', function(){
            //Title to the big play button
            var media_title = 'Play Video: '+ myPlayer.mediainfo.name;
            myPlayer.el().querySelector(".vjs-big-play-button").setAttribute('title', media_title);
        });
        var myButton = document.getElementsByClassName("vjs-subs-caps-button")[0];
    };
    registerPlugin('captions', myBtn);

})(window, window.videojs);
