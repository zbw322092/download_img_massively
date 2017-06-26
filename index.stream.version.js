// organiseRequestUrlList
//   callback => performRequest
//     pipe transform => imgRequestUrlList
//       pipe => performImgRequest
//        pipe => download

const fs = require('fs');
const Transform = require('stream').Transform;
var util = require('util');
const zlib = require('zlib');
const request = require('request');
const download = require('download');
const chalk = require('chalk');

let dist = './downloaded_imgs/';

function pageRequestList(startPage, endPage, pageSize, orderBy) {
  if (typeof startPage != 'number' && typeof endPage != 'number' && typeof pageSize != 'number') {
    throw new Error('startPage, endPage and pageSize should be number');
  }
  var orderByEnum = ['latest', 'oldest', 'popular'];
  orderBy = orderByEnum.includes(orderBy) ? orderBy : 'latest';


  let requestArray = [];
  for (startPage; startPage <= endPage; startPage++) {
    let page = startPage;
    let size = pageSize;
    let requestUrlTemplate = `https://unsplash.com/napi/photos?page=${page}&per_page=${size}&order_by=${orderBy}`;
    requestArray.push(requestUrlTemplate);
  }
  
  performPageRequest(requestArray);
}

function performPageRequest(requestArray) {
  if (requestArray.length === 0) return;
  return requestArray.forEach(function (value, key, array) {
    return request.get(value, {
      headers: {
        'content-type': 'application/json',
        'accept-encoding': 'gzip, deflate, sdch, br',
        'accept-language': 'en-US,en;q=0.8,zh-CN;q=0.6,zh;q=0.4',
        'accept-version': 'v1',
        'authorization': 'Client-ID d69927c7ea5c770fa2ce9a2f1e3589bd896454f7068f689d8e41a25b54fa6042'
      },
      encoding: 'utf-8'
    })
    .pipe(zlib.createGunzip())
    .pipe(process.stdout);
  });
}




pageRequestList(1,1,12,'lastest');

