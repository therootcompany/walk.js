// ECMAScript 2021
// (or Vanilla JS)
import { promises as fs } from "fs";
// or let fs = require("fs").promises;
import path from "path";
// or let path = require("path");

// a port of Go's filepath.Walk
async function walk(pathname, walkFunc, _dirent) {
  let err;
  function pass(e) {
    return e;
  }

  // special case of the very first run
  if (!_dirent) {
    let _name = path.basename(path.resolve(pathname));
    _dirent = await fs.lstat(pathname).catch(pass);
    if (_dirent instanceof Error) {
      err = _dirent;
    } else {
      _dirent.name = _name;
    }
  }

  // run the user-supplied function and either skip, bail, or continue
  err = await walkFunc(err, pathname, _dirent).catch(pass);
  if (false === err) {
    return;
  }
  if (err instanceof Error) {
    throw err;
  }

  // "walk does not follow symbolic links"
  if (!_dirent.isDirectory()) {
    return;
  }
  let result = await fs.readdir(pathname, { withFileTypes: true }).catch(pass);
  if (result instanceof Error) {
    return walkFunc(result, pathname, _dirent);
  }
  for (let dirent of result) {
    await walk(path.join(pathname, dirent.name), walkFunc, dirent);
  }
}

walk("./", function (err, pathname, dirent) {
  if (dirent.name.startsWith(".")) {
    return Promise.resolve(false);
  }

  console.log(path.resolve(pathname));
  return Promise.resolve(true);
});
