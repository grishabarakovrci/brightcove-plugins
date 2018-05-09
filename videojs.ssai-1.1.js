/**
 * AdBlockerDetect.js plugin
 *
 * (C) 2016 Brightcove Inc.
 *
 * @requires jquery 1.10.2+
 *
 */
adBlockDetectService = function () {
    'use strict';

    // consts
    var PINGTIMEOUT = 2000;
    var STATUSOK = 200;
    var STATUSNOCONTENT = 204;
    var DEFAULT_FAILED_MAX = 1;
    var MIN_RANDOM = 1;
    var MAX_RANDOM = 1000;
    var DEFAULT_SPIN_TIME = 10;
    var EMBED_ATTR = "default";
    var PLAYER_CLASS = "video-js";

    // external fields
    var publisherId = '';
    var location;
    var deviceType;
    var userId;
    var domain;
    var altPlayerID;
    var altVideoID;
    var adConfigId;
    var currentVideoID;
    var player;

    // urls
    var beaconUrls = [
        "http://adprovider.com/"
    ];
    var serverUrl = 'https://statserver.com/';

    // fail criterion
    var maxFailureCount = DEFAULT_FAILED_MAX;

    // throttle params
    var minRandomNumber = MIN_RANDOM;
    var maxRandomNumber = MAX_RANDOM;
    var triggerNumber = MIN_RANDOM;
    var spinInterval = DEFAULT_SPIN_TIME;

    // internal
    var timer = null;

    var isAltPlayerLoaded = false;
    var isAltVideoLoaded = false;

    function publishPlayer() {
        var playerSnippet,
            scriptUrl,
            playerScriptEl,
            parentEl,
            playerId,
            tveToken = false;

        parentEl = player.el_.parentElement;
        playerId = player.el_.id;

        if ("tveToken" in player.catalog) {
            tveToken = player.catalog.tveToken;
        }

        playerSnippet = document.createElement("video");
        playerSnippet.setAttribute("id", playerId);
        playerSnippet.setAttribute("data-player", altPlayerID);
        playerSnippet.setAttribute("data-account", publisherId);
        if (tveToken) { // if this is an authenticated video, we need to load the video after passing the tveToken to the player.
            playerSnippet.setAttribute("data-video-id", "");
        }
        else {
            playerSnippet.setAttribute("data-video-id", currentVideoID);
        }
        playerSnippet.setAttribute("data-embed", EMBED_ATTR);
        playerSnippet.setAttribute("data-application-id", "");
        playerSnippet.setAttribute("class", PLAYER_CLASS);
        playerSnippet.setAttribute("controls", "");
        if (player.autoplay()) {
            playerSnippet.setAttribute("autoplay", "");
        }

        playerScriptEl = document.createElement("script");
        scriptUrl = "//players.brightcove.net/" + publisherId + "/" + altPlayerID + "_default/index.min.js";
        playerScriptEl.src = scriptUrl;

        player.dispose();

        parentEl.appendChild(playerSnippet);
        parentEl.appendChild(playerScriptEl);

        if (tveToken) {
            playerScriptEl.onload = function () {
                /**
                 * BC cannot use autoFindAndLoadMedia() since the video is available only after the TVEtoken is provided.
                 * so we need to also add the Ad Config Id manually.
                 */
                videojs(playerId).ready(function () {
                    var _player = this;
                    _player.catalog.tveToken = tveToken;
                    _player.catalog.getVideo(currentVideoID, function (error, video) {
                        _player.catalog.load(video);
                    },adConfigId);
                });
            };
        }

    }

    // async get request to the url
    function pingBeacon(targetUrl) {
        return $.ajax({
            type: 'GET',
            url: (targetUrl.slice(-1) == '=') ? targetUrl+new Date().getTime() : targetUrl,
            //dataType: "jsonp", TODO: -- removed because MIME-type AJAX was forcing was causing an issue
            timeout: PINGTIMEOUT
        });
    }

    // send all requests
    function pingBeacons(targetUrls) {
        var requests = [];

        targetUrls.forEach(function (url) {
            var request = $.Deferred();

            pingBeacon(url).then(
                function (data, textStatus, jqXHR) {
                    request.resolve(jqXHR.status === STATUSOK || jqXHR.status === STATUSNOCONTENT);
                },
                function (jqXHR, textStatus) {
                    request.resolve(jqXHR.status === STATUSOK || jqXHR.status === STATUSNOCONTENT);
                });

            requests.push(request);
        });

        return requests;
    }

    // send new stat record
    function updateStatistics(record) {
        var result = $.post(
            serverUrl,
            JSON.stringify(record))
            .fail(function () {
                console.log('Failed to add a record.');
            });
    }

    // check results and create a record
    function processResults() {
        var record = {};
        var failureCount = 0;
        var count = arguments.length;

        for (var i = 0; i < count; i++) {
            if (!arguments[i])
                failureCount++;
        }

        record.timestamp = new Date().toISOString();
        record.referrer = document.location.href;
        record.publisherId = publisherId;
        record.isBlocked = (failureCount >= maxFailureCount);
        record.location = location;
        record.deviceType = deviceType;
        record.userId = userId;
        record.domain = domain;

        if (record.isBlocked) {
            if (!isAltPlayerLoaded) {
                publishPlayer();

                isAltPlayerLoaded = true;
                if (timer) {
                    clearInterval(timer);
                    timer = null;
                }
            }
            /**
             if (!isAltVideoLoaded) {
                player.catalog.getVideo(altVideoID, function(error, video) {

                    player.catalog.load(video);
                    isAltVideoLoaded = true;
                    if (timer) {
                        clearInterval(timer);
                        timer = null;
                    }
                });
            }
             **/

            console.info(record);

            //updateStatistics(record);
        }
    }

    // sync up
    function pollAll(targetUrls) {
        $.when.apply($, pingBeacons(targetUrls)).done(processResults);
    }

    // one time test of servers availability
    // requires:
    //  jquery, array of urls to test, statistics server url, publisher id
    // validates:
    //  max failure count
    function testBeacons() {
        if (!window.jQuery) {
            console.log('Need jQuery library.');
            return false;
        }

        if (!beaconUrls || !beaconUrls.length) {
            console.log('No list of beacons.');
            return false;
        }

        if (!serverUrl) {
            console.log('No server set.');
            return false;
        }

        if (!publisherId) {
            console.log('No Publisher Id set.');
            return false;
        }

        if (!maxFailureCount || isNaN(maxFailureCount) || maxFailureCount <= 0 || maxFailureCount > beaconUrls.length) {

            console.log('Incorrect Max Failure count. Using default. was: ' + maxFailureCount);
            maxFailureCount = DEFAULT_FAILED_MAX;
        }
        pollAll(beaconUrls);

        return true;
    }

    // one time test of servers availability if lucky
    function testBeaconsRandom() {
        var randomNumber = Math.floor(Math.random() * (maxRandomNumber - minRandomNumber + 1)) + minRandomNumber;

        if (randomNumber == triggerNumber) {
            if (!testBeacons()) {
                if (timer) {
                    clearInterval(timer);
                    timer = null;
                }
            }
        }
    }

    // repeated test of servers availability, randomly throttled
    function startBeaconsTesting() {
        if (!spinInterval || isNaN(spinInterval) || spinInterval < 1) {
            console.log('Incorrect spin interval. Using default.');
            spinInterval = DEFAULT_SPIN_TIME;
        }

        if (!minRandomNumber || isNaN(minRandomNumber) || minRandomNumber < 1) {
            console.log('Incorrect random range min. Using default.');
            minRandomNumber = MIN_RANDOM;
        }

        if (!maxRandomNumber || isNaN(maxRandomNumber) || maxRandomNumber < minRandomNumber + 1) {
            console.log('Incorrect random range max. Using default.');
            maxRandomNumber = MAX_RANDOM;
        }

        if (!triggerNumber || isNaN(triggerNumber) || triggerNumber > maxRandomNumber || triggerNumber < minRandomNumber) {
            console.log('Incorrect trigger number. Using default.');
            triggerNumber = minRandomNumber;
        }

        if (timer) {
            clearInterval(timer);
            timer = null;
        }

        timer = setInterval(testBeaconsRandom, spinInterval);
    }

    // api
    return {
        failureThreshold: maxFailureCount,
        setFailureThreshold: function (value) {
            maxFailureCount = value;
        },
        providerUrls: beaconUrls,
        setProviderUrls: function (value) {
            beaconUrls = value;
        },
        statisticsUrl: serverUrl,
        setStatisticsUrl: function (value) {
            serverUrl = value;
        },
        publisherId: publisherId,
        setPublisherId: function (value) {
            publisherId = value;
        },
        location: location,
        setLocation: function (value) {
            location = value;
        },
        deviceType: deviceType,
        setDeviceType: function (value) {
            deviceType = value;
        },
        userId: userId,
        setUserId: function (value) {
            userId = value;
        },
        domain: domain,
        setDomain: function (value) {
            domain = value;
        },
        getRandomizerParams: {
            min: minRandomNumber,
            max: maxRandomNumber,
            trigger: triggerNumber
        },
        setRandomizerParams: function (min, max, trigger) {
            minRandomNumber = min;
            maxRandomNumber = max;
            triggerNumber = trigger;
        },
        spinInterval: spinInterval,
        setSpinInterval: function (value) {
            spinInterval = value;
        },

        setAltPlayerID: function (value) {
            altPlayerID = value;
        },
        setAltVideoID: function (value) {
            altVideoID = value;
        },
        setAdConfigID: function (value) {
            adConfigId = value;
        },
        setCurrentVideoID: function (value) {
            currentVideoID = value;
        },
        setPlayer: function (value) {
            player = value;
        },

        detect: testBeacons,
        startDetection: startBeaconsTesting
    };
}();

(function (window, document, videojs, undefined) {
    AdBlockerDetect = function (options) {

        var player = this;
        options = options || {};

        if (!options.altPlayerID) {
            console.error('Plugin Error: No altPlayerID provided. Aborting.');
            return;
        }

        var account = (player.bcAnalytics) ? player.bcAnalytics.settings.accountId : 'default';

        var statsUrl = options.statsUrl || 'https://www.bcov-abd.com';
        var failureThreshold = options.failureThreshold || 5;
        var location = options.location || window.location.href;
        // TODO: input full URL to sample VAST Ad for DFP. Other DFP domains/hosts were returning 400's or 301 status codes
        var servers = options.servers || ['https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/7326/blockerstest/citytv.web/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dskippablelinear&sdkv=h.3.192.0&correlator='];
        //var servers = options.servers || ['https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dskippablelinear&sdkv=h.3.192.0&correlator='];
        //var servers = options.servers || [ 'http://pubads.g.doubleclick.net/', 'http://demo.v.fwmrm.net/ad/g/1'];
        var abdService = adBlockDetectService || {};

        var onLoadStart = function () {
            abdService.setCurrentVideoID(player.mediainfo.id);
            abdService.detect();
            abdService.startDetection();
        };

        abdService.setFailureThreshold(failureThreshold);
        abdService.setProviderUrls(servers);
        abdService.setPublisherId(account);
        abdService.setStatisticsUrl(statsUrl);
        abdService.setLocation(location);
        abdService.setPlayer(options.player || this);
        abdService.setAltPlayerID(options.altPlayerID);
        abdService.setAltVideoID(options.altVideoID);
        if (options.adConfigId) {
            abdService.setAdConfigID(options.adConfigId);
        }

        player.on("loadstart", onLoadStart);
    };

    // register the plugin with the player
    videojs.plugin("AdBlockerDetect", AdBlockerDetect);

})(window, document, videojs);