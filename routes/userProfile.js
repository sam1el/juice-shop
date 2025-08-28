/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs')
const models = require('../models/index')
const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const challenges = require('../data/datacache').challenges
const pug = require('pug')
const config = require('config')
const themes = require('../views/themes/themes').themes

module.exports = function getUserProfile () {
  const rateLimit = require('express-rate-limit')
  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10 // limit each IP to 10 requests per minute
  })
  function favicon () {
    return utils.extractFilename(config.get('application.favicon'))
  }

  return [limiter, (req, res, next) => {
    const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
    if (loggedInUser) {
      models.User.findByPk(loggedInUser.data.id).then(user => {
        // Strict HTML escaping utility
        function escapeHtml(str) {
          return String(str).replace(/[&<>'"`=\/]/g, function (c) {
            return {
              '&': '&amp;',
              '<': '&lt;',
              '>': '&gt;',
              "'": '&#39;',
              '"': '&quot;',
              '`': '&#96;',
              '=': '&#61;',
              '/': '&#47;'
            }[c];
          });
        }

        // Whitelist username: only allow alphanumeric, underscore, hyphen
        let rawUsername = user.dataValues.username || '';
        rawUsername = rawUsername.replace(/[^a-zA-Z0-9_-]/g, '');
        // Whitelist profileImage: only allow URLs starting with http(s) and ending with common image extensions
        let rawProfileImage = user.dataValues.profileImage || '';
        if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|bmp|svg)$/i.test(rawProfileImage)) {
          rawProfileImage = '';
        }

        // Escape all user-controlled data
        const safeUser = {
          username: escapeHtml(rawUsername),
          email: escapeHtml(user.dataValues.email),
          profileImage: escapeHtml(rawProfileImage),
          emailHash: insecurity.hash(user.dataValues.email)
        }

        const theme = themes[config.get('application.theme')]
        // Avoid injecting user-controlled values into CSP; allow images from self and https
        const CSP = "img-src 'self' https: data:; script-src 'self' 'unsafe-eval' https://code.getmdl.io http://ajax.googleapis.com"
        utils.solveIf(challenges.usernameXssChallenge, () => { return safeUser.profileImage.match(/;[ ]*script-src(.)*'unsafe-inline'/g) !== null && utils.contains(safeUser.username, '<script>alert(`xss`)</script>') })

        res.set({
          'Content-Security-Policy': CSP
        })

        // Render the static template and send as HTML, passing only safe variables and theme/config
        res.contentType('text/plain').send(pug.renderFile('views/userProfile.pug', {
          username: safeUser.username,
          email: safeUser.email,
          profileImage: safeUser.profileImage,
          emailHash: safeUser.emailHash,
          title: config.get('application.name'),
          favicon: utils.extractFilename(config.get('application.favicon')),
          bgColor: theme.bgColor,
          textColor: theme.textColor,
          navColor: theme.navColor,
          primLight: theme.primLight,
          primDark: theme.primDark,
          logo: utils.extractFilename(config.get('application.logo'))
        }))
      }).catch(error => {
        next(error)
      })
    } else {
      next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
    }
  }]
}
