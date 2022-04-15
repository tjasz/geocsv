// The frame viewer
function FrameView(elementId) {
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