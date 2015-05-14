//TODO merge this with assetManager pathUtils
import path from 'path'

export function parseFileUri(uri, storeNameMatcher) {
  let url = require('url')
  let pathInfo = url.parse(uri)
  let storeName = pathInfo.protocol
  let fileName = pathInfo.host + pathInfo.pathname

  storeName = storeName.replace(":", "")

  if (storeName === null) {
    if (pathInfo.path[0] === "/") {
      storeName = "local";
    } else {
    }
  } else if (storeName === "http" || storeName === "https") {
    storeName = "xhr";
    fileName = pathInfo.href;
  }

  //determine special storename using storeNameMatcher if any
  if(storeNameMatcher){
    storeName = storeNameMatcher(storeName,uri,fileName)
  }
  return {storeName, fileName}
};

export function toAbsoluteUri(fileName, parentUri, store) {
  var fullPath, isXHr, rootUri, segments;
  path = require('path');
  segments = fileName.split("/");
  if (segments[0] !== '.' && segments[0] !== '..') {
    return fileName;
  }
  rootUri = parentUri || store.rootUri || "";
  fileName = path.normalize(fileName);
  isXHr = rootUri.indexOf("http") !== -1;
  if (isXHr) {
    fullPath = rootUri + fileName;
  } else {
    rootUri = rootUri[rootUri.length - 1] === "/" ? rootUri += "a" : rootUri;
    rootUri = path.normalize(rootUri);
    rootUri = path.dirname(rootUri);
    fullPath = path.join(rootUri, fileName);
  }
  return fullPath;
};

