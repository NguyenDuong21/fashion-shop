class SocketServices {
  connection(socket) {
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
    socket.on("chat message", (msg) => {
      console.log("Message ::", msg);
      _io.emit("chat message", msg);
    });
    socket.on("JAVASCRIPT_ERROR", (msg) => {
      console.log("JAVASCRIPT_ERROR::" + msg);
    });
    socket.on("tracking_product", (msg) => {
      console.log("View product::" + msg);
    });
  }
}
module.exports = new SocketServices();
