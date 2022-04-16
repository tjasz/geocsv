// https://masteringjs.io/tutorials/fundamentals/enum

function createEnum(values) {
  const enumObject = {};
  for (const val of values) {
    enumObject[val] = val;
  }
  return Object.freeze(enumObject);
}

const SieveType = createEnum([
  'None',
  'IsEmpty', 'IsNotEmpty',
  'TextContains', 'TextDoesNotContain', 'TextStartsWith', 'TextEndsWith', 'TextIsExactly',
  //'DateIs', 'DateIsBefore', 'DateIsAfter', // TODO
  'GreaterThan', 'GreaterThanOrEqualTo', 'LessThan', 'LessThanOrEqualTo', 'IsEqualTo', 'IsNotEqualTo', 'IsBetween', 'IsNotBetween'
  ]);