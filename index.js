const fs = require('fs');
const zlib = require('zlib');
const request = require('request');
const chalk = require('chalk');

function requestList(startPage, endPage, pageSize, orderBy) {
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
  console.log('requestArray: ', requestArray);
  return requestArray;
}

function performRequest(requestArray) {
  if (requestArray.length === 0) return;
  requestArray.forEach(function(value, key, array) {
    request.get(value, {
        headers: {
          'accept-encoding': 'gzip, deflate, sdch, br',
          'accept-language': 'en-US,en;q=0.8,zh-CN;q=0.6,zh;q=0.4',
          'accept-version': 'v1',
          'authorization': 'Client-ID d69927c7ea5c770fa2ce9a2f1e3589bd896454f7068f689d8e41a25b54fa6042'
        }
      },function(error, response, body) {
        if (error) {
          return console.log(chalk.red('==Error==: '), error);
        }

      });
  });
}

performRequest(requestList(1,1,24,'latest'));

