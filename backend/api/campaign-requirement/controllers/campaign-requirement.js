'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    async soft_delete (ctx){
        const entry = await strapi.query('Campaign-requirement').update({_id:ctx.request.body.campaign_requirementID}, { isActive:false});
        return entry;
        }

};
