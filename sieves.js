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
  TextContains: TextContainsSieve,
  TextDoesNotContain: TextDoesNotContainSieve,
  TextContainsAnyOfXNoneOfY : TextContainsAnyOfXNoneOfYSieve,
  TextStartsWith: TextStartsWithSieve,
  TextEndsWith: TextEndsWithSieve,
  TextIsExactly: TextIsExactlySieve,
  //TODO
  //DateIs: DateIsSieve,
  //DateIsBefore: DateIsBeforeSieve,
  //DateIsAfter: DateIsAfterSieve,
  GreaterThan: GreaterThanSieve,
  GreaterThanOrEqualTo: GreaterThanOrEqualToSieve,
  LessThan: LessThanSieve,
  LessThanOrEqualTo: LessThanOrEqualToSieve,
  IsEqualTo: IsEqualToSieve,
  IsNotEqualTo: IsNotEqualToSieve,
  IsBetween: IsBetweenSieve,
  IsNotBetween: IsNotBetweenSieve
};
var sieveParamsMap = {
  None: [],
  IsEmpty: [],
  IsNotEmpty: [],
  TextContains: ["Substring"],
  TextDoesNotContain: ["Substring"],
  TextContainsAnyOfXNoneOfY: ["AnyOf", "NoneOf"],
  TextStartsWith: ["Prefix"],
  TextEndsWith: ["Suffix"],
  TextIsExactly: ["String"],
  //TODO
  //DateIs: ["Date"],
  //DateIsBefore: ["Date"],
  //DateIsAfter: ["Date"],
  GreaterThan: ["Value"],
  GreaterThanOrEqualTo: ["Value"],
  LessThan: ["Value"],
  LessThanOrEqualTo: ["Value"],
  IsEqualTo: ["Value"],
  IsNotEqualTo: ["Value"],
  IsBetween: ["Min", "Max"],
  IsNotBetween: ["Min", "Max"]
};
function sievesEqual(a, b) {
  if (a.constructor !== b.constructor) return false;
  var akeys = Object.keys(a);
  var bkeys = Object.keys(b);
  if (akeys.length !== bkeys.length) return false;
  if (!akeys.every(key => bkeys.includes(key))) return false;
  for (let key of akeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}


function NoneSieve(params) {
  Object.assign(this, params);
}
NoneSieve.prototype.predicate = function(x) {
  return true;
}

function IsEmptySieve(params) {
  Object.assign(this, params);
}
IsEmptySieve.prototype.predicate = function(x) {
  return "" === x;
}

function IsNotEmptySieve(params) {
  Object.assign(this, params);
}
IsNotEmptySieve.prototype.predicate = function(x) {
  return !(IsEmptySieve.prototype.predicate.bind(this))(x);
}

function TextContainsSieve(params) {
  Object.assign(this, params);
}
TextContainsSieve.prototype.predicate = function(x) {
  return x.toUpperCase().includes(this.Substring.toUpperCase());
}

function TextDoesNotContainSieve(params) {
  Object.assign(this, params);
}
TextDoesNotContainSieve.prototype.predicate = function(x) {
  return !(TextContainsSieve.prototype.predicate.bind(this))(x);
}

function TextContainsAnyOfXNoneOfYSieve(params) {
  Object.assign(this, params);
}
TextContainsAnyOfXNoneOfYSieve.prototype.predicate = function(x) {
  result = false;
  for (let ss of this.AnyOf.split(delimText.value[0])) { // TODO delim shouldn't be visible here
    result = result || x.toUpperCase().includes(ss.toUpperCase());
  }
  for (let ss of this.NoneOf.split(delimText.value[0])) { // TODO delim shouldn't be visible here
    result = result && !x.toUpperCase().includes(ss.toUpperCase());
  }
  return result;
};

function TextStartsWithSieve(params) {
  Object.assign(this, params);
}
TextStartsWithSieve.prototype.predicate = function(x) {
  return x.toUpperCase().startsWith(this.Prefix.toUpperCase());
}

function TextEndsWithSieve(params) {
  Object.assign(this, params);
}
TextEndsWithSieve.prototype.predicate = function(x) {
  return x.toUpperCase().endsWith(this.Suffix.toUpperCase());
}

function TextIsExactlySieve(params) {
  Object.assign(this, params);
}
TextIsExactlySieve.prototype.predicate = function(x) {
  return x.toUpperCase() === this.String.toUpperCase();
}

function GreaterThanSieve(params) {
  Object.assign(this, params);
}
GreaterThanSieve.prototype.predicate = function(x) {
  if (!isNaN(Number(this.Value))) {
    return Number(x) > Number(this.Value);
  } else {
    return x > this.Value;
  }
}

function GreaterThanOrEqualToSieve(params) {
  Object.assign(this, params);
}
GreaterThanOrEqualToSieve.prototype.predicate = function(x) {
  return (GreaterThanSieve.prototype.predicate.bind(this))(x) ||
         (IsEqualToSieve.prototype.predicate.bind(this))(x);
}

function LessThanSieve(params) {
  Object.assign(this, params);
}
LessThanSieve.prototype.predicate = function(x) {
  return !(GreaterThanOrEqualToSieve.prototype.predicate.bind(this))(x);
}

function LessThanOrEqualToSieve(params) {
  Object.assign(this, params);
}
LessThanOrEqualToSieve.prototype.predicate = function(x) {
  return !(GreaterThanSieve.prototype.predicate.bind(this))(x);
}

function IsEqualToSieve(params) {
  Object.assign(this, params);
}
IsEqualToSieve.prototype.predicate = function(x) {
  if (!isNaN(Number(this.Value))) {
    return Number(x) === Number(this.Value);
  } else {
    return x === this.Value;
  }
}

function IsNotEqualToSieve(params) {
  Object.assign(this, params);
}
IsNotEqualToSieve.prototype.predicate = function(x) {
  return !(IsEqualToSieve.prototype.predicate.bind(this))(x);
}

function IsBetweenSieve(params) {
  Object.assign(this, params);
}
IsBetweenSieve.prototype.predicate = function(x) {
  if (!isNaN(Number(this.Min)) && !isNaN(Number(this.Max))) {
    return Number(this.Min) <= Number(x) && Number(x) <= Number(this.Max);
  } else {
    return this.Min <= x && x <= this.Max;
  }
};

function IsNotBetweenSieve(params) {
  Object.assign(this, params);
}
IsNotBetweenSieve.prototype.predicate = function(x) {
  return !(IsBetweenSieve.prototype.predicate.bind(this))(x);
};