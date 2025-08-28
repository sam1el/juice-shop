/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const path = require('path')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const rateLimit = require('express-rate-limit')

module.exports = function servePrivacyPolicyProof () {
  const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 })
  return [limiter, (req, res) => {
    utils.solveIf(challenges.privacyPolicyProofChallenge, () => { return true })
    res.sendFile(path.resolve(__dirname, '../frontend/dist/frontend/assets/private/thank-you.jpg'))
  }]
}
