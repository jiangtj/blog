---
title: Hexo NexT Advanced Tutorial For Injects
date: 2019-07-11 09:54:31
description: A brand new custom way to share your Code.
i18n:
  中文: /articles/beechnut/hexo-next-injects/
  English: /en/articles/beechnut/hexo-next-injects/
---

> My English is not very good, so if there is a typo, please remind me, thank you very much.

# Why

This goes back to March, Mimi's [PR: Adding Submodule](https://github.com/theme-next/hexo-theme-next/pull/663), and we discussed how to manage third-party dependencies. LEAFERx proposed that using NPM management would be better, he practice PR:Extract leancloud-counter to plugins [#677](https://github.com/theme-next/hexo-theme-next/pull/677) [ #707](https://github.com/theme-next/hexo-theme-next/pull/707). In my opinion, LEAFERx's solution is not good because of the complexity. So to be plugin, there are two requirements that must be met:

1. Flexibility/Extensibility, in the plugin, we have to be able to modify most of the content.
2. Simplicity, we can integrate the functions with very little code.

In addition, ivan-nginx is also concerned about documentation issues, but if it is completely independent, it is not a problem. In the meantime, I also tried [PR:Refactoring comments](https://github.com/theme-next/hexo-theme-next/pull/711). After all, the comment system is really "bad". A bunch of `if else`. This refactoring is a good attempt, but I can't easily get together because the impact is big (almost everyone), and then I found another solution, a plugin for Hexo [hexo-inject](https://Github.com/hexojs/hexo-inject), by customizing the content by injecting code, since hexo itself is separated from the theme, it can only provide 4 injection points, and the scalability is far from enough. But if it can be implemented in NexT, it is completely different, so I mentioned [PR: Add new filter type theme_inject](https://github.com/theme-next/hexo-theme-next/pull/868)

<!-- more -->

# How to use

Okay, let's talk about this, let's experience how to use `theme_inject`. Of course, if you are a beginner, you can use the `custom_file_path` in the configuration file to add custom content. If you want to modify more content, then follow me step by step. The docs of Injects can be found in [NexT Document](https://theme-next.org/docs/advanced-settings#Injects). Here is an example, step by step integration [gitter](https://sidecar.gitter.im/).

## Injection layout

First, we create a js file (any name) in the hexo or theme `scripts`, add the following content. As long as it is a script inside, the hexo runtime will execute it.

```js
hexo.extend.filter.register('theme_inject', function(injects) {
  // Name path etc. can be modified at will, in order to facilitate the following are based on the definition here
  injects.head.file('gitter', 'views/gitter.swig', {}, {cache: true});
});
```

In the second step, we create a `views/gitter.swig` file and add the following.
```html
<script>
  ((window.gitter = {}).chat = {}).options = {
    Room: 'your-room-name'
  }});
</script>
<script src="https://sidecar.gitter.im/dist/sidecar.v1.js" async defer></script>
```

`hexo s` runs, you can see that the gitter has been integrated in the lower right corner.

## Injection style

Next step, we adjust the style. In the script, add more styles of injection.

```js
hexo.extend.filter.register('theme_inject', function(injects) {
  injects.head.file('gitter', 'views/gitter.swig', {}, {cache: true});
  injects.style.push('views/gitter.styl');
});
```

Create a `views/gitter.styl` file

```css
.gitter-open-chat-button {
  background-color: slateblue;
  margin-bottom: .8rem;
  margin-right: 1rem;
  padding: .4rem .8rem;
  border-radius: .6rem;
  box-shadow: 0 0 .4rem #111;
  opacity: .9;
}

.gitter-open-chat-button:focus,.gitter-open-chat-button:hover {
  background-color: slateblue;
  box-shadow: 0px 0px 0.8rem #111;
}

.gitter-open-chat-button.is-collapsed {
  transform: translateY(150%);
}

.sidebar-toggle {
  margin-bottom: 18px;
}
```

Run it again, the style of the button changes, do you think it is better than the original or...?

# Make a npm plugin

The spirit of open source lies in sharing. When you customize your theme, you may write an article "How to implement XXXX in NexT". Then, after Visitor saw it, and followed you. Although there is no problem. But after all, "lazy" is the intent. If we can put it all into an NPM plugin, then they only need `yarn add xxxx` when they use it. How convenient it will be! ! !

The next step is to implement a plug-in that slides to the bottom/head and read progress. The final effect is seen in [hexo-cake-moon-menu](https://github.com/jiangtj-lab/hexo-cake-moon-menu)

In order to be uploaded to the NPM repository, you first need to create an account on it: <https://www.npmjs.com/>, and for convenience, I use yarn as a command line tool.

## Initializing an NPM package

Create a new folder and run `yarn init` in it, you will be asked a series of questions (such as the following), after initialization will initialize a package.json

```cmd
PS C:\Users\MrTT\Desktop\hexo-moon-menu> yarn init
Yarn init v1.16.0
Question name (hexo-moon-menu): @jiangtj/hexo-moon-menu
Question version (1.0.0):
Question description: Hallo
Question entry point (index.js):
Question repository url: https://github.com/jiangtj/hexo-theme-cake.git
Question author: Mr.J
Question license (MIT): LGPL-3.0
Question private: false
Success Saved package.json
Done in 99.85s.
```

- name suggests adding `@scope` which is `@yourname`, after all, the same name package can't upload
- name must start with `hexo-` or `@scope/hexo-`

## Create an example project for preview

You need to upload your plugin (this step is the last step, but due to hexo will detect package.json to execute the plugin, you must have the plugin first), run `yarn publish --access public` in the current project.

Add a `.gitignore`, npm will also ignore unnecessary files based on it
```
node_modules/
*.log
example/
```

Run the following command to create an example project
```bash
# Create a hexo project
hexo init example
# Enter the example directory
cd example
# Add next theme
git clone https://github.com/theme-next/hexo-theme-next themes/next
# Switch theme configuration
hexo config theme next
# Switch scheme to Gemini, this plugin is not supported by Muse because of conflict with the sidebar. If you are interested, you can implement it in Muse.
hexo config theme_config.scheme Gemini
# Run preview
hexo s
```

Link plugin
```bash
# Add dependencies
yarn add "@jiangtj/hexo-moon-menu"
# Create a reference to the plugin for debug
cd ..
yarn link
cd example
yarn link "@jiangtj/hexo-moon-menu"
#Run preview, because nothing has been done, so nothing changes.
hexo s
```

## Layout and style

Next copy the following part of [hexo-cake-moon-menu](https://github.com/jiangtj-lab/hexo-cake-moon-menu) in my project to your plugin project.
- default.yaml default configuration
- moon-menu.swig layout of the menu
- moon-menu.styl style of the menu

In the above use of Injects, you can understand that the focus is on js scripts. Styles layout etc are organized through it, so I ignore the style, if you want to study you can view those.

## Script

The main in package.json defines the script's entry file. The default is `index.js`, so we create it and add the following

```js
// Need to load dependencies
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

hexo.extend.filter.register('theme_inject', function(injects) {

  // need to disable the original button
  hexo.theme.config.back2top.enable = false;

  // Read the default configuration file
  // __dirname to the absolute directory of the file, you need to pay attention to the location here. If you do not use path to get the absolute path, the file readout will be abnormal (recommended, try npm pit)
  let defaultConfig = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'default.yaml')));
  // Merge default configuration with moon_menu configuration in hexo
  let moonMenu = Object.assign(defaultConfig, hexo.config.moon_menu);

  // Reorganize menus, sort, etc.
  let moonMenuArr = Object.keys(moonMenu)
    .map(key => moonMenu[key])
    .map(item => {
      Item.order = item.order || 0;
      If (item.enable === undefined) {
        Item.enable = true;
      }
      Return item;
    })
    .filter(item => item.enable)
    .sort((a, b) => a.order - b.order);

  // Add layout
  injects.bodyEnd.file('moon-menu', path.join(__dirname, 'moon-menu.swig'), {menus: moonMenuArr}, {cache: true, only: true});
  // Add style
  injects.style.push(path.join(__dirname, 'moon-menu.styl'));

});
```

And you need to add `js-yaml` dependency for parsing yaml
```bash
cd ..
yarn add js-yaml
cd example
hexo s
```

Run the preview again and you can see the button added to your example project.

## Uploading and sharing

Remember to upload `yarn publish --access public` after you finish, and then try to add `yarn add @jiangtj/hexo-moon-menu` in your blog.

If you would like to more user use your plugin, please submit a PR to [Awesome-NexT](https://github.com/theme-next/awesome-next)

## Others

We can also load other hexo plugins in the plugin, after adding the hexo plugin (`yarn add plugin-name`). Load the script with the following code.

```js
const tagcloud = hexo.resolvePlugin('plugin-name')
hexo.loadPlugin(tagcloud).then(() => {
  hexo.log.debug('Plugin loaded: plugin-name');
}).catch(err => {
  hexo.log.error({err}, 'Plugin load failed: plugin-name');
});
hexo.extend.filter.register('theme_inject', injects => {
  //...
});
```

> Note: `hexo.loadPlugin` needs to be placed outside the filter, to ensure that it is executed at the first time. The above code comes from an example: [hexo-next-wapper-tag-cloud](https://github. Com/jiangtj-lab/hexo-next-wapper-tag-cloud)

# Summary

Although this theme_inject has been merged, there are still many improvements that need to be made.
- It is necessary to make NexT more structured to provide more injection points.
- The refactoring PR of the comment system is closed, for various reasons, I plan to re-refactor it based on theme_inject (Done).
