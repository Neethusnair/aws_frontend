'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async delete_family(ctx){
        const entry = await strapi.query('family').update({_id:ctx.request.body.id}, { isActive:false});
        return entry;
    },
    
    async update_family(ctx){
        var responseData ={};
        responseData.message = '';
        responseData.status = 'failed';
        var headUpdate = await strapi.services.family.update({ id: ctx.request.body.familyId }, {name: ctx.request.body.name, head: ctx.request.body.head, members: ctx.request.body.members });
        if(headUpdate.isActive){
            responseData.status = 'success';
            responseData.message = 'Family Updated successfully';
            return responseData;
        } else{
            return responseData;
        }
    },

    async add_family(ctx){
        var responseData ={};
        responseData.message = '';
        responseData.status = 'failed';

        var familyData =  await strapi.query('family').create({ 
            name: ctx.request.body.name,
            members: ctx.request.body.members,
            head: ctx.request.body.head,
        });
        if(familyData.id != undefined){
            responseData.status = 'success';
            responseData.message = 'Family Added successfully';
            return responseData;
        } else{
            return responseData;
        }
    }
};
