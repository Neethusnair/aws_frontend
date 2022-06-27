'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async delete_certificate(ctx){
        const entry = await strapi.query('certificate').update({_id:ctx.request.body.id}, { isActive:false});
        return entry;
    },

    async add_certificate(ctx){
        var responseData ={};
        responseData.message = '';
        responseData.status = 'failed';
        var authorityData =  await strapi.query('certificate-authority').create({ 
            name: ctx.request.body.certificate_authority
        });
        var typeData =  await strapi.query('certificate-type').create({ 
            certificateName: ctx.request.body.certificate_type
        });
        var certData =  await strapi.query('certificate').create({ 
            // startDate: ctx.request.body.startDate,
            // endDate: ctx.request.body.endDate,
            certificateDate: ctx.request.body.certificateDate,
            candidate_profile: ctx.request.body.addCert_profileId,
            certificate_authority: authorityData.id,
            certificate_type: typeData.id,
        });

        
        if(certData.id != null){
            if(ctx.request.body.addCert_id != undefined && ctx.request.body.addCert_id != ""){
                var deletePreviousData = await strapi.query('certificate').update({_id:ctx.request.body.addCert_id}, { isActive:false});
                responseData.message = 'Certificate Updated Successfully';
            } else{
                responseData.message = 'Certificate Added Successfully';
            }
            responseData.status = 'success';
        } 
        return responseData;
    }
};
