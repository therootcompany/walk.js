/**
 * @license
 * walk.js - fs.walk for node.js (a port of Go's filepath.Walk)
 *
 * Written in 2020 by AJ ONeal <coolaj86@gmail.com>
 * To the extent possible under law, the author(s) have dedicated all copyright
 * and related and neighboring rights to this software to the public domain
 * worldwide. This software is distributed without any warranty.
 *
 * You should have received a copy of the CC0 Public Domain Dedication along with
 * this software. If not, see <https://creativecommons.org/publicdomain/zero/1.0/>.
 */

"use strict";

async function walk(pathname, walkFunc, dirent) {
  const fs = require("fs").promises;
  const path = require("path");
  const _pass = (err) => err;

  let err;

  // special case: walk the very first file or folder
  if (!dirent) {
    let filename = path.basename(path.resolve(pathname));
    dirent = await fs.lstat(pathname).catch(_pass);
    if (dirent instanceof Error) {
      err = dirent;
    } else {
      dirent.name = filename;
    }
  }

  // run the user-supplied function and either skip, bail, or continue
  err = await walkFunc(err, pathname, dirent).catch(_pass);
  if (false === err) {
    // walkFunc can return false to skip
    return;
  }
  if (err instanceof Error) {
    // if walkFunc throws, we throw
    throw err;
  }

  // "walk does not follow symbolic links"
  // (doing so could cause infinite loops)
  if (!dirent.isDirectory()) {
    return;
  }
  let result = await fs.readdir(pathname, { withFileTypes: true }).catch(_pass);
  if (result instanceof Error) {
    // notify on directory read error
    return walkFunc(result, pathname, dirent);
  }
  for (let entity of result) {
    await walk(path.join(pathname, entity.name), walkFunc, entity);
  }
}

// Example Usage:
const path = require("path");
walk("./", function (err, pathname, dirent) {
  if (dirent.name.startsWith(".")) {
    return Promise.resolve(false);
  }

  var typ = "-";
  if (dirent.isFile()) {
    typ = "f";
  } else if (dirent.isDirectory()) {
    typ = "d";
  } else if (dirent.isSymbolicLink()) {
    typ = "@";
  }
  console.info(typ, path.resolve(pathname));
  return Promise.resolve(true);
});
