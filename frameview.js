// The frame viewer
function FrameView(elementId, connect) {
  // toggle "connected" so you don't hammer MP's server whiel testing
  this.connected = connect;
  this.frame = document.getElementById(elementId);
  this.goHome();
}
FrameView.prototype.goHome = function() {
  if (this.connected) {
    this.frame.setAttribute('src', "https://www.mountainproject.com/area/105739322/city-of-rocks");
  }
};
FrameView.prototype.goToRoute = function(url) {
  if (this.connected) {
    this.frame.setAttribute('src', url);
  }
};