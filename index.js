const restify = require('restify')
const restifyClient = require('restify-clients')
const errors = require('restify-errors')
const server = restify.createServer({ name: 'faichou' })

const v2Client = restifyClient.createJsonClient({ url: 'https://www.v2ex.com' })
const telegramClient = restifyClient.createJsonClient({ url: 'https://api.telegram.org' })
const ninjaClient = restifyClient.createJsonClient({ url: 'http://statistics.pandadastudio.com' })

server.pre(restify.plugins.pre.userAgentConnection())
server.use(restify.plugins.bodyParser({ mapParams: true }))
server.use(
  function crossOrigin(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    return next()
  }
)

function formatNumber(num) {
  if (typeof num === 'number' && !isNaN(num)) {
    return Number(num.toFixed(1));
  } else {
    console.warn('Input is not a valid number');
    return num;
  }
}


server.get('/v2hot', (req, res, next) => {
  v2Client.get('/api/topics/hot.json', (err, _req, _res, obj) => {
    res.send(obj)
    next()
  })
})

server.get('/newOrder', (req, res, next) => {
  const info = '出单啦'
  const path = `/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&text=${encodeURIComponent(info)}`
  telegramClient.get(path, (err, _req, _res, obj) => {
    res.send(obj)
    next()
  })
})

let orderIds = []

server.post('/postOrder', (req, res, next) => {
  let info = '出单啦'
  let allOrderInfo = null
  if (typeof req.body.event_data === 'string') {
    allOrderInfo = JSON.parse(req.body.event_data)
  } else if (typeof req.body.event_data === 'object') {
    allOrderInfo = req.body.event_data
  }
  const orderInfo = allOrderInfo.order
  if (orderIds.length === 0 || !orderIds.includes(orderInfo.itemno)) {
    const orderId = orderInfo.itemno
    orderIds.push(orderId)
    info = `新订单: ${orderId}
订单总额: ${orderInfo.currency_code} ${orderInfo.total_amount}
商品总数: ${formatNumber(orderInfo.total_num)}
收件姓名: ${orderInfo.user_name}
卖家保护: ${orderInfo.paypal_seller_protection}
风险等级: ${orderInfo.risk_level}
`
    const path = `/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&text=${encodeURIComponent(info)}`
    telegramClient.get(path, (err, _req, _res, obj) => {
      res.send(obj)
      next()
    })
  } else {
    // remove half, for memory
    if (orderIds.length > 100) {
      orderIds.splice(0, 50)
    }
    res.send({ code: 0, message: 'repeated request' })
    next()
  }
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
