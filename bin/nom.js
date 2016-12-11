#! /usr/bin/env node

const version = require('../package.json').version
const request = require('request')
const chalk = require('chalk')
const center = require('center-text')
const fs = require('fs')
const readline = require('readline-sync')
const os = require('os')
const args = require('minimist')(process.argv.slice(2), {
  boolean: ['version', 'help', 'tree'],
  alias: {
    v: 'version',
    h: 'help',
    t: 'tree',
  }
})
const command = args._.join(' ')
const WINDOWS = os.platform() === 'win32'
const NPM = !fs.existsSync(os.homedir() + '/.nom')

if (command === 'hello') {
  // Used in install script
  process.stdout.write(version)
  return
}

process.on('unhandledRejection', console.error)

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
        console.error(chalk.cyan('\n  A new version of nom is available!'))
        console.error(center(chalk.blue(`v${version} -> v${remoteVersion}`), { columns: 36 }))
        console.error(chalk.cyan(`  Use ${chalk.bold(`nom upgrade`)} to update nom.\n`))
      } else console.log(chalk.blue('  No updates found.\n'))
    } catch (err) {}
  } else {
    console.error('')
  }

  if (needsUpdateCheck) fs.writeFileSync(__dirname + '/../lastupdated', Date.now(), 'utf8')

  if (args.v) {
    console.log(chalk.cyan(`   _ __   ___  _ __ ___
  | '_ \\ / _ \\| '_ \` _ \\
  | | | | (_) | | | | | |
  |_| |_|\\___/|_| |_| |_|
`))
    console.log(center(`nom ${chalk.cyan('v' + version)}\n`, { columns: 28 }))
  } else if (command === 'upgrade') {
    if (readline.keyInYN(chalk.cyan('  Upgrade nom to latest?'))) {
      if (NPM) {
        process.stdout.write('\n')
        require('child_process').execSync('npm upgrade -g nomlang', { stdio: 'inherit' })
        process.exit()
      }

      if (WINDOWS) {
        require('child_process').execSync('@powershell -Command "Invoke-WebRequest http://raw.githubusercontent.com/nanalan/nom/master/install.bat -OutFile %USERPROFILE%\.nom.bat; Start-Process \"cmd.exe\" \"/c %USERPROFILE%\.nom.bat\""', { stdio: 'inherit' })
      } else {
        request('https://raw.githubusercontent.com/nanalan/nom/master/install.sh', (err, res, body) => {
          if (!err && res.statusCode == 200) {
            require('child_process').execSync('rm -rf ~/.nom', { stdio: 'inherit' })
            fs.writeFileSync(`${os.homedir()}/.nom.sh`, body, 'utf8')
            require('child_process').execSync('sh ~/.nom.sh && rm -rf ~/.nom.sh', {
              stdio: 'inherit'
            })
            process.exit()
          } else console.error(chalk.red(err))
        })
      }
    } else {
      process.stdout.write('\n')
    }
  } else if (args.h) {
    console.log(`  ${chalk.cyan(`nom ${chalk.bold('file.nom')}`)}    run ${chalk.bold('file.nom')}
  ${chalk.blue(`          -t`)}    ${chalk.dim('tree')}

   ${chalk.cyan(`nom upgrade`)}    upgrade to the latest version of nom

           ${chalk.cyan(`nom`)}    repl
  ${chalk.blue(`          -h`)}    ${chalk.dim('help')}
  ${chalk.blue(`          -v`)}    ${chalk.dim('version')}
`)
  } else if (command === '') {
    console.log(chalk.cyan(`  nom repl v${version}`))
    console.log(chalk.blue(`  use ${chalk.bold(`.exit`)} to quit\n`))
    readline.promptLoop(input => {
      const nom = require('../src/index.js')

      process.stdout.write(chalk.styles.cyan.close)

      if (input === '.exit') {
        console.log(chalk.blue('\n  bye\n'))
        return true
      }

      process.stdout.write('\n')
      execute(input, {
        ondone: () => process.stdout.write('\n')
      })
    }, {
      prompt: chalk.blue.bold('  > ') + chalk.styles.cyan.open
    })
  } else {
    const normalizeNewline = require('normalize-newline')

    chalk.enabled = true

    try {
      var src = normalizeNewline(fs.readFileSync(command, 'utf8'))
    } catch(err) {
      console.error('  ' + chalk.bgRed.white.bold(` READFILE ERROR!! `) + chalk.bgWhite.red.bold(' ' + command + ' ') + '\n')
      process.exit(1)
    }

    execute(src, args)
    process.exit(0)
  }
})

function execute(src, args) {
  const errHandler = err => {
    if (err.offset) {
      const getLineFromPos = require('get-line-from-pos')
      const leftPad = require('left-pad')

      const lines = src.split('\n')
      const lineNo = getLineFromPos(src, err.offset)
      const lineNoLen = lines.length.toString().length
      const offsetLine = err.offset - lines.slice(0, lineNo-1).join('\n').length

      console.error('  ' + chalk.bgRed.white.bold(' SYNTAX ERROR!! ') + chalk.bgWhite.red.bold(` Unexpected ${src[err.offset] === '\n' ? '↵' : src[err.offset]} on line ${lineNo} `) + '\n')

      const nearbyLines = [lineNo - 3, lineNo - 2, lineNo - 1].filter(n => n < lines.length && n >= 0)
      for (let n of nearbyLines) {
        let content = lines[n]
        console.error(chalk.blue(`  ${leftPad(n+1, lineNoLen)} ${chalk.cyan(content)}`))
      }

      console.error(chalk.bold.red(`  ${' '.repeat(offsetLine+lineNoLen+(lineNo === 1 ? 1 : 0))}^\n`))
      if (!args.sync) process.exit(1)
    } else {
      if (err instanceof Error) console.error(err)
      else {
        console.error('  ' + chalk.bgRed.white.bold(` ${err.type}!! `) + chalk.bgWhite.red.bold(` ${err.message} `) + '\n')
        if (err.help) console.error(chalk.blue('  ' + err.help.replace('\n', '\n  ') + '\n'))
      }

      if (!args.sync) process.exit(1)
    }
  }

  const nom = require('../src/index.js')

  try {
    nom(src, args)
    if (args.ondone) args.ondone()
  } catch(err) {
    errHandler(err)
    if (args.onerr) args.onerr()
  }
}
