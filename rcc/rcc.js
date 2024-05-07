#!/usr/bin/env node

const ChildProcess = require('child_process')
const path = require('path')

const command = (() => {
  switch(process.platform) {
    case 'win32':
      return path.join(__dirname, './windows64/rcc.exe')
    case 'darwin':
      return path.join(__dirname, './macos64/rcc')
    case 'linux':
      return path.join(__dirname, './linux64/rcc')
  }
})()

const args = process.argv.slice(2)
const options = {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit'
}

const rccProcess = ChildProcess.spawn(command, args, options)

rccProcess.on('close', code => {
  if (code !== 0) {
    throw new Error(`RCC exited with error code: ${code}`)
  }
})

rccProcess.on('error', error => { throw new Error(error) })

const killRCC = () => {
  try {
    rccProcess.kill()
  } catch (ignored) {}
}

process.on('exit', killRCC)
process.on('SIGTERM', killRCC)
