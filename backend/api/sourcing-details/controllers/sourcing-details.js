'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async add_candidate(ctx){
        var responseData ={};
        responseData.message = '';
        responseData.status = 'failed';

        var candidateData = await strapi.query('candidate-profile').find({ 
            isActive: true,
            candidate:ctx.request.body.candidateId
        });
        var sourcingData =  await strapi.query('sourcing-details').create({ 
            currentStatus: "APPLICANT",
            candidate_profile: candidateData[0].id,
            requirement: ctx.request.body.sourcingId,
            createdBy: ctx.state.user.id
        });

        if(sourcingData.id != undefined){
            responseData.status = 'success';
            responseData.message = 'Successfully Added';
            return responseData;
        } else{
            return responseData;
        }
    },
    async update_candidate(ctx){
        console.log(ctx.request.body);
        if(ctx.request.body.type == "APPROVE"){
            const entry = await strapi.query('sourcing-details').update({_id:ctx.request.body.id}, { currentStatus:ctx.request.body.nextStage});
            return entry;
        } else {
            const entry = await strapi.query('sourcing-details').update({_id:ctx.request.body.id}, { isActive:false});
            return entry;
        }
    },
};
