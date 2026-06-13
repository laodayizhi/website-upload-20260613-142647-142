import { H as Hls } from './hls-vendor.js';

const video = document.querySelector('[data-player]');
const overlay = document.querySelector('[data-play-overlay]');
let attached = false;
let hlsInstance = null;

const waitForReady = () => new Promise((resolve) => {
  if (!video || video.readyState > 0) {
    resolve();
    return;
  }

  let done = false;
  const complete = () => {
    if (done) {
      return;
    }
    done = true;
    video.removeEventListener('loadedmetadata', complete);
    video.removeEventListener('canplay', complete);
    resolve();
  };

  video.addEventListener('loadedmetadata', complete);
  video.addEventListener('canplay', complete);
  window.setTimeout(complete, 1300);
});

const attachVideo = () => {
  if (!video || attached) {
    return;
  }

  const source = video.dataset.videoSrc;
  if (!source) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    attached = true;
    return;
  }

  if (Hls && Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(video);
    attached = true;
    return;
  }

  video.src = source;
  attached = true;
};

const startPlayback = async () => {
  if (!video) {
    return;
  }

  attachVideo();
  if (overlay) {
    overlay.hidden = true;
  }

  try {
    await waitForReady();
    await video.play();
  } catch (error) {
    if (overlay) {
      overlay.hidden = false;
    }
  }
};

if (overlay) {
  overlay.addEventListener('click', startPlayback);
}

if (video) {
  video.addEventListener('click', () => {
    if (video.paused) {
      startPlayback();
    }
  });
  video.addEventListener('play', () => {
    if (overlay) {
      overlay.hidden = true;
    }
  });
  video.addEventListener('ended', () => {
    if (overlay) {
      overlay.hidden = false;
    }
  });
}

window.addEventListener('pagehide', () => {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
});
