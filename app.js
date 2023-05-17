const bodyParser = require("body-parser");
const { error } = require("console");
const express = require("express");
const app = express();
const fs = require("fs");
app.use(bodyParser.json());
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
app.get("/ask", (req, res) => {
  res.sendFile(__dirname + "/public/ask.html");
});
app.get("/question-detail/:id", (req, res) => {
  const { id } = req.params;
  console.log(id, "id");
  res.sendFile(__dirname + "/public/question-detail.html");
});
// app.get("/question-detail/:id", (req, res) => {
//   res.sendFile(__dirname + "/public/question-detail.html");
// });
app.get("/api/v1/questions", (req, res) => {
  console.log("wtf how it can run into it ?");
  fs.readFile("./data/question.json", "utf-8", (error, data) => {
    if (error) {
      res.status(500).json({
        message: error,
      });
    } else {
      const questions = JSON.parse(data);
      res.status(200).json(questions);
    }
  });
});
app.get("/api/v1/questions/:id", checkExits, (req, res) => {
  fs.readFile("./data/question.json", "utf-8", (error, data) => {
    if (error) {
      res.status(500).json({
        message: error,
      });
    } else {
      const { id } = req.params;
      const questions = JSON.parse(data);
      const index = questions.findIndex((e) => {
        return e.id === +id;
      });
      if (index !== -1) {
        res.status(200).json(questions[index]);
      } else {
        res.status(404).json({ message: "not found question" });
      }
    }
  });
});
app.post("/api/v1/questions", checkExits, (req, res) => {
  const input = req.body;
  let id = Math.floor(Math.random() * 10000000000000);
  fs.readFile("./data/question.json", "utf-8", (error, data) => {
    if (error) {
      res.status(500).json({
        message: error,
      });
    } else {
      const questions = JSON.parse(data);
      const index = questions.findIndex((e) => {
        return e.content === input.content;
      });
      if (index === -1) {
        let i = questions.findIndex((e) => e.id === id);
        if (i != -1) {
          while (i === -1) {
            (id = Math.floor(Math.random() * 10000000000000)),
              (i = questions.findIndex((e) => {
                return e.id === id;
              }));
          }
        }
        const newQuestion = { ...input, id: id };
        questions.push(newQuestion);
        console.log(questions, "it run over loop to this");
        fs.writeFileSync("./data/question.json", JSON.stringify(questions));
        res.status(200).json({
          status: "successfull",
          data: questions,
        });
      } else {
        res.status(200).json({
          message: "content has been exits",
        });
      }
    }
  });
});
app.put("/api/v1/questions/:id", checkExits, (req, res) => {
  console.log("does it run into put");
  const { id } = req.params;
  const mod = req.body.mod;
  const update = { ...req.body.modifyQuestion, id: id };
  fs.readFile("./data/question.json", (error, data) => {
    if (error) {
      res.status(500).json({ message: error });
    } else {
      const questions = JSON.parse(data);
      const index = questions.findIndex((e) => {
        console.log(e.id);
        return e.id.toString() === id;
      });
      if (index !== -1) {
        console.log(mod, "this is mod");
        if (mod == -1) {
          update.dislike = +update.dislike + 1;
        } else {
          update.like = +update.like + 1;
        }
        questions.splice(index, 1, update);
        fs.writeFileSync("./data/question.json", JSON.stringify(questions));
        res.status(200).json({
          message: "update complete",
          data: questions,
        });
      } else {
        res.status(404).json({
          message: "not found",
        });
      }
    }
  });
});
app.delete("/api/v1/questions/:id", checkExits, (req, res) => {
  const { id } = req.params;
  fs.readFile("./data/question.json", (error, data) => {
    if (error) {
      res.status(500).json({
        message: error,
      });
    } else {
      const questions = JSON.parse(data);
      const index = questions.findIndex((e) => e.id.toString() === id);
      if (index !== -1) {
        questions.splice(index, 1);
        fs.writeFileSync("./data/question.json", JSON.stringify(questions));
        res.status(200).json({
          status: "delete successfull",
          data: questions,
        });
      } else {
        res.status(404).json({
          message: "not found",
        });
      }
    }
  });
});
app.get("/*", (req, res) => {
  res.sendFile(__dirname + "/public/notFound.html");
});
app.listen(3000, () => {
  console.log("server run into http://localhost:3000");
});
function checkExits(req, res, next) {
  console.log("does it run into check exit");
  const content = req.body.modifyQuestion.content;
  console.log(req);
  const { id } = req.params;
  const questions = JSON.parse(fs.readFileSync("./data/question.json"));
  const exitsContent = questions.findIndex((e) => e.content === content);
  const exitsIndex = questions.findIndex((e) => e.id.toString() === id);
  if (exitsContent !== -1) {
    res.json({ message: "content already exits" });
  } else {
    next();
  }
  if (id != undefined) {
    if (exitsIndex !== -1) {
      next();
    } else {
      res.json({ message: "question not found" });
    }
  }
}
