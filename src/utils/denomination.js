const baseDenominationObject = {previous: true, next: true, decimal:1};
const denominationList = ['a', 'f', 'p', 'n', 'u', 'm', 'j', 'k', 'M'];
const denominationData = {
  a: Object.assign({}, baseDenominationObject, {previous:false, 'shortName': 'a', 'name': 'atto', decimal:0}),
  f: Object.assign({}, baseDenominationObject, {'shortName': 'f', 'name': 'femto', decimal: 3}),
  p: Object.assign({}, baseDenominationObject, {'shortName': 'p', 'name': 'piko', decimal: 6}),
  n: Object.assign({}, baseDenominationObject, {'shortName': 'n', 'name': 'nano', decimal: 9}),
  u: Object.assign({}, baseDenominationObject, {'shortName': 'u', 'name': 'micro', decimal: 12}),
  m: Object.assign({}, baseDenominationObject, {'shortName': 'm', 'name': 'milli', decimal: 15}),
  j: Object.assign({}, baseDenominationObject, {'shortName': '', 'name': '', decimal: 18}),
  k: Object.assign({}, baseDenominationObject, {'shortName': 'k', 'name': 'kilo', decimal: 21}),
  M: Object.assign({}, baseDenominationObject, {next:false, 'shortName': 'M', 'name': 'Mega', decimal: 24})
};

export function getDenominatedDataById(currentDenominationId) {
    const denominationKey = denominationList[currentDenominationId];
    return denominationData[denominationKey];
}

export function getDenominatedCurrency(currentDenominationId) {
  const {name} = getDenominatedDataById(currentDenominationId);
  return `${name}JOY`;
}
