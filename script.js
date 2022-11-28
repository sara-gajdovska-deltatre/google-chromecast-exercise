let session = null;

window['__onGCastApiAvailable'] = function(isAvailable) {
    if (isAvailable) {
      initializeCastApi();
    }
  };

function initializeCastApi() {
    cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
      });  
};

async function connectToSession() {
	await Promise.resolve();
    var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    if (!castSession) {
        return cast.framework.CastContext.getInstance().requestSession()
            .then(() => {
                return Promise.resolve(cast.framework.CastContext.getInstance().getCurrentSession());
            });
    }
    return Promise.resolve(castSession);
}

document.getElementById("btn").addEventListener('click', () => {
  launchApp();
});

function onLaunchError() {
        console.log("Error connecting to the Chromecast.");
}

function onRequestSessionSuccess(e) {
        console.log("Successfully created session: " + e.sessionId);
        session = e;
        loadMedia();
}

function launchApp() {
	return connectToSession()
	.then((session)=> {
        var mediaInfo = new chrome.cast.media.MediaInfo('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
		mediaInfo.contentType = 'video/mp4';
		var request = new chrome.cast.media.LoadRequest(mediaInfo);
		request.autoplay = true;
		return session.loadMedia(request);
	})
	.then(()=> { 
		listenToRemote();
	})
	.catch((error)=> {	
		console.log(error);
	});
}

function listenToRemote() {
	var player = new cast.framework.RemotePlayer();
	var playerController = new cast.framework.RemotePlayerController(player);

	playerController.addEventListener(
	cast.framework.RemotePlayerEventType.ANY_CHANGE, function() {
    	// you could update the play/pause button here or update the displayed time
		console.log(player.isPaused);
	});

	playerController.addEventListener(
	cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, function() {
		if (!player.isConnected) {
			stopApp();
		}
	});
}

function loadMedia() {
        var mediaInfo = new chrome.cast.media.MediaInfo('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
        mediaInfo.contentType = 'video/mp4';
  
        var request = new chrome.cast.media.LoadRequest(mediaInfo);
        request.autoplay = true;

        session.loadMedia(request, () => {
            var player = new cast.framework.RemotePlayer();
            var playerControl = new cast.framework.RemotePlayerController(player);
            playerControl.addEventListener(
                cast.framework.RemotePlayerEventType.ANY_CHANGE, function() {
                    console.log(player.isPaused);
                });
            
            playerControl.addEventListener(
                cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, function() {
                    if (!player.isConnected) {
                        stopApp();
                    }
                });
        }, () => {
            console.log('error');
        });
}

function togglePlayPause() {
	var player = new cast.framework.RemotePlayer();
	var playerController = new cast.framework.RemotePlayerController(player);
	playerController.playOrPause();
}

document.getElementById("stop").addEventListener('click', () => {
    stopApp();
  });


document.getElementById("pause").addEventListener('click', () => {
    togglePlayPause(); 
  });

function stopApp() {
    session.stop(onStopAppSuccess, onStopAppError);
}

function onStopAppSuccess() {   
        console.log('Successfully stopped app.');
}

function onStopAppError() {
        console.log('Error stopping app.');
}
