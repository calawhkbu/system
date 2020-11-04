import cmd = require('node-cmd')
import chalk from 'chalk'
import { existsSync } from 'fs'
import { resolve as pathResolve } from 'path'
import minimist = require('minimist')

const helpers = {
  argv: Object.assign(
    Object.keys(process.env)
      .filter(key => key.startsWith('npm_config_'))
      .reduce((result, current) => {
        const newResult = { ...result }
        newResult[current.substr(11)] = process.env[current]
        return newResult
      }, {}),
    minimist(process.argv.slice(2))
  ),
  helpMe: () => {
    console.log('Clone/Pull all selected repo to swivel-backend-custom from swivelsoftware-config');
    return console.log(chalk.green(`Usage: ${chalk.yellow('npm run refreshall')}`))
  }
}

const config = {
  username: 'admin-swivel',
  pw: '7739825561095c261a9a77a1ea9705859131529c',
  branch: ['prod', 'uat-new', 'master'],
  repos: [
    'customer-DEV',
    'customer-STD',
    'customer-GGL',
    'customer-DT',
    'customer-ECX',
    'customer-ASW',
    'customer-NAF',
    'customer-FHUB'
  ]
}

const basePath = pathResolve(process.cwd(), '..')

const run = () => {
  if (helpers.argv.h || helpers.argv.help) {
    return helpers.helpMe()
  }
  return Promise.all(config.repos.map((repo) => new Promise((resolve, reject) => {
    const repoPath = pathResolve(basePath, repo)
    var url = `https://${config.username}:${config.pw}@github.com/swivelsoftware-config/${repo}.git`
    let command = `cd ${basePath};`
    if(existsSync(repoPath)) {
      command = `${command}cd ${repoPath};git remote set-url origin ${url};`
    } else {
      command = `${command}git clone ${url};cd ${repoPath};git config --local --unset credential.helper;${config.branch.map(branch => `git checkout ${branch}`).join(';')};`
    }
    command = `${command}cd ${basePath};`
    return cmd.get(command, (err, data, std) => err ? reject(new Error(err)) : resolve({ name: repo, message: `${data}${std}` }))
  })))
    .then((data: { name: string, message: string }[]) => data.map(d => console.log(chalk.green(`Success on repo [Name: ${d.name}]`), '\n', chalk.green(d.message), '\n')))
    .catch(e => console.log(chalk.red('Clone Error!'), chalk.red(e)))
}

run()
