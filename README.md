# Walk.js (@root/walk)

A port of Go's [`filepath.Walk`](https://golang.org/pkg/path/filepath/#Walk) for Node.js v10+ (which introduced `fs.readdir` `withFileTypes`).

```js
await Walk.walk(rootpath, walkFunc);
```

# Example

```js
import Walk from "walk";

Walk.walk("./", function (err, pathname, dirent) {
  if (err) {
    throw err;
  }

  // ignore dot files
  if (dirent.name.startsWith(".")) {
    return Walk.skipDir;
  }
});
```

# API Documentation

`Walk.walk` walks `rootpath` (inclusive) and calls `walkFunc` for each file system entry.

It can be used with Promises:

```js
Walk.walk(rootpath, promiseWalker).then(doMore);
```

Or with async / await:

```js
await Walk.walk(rootpath, asyncWalker);
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
