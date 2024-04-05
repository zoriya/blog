---
title: "Vim features that IDE wish they could have"
description: ""
date: 2024-04-03
draft: true
tags: ["vim", "tools"]
---

This post is not here to convince you to use vim, but to show you what choices vim made 50 years ago that are still relevant today. Choices that bring benefits that moderns IDEs try to replicate the best they can with their own constraints. This post will also explain some points that make vim feels alien at first but might slowly become your favorite way of editing code.

## The first impression

### Could it get worse?

To the surprise of nobody, vim is not beginner-friendly. Everything will be different from your usual text editor or IDE of choice. This is so hard for beginners that you can find those kinds of images everywhere on the internet:

![exit vim first contact way](exit-vim.png)
 *Source: https://github.com/hakluke/how-to-exit-vim*

### Merit vs difficulty

But one need to remember, the goal of an editor is not being beginner-friendly. Writing software is hard, you are probably not choosing your language or tech stack based on how beginner-friendly it is. You also take into accounts the advantages of your tools and if the advantages outweighs the difficulties of it, you simply use it. Need an example about hard to learn tools that you or your company probably uses: Kubernetes, Git, JS Bundlers, Hexagonal Architecture, React/Angular/YourNewJsFramwork or even Rust (probably not used at your company tho).

The first thing you should seek in a tool is its capacities. You should prefer to use powerful tools over easy tools for most use cases ; and my guess is you already are doing that for your text editor. Does any of you is using notepad as your daily editor? I certainly hope not.

So I just said that you should prefer powerful tools and I guess most of you think that vim is not one of those tools. After all, how can a tool originally created in 1976 be still considered powerful today considering it did not change that much on a surface level?

## Modal editing, the core idea of vim

### What is that?

The first thing you will learn, probably painfully, in vim is that it is a modal editor. That means that when you type <kbd>u</kbd>, for example, it won't simply insert that character on the screen but instead will run the command <kbd>u</kbd> which is `undo` by default.

### Okay but why?

You might think this is gimmicky at best but this right here is the most important thing about vim and that others editors can't simply reproduce. To understand why this behavior is important, you need to realize what you are doing in your editor is not **inserting text** but **editing it**. Most of the time, you will jump around some text block and change a word for another for example. Most modern editors expect you to use combinations of <kbd>CTRL</kbd>, <kbd>SHIFT</kbd> and arrow keys. Vim on the other hands, created motions to handle this simply by a key press.

For example, If you want to delete the word your cursor is in, with vs code, IntelliJ or zed, you'll probably do something like <kbd>CTRL SHIFT Right</kbd> to select the word to your right and then press backspace to delete it. If you were not at the beginning but at the middle of the world, you'll probably do something like <kbd>CTRL Left</kbd> + <kbd>CTRL SHIFT Right</kbd> + <kbd>Backspace</kbd>. With vim, you simply type <kbd>dw</kbd> for `delete word` or <kbd>diw</kbd> for `delete inner word`. This remove the clutter of editing source files, you don't need to think "how am I going to do that" you simply do it. When you think, "I want to copy this quoted text", you simply press <kbd>yi"</kbd> which means `yank inner quotes` (yank is the old name of copy). You don't need to break your flow by selecting manually and precisely your quote.

### In gamer terms

Those kinds of keys make it hard to learn at first will, in time, become a part of your workflow. This is like with gaming, at first moving with WASD and the mouse or via a controller felt alien. I remember not knowing how to look left or right but after a few hours/days you become used to it and don't need to think about it again. I feel exactly the same about vim. It's a tool I use between 30 and 100 hours a week, and I'll probably use it for at least a decade. I feel like that's the kind of tool I want to be extremely familiar with, even if it's harder in the beginning.

## The ubiquity of vim bindings

Another great thing about vim bindings is its ubiquity. Most editors (even non-editors like bash or your browser) have plugins for using those keybinds. This means you'll always be able to use those bindings while typing, they mostly have not changed since 50 years I bet they'll stay there for a while longer.

This also means that for starting to use vim, you don't need to do much more than installing a plugin. You don't need to fully abandon your usual IDE and can simply install the vim plugin there to get used to bindings there first.

You might think learning vim is a daunting task with lots of commands to learn, but it's surprisingly easier than you might think. Sure there are a few commands to learn but most of them are intuitive and most importantly, they chain together since most commands work with the framework `<action><motion>`. Action is what you want to do, for example <kbd>d</kbd> for delete, <kbd>v</kbd> for visual which means highlight, <kbd>y</kbd> for yank which means copy... Motion is the text block you want to edit, for example <kbd>w</kbd> for word, <kbd>iw</kbd> for inner word, <kbd>Left</kbd> for the character on the left of your cursor and so on.
Vim also has a great built-in way of learning its binding called `vimtutor` which can be run on most Unix systems (or even from git bash if you are on windows).

## A story about tabs

### The classic

In a traditional editor, you are probably used to have a few dozen tabs/file open. When you start having too much of them, how do you find back your file? For me this was a huge pain point for a while, I tried every possible workflow:
 - Close a tab as soon as I finished with the file. This proved to be a bad method for me since I often jump around files a lot and find myself lost in my tabs before cleanup time.
 - Use "Close other tabs" or "Close tabs on the right/left" features to simply close everything when there is too much. This was efficient after a small debug/coding time, but I needed to use this during coding sessions a lot when writing bigger features.
 - Embrace the "too much open" and use tabs on two lines, keep 3 or 4 most important/used tabs of the time pinned to find them quickly. I really liked having tabs pinned because it reduced the amount of time/mental strain needed to jump back to the most important files. Having items on two lines on the other hand was terrible, I needed twice as much time to look for the file I wanted to use before clicking on it.
 - Abandon open tabs and rely on the file tree. Since I found it hard to search for the unorganized tabs, I thought maybe having them organized in a tree would help ; it was okay on small projects but when files were too nested or too many it was a nightmare to find them.

### How vim deals with this?

The first thing you will notice about tabs in vim is their absence. There is no such things as a tab per file on vim.

<!-- vim: wrap -->
