(function(window,document, videojs) {

  var ima3Helper = function ( ) {

    var player = this;

    var isInIframe = function isInIframe() {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true;
      }
    };

    var getParameterByName = function getParameterByName(name, url) {
      name = name.replace(/[\[\]]/g, '\\$&');
      if (!url) {
        url = window.location.href;
      }

      var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
      var results = regex.exec(url);

      if (!results) {
        return null;
      }
      if (!results[2]) {
        return '';
      }

      return decodeURIComponent(results[2].replace(/\+/g, ' '));
    };

    var addToIU = function addToIU(url, position, addition) {
      var iu = getParameterByName('iu', url);
      var originalIU = iu;

      if (iu.charAt(0) == '/') {
        iu = iu.substring(1);
      }

      var iuParts = iu.split('/');

      var arrayPosition = position - 1;

      for (var i = 0; i < arrayPosition; i++) {
        if (iuParts[i] == '') {
          iuParts[i] = 'video';
        }
      }

      iuParts[arrayPosition] = addition;

      iu = '/' + iuParts.join('/');

      return url.replace(originalIU, iu);
    };

    var getCustomParamsQueryString = function getCustomParamsQueryString() {

      var queryString = '';
      var requestUri = '';
      var requestUrl = '';

      var amp_url = getParameterByName('linkbaseurl'); //currently assuming that if linkbaseurk is found its an amp page.
      if (amp_url) {
        queryString += 'environment=googleamp&';
        var urlobj = parseUrl(amp_url);
        requestUri = urlobj.pathname; //since its an amp page lets get the path from the linkbaseurl;
        requestUrl = urlobj.hostname;
      } else {
        requestUri = getRequestUri();
        requestUrl = getRequestUrl();
      }

      if (requestUri || requestUrl) {

        var requestUriParts = requestUri.split('/');
        requestUriParts = removeEmptyElements(requestUriParts);
        
        var urlParts = requestUrl.replace('http://','').replace('https://','').split(/[/?#]/);
        urlParts = urlParts.split('.');
        var domainURL = urlParts[1] + '.' + urlParts[2];
        queryString += 'domain=' + (typeof domainURL !== 'undefined' ? domainURL : '') + '&';
        queryString += 'section=' + (typeof requestUriParts[0] !== 'undefined' ? requestUriParts[0] : '') + '&';
        queryString += 'page=' + requestUriParts.join(',') + '&';
      }

      var adUtilityObject = getAdUtility();
      var adUtilTargetQueryString = getAdUtilTargetQueryString();

      if (adUtilityObject != false && adUtilityObject.sponsId != '') {
        queryString += 'SponsId=' + adUtilityObject.sponsId + '&';
      }

      if (adUtilTargetQueryString != false) {
        queryString += adUtilTargetQueryString;
      }

      if (queryString[queryString.length - 1] == '&') {
        // If last character is &
        queryString = queryString.substring(0, queryString.length - 1);
      }

      return queryString;
    };

    var removeEmptyElements = function removeEmptyElements(array) {
      for (var i = 0; i < array.length; i++) {
        if (array[i] == '') {
          array.splice(i, 1);
          i--;
        }
      }
      return array;
    };

    var getAdUtilTargetQueryString = function getAdUtilTargetQueryString() {
      var adUtilTargetQueryString = '';
      var adUtilTargetObject = getAdUtilTarget();

      if (adUtilTargetObject == false) {
        return false;
      }

      var notTags = ['PostID', 'Author', 'Category', 'ContentType'];
      var elements = [];

      elements.Tags = '';

      for (var key in adUtilTargetObject) {
        var value = adUtilTargetObject[key];

        if (typeof(value) === 'object') {
          value = value.join(',');
        }

        if (notTags.indexOf(key) >= 0) {
          elements[key] = value;
        } else {
          elements.Tags += value + ',';
        }
      }

      if (elements.Tags[elements.Tags.length - 1] == ',') {
        elements.Tags = elements.Tags.substring(0, elements.Tags.length - 1);
      }

      for (var _key in elements) {
        adUtilTargetQueryString += _key + '=' + elements[_key] + '&';
      }

      return adUtilTargetQueryString;
    };

    var getAdUtility = function getAdUtility() {
      var inIframe = isInIframe();

      if (inIframe) {
        try {
          if (typeof parent.adUtility !== 'undefined') {
            return parent.adUtility;
          }
        } catch (e) {} // to catch cross-origin access
      } else if (typeof window.adUtility !== 'undefined') {
        return window.adUtility;
      }
      return false;
    };

    var getRequestUrl = function getRequestUrl() {
      var inIframe = isInIframe();
      var requestUrl = window.location.href;

      if (inIframe) {
        try {
          requestUrl = document.referrer;
        } catch (e) {
          // to catch cross-origin issues.
          requestUrl = ''; // setting it to false, so as to not report wrong values.
        }
      }
      return requestUrl;
    };

    var getRequestUri = function getRequestUri() {
      var inIframe = isInIframe();
      var requestUri = window.location.pathname;

      if (inIframe) {
        try {
          requestUri = parent.location.pathname;
        } catch (e) {
          // to catch cross-origin issues.
          requestUri = ''; // setting it to false, so as to not report wrong values.
        }
      }
      return requestUri;
    };

    var getAdUtilTarget = function getAdUtilTarget() {
      var inIframe = isInIframe();

      if (inIframe) {
        try {
          if (typeof parent.adutil_target !== 'undefined') {
            return parent.adutil_target;
          }else{
            return Object.values(parent.articleMetaData)[0]["Tags"];
          }
        } catch (e) {} // to catch cross origin errors
      } else if (typeof window.adutil_target !== 'undefined') {
        return window.adutil_target;
      }else{
        return Object.values(articleMetaData)[0]["Tags"];
      }
      return false;
    };

    var parseUrl = function parseUrl(url) {
      var a = document.createElement('a');
      a.href = url;
      return a;
    };

    var getIndexAds=function(a,b){if("string"!=typeof a||"object"!=typeof b)return a;try{b=JSON.stringify(b);var c=window.location!==window.parent.location?document.referrer:window.location.href,d=encodeURIComponent(a).replace(/(%7B)([^%]*)(%7D)/g,"{$2}");return console.log(d),"//as-sec.casalemedia.com/playlist?ix_id=%5Bindex_epr%5D&ix_v=8.8&ix_u="+encodeURIComponent(c)+"&ix_vt="+d+"&ix_s=191888&ix_vasd=0&ix_ca="+encodeURIComponent('{"protocols": [2,3,5,6],"mimes":["video/mp4","video/webm","application/javascript","video/x-flv","application/x-shockwave-flash"],"apiList":[1, 2],"size":"640x360","timeout": 1000,"durations": [15,30]}')+"&ix_so="+encodeURIComponent(b)}catch(b){return a}};

    var getSyndicatedTag = function getSyndicatedTag(player) {

      if(player.mediainfo) {
        var tags = player.mediainfo.tags;
        for (var i in tags) {
          if (tags[i].indexOf('syndicated=') >= 0) {
            // Getting the value of syndicated
            return tags[i].split('=')[1];
          }
        }
      }
      return false;
    };

    player.on('ready', function() {

        player.ima3.adMacroReplacement = function(url){

            var customFields = function customFields(mediainfo, macros, customFieldsName) {
              if (mediainfo && mediainfo[customFieldsName]) {
                var fields = mediainfo[customFieldsName];
                var fieldNames = Object.keys(fields);

                for (var i = 0; i < fieldNames.length; i++) {
                  var tag = '{mediainfo.' + customFieldsName + '.' + fieldNames[i] + '}';

                  macros[tag] = fields[fieldNames[i]];
                }
              }
            };

            if(url === '{adServerUrl}') {

              var adServerUrl = "";
              var site_ids = null;

              if(window.plugins && window.plugins.ima3){
                var options= window.plugins.ima3;
                adServerUrl = options.ad_server_url;
                if (options.hasOwnProperty('index_bidding_ad_server_url_exchange') && options.index_bidding_ad_server_url_exchange.hasOwnProperty('index_bidding_ad_exchange_site_id')) {
                  site_ids = options.index_bidding_ad_server_url_exchange.index_bidding_ad_exchange_site_id;
                }

              }
              else{
                //lets try fetching this from the URL
                adServerUrl = getParameterByName('adServerUrl');
                site_ids = getParameterByName('siteIds');
                if(site_ids && site_ids.length > 0){
                  site_ids = JSON.parse(site_ids);
                }
                else{
                  site_ids = null;
                }
              }

              // if it is loaded from brightcove
              var syndicated = getSyndicatedTag(player);
              if (syndicated) {
                adServerUrl = addToIU(adServerUrl, 3, syndicated);
              }

              var customParams = getCustomParamsQueryString();

              if (customParams != '') {
                adServerUrl += '&cust_params=' + encodeURIComponent(customParams);
              }

              //index bidding exchange
              if (site_ids) {
                adServerUrl = getIndexAds(adServerUrl, site_ids);
              }

              //replacing the macros
              var macros = {};

              // Static macros
              macros['{player.id}'] = player.options_['data-player'];
              macros['{mediainfo.id}'] = player.mediainfo ? player.mediainfo.id : '';
              macros['{mediainfo.name}'] = player.mediainfo ? player.mediainfo.name : '';
              macros['{mediainfo.description}'] = player.mediainfo ? player.mediainfo.description : '';
              macros['{mediainfo.tags}'] = player.mediainfo ? player.mediainfo.tags : '';
              macros['{mediainfo.reference_id}'] = player.mediainfo ? player.mediainfo.reference_id : '';
              macros['{mediainfo.duration}'] = player.mediainfo ? player.mediainfo.duration : '';
              macros['{mediainfo.ad_keys}'] = player.mediainfo ? player.mediainfo.ad_keys : '';
              macros['{player.duration}'] = player.duration();
              macros['{timestamp}'] = new Date().getTime();
              macros['{document.referrer}'] = document.referrer;
              macros['{window.location.href}'] = window.location.href;
              macros['{random}'] = Math.floor(Math.random() * 1000000000000);
              macros['{showname}'] = '';
              if( player.mediainfo && player.mediainfo.customFields && player.mediainfo.customFields.displayShowName ){
                macros['{showname}'] = player.mediainfo.customFields.displayShowName.replace(/[^a-zA-Z0-9]/i, '').toLowerCase()
              }


              customFields(player.mediainfo, macros, 'custom_fields');
              customFields(player.mediainfo, macros, 'customFields');

              if(adServerUrl) {
                for (var i in macros) {
                  adServerUrl = adServerUrl.split(i).join(encodeURIComponent(macros[i]));
                }
              }

              return adServerUrl;


            }
            return "";
        }
    });
  };

  videojs.registerPlugin('ima3Helper', ima3Helper);

})(window, document, videojs);