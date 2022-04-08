function* filter(data, predicate = function(item) { return true; }) {
  if (null === data) return null;
  for (let item of data) {
    if (predicate(item)) yield item;
  }
}