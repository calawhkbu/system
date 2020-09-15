const path = require('path')
const Module = require('module')
const { lstatSync, readFileSync, readdirSync, writeFileSync } = require('fs')
const { Script, createContext } = require('vm')
const { transpileModule } = require('typescript')
const minimist = require('minimist')
const chalk = require('chalk')

let argv = Object.keys(process.env)
  .filter(key => key.startsWith('npm_config_'))
  .reduce((result, current) => {
    const newResult = { ...result }
    newResult[current.substr(11)] = process.env[current]
    return newResult
  }, {})

argv = Object.assign(argv, minimist(process.argv.slice(2)))

const helper = () => {
  console.log('Export')
  console.log(chalk.green(`Usage: ${chalk.yellow('yarn export {filePath} {exportType}')}`))
  console.log(chalk.green(`Usage: ${chalk.yellow('npm run export {filePath} {exportType}')}`))
  return process.exit()
}

const extRequire = filepath => {
  let extRequire = Module.createRequireFromPath(filepath)
  const require_ = require.bind(this)
  // const metadata = this.metadata[filepath]
  extRequire = new Proxy(extRequire, {
    apply(target, thisArg, argArray) {
      let filePath = argArray[0]

      if (!path.isAbsolute(filePath) && !filePath.startsWith('.')) {
        return require(filePath)
      }

      filePath = target.resolve(filePath)

      // register denpendency
      // if (metadata) metadata.depend(filePath)

      return require_(filePath, baseContext)
    },
  })
  return extRequire
}

const processTsCode = async code => {
  return await transpileModule(code, {
    compilerOptions: require('./tsconfig.json').compilerOptions,
  }).outputText
}

const runCode = async (code, filepath) => {
  const context = createContext({
    __dirname: path.dirname(filepath),
    __filename: filepath,
    require: extRequire(filepath),
    console,
    exports: {},
  })
  new Script(code, { filename: filepath }).runInContext(context)
  return context.exports
}

const requireFile = async filepath => {
  const extension = path.extname(filepath)
  const content = await readFileSync(filepath, 'utf8')
  return { filepath, extension, content }
}

const requireDir = async folderPath => {
  let files = []
  for (const name of await readdirSync(folderPath)) {
    if (await lstatSync(`${folderPath}/${name}`).isDirectory()) {
      files = files.concat(await requireDir(`${folderPath}/${name}`))
    } else {
      files.push(await requireFile(`${folderPath}/${name}`))
    }
  }
  return files
}

const exportIt = async (file, to) => {
  switch (file.extension) {
    case '.ts':
      try {
        const jsCode = await processTsCode(file.content)
        const content = (await runCode(jsCode, file.filepath)).default
        switch (`.${to}`) {
          case '.js':
            return jsCode
          case '.json':
            return JSON.stringify(content, null, 2)
        }
      } catch (e) {
        console.error(e)
      }
  }
  return null
}

const run = async (path, to) => {
  const files = (await lstatSync(path).isDirectory())
    ? await requireDir(path)
    : await requireFile(path)
  for (const file of files) {
    console.log(file.filepath)
    const content = await exportIt(file, to)
    if (content) {
      await writeFileSync(file.filepath.replace(file.extension, `.${to}`), content)
    }
  }
}

if (argv.h || argv.help || argv._.length < 2) {
  return helper()
}
run(argv._[0], argv._[1])
