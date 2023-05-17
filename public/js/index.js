let listUser = [];
let index;
fetch("http://localhost:3000/api/v1/questions")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    listUser = data;
    index = Math.floor(Math.random() * (listUser.length - 1));
    const renderValue = listUser[index];
    console.log(renderValue);
    const element = document.getElementById("question");
    element.innerHTML = renderValue.content;
  });

function handleModifyLikeDisLike(mod) {
  const request = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mod: mod,
      modifyQuestion: listUser[index],
    }),
  };
  console.log(request, "this is request");
  fetch(`http://localhost:3000/api/v1/questions/${listUser[index].id}`, request)
    .then((response) => console.log(response.json()))
    .then((data) => console.log(data));
  window.location.href = `/question-detail/${listUser[index].id}`;
}
