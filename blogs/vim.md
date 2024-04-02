# Vim features that IDE wish they could have

This post is not here to convince you to use vim, but to show you what choices vim made 50 years ago that are still relevant today. Choices that bring benefits that moderns IDEs try to replicate the best they can with their own constraints. This post will also explain some points that make vim feels alien at first but might slowly become your favorite way of editing code.

## The first impression: could it get worse?

To the surprise of nobody, vim is not beginner-friendly. Everything will be different from your usual text editor or IDE of choice. This is so hard for beginners that you can find those kinds of images everywhere on the internet:

![exit-vim.png](./exit-vim.png)

But one need to remember, the goal of an editor is not being beginner-friendly. Writing software is hard, you are probably not choosing your language or tech stack based on how beginner-friendly it is. You also take into accounts the advantages of your tools and if the advantages outweighs the difficulties of it, you simply use it. Need an example about hard to learn tools that you or your company probably uses: Kubernetes, Git, JS Bundlers, Hexagonal Architecture, React/Angular/YourNewJsFramwork or even Rust (probably not used at your company tho).

The first thing you should seek in a tool is its capacities. You should prefer to use powerful tools over easy tools for most use cases ; and my guess is you already are doing that for your text editor. Does any of you is using notepad as your daily editor? I certainly hope not.

So I just said that you should prefer powerful tools and I guess most of you think that vim is not one of those tools. After all, how can a tool originally created in 1976 be still considered powerful today considering it did not change that much on a surface level?

## Modal editing, the core idea of vim

The first thing you will learn, probably painfully, in vim is that it is a modal editor. That means that when you type `u`, for example, it won't simply insert that character on the screen but instead will run the command `u` which is `undo` by default.

You might think this is gimmicky at best but this right here is the most important thing about vim and that others editors can't simply reproduce. To understand why this behavior is important, you need to realise what you are doing in your editor is not **INSERTING text** but **EDITING it**. Most of the time, you will jump arround some text block and change a word for another for example. Most modern editors expect you to use combinations of `CTRL`, `SHIFT` and arrow keys. Vim on the other hands, created motions to handle this simply by a keypress.

For example, If you want to delete the word your cursor is in, with vscode, intelij or zed, you'll probably do something like `CTRL SHIFT Right` to select the word to your right and then press backspace to delete it. If you were not at the begining but at the middle of the world, you'll probably do something like `CTRL Left` + `CTRL SHIFT Right` + `Backspace`. With vim, you simply type `dw` for `delete word` or `diw` for `delete inner word`. This remove the clutter of editing source files, you don't need to think "how am I gonna do that" you simply do it. When you think, "I want to copy this quotted text", you simply press `yi"` which means `yank inner quotes` (yank is the old name of copy). You don't need to break your flow by selecting manually and precisly your quote.

Those kind of keys make it hard to learn at first will, in time, become a part of your workflow. This is like with gaming, at first moving with WASD and the mouse or via a controller felt alien. I remember not knowing how to look left or right but after a few hours/days you become used to it and don't need to think about it again. I feel exactly the same about vim. It's a tool I use between 30 and 100 hours a week and I'll probably use it for at least a decade. I feel like that's the kind of tool I want to be extremely familiar with, even if it's harder in the begining.

## The ubiquity of vim bindings

Another great thing about vim bindings is it's ubiquity. Most editors (even non-editors like bash or your browser) have plugins for using those keybinds. This means you'll always be able to use those bindings while typing, they mostly have not changed since 50 years I bet they'll stay there for a while longer.

This also means that for starting to use vim, you don't need to do much more than installing a plugin. You don't need to fully abandon your usual IDE and you can simply install the vim plugin there to get used to bindings there first.

You might think learning vim is a daugting task with lots of commands to learn but it's surprisingly easier than you might think. Sure there is a few commands to learn but most of them are intuitive and most importantly, they chain together since most commands work with the framework `<action><motion>`. Action is what you want to do, for example `d` for delete, `v` for visual which means highlight, `y` for yank wich means copy... Motion is the text block you want to edit, for example `w` for word, `iw` for inner word, `Left` for the character on the left of your cursor and so on.
Vim also has a great builtin way of learning it's binding called `vimtutor` which can be run on most unix systems (or even from `git bash` if you are on windows).

## 

<!-- vim: wrap -->
