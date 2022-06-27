'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async list(ctx){
        var responseData ={};
        responseData.message = 'Fetching List Failed';
        responseData.status = 'failed';
        const gatewayListData = await strapi.query('paymentgateway').find({
            isConfigured:true,
            isActive:true
         })
         var gatewayList = [];

        for (var i=0; i < gatewayListData.length ; ++i){
            gatewayList.push({'id':gatewayListData[i]['id'], 'gateway':gatewayListData[i]['gateway'], 'logo':gatewayListData[i]['logo']});
        }
        responseData.status = 'success';
        responseData.message = 'List Fetched Successfully';
        responseData.data = gatewayList;

        return responseData;

    }

};
