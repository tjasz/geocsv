// The frame viewer
function FrameView(elementId) {
  this.frame = document.getElementById(elementId);
  this.clear();
}
FrameView.prototype.clear = function() {
  this.frame.setAttribute('src', "");
};
FrameView.prototype.goTo = function(url) {
  this.frame.setAttribute('src', url);
};