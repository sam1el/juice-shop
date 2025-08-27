/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const fetch = require('node-fetch')
const colors = require('colors/safe')
const logger = require('../lib/logger')
const utils = require('../lib/utils')
const os = require('os')
const config = require('config')
exports.notify = async (challenge, webhook = process.env.SOLUTIONS_WEBHOOK) => {
  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      solution: {
        challenge: challenge.key,
        evidence: null,
        issuedOn: new Date().toISOString()
      },
      ctfFlag: utils.ctfFlag(challenge.name),
      issuer: {
        hostName: os.hostname(),
        os: `${os.type()} (${os.release()})`,
        appName: config.get('application.name'),
        config: process.env.NODE_ENV || 'default',
        version: utils.version()
      }
    })
  })
  logger.info(`Webhook ${colors.bold(webhook)} notified about ${colors.cyan(challenge.key)} being solved: ${res.status < 400 ? colors.green(res.status) : colors.red(res.status)}`)
}
