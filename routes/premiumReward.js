/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const path = require('path')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const rateLimit = require('express-rate-limit')

module.exports = function servePremiumContent () {
  const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 })
  return [limiter, (req, res) => {
    utils.solveIf(challenges.premiumPaywallChallenge, () => { return true })
    res.sendFile(path.resolve(__dirname, '../frontend/dist/frontend/assets/private/JuiceShop_Wallpaper_1920x1080_VR.jpg'))
  }]
}
