const APP_SETTINGS = require('../../../config/config')
const axios = require("axios");

class httpRequests {
  async chargingInfoFromGetWay(reqPayload, jwtToken) {

    let resData = await axios.post(
      APP_SETTINGS.PARTNERS.APPOTAPAY.CONNECTION.API_URI +
      APP_SETTINGS.PARTNERS.APPOTAPAY.ENDPOINTS.TOPUP_CHARGING.ENDPOINT,
      reqPayload,
      {
        headers: {
          "X-APPOTAPAY-AUTH": `${APP_SETTINGS.PARTNERS.APPOTAPAY.HEADERS.AUTH_HEADER_SCHEME} ${jwtToken}`,
          "Content-Type": APP_SETTINGS.PARTNERS.APPOTAPAY.HEADERS.AUTH_HEADER_CONTENT_TYPE,
        },
      }
    );
    return resData
  }
}
module.exports = new httpRequests();
