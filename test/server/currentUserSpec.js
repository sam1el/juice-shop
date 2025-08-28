const secrets = require('../helpers/secrets')
/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('currentUser', () => {
  const retrieveLoggedInUser = require('../../routes/currentUser')

  beforeEach(() => {
    this.req = { cookies: {}, query: {} }
    this.res = { json: sinon.spy() }
  })

  it('should return neither ID nor email if no cookie was present in the request headers', () => {
    this.req.cookies.token = ''

    retrieveLoggedInUser()(this.req, this.res)

    expect(this.res.json).to.have.been.calledWith({ user: { id: undefined, email: undefined, lastLoginIp: undefined, profileImage: undefined } })
  })

  it('should return ID and email of user belonging to cookie from the request', () => {
    this.req.cookies.token = secrets.currentUserToken()
    this.req.query.callback = undefined
    require('../../lib/insecurity').authenticatedUsers.put(secrets.currentUserToken(), { data: { id: 1, email: 'admin@juice-sh.op', lastLoginIp: '0.0.0.0', profileImage: '/assets/public/images/uploads/default.svg' } })
    retrieveLoggedInUser()(this.req, this.res)

    expect(this.res.json).to.have.been.calledWith({ user: { id: 1, email: 'admin@juice-sh.op', lastLoginIp: '0.0.0.0', profileImage: '/assets/public/images/uploads/default.svg' } })
  })
})
