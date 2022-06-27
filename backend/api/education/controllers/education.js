'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async delete_education(ctx){
        const entry = await strapi.query('education').update({_id:ctx.request.body.id}, { isActive:false});
        return entry;
    },

    async add_education(ctx){
        var responseData ={};
        responseData.message = '';
        responseData.status = 'failed';
        var degreeData =  await strapi.query('degree').create({ 
            name: ctx.request.body.degree
        });
        var schoolData =  await strapi.query('school').create({ 
            name: ctx.request.body.school
        });
        var eduData =  await strapi.query('education').create({ 
            startDate: ctx.request.body.startDate,
            endDate: ctx.request.body.endDate,
            major: ctx.request.body.major,
            grade: ctx.request.body.grade,
            candidate_profile: ctx.request.body.addEdu_profileId,
            degree: degreeData.id,
            school: schoolData.id,
        });
        console.log("I have successfully implemented this is id :" , ctx.request.body.addEdu_profileId)
        
        if(eduData.id != null){
            if(ctx.request.body.addEdu_id != undefined && ctx.request.body.addEdu_id != ""){
                var deletePreviousData = await strapi.query('education').update({_id:ctx.request.body.addEdu_id}, { isActive:false});
                responseData.message = 'Education Updated Successfully';
            } else{
                responseData.message = 'Education Added Successfully';
            }
            responseData.status = 'success';
        } 
        return responseData;
    }
};
