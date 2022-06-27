'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = 
{

    async soft_delete (ctx){

        const entry = await strapi.query('ui-preference').update({_id:ctx.request.body.ui_preferenceID}, { isActive:false});
  
        return entry; 
 }


};
