const baseDenominationObject = {previous: true, next: true, decimal:1};
const denominationList = ['a', 'f', 'p', 'n', 'u', 'm', 'j', 'k', 'M'];
const denominationData = {
  a: Object.assign({}, baseDenominationObject, {previous:false, 'shortName': 'a', 'name': 'atto', decimal:1}),
  f: Object.assign({}, baseDenominationObject, {'shortName': 'f', 'name': 'femto', decimal: 1000}),
  p: Object.assign({}, baseDenominationObject, {'shortName': 'p', 'name': 'piko', decimal: 1000000}),
  n: Object.assign({}, baseDenominationObject, {'shortName': 'n', 'name': 'nano', decimal: 1000000000}),
  u: Object.assign({}, baseDenominationObject, {'shortName': 'u', 'name': 'micro', decimal: 1000000000000}),
  m: Object.assign({}, baseDenominationObject, {'shortName': 'm', 'name': 'milli', decimal: 1000000000000000}),
  j: Object.assign({}, baseDenominationObject, {'shortName': '', 'name': '', decimal: 1000000000000000000}),
  k: Object.assign({}, baseDenominationObject, {'shortName': 'k', 'name': 'kilo', decimal: 1000000000000000000000}),
  M: Object.assign({}, baseDenominationObject, {next:false, 'shortName': 'M', 'name': 'Mega', decimal: 1000000000000000000000000})
};

export function getDenominatedDataById(currentDenominationId) {
    const denominationKey = denominationList[currentDenominationId];
    return denominationData[denominationKey];
}

export function getDenominatedCurrency(currentDenominationId) {
  const {name} = getDenominatedDataById(currentDenominationId);
  return `${name}JOY`;
}
