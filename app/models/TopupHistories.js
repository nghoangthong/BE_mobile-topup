const Model = require("./Model");

/**
 * Topup histories Entity
 */
class TopupHistories extends Model {
    constructor() {
        super('topup_histories');
    }
}

module.exports = new TopupHistories();