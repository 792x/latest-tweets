var request = require('request')
var xpath = require('xpath')
var dom = require('xmldom').DOMParser

module.exports = function (username, cb) {

  var url = 'https://twitter.com/' + username

  request(url, function (err, res, body) {
    if (err) {
      cb(err)
    } else {
      var res = []

      var doc = new dom({errorHandler: function() {}}).parseFromString(body)

      var tweets = xpath.select('//li[contains(@class, \'js-stream-item\')]', doc)

      tweets.forEach(function (n) {
        var tweet = xpath.select('./div[contains(@class, \'tweet\')]/div[contains(@class, \'content\')]', n)[0]
        if (!tweet) {
          // bad tweet?
          return
        }
        var header = xpath.select('./div[contains(@class, \'stream-item-header\')]', tweet)[0]
        var body = xpath.select('./p[contains(@class, \'tweet-text\')]/text()', tweet)[0]
        if (body) body = body.data
        var item = {
          username: '@' + xpath.select('./a/span[contains(@class, \'username\')]/b/text()', header)[0].data,
          body: body,
          fullname: xpath.select('./a/strong[contains(@class, "fullname")]/text()', header)[0].data,
          avatar: xpath.select('./a/img[contains(@class, "avatar")]/@src', header)[0].value,
          url: 'https://twitter.com' + xpath.select('./small[contains(@class, "time")]/a[contains(@class, "tweet-timestamp")]/@href', header)[0].value,
          timestamp: xpath.select('./small[contains(@class, "time")]/a[contains(@class, "tweet-timestamp")]/span/@data-time', header)[0].value
        }

        var date = new Date(1970, 0, 1)
        date.setSeconds(item.timestamp)
        item.timestamp = date.toISOString()

        res.push({
          url: item.url,
          content: item.body,
          date: date
        })
      })

      cb(null, res)
    }
  })
}

