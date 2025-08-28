/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs')
const models = require('../models/index')
const insecurity = require('../lib/insecurity')
const fetch = require('node-fetch')
const logger = require('../lib/logger')

module.exports = function profileImageUrlUpload () {
  return (req, res, next) => {
    if (req.body.imageUrl !== undefined) {
      if (typeof req.body.imageUrl !== 'string') {
        return res.status(400).send('Invalid image URL')
      }
      let url = req.body.imageUrl
      // Basic SSRF protection: only allow http/https URLs
      if (!/^https?:\/\//i.test(url)) {
        return res.status(400).send('Invalid image URL')
      }
      // Prevent path traversal in file extension
      url = String(url).split('?')[0]
      const extMatch = url.match(/\.([a-zA-Z0-9]+)$/)
      const ext = extMatch && ['jpg', 'jpeg', 'png', 'svg', 'gif'].includes(extMatch[1].toLowerCase()) ? extMatch[1].toLowerCase() : 'jpg'
      if (url.match(/(.)*solve\/challenges\/server-side(.)*/) !== null) req.app.locals.abused_ssrf_bug = true
      const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
      if (loggedInUser) {
        fetch(url, { method: 'GET', timeout: 5000 })
          .then(response => {
            if (response.ok) {
              const destPath = `frontend/dist/frontend/assets/public/images/uploads/${loggedInUser.data.id}.${ext}`
              if (destPath.includes('..')) {
                return res.status(400).send('Invalid file path')
              }
              const dest = fs.createWriteStream(destPath)
              response.body.pipe(dest)
              models.User.findByPk(loggedInUser.data.id).then(user => { return user.update({ profileImage: `/assets/public/images/uploads/${loggedInUser.data.id}.${ext}` }) }).catch(error => { next(error) })
            } else {
              models.User.findByPk(loggedInUser.data.id).then(user => { return user.update({ profileImage: url }) }).catch(error => { next(error) })
            }
          })
          .catch(err => {
            models.User.findByPk(loggedInUser.data.id).then(user => { return user.update({ profileImage: url }) }).catch(error => { next(error) })
            logger.warn('Error retrieving user profile image: ' + err.message + '; using image link directly')
          })
      } else {
        next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
      }
    }
    res.location(process.env.BASE_PATH + '/profile')
    res.redirect(process.env.BASE_PATH + '/profile')
  }
}
