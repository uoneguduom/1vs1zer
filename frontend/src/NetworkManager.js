export default class NetworkManager {
  constructor(url) {
    this.ws = new WebSocket(url);
    this._handlers = {};
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      this._handlers[msg.type]?.(msg);
    };
    this.ws.onerror = (e) => console.error("WS error", e);
  }

  on(type, fn) {
    this._handlers[type] = fn;
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  whenReady(fn) {
    if (this.ws.readyState === WebSocket.OPEN) fn();
    else this.ws.addEventListener("open", fn, { once: true });
  }
}
