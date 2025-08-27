/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const utils = require('../lib/utils')
const fs = require('fs')
const models = require('../models/index')
const insecurity = require('../lib/insecurity')
const logger = require('../lib/logger')
const fileType = require('file-type')
const rateLimit = require('express-rate-limit')

module.exports = function fileUpload () {
  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5 // limit each IP to 5 uploads per minute
  })
  return [limiter, (req, res, next) => {
    if (!req.file || typeof req.file !== 'object' || !req.file.buffer || !Buffer.isBuffer(req.file.buffer)) {
      return res.status(400).send('Invalid file upload')
    }
    const file = req.file
    const buffer = file.buffer
    const uploadedFileType = fileType(buffer)
    if (uploadedFileType !== null && typeof uploadedFileType.ext === 'string' && utils.startsWith(uploadedFileType.mime, 'image')) {
      const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
      if (loggedInUser) {
        const safeExt = String(uploadedFileType.ext).replace(/[^a-zA-Z0-9]/g, '')
        const destPath = `frontend/dist/frontend/assets/public/images/uploads/${safeUserId}.${safeExt}`
        const resolvedDestPath = require('path').resolve(destPath)
        const allowedBase = require('path').resolve('frontend/dist/frontend/assets/public/images/uploads')
        if (!resolvedDestPath.startsWith(allowedBase)) {
          return next(new Error('Invalid file path'))
        }
        fs.open(resolvedDestPath, 'w', function (err, fd) {
          if (err) logger.warn('Error opening file: ' + err.message)
          fs.write(fd, buffer, 0, buffer.length, null, function (err) {
            if (err) logger.warn('Error writing file: ' + err.message)
            fs.close(fd, function () { })
          })
        })
        models.User.findByPk(loggedInUser.data.id)
          .then(user => {
            return user.update({ profileImage: `assets/public/images/uploads/${safeUserId}.${safeExt}` })
          })
          .then(() => {
            res.location(process.env.BASE_PATH + '/profile')
            res.redirect(process.env.BASE_PATH + '/profile')
          })
          .catch(error => {
            next(error)
          })
      } else {
        next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
      }
    } else {
      res.status(415)
      next(new Error(`Profile image upload does not accept this file type${uploadedFileType ? (': ' + uploadedFileType.mime) : '.'}`))
    }
  }]
}
