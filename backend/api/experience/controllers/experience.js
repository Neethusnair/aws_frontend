'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async delete_experience(ctx){
        const entry = await strapi.query('experience').update({_id:ctx.request.body.id}, { isActive:false});
        return entry;
    },

    async add_experience(ctx){
        var responseData ={};
        responseData.message = '';
        responseData.status = 'failed';
        var expData =  await strapi.query('experience').create({ 
            startDate: ctx.request.body.startDate,
            endDate: ctx.request.body.endDate,
            client: ctx.request.body.client,
            title: ctx.request.body.title,
            candidate_profile: ctx.request.body.addExp_profileId
        });
        
        if(expData.id != null){
            console.log(ctx.request.body.addExp_id);
            if(ctx.request.body.addExp_id != undefined && ctx.request.body.addExp_id != ""){
                var deletePreviousData = await strapi.query('experience').update({_id:ctx.request.body.addExp_id}, { isActive:false})
                responseData.message = 'Experience Updated Successfully';
            } else{
                responseData.message = 'Experience Added Successfully';
            }
            responseData.status = 'success';
        } 
        return responseData;
    }
};
