#! /usr/bin/env node

let chunks = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', chunk => chunks += chunk)
process.stdin.on('end', () => {
  const program = JSON.parse(chunks)

  run(program)
})

const run = module.exports = (program=[], start=0, end) => {
  const check = v => {
    flags.z = v === 0
    flags.n = v  <  0
  }

  end = end || -1
  let flags = {}
  let out = process.stdout
  let ran = 0

  let a = 0

  for (let i = start; !flags.quit && ran !== end; ran++) {
    const opcode = program[i++]

    switch (opcode) {
      case 'noop': break
      case 'quit': flags.quit = true; break
      case 'nwln': out.write('\n'); break

      /*
      case GOTO: i = program[i]; break
      case GTOZ: i = flags.z ? i+program[i]-1 : i+1; break
      case GTON: i = flags.n ? i+program[i]-1 : i+1; break
      */

      case 'go':   i = program[i]; break
      case 'goeq': i = flags.z ? program[i] : i+1; break // === 0 BEQ
      case 'golt': i = flags.n ? program[i] : i+1; break //  <  0 BLT
      case 'gone': i = flags.z ? i+1 : program[i]; break // !== 0 BNE
      case 'goge': i = flags.n ? i+1 : program[i]; break //  >= 0 BGE
      case 'gole': i = (flags.n || flags.z) ? program[i] : i+1; break
      case 'gogt': i = (flags.n || flags.z) ? i+1 : program[i]; break

      case 'jp':   i = i+program[i]-1; break
      case 'jpeq': i = flags.z ? i+program[i]-1 : i+1; break // === 0 BEQ
      case 'jplt': i = flags.n ? i+program[i]-1 : i+1; break //  <  0 BLT
      case 'jpne': i = flags.z ? i+1 : i+program[i]-1; break // !== 0 BNE
      case 'jpge': i = flags.n ? i+1 : i+program[i]-1; break //  >= 0 BGE
      case 'jple': i = (flags.n || flags.z) ? i+program[i]-1 : i+1; break
      case 'jpgt': i = (flags.n || flags.z) ? i+1 : i+program[i]-1; break

      case 'seta': a = program[i++]; check(a); break
      case 'adda': a += program[i++]; check(a); break
      case 'suba': a -= program[i++]; check(a); break
      case 'mula': a *= program[i++]; check(a); break
      case 'diva': a /= program[i++]; check(a); break
      case 'cmpa': check(a-program[i++]); break
      case 'loga': out.write(a.toString()); break

      // memory IS the program
      // so a program can actually rewrite itself as it goes :O
      case 'mrda': a = program[program[i++]]; break
      case 'mwra': program[program[i++]] = a; break

      default:
        out.write(`\n  \u001B[1m\u001B[41m FATAL ERROR!! \u001B[47m\u001B[31m Unknown opcode [${opcode}] at #${i-1} \u001B[0m\n\n`)
        flags.quit = true
      break
    }
  }
}
