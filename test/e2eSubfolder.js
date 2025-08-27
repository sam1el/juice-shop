/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const app = require('express')()
const server = require('http').Server(app)
const fetch = require('node-fetch')
const colors = require('colors/safe')
const logger = require('./../lib/logger')
const serverApp = require('./../server.js')

const url = require('url')
const originalBase = require('../protractor.conf.js').config.baseUrl
const baseUrl = new url.URL(require('../protractor.subfolder.conf.js').config.baseUrl)
const basePath = baseUrl.pathname
const proxyPort = baseUrl.port
process.env.BASE_PATH = basePath

app.use('/subfolder', async (req, res) => {
  const proxyUrl = originalBase + req.url
  try {
    const response = await fetch(proxyUrl)
    response.body.pipe(res)
  } catch (err) {
    res.status(500).send('Proxy error')
  }
})

exports.start = async function (readyCallback) {
  serverApp.start(() => {
    server.listen(proxyPort, () => {
      logger.info(colors.cyan(`Subfolder proxy listening on port ${proxyPort}`))

      if (readyCallback) {
        readyCallback()
      }
    })
  })
}

exports.close = function (exitCode) {
  return serverApp.close(exitCode)
}

const ownFilename = __filename.slice(__dirname.length + 1)
if (process.argv && process.argv.length > 1 && process.argv[1].endsWith(ownFilename)) {
  exports.start()
}
