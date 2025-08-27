/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const db = require('../data/mongodb')
const insecurity = require('../lib/insecurity')

module.exports = function productReviews () {
  return (req, res, next) => {
    const user = insecurity.authenticatedUsers.from(req)
    const ObjectId = require('mongodb').ObjectId
    let reviewId = ''
    if (typeof req.body.id === 'string' && ObjectId.isValid(req.body.id)) {
      reviewId = new ObjectId(req.body.id)
    } else {
      return res.status(400).json({ error: 'Invalid review ID format.' })
    }
    // Only allow updating the message field for a specific review by ObjectId
    const sanitizedMessage = typeof req.body.message === 'string'
      ? req.body.message.replace(/[^\w\s.,!?'-]/g, '').trim()
      : ''
    if (!sanitizedMessage) {
      return res.status(400).json({ error: 'Invalid message format.' })
    }
    db.reviews.update(
      { _id: reviewId },
      { $set: { message: sanitizedMessage } },
      { multi: false }
    ).then(
      result => {
        utils.solveIf(challenges.noSqlReviewsChallenge, () => { return result.modified > 1 })
        utils.solveIf(challenges.forgedReviewChallenge, () => { return user && user.data && result.original[0].author !== user.data.email && result.modified === 1 })
        res.json(result)
      }, err => {
        res.status(500).json(err)
      })
  }
}
