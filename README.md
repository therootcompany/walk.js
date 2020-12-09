# Walk.js (@root/walk)

Walk a directory recursively and handle each entity (files, directories, symlnks, etc).

(a port of Go's [`filepath.Walk`](https://golang.org/pkg/path/filepath/#Walk)
using Node.js v10+'s `fs.readdir`'s `withFileTypes` and ES 2021)

```js
await Walk.walk(pathname, walkFunc);

async function walkFunc(err, pathname, dirent) {
  // err is failure to lstat a file or directory
  // pathname is relative path, including the file or folder name
  // dirent = { name, isDirectory(), isFile(), isSymbolicLink(), ... }

  if (err) {
    return false;
  }
  console.log(pathname);
}
```

# Table of Contents

- Install
- Usage
  - CommonJS
  - ES Modules
- API
  - Walk.walk
    - walkFunc
    - Example: filter dotfiles
  - Walk.create
    - withFileStats
    - sort (and filter)
- [Node walk in <50 Lines of Code](https://therootcompany.com/blog/fs-walk-for-node-js/)
- License (MPL-2.0)

# Install

```bash
npm install --save @root/walk
```

# Usage

You can use this with Node v12+ using Vanilla JS (CommonJS) or ES2021 (ES Modules).

## CommonJS (Vanilla JS / ES5)

```js
var Walk = require("@root/walk");
var path = require("path");

Walk.walk("./", walkFunc).then(function () {
  console.log("Done");
});

// walkFunc must be async, or return a Promise
function walkFunc(err, pathname, dirent) {
  if (err) {
    // throw an error to stop walking
    // (or return to ignore and keep going)
    console.warn("fs stat error for %s: %s", pathname, err.message);
    return Promise.resolve();
  }

  // return false to skip a directory
  // (ex: skipping "dot file" directories)
  if (dirent.isDirectory() && dirent.name.startsWith(".")) {
    return Promise.resolve(false);
  }

  // fs.Dirent is a slimmed-down, faster version of fs.Stats
  console.log("name:", dirent.name, "in", path.dirname(pathname));
  // (only one of these will be true)
  console.log("is file?", dirent.isFile());
  console.log("is link?", dirent.isSymbolicLink());

  return Promise.resolve();
}
```

## ECMAScript 2021 (ES Modules)

`@root/walk` can be used with async/await or Promises.

```js
import { walk } from "@root/walk";
import path from "path";

const walkFunc = async (err, pathname, dirent) => {
  if (err) {
    throw err;
  }

  if (dirent.isDirectory() && dirent.name.startsWith(".")) {
    return false;
  }

  console.log("name:", dirent.name, "in", path.dirname(pathname));
};

await walk("./", walkFunc);

console.log("Done");
```

# API Documentation

## Walk.walk(pathname, walkFunc)

`Walk.walk` walks `pathname` (inclusive) and calls `walkFunc` for each file system entity.

It can be used with Promises:

```js
Walk.walk(pathname, promiseWalker).then(doMore);
```

Or with async / await:

```js
await Walk.walk(pathname, asyncWalker);
```

The behavior should exactly match Go's
[`filepath.Walk`](https://golang.org/pkg/path/filepath/#Walk) with a few exceptions:

- uses JavaScript Promises/async/await
- receives `dirent` rather than `lstat` (for performance, see `withFileStats`)
- optional parameters to change stat behavior and sort order

### walkFunc

Handles each directory entry

```js
async function walkFunc(err, pathname, dirent) {
  // `err` is a file system stat error
  // `pathname` is the full pathname, including the file name
  // `dirent` is an fs.Dirent with a `name`, `isDirectory`, `isFile`, etc
  return null;
}
```

## Walk.create(options)

Create a custom walker with these options:

- `withFileStats: true` walkFunc will receive fs.Stats[] from fs.lstat instead of fs.Dirent[]
- `sort: (entities) => entities.sort()` sort and/or filter entities before walking them

```js
const walk = Walk.create({
  withFileStats: true,
  sort: (entities) => entities.sort()),
});
```

## withFileStats

By default `walk` will use `fs.readdir(pathname, { withFileTypes: true })` which returns `fs.Dirent[]`,
which only has name and file type info, but is much faster when you don't need the complete `fs.Stats`.

Enable `withFileStats` to use get full `fs.Stats`. This will use `fs.readdir(pathname)` (returning `String[]`)
and then call `fs.lstat(pathname)` - including `mtime`, `birthtime`, `uid`, etc - right after.

```js
const walk = Walk.create({
  withFileStats: true,
});

walk(".", async function (err, pathname, stat) {
  console.log(stat.name, stat.uid, stat.birthtime, stat.isDirectory());
});
```

## sort (and filter)

Sometimes you want to give priority to walking certain directories first.

The `sort` option allows you to specify a funciton that modifies the `fs.Dirent[]` entities (default) or `String[]` filenames (`withFileStats: true`).

Since you must return the sorted array, you can also filter here if you'd prefer.

```js
const byNameWithoutDotFiles = (entities) => {
  // sort by name
  // filter dot files
  return entities
    .sort((a, b) => {
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      return 0;
    })
    .filter((ent) => !ent.name.startsWith("."));
};

const walk = Walk.create({ sort: byNameWithoutDotFiles });

walk(".", async function (err, pathname, stat) {
  // each directories contents will be listed alphabetically
  console.log(pathname);
});
```

Note: this gets the result of `fs.readdir()`. If `withFileStats` is `true` you will get a `String[]` of filenames - because this hapens BEFORE `fs.lstat()` is called - otherwise you will get `fs.Dirent[]`.

# node walk in 50 lines of code

If you're like me and you hate dependencies,
here's the bare minimum node fs walk function:

See [snippet.js](/snippet.js) or <https://therootcompany.com/blog/fs-walk-for-node-js/>.

# License

The main module, as published to NPM, is licensed the MPL-2.0.

The ~50 line snippet is licensed CC0-1.0 (Public Domain).
