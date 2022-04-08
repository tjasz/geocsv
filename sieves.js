function NumberSieve() {
}
NumberSieve.prototype.setMin = function(min) {
  this.min = min;
};
NumberSieve.prototype.setMax = function(max) {
  this.max = max;
};
NumberSieve.prototype.setRange = function(min, max) {
  this.min = min;
  this.max = max;
};
NumberSieve.prototype.predicate = function(x) {
  result = true;
  if (null !== this.min && !isNaN(this.min)) result = result && this.min <= x;
  if (null !== this.max&& !isNaN(this.max)) result = result && this.max >= x;
  return result;
};

function StringSieve() {
  this.substrs = [];
}
StringSieve.prototype.set = function(substrs) {
  this.substrs = substrs;
};
StringSieve.prototype.predicate = function(x) {
  if (this.substrs.length < 1) return true;
  result = false;
  for (let ss of this.substrs) {
    if (ss.charAt(0) === "!")
    {
      result = result && !x.toUpperCase().includes(ss.substring(1).toUpperCase());
    } else {
      result = result || x.toUpperCase().includes(ss.toUpperCase());
    }
  }
  return result;
};

function FieldSieve() {
  this.sieves = {}
}
FieldSieve.prototype.clear = function() {
  this.sieves = {}
};
FieldSieve.prototype.clear = function(field) {
  delete this.sieves[field];
};
FieldSieve.prototype.set = function(field, sieve) {
  this.sieves[field] = sieve;
};
FieldSieve.prototype.predicate = function(item) {
  result = true;
  for (const [field, sieve] of Object.entries(this.sieves)) {
    result = result && sieve.predicate(item[field]);
  }
  return result;
};