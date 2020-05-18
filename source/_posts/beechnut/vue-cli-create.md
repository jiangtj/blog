---
title: 一点点解析Vue CLI之Create
categories: [前端]
tags: [Vue,Vue CLI]
date: 2019-04-16 21:27:47
updated: 2019-04-16 21:27:47
---

Nodejs除了赋予前端后端的能力外，还能有各种各样的脚本，极大的简单各种操作。在早期，脚本做的工作大都是生成固定的模版，所以你需要了解的，仅仅生成的项目就够了。然而，随着框架的完善，架构师往往希望通过脚本处理默认的配置或者环境，这样能减少环境差异导致的问题，还能简化升级核心框架的升级，例如Vue CLI做的事。

这时候，我们不得不探一探它的神秘面纱。

这次带来的是Create的原理解析。

<!-- more -->

# Package

怎么看的呢？第一步是寻找package.json文件，它定义了项目所需的依赖以及项目的名称等信息，所以都存这样的文件。CLI的脚本放在[bin属性](https://yarnpkg.com/zh-Hant/docs/package-json/#toc-bin)下，它会随着安装放入系统的环境变量中，所以我们可以在任意的位置使用它。

在Vue CLI的项目中，目录结构是奇怪的。一般情况下，最外面的是项目本身，也就是CLI工程，然而它是文档。他的CLI项目放在[packages/@vue](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue)目录下。

这里做个备注，此时的hash值是`7375b12c8e75bd4ddc5f04a475512971e1f2bd04`，你们可以看这个位置的源码。

里面的CLI项目很多，不过我这次找的算简单的，在cli的这个项目里，他的package.json如下。

```json
{
  "name": "@vue/cli",
  "version": "3.6.3",
  "description": "Command line interface for rapid Vue.js development",
  "bin": {
    "vue": "bin/vue.js"
  },
  //...
}
```

`bin/vue.js`这是所执行的脚本。

# vue.js
接下来看一下第一个脚本。
```js
#!/usr/bin/env node
// 定义使用node环境

const minimist = require('minimist')
const program = require('commander')
const loadCommand = require('../lib/util/loadCommand')


program
  .command('create <app-name>')
  .description('create a new project powered by vue-cli-service')
  .option('-p, --preset <presetName>', 'Skip prompts and use saved or remote preset')
  //...more option
  .option('--skipGetStarted', 'Skip displaying "Get started" instructions')
  .action((name, cmd) => {
    const options = cleanArgs(cmd)

    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(chalk.yellow('\n Info: You provided more than one argument. The first one will be used as the app\'s name, the rest are ignored.'))
    }
    // --git makes commander to default git to true
    if (process.argv.includes('-g') || process.argv.includes('--git')) {
      options.forceGit = true
    }
    require('../lib/create')(name, options)
  })

// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
function cleanArgs (cmd) {
  const args = {}
  cmd.options.forEach(o => {
    const key = camelize(o.long.replace(/^--/, ''))
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}

```

上面，我只拷贝了相关代码。

我们可以看到，create命令是通过[commander](https://www.npmjs.com/package/commander)创建的，这是个转换命令行的工具，简单说就是将`vue create xxx --a aaa --b vvv`这些东西格式化。`cleanArgs`函数，将program属性想换为配置对象，便于后面的操作

其中[process](https://nodejs.org/api/process.html)是node的线程也是就是这次命令的线程，它可以用来获取当前目录以及变量等，当然也可以通过它异常结束。比如`process.argv.slice(3)`这因为在命令行中，第一个变量是自己本身，而vue create分别占据第二第三变量，所需从第四个起。

`minimist`也是同样，起到格式化的作用，详见[它的文档](https://www.npmjs.com/package/minimist)。

接下来，它调用`../lib/create`脚本。

# create

第二个脚本

```js
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')
const Creator = require('./Creator')
const { clearConsole } = require('./util/clearConsole')
const { getPromptModules } = require('./util/createTools')
const { error, stopSpinner, exit } = require('@vue/cli-shared-utils')
const validateProjectName = require('validate-npm-package-name')

async function create (projectName, options) {
  if (options.proxy) {
    process.env.HTTP_PROXY = options.proxy
  }

  const cwd = options.cwd || process.cwd()
  const inCurrent = projectName === '.'
  const name = inCurrent ? path.relative('../', cwd) : projectName
  const targetDir = path.resolve(cwd, projectName || '.')

  const result = validateProjectName(name)
  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: "${name}"`))
    result.errors && result.errors.forEach(err => {
      console.error(chalk.red.dim('Error: ' + err))
    })
    result.warnings && result.warnings.forEach(warn => {
      console.error(chalk.red.dim('Warning: ' + warn))
    })
    exit(1)
  }

  if (fs.existsSync(targetDir)) {
    if (options.force) {
      await fs.remove(targetDir)
    } else {
      await clearConsole()
      if (inCurrent) {
        const { ok } = await inquirer.prompt([
          {
            name: 'ok',
            type: 'confirm',
            message: `Generate project in current directory?`
          }
        ])
        if (!ok) {
          return
        }
      } else {
        const { action } = await inquirer.prompt([
          {
            name: 'action',
            type: 'list',
            message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
            choices: [
              { name: 'Overwrite', value: 'overwrite' },
              { name: 'Merge', value: 'merge' },
              { name: 'Cancel', value: false }
            ]
          }
        ])
        if (!action) {
          return
        } else if (action === 'overwrite') {
          console.log(`\nRemoving ${chalk.cyan(targetDir)}...`)
          await fs.remove(targetDir)
        }
      }
    }
  }

  const creator = new Creator(name, targetDir, getPromptModules())
  await creator.create(options)
}

module.exports = (...args) => {
  return create(...args).catch(err => {
    stopSpinner(false) // do not persist
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}
```

`module.exports = (...args) `接受不定参，然后，不管是传入也好调用也好，都是固定的两个参数，不明白这里的目的，偷懒？

这里的代码大部分都是对命令行参数的校验与解析，不存在难点。

最后，通过`new Creator(name, targetDir, getPromptModules())`创建创建者对象，以及执行`create`。所以重点在Creator对象中。

# Creator

太长了！😖所以这部分不细说了，大体上与之前一致，只不过复杂点。值得一提的是Creator继承了`EventEmitter`，所以它在创建过程的不同阶段发布事件，根据这个，我们可以拆分着看。

```js
this.emit('creation', { event: 'fetch-remote-preset' })
this.emit('creation', { event: 'creating' })
this.emit('creation', { event: 'git-init' })
this.emit('creation', { event: 'plugins-install' })
this.emit('creation', { event: 'invoking-generators' })
this.emit('creation', { event: 'deps-install' })
this.emit('creation', { event: 'completion-hooks' })
this.emit('creation', { event: 'done' })
```

一共有以上几个事件，当然，也有可能由于配置原因，某些步骤会跳过。比如设置shouldInitGit为false。


> 大体上就是这样。唉，这可能是唯一的一篇讲解Vue CLI源码的文章，太忙了（我是后端，后端，后端~~）
