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
FieldSieve.prototype.predicate = function(x) {
  result = true;
  for (const [field, sieve] of Object.entries(this.sieves)) {
    result = result && sieve.predicate(x[field]);
  }
  return result;
};

var sieveTypeMap = {
  None: NoneSieve,
  IsEmpty: IsEmptySieve,
  IsNotEmpty: IsNotEmptySieve,
  TextContains: NoneSieve,
  TextDoesNotContain: NoneSieve,
  TextStartsWith: NoneSieve,
  TextEndsWith: NoneSieve,
  TextIsExactly: NoneSieve,
  DateIs: NoneSieve,
  DateIsBefore: NoneSieve,
  DateIsAfter: NoneSieve,
  GreaterThan: NoneSieve,
  GreaterThanOrEqualTo: NoneSieve,
  LessThan: NoneSieve,
  LessThanOrEqualTo: NoneSieve,
  IsEqualTo: NoneSieve,
  IsNotEqualTo: NoneSieve,
  IsBetween: NoneSieve,
  IsNotBetween: NoneSieve
};

function NoneSieve() {
}
NoneSieve.prototype.predicate = function(x) {
  return true;
}

function IsEmptySieve() {
}
IsEmptySieve.prototype.predicate = function(x) {
  return "" === x;
}

function IsNotEmptySieve() {
}
IsNotEmptySieve.prototype.predicate = function(x) {
  return !(new IsEmptySieve()).predicate(x);
}

function IsBetweenSieve(min, max) {
  this.min = min;
  this.max = max;
}
IsBetweenSieve.prototype.predicate = function(x) {
  return this.min <= x && x <= this.max;
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