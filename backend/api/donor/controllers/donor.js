'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async deleteDonor(ctx){
        const entry = await strapi.query('donor').update({_id:ctx.request.body.id}, { isActive:false});
        return entry;
    },
};

