/* Centralized test passwords with env overrides to avoid hardcoding in specs */

function envOr (key, fallback) {
  return process.env[key] || fallback
}

exports.admin = () => envOr('TEST_PWD_ADMIN', 'admin123')
exports.jim = () => envOr('TEST_PWD_JIM', 'ncc-1701')
exports.bender = () => envOr('TEST_PWD_BENDER', 'OhG0dPlease1nsertLiquor!')
exports.morty = () => envOr('TEST_PWD_MORTY', 'focusOnScienceMorty!focusOnScience')
exports.accountant = () => envOr('TEST_PWD_ACCOUNTANT', 'i am an awesome accountant')
exports.mcSafesearch = () => envOr('TEST_PWD_MC_SAFESEARCH', 'Mr. N00dles')
exports.amy = () => envOr('TEST_PWD_AMY', 'K1f.....................')
exports.base64Email = () => envOr('TEST_PWD_BASE64_EMAIL', 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI=')
exports.kunigunde = () => envOr('TEST_PWD_KUNIGUNDE', 'kunigunde')
exports.kallliiii = () => envOr('TEST_PWD_KALLLIIII', 'kallliiii')
exports.ooootto = () => envOr('TEST_PWD_OOOOTTO', 'ooootto')
exports.hoooorst = () => envOr('TEST_PWD_HOOOORST', 'hooooorst')
exports.longPassphrase = () => envOr('TEST_PWD_LONG_PASSPHRASE', 'monkey summer birthday are all bad passwords but work just fine in a long passphrase')
exports.admun = () => envOr('TEST_PWD_ADMUN', 'admun123')
exports.wurstbrot = () => envOr('TEST_PWD_WURSTBROT', 'EinBelegtesBrotMitSchinkenSCHINKEN!')
exports.j12934 = () => envOr('TEST_PWD_J12934', '0Y8rMnww$*9VFYE§59-!Fg1L6t&6lB')
exports.veryStrong = () => envOr('TEST_PWD_VERY_STRONG', 'mDLx?94T~1CfVfZMzw@sJ9f?s3L6lbMqE70FfI8^54jbNikY5fymx7c!YbJb')


