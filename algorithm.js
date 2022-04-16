function* filter(data, predicate = function(item) { return true; }) {
  if (null === data) return null;
  for (let item of data) {
    if (predicate(item)) yield item;
  }
}

function toDegrees(input) {
  if ("" !== input && !isNaN(Number(input))) return Number(input);
  // otherwise try to Nddmmsshh format
  var deg = 0;
  if (input.length >= 9)
  {
    // read seconds and hudredths
    deg += Number(input.slice(-4)) / 100;
    deg /= 60.0;
    // read minutes
    deg += Number(input.substr(input.length-6,2));
    deg /= 60.0;
    // read degrees
    deg += Number(input.substring(1, input.length-6));
    if (input[0] === "W" || input[0] === "S") deg *= -1;
    if (!isNaN(deg)) return deg;
  }
  // otherise, bad latlng
  return null;
}