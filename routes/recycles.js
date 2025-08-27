/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const models = require('../models/index')
const utils = require('../lib/utils')

exports.sequelizeVulnerabilityChallenge = () => (req, res) => {
  let id = req.params.id
  if (typeof id !== 'string' || !/^[0-9]+$/.test(id)) {
    return res.status(400).send('Invalid recycle id')
  }
  models.Recycle.findAll({
    where: {
      id: parseInt(id, 10)
    }
  }).then((Recycle) => {
    const safeJson = JSON.stringify(utils.queryResultToJson(Recycle)).replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return res.send(safeJson)
  })
}

exports.blockRecycleItems = () => (req, res) => {
  const errMsg = { err: 'Sorry, this endpoint is not supported.' }
  return res.send(utils.queryResultToJson(errMsg))
}
