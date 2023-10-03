const express = require('express');
const router = express.Router();
const {validateRequestSchema} = require("../middlewares/Common/ValidateRequest");
const {
    validateHeaderSchema,
    validateTopupChargingSchema
} = require('../libraries/AppotaPay/ValidationSchemas/TopupRequestSchema');
const TopupController = require('../controllers/TopupController');

/**
 * Endpoint: POST /v1/topup/charging
 */
router.post('/charging',
    /**
     * Step 1: validate headers and request body
     */
    validateRequestSchema('headers', validateHeaderSchema),

    TopupController.charging
);

/**
 * Endpoint: GET /v1/topup/transactions
 */
router.get('/transactions', TopupController.transactions);

module.exports = router;

