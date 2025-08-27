/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const os = require('os')
const vm = require('vm')
const fs = require('fs')
const unzipper = require('unzipper')
const path = require('path')
const xml2js = require('xml2js')

function matchesSystemIniFile (text) {
  const match = text.match(/(; for 16-bit app support|drivers|mci|driver32|386enh|keyboard|boot|display)/gi)
  return match && match.length >= 2
}

function matchesEtcPasswdFile (text) {
  const match = text.match(/\w*:\w*:\d*:\d*:\w*:.*/gi)
  return match && match.length >= 2
}

function ensureFileIsPassed ({ file }, res, next) {
  if (file) {
    next()
  }
}

function handleZipFileUpload ({ file }, res, next) {
  if (utils.endsWith(file.originalname.toLowerCase(), '.zip')) {
    if (file.buffer && !utils.disableOnContainerEnv()) {
      const buffer = file.buffer
      const filename = file.originalname.toLowerCase()
      const tempFile = path.join(os.tmpdir(), filename)
      fs.open(tempFile, 'w', function (err, fd) {
        if (err) { next(err) }
        fs.write(fd, buffer, 0, buffer.length, null, function (err) {
          if (err) { next(err) }
          fs.close(fd, function () {
            fs.createReadStream(tempFile)
              .pipe(unzipper.Parse())
              .on('entry', function (entry) {
                const fileName = path.basename(entry.path)
                const absolutePath = path.resolve('uploads/complaints', fileName)
                if (!absolutePath.startsWith(path.resolve('uploads/complaints'))) {
                  entry.autodrain()
                } else {
                  utils.solveIf(challenges.fileWriteChallenge, () => { return absolutePath === path.resolve('ftp/legal.md') })
                  entry.pipe(fs.createWriteStream(absolutePath).on('error', function (err) { next(err) }))
                }
              }).on('error', function (err) { next(err) })
          })
        })
      })
    }
    res.status(204).end()
  } else {
    next()
  }
}

function checkUploadSize ({ file }, res, next) {
  utils.solveIf(challenges.uploadSizeChallenge, () => { return file.size > 100000 })
  next()
}

function checkFileType ({ file }, res, next) {
  const fileType = file.originalname.substr(file.originalname.lastIndexOf('.') + 1).toLowerCase()
  utils.solveIf(challenges.uploadTypeChallenge, () => {
    return !(fileType === 'pdf' || fileType === 'xml' || fileType === 'zip')
  })
  next()
}

function handleXmlUpload ({ file }, res, next) {
  if (utils.endsWith(file.originalname.toLowerCase(), '.xml')) {
    utils.solveIf(challenges.deprecatedInterfaceChallenge, () => { return true })
    if (file.buffer && !utils.disableOnContainerEnv()) {
      const data = file.buffer.toString()
      xml2js.parseString(data, { explicitCharkey: true, explicitRoot: false }, (err, result) => {
        if (err) {
          res.status(410)
          next(new Error('B2B customer complaints via file upload have been deprecated for security reasons: ' + err.message + ' (' + file.originalname + ')'))
        } else {
          const xmlString = JSON.stringify(result)
          utils.solveIf(challenges.xxeFileDisclosureChallenge, () => { return (matchesSystemIniFile(xmlString) || matchesEtcPasswdFile(xmlString)) })
          res.status(410)
          next(new Error('B2B customer complaints via file upload have been deprecated for security reasons: ' + utils.trunc(xmlString, 400) + ' (' + file.originalname + ')'))
        }
      })
    } else {
      res.status(410)
      next(new Error('B2B customer complaints via file upload have been deprecated for security reasons (' + file.originalname + ')'))
    }
  }
  res.status(204).end()
}

module.exports = {
  ensureFileIsPassed,
  handleZipFileUpload,
  checkUploadSize,
  checkFileType,
  handleXmlUpload
}
