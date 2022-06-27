'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

 module.exports = {
    async domainAvailable(ctx){
        var domainData = await strapi.query('deployment-data').find({ 
            isActive: true,
            namePrefix: ctx.request.body.business_url
        });
        var isAvailable = true;

        if(domainData.length > 0){
            isAvailable = false;
        }
        return {valid:isAvailable};
    }
};
