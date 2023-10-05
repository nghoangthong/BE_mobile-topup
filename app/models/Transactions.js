const Model = require("./Model");

/**
 * Topup Transaction Entity
 */
class Transaction extends Model {
    constructor() {
        super('topup_transaction');
    }
}

module.exports = new Transaction();
