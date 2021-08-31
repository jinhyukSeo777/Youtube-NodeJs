import { async } from "regenerator-runtime";

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const textarea = form.querySelector("textarea");
const delBtn = document.querySelectorAll(".delBtn");

const addComment = (text, id) => {
  const videoComment = document.getElementById("video_comments");
  const ul = videoComment.querySelector("ul");
  const newComment = document.createElement("li");
  const icon = document.createElement("i");
  const span1 = document.createElement("span");
  const span2 = document.createElement("span");

  icon.className = "fas fa-comment";
  span1.innerText = ` ${text}`;
  span2.innerText = "❌";
  span2.addEventListener("click", handleDelete);

  newComment.appendChild(icon);
  newComment.appendChild(span1);
  newComment.appendChild(span2);
  newComment.className = "video_comment";
  newComment.dataset.id = id;

  ul.prepend(newComment);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const text = textarea.value;
  const videoID = videoContainer.dataset.id;

  if (text === "") {
    return;
  }

  const response = await fetch(`/api/videos/${videoID}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  // const status = response.status; 등 사용가능

  const { newCommentId } = await response.json();

  addComment(text, newCommentId);

  textarea.value = "";
};

const handleDelete = async (e) => {
  const btn = e.target;
  const li = btn.parentNode;
  const ul = li.parentNode;
  ul.removeChild(li);

  const commentId = li.dataset.id;
  const videoID = videoContainer.dataset.id;

  await fetch(`/api/comments/${videoID}/${commentId}`, {
    method: "DELETE",
  });
};

form.addEventListener("submit", handleSubmit);
for (let btn of delBtn) {
  btn.addEventListener("click", handleDelete);
}
