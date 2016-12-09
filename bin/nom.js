#! /usr/bin/env node

const version = require('../package.json').version
const request = require('request')
const chalk = require('chalk')
const center = require('center-text')
const fs = require('fs')
const os = require('os')
const args = require('minimist')(process.argv.slice(2), {
  boolean: ['version', 'help'],
  alias: {
    v: 'version',
    h: 'help',
  }
})
const command = args._.join(' ')
const WINDOWS = os.platform() === 'win32'

if (command === 'hello') {
  // Used in install script
  process.stdout.write(version)
  return
}

let lastCheckedForUpdate = 0
try {
  lastCheckedForUpdate = fs.readFileSync(__dirname + '/../lastupdated', 'utf8')
} catch(e) {}
let needsUpdateCheck = Date.now() - lastCheckedForUpdate > 1000 * 60 * 60 * 24

if (command === 'update') needsUpdateCheck = false
if (needsUpdateCheck) console.log(chalk.blue('\n  Checking for updates...'))

// Check for new version
;(!needsUpdateCheck ? ((a, b) => b(true)) : request)('https://raw.githubusercontent.com/nanalan/nom/master/package.json', (err, res, body) => {
  if (!err && res.statusCode == 200) {
    try {
      const remoteVersion = JSON.parse(body).version

      if (version !== remoteVersion) {
        console.log(chalk.cyan('\n  A new version of nom is available!'))
        console.log(center(chalk.blue(`v${version} -> v${remoteVersion}`), { columns: 36 }))
        console.log(chalk.cyan(`  Run ${chalk.bold(`nom update`)} to update.\n`))
      } else console.log(chalk.blue('  No updates found.\n'))
    } catch (err) {}
  } else {
    console.log('')
  }

  if (needsUpdateCheck) fs.writeFileSync(__dirname + '/../lastupdated', Date.now(), 'utf8')

  if (args.v) {
    console.log(chalk.cyan(`   _ __   ___  _ __ ___
  | '_ \\ / _ \\| '_ \` _ \\
  | | | | (_) | | | | | |
  |_| |_|\\___/|_| |_| |_|
`))
    console.log(center(`nom ${chalk.cyan('v' + version)}\n`, { columns: 28 }))
  } else if (command === 'update') {
    if (WINDOWS) {
      require('child_process').execSync('@powershell -Command "Invoke-WebRequest http://raw.githubusercontent.com/nanalan/nom/master/install.bat -OutFile %USERPROFILE%\.nom.bat; Start-Process \"cmd.exe\" \"/c %USERPROFILE%\.nom.bat\""', { stdio: 'inherit' })
    } else {
      request('https://raw.githubusercontent.com/nanalan/nom/master/install.sh', (err, res, body) => {
        if (!err && res.statusCode == 200) {
          require('child_process').execSync('rm -rf ~/.nom', { stdio: 'inherit' })
          fs.writeFileSync(`${process.env.HOME}/.nom.sh`, body, 'utf8')
          require('child_process').execSync('sh ~/.nom.sh && rm -rf ~/.nom.sh', {
            stdio: 'inherit'
          })
        } else console.error(chalk.red(err))
      })
    }
  } else if (args.h || command === '') {
    console.log(`  ${chalk.cyan(`nom ${chalk.bold('file.nom')}`)}    compile ${chalk.bold('file.nom')}
  ${chalk.blue(`  -o ${chalk.bold('file.js')}`)}    output to ${chalk.bold('file.js')}
  ${chalk.blue(`  -h`)}            help
  ${chalk.blue(`  -v`)}            version

  ${chalk.cyan(`nom update`)}      update to the latest version
`)
  } else {
    const nom = require('../src/index.js')
    const out = args.o ? fs.createWriteStream(args.o) : process.stdout

    try { var src = fs.readFileSync(command) }
    catch(err) { console.error(chalk.red(`Could not read file ${chalk.bold(command)}\n`)) }

    nom(src)
      .catch(err => console.error(err, '\n'))
      .then(js => {
        out.write(require('util').inspect(js, { depth: null, colors: typeof args.o == 'undefined' }))
        console.error('\n')
      })
  }
})
