const ServiceBase = require('./serviceBase');

const defaults = {
  TermsCode: 'DEF',
  CustomerType: 'CUS',
  CurrencyCode: 'USD'
};
const SERVICE = 'Erp.Bo.CustomerSvc';

class Customer extends ServiceBase {
  constructor(connection) {
    super(connection, SERVICE, 'Customer', 'CustNum');
  }

  /**
   * Create a new customer with default territory.  CustID must be specified.
   */
  async create(customer) {
    // TODO we should only call the service if there is no territory specified on the source
    const defaultTerritory = await this.makeRequest('GetCustomerTerritory', {
      custNum: 0,
      ds: {
        Customer: [
          {
            // Company: this.connection.company
          }
        ]
      }
    });
    const payload = defaultTerritory.parameters.ds.Customer[0];
    const result = await super.create(
      Object.assign(payload, defaults, customer)
    );
    return result;
  }

  _getRows(where, pageSize, currentPage) {
    // we have to use getRows because GetList does not return all the data
    const params = {
      whereClauseCustomer: where,
      whereClauseCustomerAttch: '',
      whereClauseCustomCrdPool: '',
      whereClausePartner: '',
      whereClauseCustBillTo: '',
      whereClauseCustBank: '',
      whereClauseCustChild: '',
      whereClauseCustDfltDocType: '',
      whereClauseCustIC: '',
      whereClauseCustLabExpRate: '',
      whereClauseCustMandate: '',
      whereClauseCustomerDocs: '',
      whereClauseCustRestriction: '',
      whereClauseCustUPSEmail: '',
      whereClauseCustomerDiscPriceLst: '',
      whereClauseCustomerFSPriceList: '',
      whereClauseGlbCustCred: '',
      whereClauseNAMember: '',
      whereClausePECustWhldHist: '',
      whereClauseShipTo: '',
      whereClauseShipToAttch: '',
      whereClauseShipToRestriction: '',
      whereClauseShipToLabExpRate: '',
      whereClauseCustomerDocsSH: '',
      whereClauseShipToDiscPriceLst: '',
      whereClauseShipToMFBill: '',
      whereClauseShipToPriceLst: '',
      whereClauseShipToUPSEml: '',
      whereClauseCustMFBill: '',
      whereClauseMangCust: '',
      whereClauseShipToSrch: '',
      whereClauseCustomerPriceLst: '',
      whereClauseEntityGLC: '',
      whereClauseTaxExempt: '',
      pageSize,
      absolutePage: currentPage
    };
    return this.makeRequest('GetRows', params).then(results => ({
      dataset: results.returnObj,
      morePage: results.parameters.morePage
    }));
  }
}

module.exports = Customer;
