const topupRouter = require('./topup')
function route(app) {
    app.use('/v1/topup', topupRouter)
}   

module.exports = route;