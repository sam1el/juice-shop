/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const path = require('path')

module.exports = function serveQuarantineFiles () {
  return ({ params, query }, res, next) => {
    const file = params.file

    if (!file.includes('/')) {
  const safeFile = path.basename(file)
  res.sendFile(path.resolve(__dirname, '../ftp/quarantine/', safeFile))
    } else {
      res.status(403)
      next(new Error('File names cannot contain forward slashes!'))
    }
  }
}
