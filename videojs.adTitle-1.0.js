(function(window, videojs) {
 'use strict';
  var init, extend;
  var className = '.vjs-dock-title';
  var defaults = {"advertisement_title":"Advertisement"};

  init = function ( options ) {

    this.one('loadstart', function(){
        var player = this;
        var media_title = player.mediainfo.name;
        defaults = extend({}, defaults, options || {});

        // When an ad starts, replace the content of the title with Advertisement
        player.on('ads-ad-started', function() {
          var dock_text_el = player.el().querySelector(className);
          if(dock_text_el) {
              dock_text_el.innerHTML = defaults.advertisement_title;
          }
        });

        // Whenever video ad ends put back the title.
        player.on('ads-ad-ended', function() {
            var dock_text_el = player.el().querySelector(className);
            if(dock_text_el) {
                dock_text_el.innerHTML = player.mediainfo.name;
            }
        });

    });

  };

  extend = function(obj) {
    var arg, i, k;
    for (i = 1; i < arguments.length; i++) {
      arg = arguments[i];
      for (k in arg) {
        if (arg.hasOwnProperty(k)) {
          obj[k] = arg[k];
        }
      }
    }
    return obj;
  };

  // register the plugin
  videojs.registerPlugin('adtitle', init);

})(window, window.videojs);
