export default function handler(req, res) {
  if (req.method === "POST") {
    res.socket.server.io.emit("mpesaCallback", req.body.Body.stkCallback);
  } else {
    res.status(405).end();
  }
}
