const fs = require('fs');
const zlib = require('zlib');
const request = require('request');
const download = require('download');
const chalk = require('chalk');
const concat = require('concat-stream');
const async = require('async');

let dist = './downloaded_imgs/';

function pageRequestList(startPage, endPage, pageSize, orderBy, callback) {
  if (typeof startPage != 'number' && typeof endPage != 'number' && typeof pageSize != 'number') {
    throw new Error('startPage, endPage and pageSize should be number');
  }
  var orderByEnum = ['latest', 'oldest', 'popular'];
  orderBy = orderByEnum.includes(orderBy)
    ? orderBy
    : 'latest';

  let requestArray = [];
  for (startPage; startPage <= endPage; startPage++) {
    let page = startPage;
    let size = pageSize;
    let requestUrlTemplate = `https://unsplash.com/napi/photos?page=${page}&per_page=${size}&order_by=${orderBy}`;
    requestArray.push(requestUrlTemplate);
  }
  callback(null, requestArray);
}

function performPageRequest(requestArray, callback) {
  if (requestArray.length === 0) 
    return;
  async.map(requestArray, (item, cb) => {
    request.get(item, {
      headers: {
        'content-type': 'application/json',
        'accept-encoding': 'gzip, deflate, sdch, br',
        'accept-language': 'en-US,en;q=0.8,zh-CN;q=0.6,zh;q=0.4',
        'accept-version': 'v1',
        'authorization': 'Client-ID d69927c7ea5c770fa2ce9a2f1e3589bd896454f7068f689d8e41a25b54fa6042'
      },
        encoding: null
      })
      .pipe(zlib.createGunzip())
      .pipe(concat({
        encoding: 'string'
      }, function (data) {
        cb(null, JSON.parse(data));
      }));
  }, (err, result) => {
    callback(null, result);
  });
}

function getPicUrlList(result, callback) {
  var resultArr = [];
  var picUrlList = [];
  for (var i = 0; i < result.length; i++) {
    resultArr = resultArr.concat(result[i]);
  }

  resultArr.forEach(function (value, key, array) {
    picUrlList.push({id: value.id, url: value.links.download});
  });
  callback(null, picUrlList);
}

function downloadPics(urlList, callback) {
  urlList.forEach((value, key, array) => {
    download(value.url)
      .pipe(fs.createWriteStream(dist + value.id))
      .on('close', () => {
        console.log('Img ' + chalk.green(value.id) + ' has been downloaded');
      });
  });
  callback(null);
}

async.waterfall([
  pageRequestList.bind(null, 1, 2, 12, 'latest'),
  performPageRequest,
  getPicUrlList, 
  downloadPics
], (err, result) => {});