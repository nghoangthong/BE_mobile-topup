const Model = require("./Model");

/**
 * Topup Transaction Entity
 */
class Topup extends Model {
    constructor() {
        super('topup_charging');
    };
    async getDataByPartnerRefId(partnerRefId) {
        const query = `
          SELECT *
          FROM ${this.tableName}
          WHERE partner_ref_id = $1;
        `;
      
        const values = [partnerRefId];
      
        try {
          const result = await this.model.query(query, values);
          if (result.rows.length > 0) {
            return result.rows[0];
          }
          return false;
        } catch (error) {
          Logger.error("function getBillDataByPartnerRefId | Error retrieving bill data:", error);
          return false;
        }
      }
}

module.exports = new Topup();
