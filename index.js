const restify = require('restify');
const restifyClient = require('restify-clients')
const errors = require('restify-errors')
const server = restify.createServer({ name: 'faichou' });

const v2Client = restifyClient.createJsonClient({ url: 'https://www.v2ex.com' })
const ninjaClient = restifyClient.createJsonClient({ url: 'http://statistics.pandadastudio.com' })

server.pre(restify.plugins.pre.userAgentConnection());
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

server.post('/tmp', (req, res, next) => {
  res.send({ code: 0 })
  next()
})

server.get('/ninja/:uid/:code', (req, res, next) => {
  const { uid, code } = req.params
  ninjaClient.get(`/player/giftCode?uid=${uid}&code=${code}`, (err, _req, _res, obj) => {
    res.send(obj)
    next()
  })
})

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
})
