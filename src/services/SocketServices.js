class SocketServices {
  connection(socket) {
    socket.on("disconnect", () => {
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
