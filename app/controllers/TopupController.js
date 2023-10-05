const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const JWTGenerator = require("../libraries/AppotaPay/JWTGenerator");
const SignatureGenerator = require("../libraries/AppotaPay/SignatureGenerator");
const ResponseBuilder = require("../libraries/Common/Builders/ResponseBuilder");
const TopupModel = require("../models/Topup");
const TransactionModel = require("../models/Transactions");
const TopupHistories = require("../models/TopupHistories");
const CONSTANT = require("../../config/constant");
const getJsonData = require("../libraries/AppotaPay/GetJsonData");
const httpRequest = require("../libraries/AppotaPay/httpRequests");
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
   * @returns json
   */
  charging = async (req, res, next) => {
    let partnerRefId = uuidv4();
    let amount = req.body.amount;
    let telco = req.body.telco;
    let telcoServiceType = req.body.telcoServiceType;
    let phoneNumber = req.body.phoneNumber;

    try {
      let data = {
        partnerRefId: partnerRefId,
        amount: amount,
        telco: telco,
        telcoServiceType: telcoServiceType,
        phoneNumber: phoneNumber,
      };
      let resData = await this.#processTopupCharging(data);

      // response
      return res.json(
        ResponseBuilder.init().withData(resData.response).build()
      );
    } catch (error) {
      Logger.error(
        `===TopupController::charging -- Error while process topup charging to phone number:${phoneNumber}, partnerRefId:${partnerRefId}, telcoServiceType:${telcoServiceType}, telco:${telco} and amount:${amount} \n`
      );
      Logger.error(error);
      Logger.error(error.response.data);

      let data = {
        transaction_status: CONSTANT.TOPUP_DETAIL.STATUS.ERROR,
        partner_ref_id: partnerRefId ? partnerRefId : "",
        telco: telco ? telco : "",
        amount: amount ? amount : 0,
        telco_service_type: telcoServiceType ? telcoServiceType : "",
        phone_number: phoneNumber ? phoneNumber : "",
        response:
          Object.prototype.toString.call(error.response.data) ===
          "[object Object]"
            ? error.response.data
            : {
                message: error.response.data,
                errorCode: error.response.status,
              },
      };
      await TopupHistories.saveRecordAsync(data);
      await TopupModel.saveRecordAsync(data);

      next(error);
    }
  };

  /**
   * Make a request to process the Topup Charging to AppotaPay
   *
   * @param reqPayload
   * @returns json
   */
  async #processTopupCharging(reqPayload) {
    // prepare jwt token
    let jwtToken = new JWTGenerator().generate();

    // assign signature into payload
    reqPayload.signature = new SignatureGenerator().generate(reqPayload);

    Logger.debug(
      "TopupController::#processTopupCharging -- Procedure topup charging with payload ",
      reqPayload
    );

    // send POST request to AppotaPay
    let resData = await httpRequest.chargingInfoFromGetWay(
      reqPayload,
      jwtToken
    );
    let transactionStatus = getJsonData.getTransactionStatus(
      resData.data.errorCode
    );
    console.log("resData.data.errorCode", resData.data.errorCode);
    Logger.debug(
      "TopupController::#processTopupCharging -- Response: ",
      resData
    );
    let data = {
      transaction_status: transactionStatus,
      partner_ref_id: reqPayload.partnerRefId,
      telco: reqPayload.telco,
      telco_service_type: reqPayload.telcoServiceType,
      amount: reqPayload.amount,
      phone_number: reqPayload.phoneNumber,
      response: resData.data,
    };
    await TopupHistories.saveRecordAsync(data);
    return await TopupModel.saveRecordAsync(data);
  }

  /**
   * Query the status of a specific transaction
   *
   * @param req
   * @param res
   * @returns json
   */
  transactions = async (req, res) => {
    try {
      let partnerRefId = req.params.partner_ref_id;
      let topupData = await TopupModel.getDataByPartnerRefId(partnerRefId);
      if (topupData) {
        let validStatuses = [
          CONSTANT.TOPUP_DETAIL.STATUS.SUCCESS,
          CONSTANT.TOPUP_DETAIL.STATUS.ERROR,
          CONSTANT.TOPUP_DETAIL.STATUS.PENDING,
          CONSTANT.TOPUP_DETAIL.STATUS.RETRY,
        ];

        let isSuccessStatus =
          topupData.transaction_status === CONSTANT.TOPUP_DETAIL.STATUS.SUCCESS;
        let isErrorStatus =
          topupData.transaction_status === CONSTANT.TOPUP_DETAIL.STATUS.ERROR;
        let isPendingStatus =
          topupData.transaction_status === CONSTANT.TOPUP_DETAIL.STATUS.PENDING;
        let isRetryStatus =
          topupData.transaction_status === CONSTANT.TOPUP_DETAIL.STATUS.RETRY;

        if (validStatuses.includes(topupData.transaction_status)) {
          if (isSuccessStatus || isErrorStatus) {
            return res.json(
              ResponseBuilder.init().withData(topupData.response).build()
            );
          }
          if (isPendingStatus || isRetryStatus) {
            let resData = await this.#processTopupTransaction(partnerRefId);
            let trasactionStatus = getJsonData.getTransactionStatus(
              resData.data.errorCode
            );

            let record = await TransactionModel.saveRecordAsync({
              transaction_status: trasactionStatus,
              partner_ref_id: partnerRefId,
              response: resData.data,
            });

            await TopupModel.updateDataByPartnerRefId(partnerRefId, {
              response: resData.data,
              transaction_status: trasactionStatus,
            });

            return res.json(
              ResponseBuilder.init().withData(record.response).build()
            );
          }
        }
      }

      Logger.error(
        `===TopupController::transactions -- Error:${partnerRefId} \n`
      );
      let record = {
        code: 4002,
        message:
          "Thông tin thanh toán không hợp lệ, vui lòng kiểm tra lại Mã hóa đơn & Mã dịch vụ.",
      };
      return res.json(ResponseBuilder.init().withData(record).build());
    } catch (error) {
      Logger.error(
        `===TopupController::transaction -- Error checking transaction:${req.params.partner_ref_id} \n`
      );
      Logger.error(error.response.data);

      await TransactionModel.saveRecordAsync({
        transaction_status: CONSTANT.TOPUP_DETAIL.STATUS.ERROR,
        partner_ref_id: req.params.partner_ref_id,
        response: error.response.data,
      });
      return res.json(ResponseBuilder.init().withData(error.response).build());
    }
  };

  /**
   * process Topup Transaction
   *
   * @param partnerRefId
   * @returns json
   */
  async #processTopupTransaction(partnerRefId) {
    let jwtToken = new JWTGenerator().generate();
    return await httpRequest.transactionInfoFromGetWay(partnerRefId, jwtToken);
  }
}

module.exports = new TopupController();
