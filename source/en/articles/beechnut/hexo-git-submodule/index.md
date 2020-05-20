---
title: Use git submodule manage hexo theme
date: 2019-08-07 23:23:25
updated: 2020-05-20
i18n:
  中文: /articles/beechnut/hexo-git-submodule/
  English: /en/articles/beechnut/hexo-git-submodule/
---

Need to reserve knowledge in advance, if you do not understand please go to Google
- Basic Git operation (Git Init/Add/Commit/Pust/Fetch/Pull)
- Basic Node/NPM operation (npm install) or Yarn (similar to NPM)
- Basic Hexo command (hexo init/cl/s/g)

# Initialization project

First we create a new hexo project, the command line runs the following command
```bash
# Create a new hexo project
hexo init <dir>
Cd <dir>
```

Use the Git management for this project
```bash
Git init
# do something by yourself, if you want to push it to GitHub.
```

Add the Cake theme as the Git submodule for the project
```bash
git submodule add https://github.com/JiangTJ/hexo-theme-cake themes/cake
```

Modify the configuration file in Hexo `theme` to `cake`

A basic project can be created through the above steps. If you have already had your own blog project before this article, locate the unfinished steps and follow the instructions.

# Update theme version

If the theme you are using is still being maintained, then you can get updates from remote. This operation is very simple, like this:
```bash
git submodule update --remote
```

It will pull the code from the latest master to your submodule from the remote.

> If you want to modify the pull branch by `git config -f .gitmodules submodule.themes/cake.branch stable`, in general, the master branch is good enough, no need to modify

# Replace with npm script

The git submodule command is not easy to remember, another way is to use the npm script to replace. Edit the `package.json` file and add the following:
```json
{
  "name": "mrtt-hexo-blog",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "update-theme": "git submodule update --remote"
  },
  "hexo": {
    "version": "3.9.0"
  },
  "dependencies": {
    //...
  }
}
```

For each update, you only need to run `npm run update-theme`

# Custom Theme

This problem is often mentioned, I want to get updates from the official remote repository, but I want to be able to modify the file of the theme, add my own code, how to deal with it?

One way is to fork, and then use the theme of your fork as a submodule, but each update needs to synchronize the official update to the theme of your fork (somewhat troublesome)

The other one is introduced here: replacement. I don't make changes to the theme file, but I can create a file outside. The idea is to replace the file in the same way as the file path of the theme.

## Replacement

First, install a hexo plugin [hexo-theme-plus](https://github.com/jiangtj/hexo-theme-plus)
```bash
npm i --save @jiangtj/hexo-theme-plus
```

By default, the replacement path is already configured. If you need to modify it, modify the following configuration in hexo.
```yml
theme_plus:
  custom_path: custom/theme # disabled: set 'false'
```

Create a corresponding theme file in `custom/theme`, such as `${theme_dir}/layout/_partials/footer.swig`, copy it to `${hexo_dir}/custom/theme/_partials/footer.swig`, then Make some changes, for example, I added a Ծ‸ Ծ to the author information.
```html
  <span class="author" itemprop="copyrightHolder">{{ theme.footer.copyright || author }} Ծ‸ Ծ</span>
```

`hexo s` run preview, we can see the bottom, the author has added Ծ‸ Ծ

> Replace has a bit of defects. First, it only supports files under `layout`. Secondly, it needs theme support (using partial, you can't use the specific syntax of the template, such as include). Cake except for the `layout` root directory, all support replacement. But NexT requires you to replace the syntax of `include` `macro` etc.

## Injection

Another way, you can also inject any code you want at the injection point. See my previous article [Hexo NexT Advanced Tutorial Injects](/articles/beechnut/hexo-next-injects/)

# Editing on another computer

In the case of Git repository synchronization, if you need to work on another computer, the only thing you need to do is add `--recursive` to the `git clone` command.

```bash
git clone --recursive https://github.com/your-name/your-blog
```

If it's a GUI tool, then nothing needs to be changed. They default to adding `--recursive`

If you forget to add `--recursive`, you can execute the following command. Of course, you can also add it to your npm scripts, so you can remember it.

```bash
git submodule init
git submodule update
```

# Summary

1. Don't modify any theme files. I believe that replacing and injecting, you can modify any theme code, which ensures that your theme repository can be set directly to the official repository, and the update has no conflicts.
2. There are very few commands to remember, just two `git submodule update --remote` and `git clone --recursive repo`
