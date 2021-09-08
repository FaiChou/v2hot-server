const restify = require('restify')
const restifyClient = require('restify-clients')
const errors = require('restify-errors')
const server = restify.createServer({ name: 'faichou' })

const v2Client = restifyClient.createJsonClient({ url: 'https://www.v2ex.com' })
const telegramClient = restifyClient.createJsonClient({ url: 'https://api.telegram.org' })
const ninjaClient = restifyClient.createJsonClient({ url: 'http://statistics.pandadastudio.com' })

server.pre(restify.plugins.pre.userAgentConnection())
server.use(restify.plugins.bodyParser())
server.use(
  function crossOrigin(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    return next()
  }
)


server.get('/v2hot', (req, res, next) => {
  v2Client.get('/api/topics/hot.json', (err, _req, _res, obj) => {
    res.send(obj)
    next()
  })
})

server.get('/newOrder', (req, res, next) => {
  const info = 'hello from restify'
  const path = `/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&text=${encodeURIComponent(info)}`
  telegramClient.get(path, (err, _req, _res, obj) => {
    res.send(obj)
    next()
  })
})

server.post('/postOrder', (req, res, next) => {
  console.log(req.params)
  const info = 'hello from restify'
  const path = `/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&text=${encodeURIComponent(info)}`
  telegramClient.get(path, (err, _req, _res, obj) => {
    res.send(obj)
    next()
  })
})

server.get('/ninja/:uid/:code', (req, res, next) => {
  const { uid, code } = req.params
  ninjaClient.get(`/player/giftCode?uid=${uid}&code=${encodeURIComponent(code)}`, (err, _req, _res, obj) => {
    res.send(obj)
    next()
  })
})

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url)
})
