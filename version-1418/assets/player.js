(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (wrap) {
    var button = wrap.querySelector('[data-play]');
    var video = wrap.querySelector('video');

    if (!button || !video) {
      return;
    }

    var streamUrl = button.getAttribute('data-stream');
    var hlsInstance = null;

    function beginPlay() {
      if (!streamUrl) {
        return;
      }

      button.querySelector('strong').textContent = '加载中';

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          wrap.classList.add('is-playing');
          video.play().catch(function () {});
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !hlsInstance) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
            hlsInstance = null;
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', function () {
          wrap.classList.add('is-playing');
          video.play().catch(function () {});
        }, { once: true });
      } else {
        video.src = streamUrl;
        wrap.classList.add('is-playing');
        video.play().catch(function () {});
      }
    }

    button.addEventListener('click', beginPlay, { once: true });
  });
})();
