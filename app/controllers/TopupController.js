const axios = require('axios');
const {v4: uuidv4} = require('uuid');
const JWTGenerator = require('../libraries/AppotaPay/JWTGenerator');
const SignatureGenerator = require('../libraries/AppotaPay/SignatureGenerator');
const ResponseBuilder = require('../libraries/Common/Builders/ResponseBuilder');
const RequestValidationError = require('../libraries/Exception/RequestValidationError');

class TopupController {
    /**
     *
     * @returns {TopupController}
     */
    constructor() {
        return this;
    }

    /**
     * Make a request top topup
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    charging = async (req, res, next) => {
        try {
            // response
            return res.json(
                ResponseBuilder.init()
                    .withData(??)
                    .build()
            );
        } catch (error) {
            Logger.error(`===TopupController::charging -- Error while process topup charging to phone number:${phoneNumber}, partnerRefId:${partnerRefId}, telcoServiceType:${telcoServiceType}, telco:${telco} and amount:${amount} \n`);
            Logger.error(error);
            Logger.error(error.response.data);

            // TODO: save the response error to DB

            next(error);
        }
    };

    /**
     * Make a request to process the Topup Charging to AppotaPay
     *
     * @param reqPayload
     * @returns {Promise<*>}
     */
    async #processTopupCharging(reqPayload) {
        // prepare jwt token
        let jwtToken = (new JWTGenerator()).generate();

        // assign signature into payload
        reqPayload.signature = (new SignatureGenerator()).generate(reqPayload);

        Logger.debug('TopupController::#processTopupCharging -- Procedure topup charging with payload ', reqPayload);

        // send POST request to AppotaPay
        let resData = await axios.post(
            APP_SETTINGS.PARTNERS.APPOTAPAY.CONNECTION.API_URI + APP_SETTINGS.PARTNERS.APPOTAPAY.ENDPOINTS.TOPUP_CHARGING.ENDPOINT,
            reqPayload,
            {
                headers: {
                    'X-APPOTAPAY-AUTH': `${APP_SETTINGS.PARTNERS.APPOTAPAY.HEADERS.AUTH_HEADER_SCHEME} ${jwtToken}`,
                    'Content-Type': APP_SETTINGS.PARTNERS.APPOTAPAY.HEADERS.AUTH_HEADER_CONTENT_TYPE
                }
            }
        );

        Logger.debug('TopupController::#processTopupCharging -- Response: ', resData);

        // persist data into table
        return ??;
    }

    /**
     * Query the status of a specific transaction
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    transactions = async (req, res) => {
        try {
            // response
            return res.json(
                ResponseBuilder.init()
                    .withData({})
                    .build()
            );
        } catch (error) {
            console.error(error);
        }
    };
}

module.exports = new TopupController();
