import Walk from "../index.js";
import path from "path";

var rootpath = process.argv[2] || ".";

Walk.walk(rootpath, async function (err, pathname, dirent) {
  if (err) {
    throw err;
  }

  if (dirent.name.startsWith(".")) {
    return false;
  }

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
