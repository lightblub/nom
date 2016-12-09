#! /usr/bin/env node

const version = require('../package.json').version
const request = require('request')
const chalk = require('chalk')
const center = require('center-text')
const fs = require('fs')
const args = require('minimist')(process.argv.slice(2), {
  boolean: ['version'],
  alias: {
    v: 'version',
  }
})
const command = args._.join(' ')

let lastCheckedForUpdate = 0
try {
  lastCheckedForUpdate = fs.readFileSync(__dirname + '/../lastupdated', 'utf8')
} catch(e) {}
const needsUpdateCheck = Date.now() - lastCheckedForUpdate > 1000 * 60 * 60 * 24

if (needsUpdateCheck) console.log(chalk.blue('\n  Checking for updates...'))

// Check for new version
;(!needsUpdateCheck ? ((a, b) => b(true)) : request)('https://raw.githubuserconent.com/nanalan/nom/master/package.json', (err, res, body) => {
  if (!err && res.statusCode == 200) {
    try {
      const remoteVersion = JSON.parse(body).version

      if (version !== remoteVersion) {
        console.log(chalk.cyan('\n  A new version of nom is available!'))
        console.log(center(chalk.blue(`v${version} -> v${remoteVersion}`), { columns: 36 }))
        console.log(chalk.cyan(`Run ${chalk.bold(`nom update`)} to update.`))
      }
    } catch (err) {}
  } else if (needsUpdateCheck) {
    console.log(chalk.blue('  No updates found.\n'))
  } else {
    console.log('')
  }

  if (needsUpdateCheck) fs.writeFileSync(__dirname + '/../lastupdated', Date.now(), 'utf8')

  if (args.v === true) {
    console.log(chalk.cyan(`   _ __   ___  _ __ ___
  | '_ \\ / _ \\| '_ \` _ \\
  | | | | (_) | | | | | |
  |_| |_|\\___/|_| |_| |_|
`))
    console.log(center(`nom ${chalk.cyan('v' + version)}\n`, { columns: 28 }))
  } else {
    // TODO
    console.log('  nom doesn\'t have a proper cli yet, sorry\n')
  }
})
