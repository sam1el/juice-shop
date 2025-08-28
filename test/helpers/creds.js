/*
 * Helper to provide non-hardcoded credentials for tests
 */

function randomString (length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
  let out = ''
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return out
}

exports.generateEmail = function generateEmail (prefix = 'user') {
  const domain = process.env.TEST_DOMAIN || 'example.com'
  return `${prefix}${Date.now()}_${Math.floor(Math.random() * 10000)}@${domain}`
}

exports.generatePassword = function generatePassword () {
  return process.env.TEST_PASSWORD || randomString(16)
}

exports.generateTotpSecret = function generateTotpSecret () {
  // 20 uppercase base32-like characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let out = ''
  for (let i = 0; i < 20; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return process.env.TEST_TOTP_SECRET || out
}
