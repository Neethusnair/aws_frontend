'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async delete_candidate(ctx){
        const entry = await strapi.query('candidates').update({_id:ctx.request.body.id}, { isActive:false});
        return entry;
    },
    async search_candidate(ctx){
        console.log(ctx.request.body.query);
        const entry = await strapi.query('candidates').find({ isActive: true, 'user.names.firstName_contains': ctx.request.body.query });
        return entry;
    },

    async add_candidate(ctx){
        var responseData ={};
        responseData.message = '';
        responseData.status = 'failed';

        var mobileType = await strapi.query('phone-type').find({ 
            isActive: true,
            name:'Personal'
        });
               
        var emailType = await strapi.query('email-type').find({ 
            isActive: true,
            name:'Personal'
        });
        
        var emailTypeId = '';
        if(emailType == ""){
            var emailType =  await strapi.query('email-type').create({ 
                isActive: true,
                name:'Personal'
            });
            emailTypeId = emailType;        
        } else{
            emailTypeId = emailType[0].id;
        }

        var nameData =  await strapi.query('names').create({ 
            firstName: ctx.request.body.firstName,
            middleName: ctx.request.body.middleName,
            lastName: ctx.request.body.lastName,
        });

        var phoneTypeId = '';
        if(mobileType == ""){
            var mobileType =  await strapi.query('phone-type').create({ 
                isActive: true,
                name:'Personal'
            });
            phoneTypeId = mobileType.id;
        } else{
            phoneTypeId = mobileType[0].id;

        }
        var phoneData =  await strapi.query('phone').create({ 
            number: ctx.request.body.number,
            phone_type:phoneTypeId
        });
        console.log('phoneData',phoneData)

        var emailData =  await strapi.query('email').create({ 
            email: ctx.request.body.email,
            email_type: emailTypeId
        });
        console.log('emailData',emailData)

        var profileData =  await strapi.query('candidate-profile').create({ 
            profileName: 'Default',
            name: [nameData.id],   
            email: emailData.id,
            phone: phoneData.id,
        });
        console.log('profileData',profileData)
        
        var candidateData =  await strapi.query('candidates').create({ 
            candidate_profiles : [profileData.id]
        });
        console.log('candidateData',candidateData)

        var  userData = await strapi.query('user', 'users-permissions').update({id:ctx.request.body.userId},{
            userType: 'CANDIDATE',
            names: [nameData.id],
            addon_email: emailData.id,
            addon_phone: phoneData.id,
            candidate: candidateData.id,
        });

        if(userData.id != undefined){
            responseData.status = 'success';
            return responseData;
        } else{
            return responseData;
        }
        
    },    
};