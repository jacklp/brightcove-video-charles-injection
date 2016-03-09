/**
 * Brightcove Google Analytics Plugins for Smart API
 *
 * REFERENCES:
 *	 Website: 
 *	 Source: 
 *
 * AUTHORS:
 *	 Tatsuo Hase <thase@brightcove.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, alter, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to
 * whom the Software is furnished to do so, subject to the following conditions:
 *   
 * 1. The permission granted herein does not extend to commercial use of
 * the Software by entities primarily engaged in providing online video and
 * related services.
 *  
 * 2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT ANY WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, SUITABILITY, TITLE,
 * NONINFRINGEMENT, OR THAT THE SOFTWARE WILL BE ERROR FREE. IN NO EVENT
 * SHALL THE AUTHORS, CONTRIBUTORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY WHATSOEVER, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH
 * THE SOFTWARE OR THE USE, INABILITY TO USE, OR OTHER DEALINGS IN THE SOFTWARE.
 *  
 * 3. NONE OF THE AUTHORS, CONTRIBUTORS, NOR BRIGHTCOVE SHALL BE RESPONSIBLE
 * IN ANY MANNER FOR USE OF THE SOFTWARE.  THE SOFTWARE IS PROVIDED FOR YOUR
 * CONVENIENCE AND ANY USE IS SOLELY AT YOUR OWN RISK.  NO MAINTENANCE AND/OR
 * SUPPORT OF ANY KIND IS PROVIDED FOR THE SOFTWARE.
 */

function GoogleAnalysticsJS(window, id, accountNumber, gaq, gaslot, gavarname, gavalue, playerName, pageName) {

	// ---------- CONSTANTS ----------
	// Event Names
	var ACTION_PLAYER_LOAD = "Player Load";
	var ACTION_VIDEO_LOAD = "Video Load";
	var ACTION_REFERRER_URL = "Referrer URL";
	var ACTION_MEDIA_BEGIN = "Media Begin";
	var ACTION_MEDIA_PAUSE = "Media Pause";
	var ACTION_MEDIA_RESUME = "Media Resume";
	var ACTION_MEDIA_COMPLETE = "Media Complete";

	var ACTION_MILESTONE_25 = "25% Milestone Passed";
	var ACTION_MILESTONE_50 = "50% Milestone Passe";
	var ACTION_MILESTONE_75 = "75% Milestone Passed";
	var ACTION_SEEK_FORWARD = "Seeked Forward";
	var ACTION_SEEK_BACKWARD = "Seeked Backward";

	// Event Attribute Setting (not currently used)
	var eventList = {
		PLAYER_LOAD: {name:ACTION_PLAYER_LOAD, enabled:true},
		VIDEO_LOAD: {name:ACTION_VIDEO_LOAD, enabled:true},
		REFERRER_URL: {name:ACTION_REFERRER_URL, enabled:false},
		MEDIA_BEGIN: {name:ACTION_MEDIA_BEGIN, enabled:true},
		MEDIA_PAUSE: {name:ACTION_MEDIA_PAUSE, enabled:false},
		MEDIA_RESUME: {name:ACTION_MEDIA_RESUME, enabled:false},
		MEDIA_COMPLETE: {name:ACTION_MEDIA_COMPLETE, enabled:true},
		MILESTONE_25: {name:ACTION_MILESTONE_25, enabled:true},
		MILESTONE_50: {name:ACTION_MILESTONE_50, enabled:true},
		MILESTONE_75: {name:ACTION_MILESTONE_75, enabled:true},
		SEEK_FORWARD: {name:ACTION_SEEK_FORWARD, enabled:true},
		SEEK_BACKWARD: {name:ACTION_SEEK_BACKWARD, enabled:true}
	};

	// ---------- PARAMETERS
	var _ACCOUNT_NUMBER = null;
	var _PLAYER_NAME = null;
	var _PAGE_NAME = null;

	var _CATEGORY_VIDEO;
	var _CUSTOM_EVENT_SLOT;;
	var _CUSTOM_EVENT_NAME;

	var _GAQ = null;
	var _GA_SLOT = null;
	var _GA_VAR_NAME  = null;
	var _GA_VALUE = null;
	
	// ---------- GLOBAL VARIABLES
	var player;
	var videoPlayer;

	var experienceModule;
	var videoPlayerModule;
	var contentModule;
	var cuePointModule;

	// Current Video Infomation
	var _currentVideo;
	var _customVideoID;
	var _currentPosition;

	//flags for tracking
	var _mediaBegin = false
	var _mediaComplete = true;
	var _mediaPaused = false;
	var _trackSeekForward = false;
	var _trackSeekBackward = false;

	var isPlugin = false;
	
	// ---------- Public Functions ----------

	// Global variable initialization
	_ACCOUNT_NUMBER = accountNumber;
	_PLAYER_NAME = playerName;
	_PAGE_NAME =  pageName;
	
	_CATEGORY_VIDEO = (_PLAYER_NAME == null) ? "Brightcove Player" : _PLAYER_NAME;
	_CUSTOM_EVENT_SLOT = 1;
	_CUSTOM_EVENT_NAME = "videoStatus";

	_GAQ = gaq;

	_GA_SLOT = 1;
	if(gaslot != null && gaslot > 0 && gaslot <= 5) _GA_SLOT = gaslot;

	_GA_VAR_NAME = "VIDEO";
	if(gavarname != null) _GA_VAR_NAME = gavarname;
	
	if(gavalue != null) _GA_VALUE = gavalue;
	// ----------

	// Initializer
    myLog("initialize: " + id);
    player = brightcove.api.getExperience(id);

    if (!player) {
        myLog("using universal api");
    } else {
        player = brightcove.getExperience(id);
        isPlugin = true;
        myLog("using plugin api");
    }
    experienceModule = player.getModule(brightcove.api.modules.APIModules.EXPERIENCE);
	experienceModule.addEventListener(brightcove.api.events.ExperienceEvent.TEMPLATE_READY, onHTMLTemplateReady);

	// ---------- Callback Functions ----------	
	function onGetExperienceHandler(result) {
		if(_PLAYER_NAME == null) {
			_PLAYER_NAME = ""+result;
		}

		if(_PAGE_NAME == null) {
			_PAGE_NAME = document.URL;
		}		
		myLog("_PLAYER_NAME = " + _PLAYER_NAME);
		myLog("_PAGE_NAME = " + _PAGE_NAME);
	}

	function onHTMLTemplateReady(event) {
	    experienceModule.removeEventListener(brightcove.api.events.ExperienceEvent.TEMPLATE_READY, onHTMLTemplateReady);
		// Get Available Modules
	    videoPlayerModule = player.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
		contentModule = player.getModule(brightcove.api.modules.APIModules.CONTENT);
		cuePointModule = player.getModule(brightcove.api.modules.APIModules.CUE_POINTS);

		// Media Events
		videoPlayerModule.addEventListener(brightcove.api.events.MediaEvent.BEGIN, onHTMLMediaBegin);
		videoPlayerModule.addEventListener(brightcove.api.events.MediaEvent.CHANGE, onHTMLMediaChange);
		videoPlayerModule.addEventListener(brightcove.api.events.MediaEvent.COMPLETE, onHTMLMediaComplete);
		videoPlayerModule.addEventListener(brightcove.api.events.MediaEvent.PLAY, onHTMLMediaPlay);
		videoPlayerModule.addEventListener(brightcove.api.events.MediaEvent.PROGRESS, onHTMLMediaProgress);
		videoPlayerModule.addEventListener(brightcove.api.events.MediaEvent.SEEK_NOTIFY, onHTMLMediaSeek);
		videoPlayerModule.addEventListener(brightcove.api.events.MediaEvent.STOP, onHTMLMediaStop);
		cuePointModule.addEventListener(brightcove.api.events.CuePointEvent.CUE, onHTMLCuePointCue);

		if(isPlugin == false) {
			experienceModule.getExperienceID(onGetExperienceHandler);
		} else {
			onGetExperienceHandler(experienceModule.getExperienceID());
		}

		if(_GAQ) {
			_GAQ.push(['_setAccount', _ACCOUNT_NUMBER]);
		}

		resetMediaFlags();
		processMediaChange(true);
	}
	

	// ---------- Event Handlers Start ----------
	function resetMediaFlags() {
		_mediaBegin = false;
		_mediaComplete = false;
		
		_mediaPaused = false;

		_trackSeekForward = false;
		_trackSeekBackward = false;
	}

	function initialTrackEvent(isFirst) {
		if(isFirst) {
			trackEvent(_CATEGORY_VIDEO, "PLAYER_LOAD", document.URL);
		}
		trackEvent(_CATEGORY_VIDEO, "VIDEO_LOAD", _customVideoID);
	}

	function processMediaChange(isFirst) {
		if(isPlugin == false) {
			videoPlayerModule.getCurrentVideo(function(video) {
				_currentVideo = video;
				
				_customVideoID = getCustomVideoID(_currentVideo);

				cuePointModule.getCuePoints(_currentVideo.id, function(cuePoints) {
					removeCuePoints(cuePoints);
					createCuePoints();
					initialTrackEvent(isFirst);
				});

			});
		} else {
			_currentVideo = videoPlayerModule.getCurrentVideo();
			_customVideoID = getCustomVideoID(_currentVideo);
			var cuePoints = cuePointModule.getCuePoints(_currentVideo.id);
			removeCuePoints(cuePoints);
			createCuePoints();			
			initialTrackEvent(isFirst);
		}
	}

	// ### EVENT HANDLER(MediaChanged) ###
	function onHTMLMediaChange(event) {
		showEvent(event);
		resetMediaFlags();
		processMediaChange(false);
	}

	function onHTMLMediaBeginHandler(video) {
		_currentVideo = video;
		_customVideoID = getCustomVideoID(_currentVideo);

		// Set to indicate that user watched at least one video in a session.
		if(_GAQ) {
			var value = _GA_VALUE;
			if(value == null) {
				value = _customVideoID;
			}
			_GAQ.push(['_setCustomVar', _GA_SLOT, _GA_VAR_NAME, value, 2]);
		}

		if(!_mediaBegin) {
			trackEvent(_CATEGORY_VIDEO, "MEDIA_BEGIN", _customVideoID, Math.round(_currentVideo.length / 1000));
			_mediaBegin = true;
			_mediaComplete = false;
		}
	}

	// ### EVENT HANDLER(MediaBegin) ###
	function onHTMLMediaBegin(event) {
	    showEvent(event);
		if(isPlugin == false) {
			videoPlayerModule.getCurrentVideo(onHTMLMediaBeginHandler);
		} else {
			onHTMLMediaBeginHandler(videoPlayerModule.getCurrentVideo());
		}
	}


	// ### EVENT HANDLER(MediaPlay) ###
	function onHTMLMediaPlay(event) {
	    showEvent(event);

		if(!_mediaBegin) {
			if(true || !_mediaComplete) {
				onHTMLMediaBegin(event);
			}
		}

		if(_mediaPaused) {
			_mediaPaused = false;
			trackEvent(_CATEGORY_VIDEO, "MEDIA_RESUME", _customVideoID, Math.round(event.position));
		}
	}


	// ### EVENT HANDLER(MediaStop) ###
	function onHTMLMediaStop(event) {
	    showEvent(event);
		if(!_mediaComplete && !_mediaPaused) {
			_mediaPaused = true;
			trackEvent(_CATEGORY_VIDEO, "MEDIA_PAUSE", _customVideoID, Math.round(event.position));
		}
	}


	// ### EVENT HANDLER(MediaComplete) ###
	function onHTMLMediaComplete(event) {
	    showEvent(event);
	    
		if(!_mediaComplete) {
			_mediaComplete = true;
			_mediaBegin = false;
			
			trackEvent(_CATEGORY_VIDEO, "MEDIA_COMPLETE", _customVideoID, Math.round(_currentVideo.length / 1000));
		}
	}


	// ### EVENT HANDLER(MediaProgress) ###
	function onHTMLMediaProgress(event) {
		// showEvent(event);
		_currentPosition = event.position;

		// Most of the time, mediaComplete will occur here.
		if( (Math.abs(event.duration - event.position) < 1) && !_mediaComplete) {
			videoPlayerModule.removeEventListener(brightcove.api.events.MediaEvent.PROGRESS, onHTMLMediaProgress);			
			onHTMLMediaComplete(event);
			videoPlayerModule.addEventListener(brightcove.api.events.MediaEvent.PROGRESS, onHTMLMediaProgress);			
		}
		if(!_mediaComplete) {
			if(_trackSeekForward) {
				trackEvent(_CATEGORY_VIDEO, "SEEK_FORWARD", _customVideoID, Math.round(_currentPosition));
				_trackSeekForward = false;
			}
			if(_trackSeekBackward) {
				trackEvent(_CATEGORY_VIDEO, "SEEK_BACKWARD", _customVideoID, Math.round(_currentPosition));
				_trackSeekBackward = false;
			}
		}
	}

	function onHTMLMediaSeek(event) {
	    showEvent(event);
		if(event.position > _currentPosition) {
			_trackSeekForward = true;
		} else {
			_trackSeekBackward = true;
		}
	}

	function onHTMLCuePointCue(event) {
	    showEvent(event);
		if(event.cuePoint.type == brightcove.api.modules.CuePointsModule.CuePointType.CODE && event.cuePoint.name == "milestone") {
			switch(event.cuePoint.metadata) {
			case "25%":
				trackEvent(_CATEGORY_VIDEO, "MILESTONE_25", _customVideoID, Math.round(event.cuePoint.time));
				break;
			case "50%":
				trackEvent(_CATEGORY_VIDEO, "MILESTONE_50", _customVideoID, Math.round(event.cuePoint.time));
				break;
			case "75%":
				trackEvent(_CATEGORY_VIDEO, "MILESTONE_75", _customVideoID, Math.round(event.cuePoint.time));
				break;
			}
		}
	}

	// ---------- Event Handlers End ----------


	function getCustomVideoID(currentVideo) {
//		var refId = currentVideo.referenceID || currentVideo.referenceId || "{null_refid}";
//		var customVideoID = refId + " | " + currentVideo.displayName;		
		var customVideoID = currentVideo.id + " | " + currentVideo.displayName;
		
		return customVideoID;
	}

	function trackEvent(category, event, label, value) {
		var eventName = eventList[event].name;
		var isTrack = eventList[event].enabled;
		myLog("ENABLED="+isTrack+" CAT="+category+" EVENT="+eventName+" LABEL="+label+" VALUE="+value);
		
		if(_GAQ && isTrack) {
			myLog("TRACK!");
			if(value == null) {
				_GAQ.push(['_trackEvent', category, eventName, label]);
			} else {
				_GAQ.push(['_trackEvent', category, eventName, label, value]);
			}
		}
	}

	function createCuePoints() {
		myLog("createCuePoints " + _currentVideo.id);
		var percent25 = {
			type: brightcove.api.modules.CuePointsModule.CuePointType.CODE, //chapter cue point
			name: "milestone",
			metadata: "25%",
			time: (_currentVideo.length/1000) * 0.25
		};
		var percent50 = {
			type: brightcove.api.modules.CuePointsModule.CuePointType.CODE, //chapter cue point
			name: "milestone",
			metadata: "50%",
			time: (_currentVideo.length/1000) * 0.50
		};
		var percent75 = {
			type: brightcove.api.modules.CuePointsModule.CuePointType.CODE, //chapter cue point
			name: "milestone",
			metadata: "75%",
			time: (_currentVideo.length/1000) * 0.75
		};
		var cuePoints = [percent25, percent50, percent75];
		myLog(cuePoints);
		cuePointModule.addCuePoints(_currentVideo.id, cuePoints);
	}

	function removeCuePoints(cuePoints) {
		if(cuePoints != null) {
			for(var j = 0; j < cuePoints.length; j++) {
				var cuePoint = cuePoints[j];
				if(cuePoint.type == brightcove.api.modules.CuePointsModule.CuePointType.CODE && cuePoint.name == 'milestone') {
					myLog("REMOVING = " + cuePoint.time);
					cuePointModule.removeCodeCuePointsAtTime(_currentVideo.id, cuePoint.time);
				}
			}
		}
	}

	// ########## User Setting End ##########	
	function showEvent(event) {
		myLog(event.type);
	}
	
	function myLog(str) {
		(str);
	}
}
