"use strict";

var path = require("path");
var Walk = require("../index.js");

var walk = Walk.walk;
var alt = process.argv[2];

if (alt) {
  walk = Walk.create({
    sort: function (ents) {
      return ents.filter(function (ent) {
        return !ent.name.startsWith(".");
      });
    },
  });
}

var rootpath = process.argv[2] || ".";

walk(rootpath, async function (err, pathname, dirent) {
  if (err) {
    throw err;
  }

  if (!alt) {
    if (dirent.name.startsWith(".")) {
      return false;
    }
  }

  var entType = "?";
  if (dirent.isDirectory()) {
    entType = "d";
  } else if (dirent.isFile()) {
    entType = "f";
  } else if (dirent.isSymbolicLink()) {
    entType = "@";
  }
  console.info("%s %s", entType, path.dirname(path.resolve(pathname)), dirent.name);
}).catch(function (err) {
  console.error(err.stack);
});
