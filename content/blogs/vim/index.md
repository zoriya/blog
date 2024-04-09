---
title: "Vim features that IDE wish they could have"
description: ""
date: 2024-04-03
draft: true
tags: ["vim", "tools"]
---

I get asked at lot why I use vim and people don't believe me when I tell them I don't miss IntelliJ or other IDEs. This post will explain why I initially left the comfort of my well-known IDE and tried vim. I'm also going to explain why I find vim's way of handling keybinds and file tabs appealing ; as well as what my paint-points with traditional IDE's way of handling them were.

The post was not written with the indent to convince you to use vim, I don't think everybody should use vim, but I think every dev should master their editor.

## The learning curve

### Beginner friendliness

To the surprise of nobody, vim is not beginner-friendly. Everything will be different from your usual text editor or IDE of choice. Vim being so hard to grasp is a well known fact around the internet, you won't have to search long to find this kind of images:

![exit vim first contact way](exit-vim.png "Source: https://github.com/hakluke/how-to-exit-vim")

### Merit vs difficulty

That may sound weird at first, but the goal of an editor is not being beginner-friendly. Writing software is hard, you are probably not choosing your language or tech stack based on how beginner-friendly it is. Taking into account the advantages of your tools is also important. If the advantages outweigh the difficulties of it, you simply use it. <br/>
Please don't take my word for it, look at the tools you or your company uses daily. Some examples might include kubernetes, git, hexagonal architecture, react/angular/your-new-js-framwork or even rust.

The first thing you should seek in a tool is its capacities. You should prefer to use powerful tools over easy tools for most use cases ; and I guess you are already choosing powerful tools for your text editor. I don't think any reader is using notepad or nano as their only editor.

So I just said that you should prefer powerful tools and I guess most of you think that vim is not one of those tools. After all, how can a tool originally created in 1976 be still considered powerful today considering it did not change that much on a surface level?

## Modal editing, the core idea of vim

### What is that?

The first painful thing you will find is pressing <kbd>d</kbd>, `d` will not be inserted on your document. In fact, pressing <kbd>d</kbd> will bring you to the `delete` mode. What is a mode you might say?<br/>
A mode is a set of keybinds that become available after the mode gets activated. You can think of traditional editors as modeless since they only have one set of keybinds.

Vim on the other hand as a lot of modes, the most well-known ones are `Normal`, `Insert` and `Visual` modes.<br/>
To put it simply normal is the default one where you can enter all other modes, insert is the one that closely resemble traditional editors (when pressing <kbd>d</kbd> actually inserts `d`) and visual is a mode to select text.<br/>
There is of course lots of other modes but we don't need to know about them just yet.
![vim modes](./vim-modes.svg "The chart of all vim modes and how to reach them (I promise it's not as scary as it looks), [source](https://gist.github.com/darcyparker/1886716)")

We can see that pressing <kbd>d</kbd> does not enable a `delete` mode but in fact activates the `Operator-pending mode` with the action `delete` (it's the tiny `operator` branch on the graph). We'll see more of this later.

### Okay but why?

You might think this is gimmicky at best but this right here is the most important thing about vim and that others editors can't simply reproduce. To understand why this behavior is important, you need to realize what you are doing in your editor is not **inserting text** but **editing it**. Most of the time, you will jump around some text block and change a word for another for example. Most modern editors expect you to use combinations of <kbd>CTRL</kbd>, <kbd>SHIFT</kbd> and arrow keys. Vim on the other hands, created motions and modes to handle logical editing commands.

For example, If you want to delete the word your cursor is in, with vscode, IntelliJ or zed, you'll probably do something like <kbd>CTRL SHIFT Right</kbd> to select the word to your right and then press backspace to delete it. If you were not at the beginning but at the middle of the world, you'll probably do something like <kbd>CTRL Left</kbd> + <kbd>CTRL SHIFT Right</kbd> + <kbd>Backspace</kbd>. With vim, you simply type <kbd>dw</kbd> for `delete word` or <kbd>diw</kbd> for `delete inner word`. This remove the clutter of editing source files, you don't need to think "how am I going to do that" you simply do it. When you think, "I want to copy this quoted text", you simply press <kbd>yi"</kbd> which means `yank inner quotes` (yank is the old name of copy). You don't need to stop your action to manually select your quote, you use a built-in motion for that. 

### In gamer terms

Modes and motions makes vim harder to learn. With time, this method of typing will slowly become part of your workflow. This is like with gaming, at first moving with WASD and the mouse or with a controller felt alien. I remember not knowing how to look left or right but after a few hours/days you become used to it. You don't need to think about how to do actions, you simply do them. I feel exactly the same about vim. It's a tool I use between 30 and 100 hours a week, and I'll probably use it for decades. I feel like that's the kind of tool I want to be extremely familiar with, even if it's harder in the beginning.

## The ubiquity of vim bindings

Another great thing about vim bindings is its ubiquity. Most editors (even non-editors like bash or your browser) have plugins for using those keybinds. This means you'll always be able to use those bindings while typing, they mostly have not changed since 50 years I bet they'll stay there for a while longer.

This also means that for starting to use vim, you don't need to do much more than installing a plugin. You don't need to fully abandon your usual IDE and can simply install the vim plugin there to get used to bindings there first.

You might think learning vim is a daunting task with lots of commands to learn, but it's surprisingly easier than you might think. Sure there are a few commands to learn but most of them are intuitive and most importantly, they chain together since most commands work with the framework `<action><motion>`. Action is what you want to do, for example <kbd>d</kbd> for delete, <kbd>v</kbd> for visual which means highlight, <kbd>y</kbd> for yank which means copy... Motion is the text block you want to edit, for example <kbd>w</kbd> for word, <kbd>iw</kbd> for inner word, <kbd>Left</kbd> for the character on the left of your cursor and so on.
Vim also has a great built-in way of learning its binding called `vimtutor` which can be run on most Unix systems (or even from git bash if you are on windows).

---

But enough about keybinds and motions, let's talk about another thing completely different between traditional editors and vim. This one is not as well known, but was the perfect solution for my workflow.

## A story about tabs

### The classic

In a traditional editor, you are probably used to have a few dozen tabs/file open. When you start having too much of them, how do you find back your file? For me this was a huge pain point for a while, I tried every possible workflow:
 - Close a tab as soon as I finished with the file. This proved to be a bad method for me since I often jump around files a lot and find myself lost in my tabs before cleanup time.
 - Use "Close other tabs" or "Close tabs on the right/left" features to simply close everything when there is too much. This was efficient after a small debug/coding time, but I needed to use this during coding sessions a lot when writing bigger features.
 - Embrace the "too much open" and use tabs on two lines, keep 3 or 4 most important/used tabs of the time pinned to find them quickly. I really liked having tabs pinned because it reduced the amount of time/mental strain needed to jump back to the most important files. Having items on two lines on the other hand was terrible, I needed twice as much time to look for the file I wanted to use before clicking on it.
 - Abandon open tabs and rely on the file tree. Since I found it hard to search for the unorganized tabs, I thought maybe having them organized in a tree would help ; it was okay on small projects but when files were too nested or too many it was a nightmare to find them.

### How vim deals with this?

The first thing you will notice about tabs in vim is their absence. There is no such things as a tab per file on vim.

#### Buffers and jump list

In vim, files are stored in `buffers`. You can think of a buffer as an invisible tab. Since a buffer is invisible, you don't need to close them nor do you manually select one in a list. Instead, you mostly jump around opened buffers using something called the jump list.

As its name imply, it records when you open another file, use "Go to definition/implementation" to move elsewhere or any other action that makes the cursor jump. This list can then be used to jump back and forth between all those positions by using <kbd>CTRL</kbd>+<kbd>o</kbd> or <kbd>CTRL</kbd>+<kbd>i</kbd>.

This is kinda like the "Abandon open tabs" approach with an extra jump list to quickly go back and forth on recently viewed files. 

#### Pinned files

The jump list works great for quickly navigating between files but after jumping everywhere you probably want to go back to one of your core files. With tabs, I would either look at every opened file and check if that was the file I wanted, if it was, I would close every other files. Since vim does not have tabs, this method is not applicable. You have two solutions to navigate back to your beloved file:
 - Open your file again (what I was doing with the file-tree approach)
 - Use global marks as a way to pin files.

You can think of global marks as a bookmark, you first mark a file with a key (<kbd>m</kbd>+<kbd>A</kbd> for example, <kbd>m</kbd> means mark and <kbd>A</kbd> is the name of your mark, it can be any uppercase letter). Pressing <kbd>\'</kbd>+<kbd>A</kbd> will bring you back to the same file at the exact same line as when you bookmarked it.

{{< alert "note" >}}

You might wonder why only uppercase letters are allowed for global marks. That's simply because a lowercase letter refers to a local mark. A local mark is scoped to a file, so you can have a <kbd>a</kbd> mark per file. Pressing it will get you back to the marked line but not change file.

{{< /alert >}}

## Closing notes: the present of vim

I focused on core vim stuff that could solve some of my issues with traditional IDEs but vim in itself is a far more modern editor than you might think. A fork of vim called [neovim](https://github.com/neovim/neovim) supports lsp (tools that creates autocompletion, go to definition, formatting, diagnostics...), treesitter (a fast and powerful code parser/highlighter), debuggers...

Most importantly, vim/neovim is expandable and customizable. You can adapt everything to your own workflow by changing 2/3 lines of lua. It also has an active community that integrate all tools inside neovim directly. Be aware tho, if you are not interested on scripting your editor to your liking, you will probably not be interested in vim.  A vim plugin in vscode/intelij is probably more right for you.

> Neovim is a PDE, a Personalized Development Environment
>
> -- <cite>TJ DeVries</cite>

Vim is not an of-the-shelf solution. You will need to configure it before using it as a daily editor. If you do not enjoy that kind of editor, that's fine just use something else. I personally really like getting to know my tools and having an editor I can tinker with. Consistently learning new things about the editor and using more coreutils tools in my workflow is something I find really enjoyable.
-- On a side note, I still think `awk` and `jq` are ones of the most underrated tools available.

<!-- vim: wrap -->

