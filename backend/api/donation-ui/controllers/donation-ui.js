'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */


 const { sanitizeEntity } = require('strapi-utils');
module.exports = {

    async set_donation_driver_details(ctx) {
            var responseData ={};
            responseData.message = '';
            responseData.status = 'failed';
    

        console.log(ctx.request.header.id)
        

        var newDonationUIEntry =  await strapi.query('donation-ui').create({ 
            user : {_id: ctx.request.header.id},
            bgColor : ctx.request.body.bgcolor,
            codeLocation : ctx.request.body.codeLocation,
            websiteURL : ctx.request.body.websiteURL,
            fgColor : ctx.request.body.fgcolor,
            templateName : ctx.request.body.templateName,
            isActive : ctx.request.body.isActive
        });

     
        if(newDonationUIEntry.id != undefined){
            responseData.status = 'success';
            return responseData;
        } else{
            return responseData;
        }
        
    },
    async get_donation_driver_UI_details(ctx){
        const getUIDetails = await strapi.query('donation-ui').find({
           websiteURL: ctx.request.body.websiteURL,
           isActive:true
        })
        // return getUIDetails
        console.log('getUIDetails',getUIDetails);
        
        return sanitizeEntity(getUIDetails,{ model: strapi.query('donation-ui').model });
        
    }

};
