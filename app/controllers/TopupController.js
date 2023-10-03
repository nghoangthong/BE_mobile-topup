const {v4: uuidv4} = require('uuid');
const axios = require('axios');

const JWTGenerator = require('../libraries/AppotaPay/JWTGenerator');
const SignatureGenerator = require('../libraries/AppotaPay/SignatureGenerator');
const ResponseBuilder = require('../libraries/Common/Builders/ResponseBuilder');
const RequestValidationError = require('../libraries/Exception/RequestValidationError');
const TopupModel = require('../models/Topup');
const CONSTANT = require('../../config/constant')
const getJsonData = require('../libraries/AppotaPay/GetJsonData')
const httpRequest = require('../libraries/AppotaPay/httpRequests');
const { get } = require('https');
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
       
        let partnerRefId = uuidv4();
        let amount = req.body.amount;
        let telco = req.body.telco;
        let telcoServiceType = req.body.telcoServiceType;
        let phoneNumber = req.body.phoneNumber;
        let billData = await TopupModel.getDataByPartnerRefId(partnerRefId)
        // transactionStatus = getJsonData.getTransactionStatus(res.errorcode)

        try { 
            let data = {
                partnerRefId: partnerRefId,
                amount: amount,
                telco: telco,
                telcoServiceType: telcoServiceType,
                phoneNumber: phoneNumber
            };
            console.log(data)
            let resData = await this.#processTopupCharging(data)
            // response

            return res.json(
                ResponseBuilder.init()
                    .withData(resData.response)
                    .build()
            );
        } catch (error) {
            Logger.error(`===TopupController::charging -- Error while process topup charging to phone number:${phoneNumber}, partnerRefId:${partnerRefId}, telcoServiceType:${telcoServiceType}, telco:${telco} and amount:${amount} \n`);
            Logger.error(error);
            Logger.error(error.response.data);

            let data = {
                transaction_status: CONSTANT.BILL_DETAIL.BILL_STATUS.ERROR,
                partner_ref_id: partnerRefId ? partnerRefId : '',
                telco: telco ? telco : '',
                amount: amount ? amount : 0,
                telco_service_type: telcoServiceType ? telcoServiceType : '',
                phone_number: phoneNumber ? phoneNumber : '',
                response:
                  Object.prototype.toString.call(error.response.data) ===
                    '[object Object]'
                    ? error.response.data
                    : {
                      message: error.response.data,
                      errorCode: error.response.status,
                    },
              }

              await TopupModel.saveRecordAsync(data)
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
        let resData = await httpRequest.chargingInfoFromGetWay(reqPayload, jwtToken)
        let transactionStatus = getJsonData.getTransactionStatus(resData.data.errorCode)

        Logger.debug('TopupController::#processTopupCharging -- Response: ', resData);
        let data = {
            transaction_status: transactionStatus,
            partner_ref_id: reqPayload.partnerRefId,
            telco: reqPayload.telco,
            telco_service_type: reqPayload.telcoServiceType,
            amount: reqPayload.amount,
            phone_number: reqPayload.phoneNumber,
            response: resData.data,
        }
        return await TopupModel.saveRecordAsync(data)

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
