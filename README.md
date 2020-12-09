# Walk.js (@root/walk)

Walk a directory recursively and handle each entity (files, directories, symlnks, etc).

(a port of Go's [`filepath.Walk`](https://golang.org/pkg/path/filepath/#Walk)
using Node.js v10+'s `fs.readdir`'s `withFileTypes` and ES 2021)

```js
await Walk.walk(pathname, walkFunc);

function walkFunc(err, pathname, dirent) {
  // ...
}
```

Where

- `err` is a failure to lstat a file or directory
- `pathname` may be relative
- `dirent` is an `fs.Dirent` that has
  - `dirent.name`
  - `dirent.isFile()`
  - `dirent.isDirectory()`
  - `dirent.isSymbolicLink()`
  - etc

# Examples

You can use this with Node v12+ using Vanilla JS or ES2021.

## ES 2021 Modules

`@root/walk` can be used with async/await or Promises.

```js
import { walk } from "@root/walk";
import path from "path";

await walk("./", async (err, pathname, dirent) => {
  if (err) {
    // throw an error to stop walking
    // (or return to ignore and keep going)
    console.warn("fs stat error for %s: %s", pathname, err.message);
    return;
  }

  // return false to skip a directory
  // (ex: skipping "dot files")
  if (dirent.isDirectory() && dirent.name.startsWith(".")) {
    return false;
  }

  // fs.Dirent is a slimmed-down, faster version of fs.Stat
  console.log("name:", dirent.name, "in", path.dirname(pathname));
  // (only one of these will be true)
  console.log("is file?", dirent.isFile());
  console.log("is link?", dirent.isSymbolicLink());
});

console.log("Done");
```

## Vanilla JS (ES5)

```js
var Walk = require("@root/walk");
var path = require("path");

Walk.walk("./", function walkFunc(err, pathname, dirent) {
  if (err) {
    throw err;
  }

  if (dirent.isDirectory() && dirent.name.startsWith(".")) {
    return Promise.resolve(false);
  }
  console.log("name:", dirent.name, "in", path.dirname(pathname));

  return Promise.resolve();
}).then(function () {
  console.log("Done");
});
```

# API Documentation

`Walk.walk` walks `pathname` (inclusive) and calls `walkFunc` for each file system entry.

It can be used with Promises:

```js
Walk.walk(pathname, promiseWalker).then(doMore);
```

Or with async / await:

```js
await Walk.walk(pathname, asyncWalker);
```

The behavior should exactly match Go's
[`filepath.Walk`](https://golang.org/pkg/path/filepath/#Walk) with 3 exceptions:

- uses JavaScript Promises/async/await
- receives `dirent` rather than `lstat` (for performance)

<!-- TODO
- can be created with `options` to change default behaviors
-->

## walkFunc

Handles each directory entry

```js
function walker(err, pathname, dirent) {
  // `err` is a file system stat error
  // `pathname` is the full pathname, including the file name
  // `dirent` is an fs.Dirent with a `name`, `isDirectory`, `isFile`, etc
  return null;
}
```

<!-- TODO
## create(options)

Create a custom walker with these options:

- `withFileTypes: false` walkFunc will receive String[] instead of fs.Dirent[]
- `sort: sortFunc`
-->
