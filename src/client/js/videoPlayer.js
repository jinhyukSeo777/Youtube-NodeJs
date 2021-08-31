const video = document.querySelector("video");
const play = document.getElementById("play");
const playIcon = play.querySelector("i");
const mute = document.getElementById("mute");
const muteIcon = mute.querySelector("i");
const curTime = document.getElementById("curTime");
const totalTime = document.getElementById("totalTime");
const volumeRange = document.getElementById("volume");
const timeLine = document.getElementById("timeLine");
const fullScreen = document.getElementById("fullScreen");
const fullScreenIcon = fullScreen.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeoutID = null;
let curVolume = 0.5;
video.volume = 0.5;

const handlePlay = (e) => {
  if (video.paused) {
    video.play();
    playIcon.classList = "fas fa-stop";
  } else {
    video.pause();
    playIcon.classList = "fas fa-play";
  }
};

const handleMute = (e) => {
  if (video.muted) {
    video.muted = false;
    muteIcon.classList = "fas fa-volume-up";
    if (curVolume == 0) {
      video.volume = volumeRange.value = curVolume = 0.5;
    } else {
      video.volume = volumeRange.value = curVolume;
    }
  } else {
    video.muted = true;
    muteIcon.classList = "fas fa-volume-mute";
    volumeRange.value = 0;
  }
};

const handleVolume = (e) => {
  const value = e.target.value;
  video.volume = curVolume = value;
  if (value == 0) {
    video.muted = true;
    muteIcon.classList = "fas fa-volume-mute";
  } else {
    video.muted = false;
    muteIcon.classList = "fas fa-volume-up";
  }
};

const formatTime = (seconds) => {
  return new Date(seconds * 1000).toISOString().substr(14, 5);
};

const handleLoadedMetaData = (e) => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeLine.max = Math.floor(video.duration);
};

const handleTimeUpdate = (e) => {
  curTime.innerText = formatTime(Math.floor(video.currentTime));
  timeLine.value = Math.floor(video.currentTime);
};

const handleTimeLine = (e) => {
  const value = e.target.value;
  video.currentTime = value;
};

const handleFullscreen = (e) => {
  const isFullScreen = document.fullscreenElement;
  if (isFullScreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
  }
};

const handleMouseMove = (e) => {
  if (controlsTimeoutID) {
    clearTimeout(controlsTimeoutID);
    controlsTimeoutID = null;
  }
  videoControls.classList.add("showing");

  controlsTimeoutID = setTimeout(() => {
    videoControls.classList.remove("showing");
  }, 3000);
};

const handleMouseLeave = (e) => {
  clearTimeout(controlsTimeoutID);
  controlsTimeoutID = setTimeout(() => {
    videoControls.classList.remove("showing");
  }, 3000);
};

const handleEnded = (e) => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
};

play.addEventListener("click", handlePlay);
mute.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolume);
video.addEventListener("loadedmetadata", handleLoadedMetaData);
video.addEventListener("timeupdate", handleTimeUpdate);
timeLine.addEventListener("input", handleTimeLine);
fullScreen.addEventListener("click", handleFullscreen);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
video.addEventListener("click", handlePlay);
document.body.onkeyup = function (e) {
  if (e.keyCode == 32) {
    handlePlay();
  }
};
video.addEventListener("ended", handleEnded);
