

// Souce: https://github.com/validatorjs/validator.js/blob/master/src/lib/isMobilePhone.js
// Note: Quite readable, but rather strict (e.g. does not allow 06 - 12345678)
// export const DutchMobilePhoneRegex = /^(((\+|00)?31\(0\))|((\+|00)?31)|0)6{1}\d{8}$/

// Source: https://stackoverflow.com/a/19814504
export const DutchMobilePhoneRegex = /^(?:0|(?:\+|00) ?31 ?)(?:(?:[1-9] ?(?:[0-9] ?){8})|(?:6 ?-? ?[1-9] ?(?:[0-9] ?){7})|(?:[1,2,3,4,5,7,8,9]\d ?-? ?[1-9] ?(?:[0-9] ?){6})|(?:[1,2,3,4,5,7,8,9]\d{2} ?-? ?[1-9] ?(?:[0-9] ?){5}))$/
