const restify = require('restify');
const restifyClient = require('restify-clients')
const server = restify.createServer({ name: 'faichou' });

const client = restifyClient.createJsonClient({ url: 'https://www.v2ex.com' });

server.pre(restify.plugins.pre.userAgentConnection());

server.use(
  function crossOrigin(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    return next()
  }
)

server.get('/v2hot', (req, res, next) => {
  client.get('/api/topics/hot.json', (err, _req, _res, obj) => {
    res.send(obj)
    next()
  })
})

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
})
