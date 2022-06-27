'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async make_default(ctx){
        var mobileType = await strapi.query('candidate-profile').find({ 
            isActive: true, 
            candidate: [{ _id: ctx.request.body.candidateId }]
        });
        const removeDefault = await strapi.query('candidate-profile').update({ isActive: true, candidate: [{ _id: ctx.request.body.candidateId }] }, { isDefault:false});
        console.log(removeDefault);

        const setDefault = await strapi.query('candidate-profile').update({_id:ctx.request.body.id}, { isDefault:true});
       

    },
    
    async delete_profile(ctx){
        const entry = await strapi.query('candidate-profile').update({_id:ctx.request.body.id}, { isActive:false});
        return entry;
    }
};

