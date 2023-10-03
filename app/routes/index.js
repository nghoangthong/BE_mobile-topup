const topupRouter = require('./topup')
const serviceRouter = require('./services')
function route(app) {
    app.use('/v1/topup', topupRouter)
    app.use('/v1', serviceRouter)
}   

module.exports = route;