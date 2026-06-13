import { H as Hls } from '../vendor/hls-vendor-dru42stk.js';

document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var status = player.querySelector('[data-player-status]');
    var toggleButton = player.querySelector('[data-player-toggle]');
    var muteButton = player.querySelector('[data-player-mute]');
    var fullscreenButton = player.querySelector('[data-player-fullscreen]');
    var source = player.getAttribute('data-src');
    var initialized = false;
    var hls = null;

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function initializePlayer() {
        if (initialized || !video || !source) {
            return initialized;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(source);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus('视频已就绪');
            });

            hls.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    setStatus('网络加载异常，正在重试');
                    hls.startLoad();
                    return;
                }

                if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    setStatus('媒体播放异常，正在恢复');
                    hls.recoverMediaError();
                    return;
                }

                setStatus('当前浏览器无法播放该视频');
                hls.destroy();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                setStatus('视频已就绪');
            }, { once: true });
        } else {
            setStatus('当前浏览器不支持 HLS 播放');
            return false;
        }

        initialized = true;
        return true;
    }

    function playVideo() {
        if (!initializePlayer()) {
            return;
        }

        if (cover) {
            cover.classList.add('is-hidden');
        }

        video.controls = true;
        player.classList.add('is-playing');
        setStatus('正在加载播放源');

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                window.setTimeout(function () {
                    video.play().catch(function () {
                        setStatus('请再次点击播放按钮');
                    });
                }, 600);
            });
        }
    }

    function toggleVideo() {
        if (!video) {
            return;
        }

        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    }

    if (cover) {
        cover.addEventListener('click', playVideo);
    }

    if (toggleButton) {
        toggleButton.addEventListener('click', toggleVideo);
    }

    if (muteButton) {
        muteButton.addEventListener('click', function () {
            if (!video) {
                return;
            }

            video.muted = !video.muted;
            muteButton.textContent = video.muted ? '取消静音' : '静音';
        });
    }

    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', function () {
            if (document.fullscreenElement) {
                document.exitFullscreen();
                return;
            }

            if (player.requestFullscreen) {
                player.requestFullscreen();
            }
        });
    }

    if (video) {
        video.addEventListener('play', function () {
            player.classList.add('is-playing');
            setStatus('正在播放');
        });

        video.addEventListener('pause', function () {
            player.classList.remove('is-playing');
            setStatus('已暂停');
        });
    }
});
