import path from "path";
//import { walk } from "../index.js";

import Walk from "../index.js";
var walk = Walk.create({
  sort: function (ents) {
    return ents.filter(function (ent) {
      return !ent.name.startsWith(".");
    });
  },
});

var rootpath = process.argv[2] || ".";

walk(rootpath, async function (err, pathname, dirent) {
  if (err) {
    throw err;
  }

  /*
  if (dirent.name.startsWith(".")) {
    return false;
  }
  */

  var entType;
  if (dirent.isDirectory()) {
    entType = " dir";
  } else if (dirent.isFile()) {
    entType = "file";
  } else if (dirent.isSymbolicLink()) {
    entType = "link";
  } else {
    entType = "----";
  }
  console.info("[%s] %s", entType, path.dirname(path.resolve(pathname)), dirent.name);
}).catch(function (err) {
  console.error(err.stack);
});
