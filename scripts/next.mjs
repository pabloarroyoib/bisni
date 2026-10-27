import { spawn } from 'node:child_process'
import { realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

/**
 * En Windows, si el proyecto se abre con un casing distinto al real del disco
 * (p. ej. `C:\Users\...\desktop\proyectos\bisni` en vez de
 * `C:\Users\...\Desktop\Proyectos\bisni`), Next resuelve React dos veces y el
 * build falla al prerenderizar /_global-error con:
 *
 *   TypeError: Cannot read properties of null (reading 'useContext')
 *
 * Normalizamos el cwd al casing real antes de arrancar Next. En Linux/macOS
 * esto es un no-op.
 */
const cwd = realpathSync.native(process.cwd())

process.chdir(cwd)

const require = createRequire(join(cwd, 'package.json'))
const nextBin = require.resolve('next/dist/bin/next')

const child = spawn(process.execPath, [nextBin, ...process.argv.slice(2)], {
  cwd,
  env: {
    ...process.env,
    // npm los fija con el cwd original (posiblemente con otro casing).
    INIT_CWD: cwd,
    PWD: cwd,
  },
  stdio: 'inherit',
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 1)
})
