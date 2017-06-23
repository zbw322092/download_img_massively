const fs = require('fs');
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
  console.log('requestArray: ', requestArray);
  return requestArray;
}

function performPageRequest(requestArray) {
  if (requestArray.length === 0) return;
  requestArray.forEach(function (value, key, array) {
    request.get(value, {
      headers: {
        'content-type': 'application/json',
        'accept-encoding': 'gzip, deflate, sdch, br',
        'accept-language': 'en-US,en;q=0.8,zh-CN;q=0.6,zh;q=0.4',
        'accept-version': 'v1',
        'authorization': 'Client-ID d69927c7ea5c770fa2ce9a2f1e3589bd896454f7068f689d8e41a25b54fa6042'
      },
      encoding: null
    }, function (error, response, body) {
      if (error) {
        return console.log(chalk.red('==Error==: '), error);
      }

      return getPicUrlList(body);
    });
  });
}

function getPicUrlList(res) {
  var picUrlList = [];
  zlib.unzip(res, function (error, result) {
    if (error) {
      return console.log('unzip error', error);
    }
    result = JSON.parse(result.toString('utf-8'));
    result.forEach(function(value, key, array) {
      picUrlList.push({
        id: value.id,
        url: value.links.download
      });
    });
    console.log(picUrlList);
    downloadPics(picUrlList);
  });
}

function downloadPics(urlList) {
  urlList.forEach((value, key, array) => {
    download(value.url)
      .pipe(fs.createWriteStream(dist + value.id))
      .on('close', () => {
        console.log('Img ' + chalk.green(value.id) + ' has been downloaded');
      });
  });
}

performPageRequest(pageRequestList(1, 1, 24, 'latest'));
