const os = require('os')
const exec = require('child_process').execSync
const WINDOWS = os.platform() === 'win32'

if (WINDOWS) exec(`node node_modules\\nearley\\bin\\nearleyc.js ${__dirname}\\src\\grammar\\grammar.ne -o ${__dirname}\\src\\grammar\\grammar.js 2> NUL`)
else exec(`./node_modules/nearley/bin/nearleyc.js ${__dirname}/src/grammar/grammar.ne -o ${__dirname}/src/grammar/grammar.js 2> /dev/null`)
