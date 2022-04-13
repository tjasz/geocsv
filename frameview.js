// The frame viewer
function FrameView(elementId, connect) {
  // toggle "connected" so you don't hammer MP's server whiel testing
  this.connected = connect;
  this.frame = document.getElementById(elementId);
  this.clear();
}
FrameView.prototype.clear = function() {
  if (this.connected) {
    this.frame.setAttribute('src', "");
  }
};
FrameView.prototype.goTo = function(url) {
  if (this.connected) {
    this.frame.setAttribute('src', url);
  }
};