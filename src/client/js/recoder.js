import regeneratorRuntime, { async } from "regenerator-runtime";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream, recorder, videoFile;

const handleDownload = async (e) => {
  startBtn.removeEventListener("click", handleDownload);
  startBtn.innerText = "Transcoding...";
  startBtn.disabled = true;

  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

  ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile));

  await ffmpeg.run("-i", "recording.webm", "-r", "60", "output.mp4");

  // -ss는 스크린샷, 1은 한장
  await ffmpeg.run(
    "-i",
    "recording.webm",
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    "thumbnail.jpg"
  );

  const mp4File = ffmpeg.FS("readFile", "output.mp4");
  const thumbFile = ffmpeg.FS("readFile", "thumbnail.jpg");

  // 실제 data는 buffer에 저장되있음
  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  const a = document.createElement("a");
  a.href = mp4Url;
  a.download = "MyRecording.mp4";
  document.body.appendChild(a);
  a.click();

  const b = document.createElement("a");
  b.href = thumbUrl;
  b.download = "MyThumbnail.jpg";
  document.body.appendChild(b);
  b.click();

  ffmpeg.FS("unlink", "output.mp4");
  ffmpeg.FS("unlink", "thumbnail.jpg");
  ffmpeg.FS("unlink", "recording.webm");

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  startBtn.addEventListener("click", handleStart);
  startBtn.innerText = "Record Again";
  startBtn.disabled = false;
};

// const handleStop = (e) => {
//   recorder.stop();
//   startBtn.innerText = "Download Recording";
//   startBtn.removeEventListener("click", handleStop);
//   startBtn.addEventListener("click", handleDownload);
// };

const handleStart = (e) => {
  startBtn.innerText = "Recoding";
  startBtn.disabled = true;
  startBtn.removeEventListener("click", handleStart);
  //startBtn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  recorder.ondataavailable = (e) => {
    videoFile = URL.createObjectURL(e.data); // blob...
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
    startBtn.innerText = "Download";
    startBtn.disabled = false;
    startBtn.addEventListener("click", handleDownload);
  };
  recorder.start();
  setTimeout(() => {
    recorder.stop();
  }, 5000);
};

const init = async (e) => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  video.srcObject = stream;
  video.play();
};

init();

startBtn.addEventListener("click", handleStart);
