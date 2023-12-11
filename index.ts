const express = require("express");
const mainRouter = require("./Router/main");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")));
app.use(express.static(path.join(__dirname, "public/")));

io.on("connection", (socket) => {
  socket.on("pesanan", (pesanan) => {
    console.log("pesanannn");
    io.emit("pesanan", pesanan);
  });
});

app.use(mainRouter);
app.set("socketio", io);

http.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
