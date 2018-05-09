(function(window, videojs) {
      // Cross-compatibility for Video.js 5 and 6.
    var registerPlugin = videojs.registerPlugin || videojs.plugin;

    var gbCaptions = function () {
  

vjs.HDButton = vjs.Button .extend({
  init:function(player, options) {
    vjs.Button.call(this, player, options);
  }
});
vjs.HDButton .prototype.className =" vjs-hd-button vjs-control ";
vjs.HDButton .prototype.buildCSSClass = function() {
  return this.className + vjs.Button.prototype.buildCSSClass.call(this);
};
vjs.HDButton .prototype.onClick = function() {
 /*
do whatever here - if you're swapping to an HD source be sure to remove the video element's source tags first
*/
};


  var Button = videojs.getComponent('Button');
  var CaptionsToggleButton = videojs.extend(Button, {
    init: function(player, options) {
     /* videojs.Button.call(this, player, {
        el: videojs.Button.prototype.createEl.call(this, 'div', {
          className: 'vjs-caption-toggle-control vjs-control',
          role: 'button',
          'aria-live': 'polite',
          innerHTML: '<div class="vjs-control-content"><span class="vjs-control-text">Toggle Captions</span></div>'
        })
      });*/
      this.language_ = options.language;
/*
      // setup pointer event handlers
      this.on('touchstart', videojs.bind(this, function(event) {
        this.toggleCaptions();
        event.preventDefault();
      }));
      this.on('click', videojs.bind(this, this.toggleCaptions));
    */}
  });/*
  videojs.CaptionsToggleButton.prototype.toggleCaptions = function() {
    var tracks = this.player().textTracks(),
        track,
        i;
    
    for (i = 0; i < tracks.length; i++) {
      track = tracks[i];
      if (track.kind === 'captions' &&
          track.language === this.language_) {
        if (track.mode !== 'showing') {
          track.mode = 'showing';
          this.addClass('vjs-selected');
        } else {
          track.mode = 'hidden';
          this.removeClass('vjs-selected');
        }
        return;
      }
    }
    videojs.log('Tried to toggle captions but no caption track with language ' +
                this.language_ + ' was found!');
    return;
  };
*/
  var captionsToggle = function() {
    'use strict';
    var player = this,

        settings = videojs.util.mergeOptions({
          language: 'en'
        }, options);

    player.controlBar.addChild('CaptionsToggleButton', settings);
  };
  //videojs.captionsToggle();
  
};
  
  registerPlugin('captions', captionsToggle);

})(window, window.videojs);




videojs('myPlayerID').ready(function(){
      // Create variables and new div, anchor and image for download icon
      var myPlayer = this,
        controlBar,
        newElement = document.createElement('div'),
        newLink = document.createElement('a'),
        newImage = document.createElement('img');
      // Assign id and classes to div for icon
      newElement.id = 'downloadButton';
      newElement.className = 'downloadStyle vjs-control';
      // Assign properties to elements and assign to parents
      newImage.setAttribute('src','http://solutions.brightcove.com/bcls/brightcove-player/download-video/file-download.png');
      newLink.setAttribute('href','http://www.brightcove.com');
      newLink.appendChild(newImage);
      newElement.appendChild(newLink);
      // Get controlbar and insert before elements
      // Remember that getElementsByClassName() returns an array
      controlBar = document.getElementsByClassName('vjs-control-bar')[0];
      // Change the class name here to move the icon in the controlBar
      insertBeforeNode = document.getElementsByClassName('vjs-volume-menu-button')[0];
      // Insert the icon div in proper location
      controlBar.insertBefore(newElement,insertBeforeNode);
    });
//---------------------------------

(function(window, videojs) {
      // Cross-compatibility for Video.js 5 and 6.
    var registerPlugin = videojs.registerPlugin || videojs.plugin;

    videojs.Btn = videojs.Button.extend({
    init: function (player, options) {
        videojs.Button.call(this, player, options);
        this.on('click', this.onClick);
    }
});

videojs.Btn.prototype.onClick = function () {
    alert("Click on my custom button!");
};

var createCustomButton = function () {
    var props = {
        className: 'vjs-custom-button vjs-control',
        innerHTML: '<div class="vjs-control-content"><span class="vjs-control-text"><input type="button">my button</button></span></div>',
        role: 'button',
            'aria-live': 'polite',
        tabIndex: 0
    };
    return videojs.Component.prototype.createEl(null, props);
};

var myBtn;
videojs.plugin('myBtn', function () {
    var options = {
        'el': createCustomButton()
    };
    myBtn = new videojs.Btn(this, options);
    this.controlBar.el().appendChild(myBtn.el());
});

var vid = videojs("example_video_1", {
    plugins: {
        myBtn: {}
    }
});
      



      
  var Button = videojs.getComponent('Button');
  var CaptionsToggleButton = videojs.extend(Button, {
    init: function(player, options) {
      videojs.Button.call(this, player, {
        el: videojs.Button.prototype.createEl.call(this, 'div', {
          className: 'vjs-caption-toggle-control vjs-control',
          role: 'button',
          'aria-live': 'polite',
          innerHTML: '<div class="vjs-control-content"><span class="vjs-control-text">Toggle Captions</span></div>'
        })
      });
      this.language_ = options.language;
      this.on('click', this.onClick);
}
  });
  
videojs.Btn.prototype.onClick = function () {
    alert("Click on my custom button!");
};

  var captionsToggle = function() {
    'use strict';
    var player = this,
        settings = videojs.mergeOptions({
          language: 'en'
        }, options);

    player.controlBar.addChild('CaptionsToggleButton', settings);
  };

  
  registerPlugin('captions', captionsToggle);

})(window, window.videojs);
