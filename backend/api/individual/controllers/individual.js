'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async delete_member(ctx){
        const entry = await strapi.query('individual').update({_id:ctx.request.body.id}, { isActive:false});
        return entry;
    },
    
    async update_member(ctx){
        var responseData ={};
        responseData.message = '';
        responseData.status = 'failed';

        const userWithSameEmail = await strapi
            .query('user', 'users-permissions')
            .findOne({ email: ctx.request.body.email.toLowerCase() });

        if(userWithSameEmail != null && userWithSameEmail.individuals[0].id != ctx.request.body.memberId){
            responseData.message = "Email Already Exists";
            return responseData;
        }
        var nameId = userWithSameEmail.names[0].id;
        var mobileId = userWithSameEmail.addon_phone.id;
        var nameUpdate = await strapi.services.names.update({ id: nameId }, {firstName:ctx.request.body.firstName, middleName:ctx.request.body.middleName, lastName:ctx.request.body.lastName});
        var mobileUpdate = await strapi.services.phone.update({ id: mobileId }, {number:ctx.request.body.number});
    
        if(mobileUpdate.isActive){
            responseData.status = 'success';
            responseData.message = 'Member Updated successfully';
            return responseData;
        } else{
            return responseData;
        }
      
    },

    async add_member(ctx){
        var responseData ={};
        responseData.message = '';
        responseData.status = 'failed';

        const userWithSameEmail = await strapi
        .query('user', 'users-permissions')
        .findOne({ email: ctx.request.body.email.toLowerCase() });

        if(userWithSameEmail != null){
            responseData.message = "Email Already Exists";
            return responseData;
        }

        var mobileType = await strapi.query('phone-type').find({ 
            isActive: true,
            name:'Personal'
        });
        var emailType = await strapi.query('email-type').find({ 
            isActive: true,
            name:'Personal'
        });

        var emailData =  await strapi.query('email').create({ 
            email: ctx.request.body.email,
            email_type: emailType[0].id
        });

        var nameData =  await strapi.query('names').create({ 
            firstName: ctx.request.body.firstName,
            middleName: ctx.request.body.middleName,
            lastName: ctx.request.body.lastName,
        });

        var phoneData =  await strapi.query('phone').create({ 
            number: ctx.request.body.number,
            phone_type:mobileType[0].id
        });

        var emailData =  await strapi.query('email').create({ 
            email: ctx.request.body.email,
            email_type: emailType[0].id 
        });

        
        var individualData =  await strapi.query('individual').create({ 
            type: "MEMBER"
        });
        
        var userData = await strapi.plugins['users-permissions'].services.user.add({
            username:ctx.request.body.email,
            email: ctx.request.body.email,
            password: ctx.request.body.number,
            names: [nameData.id],
            addon_email: emailData.id,
            addon_phone: phoneData.id,
            individuals: [individualData.id]
        });

        if(userData.id != undefined){
            responseData.status = 'success';
            responseData.message = 'Member Added successfully';
            return responseData;
        } else{
            return responseData;
        }
        
    },
              
    async createMember(ctx){
        var responseData ={};
        responseData.message = '';
        responseData.status = 'failed';

        var mobileType = await strapi.query('phone-type').find({ 
            isActive: true,
            name:'Personal'
        });

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
        
        var individualData =  await strapi.query('individual').create({ 
            type: "MEMBER",
            relation: "HeadOfHousehold"
        });
        
        memberIds.push(individualData.id);
        var familyData =  await strapi.query('family').update({ id: ctx.request.body.familyId },{
            name : ctx.request.body.firstName + " & Family",
            members : [individualData.id]
        });

    },

    async createHeadMember(ctx){
        var responseData ={};
        responseData.message = '';
        responseData.status = 'failed';

        const userWithSameEmail = await strapi
        .query('user', 'users-permissions')
        .findOne({ username: ctx.request.body.email.toLowerCase() });

        if(userWithSameEmail != null){
            responseData.message = "Email Already Exists";
            return responseData;
        }
        var responseData ={};
        responseData.message = '';
        responseData.status = 'failed';

        var mobileType = await strapi.query('phone-type').find({ 
            isActive: true,
            name:'Personal'
        });

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
        
        var individualData =  await strapi.query('individual').create({ 
            type: "MEMBER",
            relation: "HeadOfHousehold"
        });

        var roleType = await strapi.query('role-type').find({ 
            isActive: true,
            roleType:'User'
        });

        const roleData = await strapi.query('role', 'users-permissions').findOne({type: 'authenticated'});
        let userData = await strapi.plugins['users-permissions'].services.user.add({
            names: [nameData.id],
            username: ctx.request.body.email,
            email: ctx.request.body.email,
            addon_phone: phoneData.id,
            password: 'Sreyo123',
            role: roleData.id,
            role_types: [roleType[0].id],
            individuals: [individualData.id],
            provider: 'local',
            confirmed: true
        });
        if(userData.id != undefined){
            var familyData =  await strapi.query('family').create({ 
                name : ctx.request.body.firstName + " & Family",
                head : [individualData.id]
            });
        } else{
            return responseData;
        }

        if(familyData.id != undefined){
            responseData.status = 'success';
            responseData.message = ctx.request.body.firstName+' & Family Created Successfully';
            responseData.details = familyData;
            return responseData;
        } else{
            return responseData;
        }
    },

    async createFamily(ctx){
        var responseData ={};
        responseData.message = 'Family Addition Failed';
        responseData.status = 'failed';

        var memberIds = [];
        var receivedData = ctx.request.body;
        var addressData =  await strapi.query('address').create({ 
            type: 'Home',
            houseNo: receivedData.address.houseNo,
            street: receivedData.address.street,
            zipCode: receivedData.address.zipCode,
            country: receivedData.address.country,
            state: receivedData.address.state,
            city: receivedData.address.city,
        });

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
            emailTypeId = emailType.id;        
        } else{
            emailTypeId = emailType[0].id;
        }

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
            number: receivedData.allMemberData[0].number,
            phone_type:phoneTypeId
        });

        var emailData =  await strapi.query('email').create({ 
            email: receivedData.allMemberData[0].email,
            email_type: emailTypeId
        });

        var nameData =  await strapi.query('names').create({ 
            firstName: receivedData.allMemberData[0].firstName,
            middleName: receivedData.allMemberData[0].middleName,
            lastName: receivedData.allMemberData[0].lastName,
        });
        
        var roleType = await strapi.query('role-type').find({ 
            isActive: true,
            roleType:'User'
        });
        var roleTypeId = '';
        if(roleType == ""){
            var roleType =  await strapi.query('role-type').create({ 
                isActive: true,
                roleType:'User'
            });
            roleTypeId = roleType.id;        
        } else{
            roleTypeId = roleType[0].id;   
        }
   
        var individualHeadData =  await strapi.query('individual').create({ 
            type: "MEMBER",
            relation: "HeadOfHousehold",
            email: emailData.id,
            phone: phoneData.id,
            address: addressData.id,
            names: [nameData.id]
        });

        const roleData = await strapi.query('role', 'users-permissions').findOne({type: 'authenticated'});

        let userData = await strapi.plugins['users-permissions'].services.user.add({
            names: [nameData.id],
            username: receivedData.allMemberData[0].email,
            email: receivedData.allMemberData[0].email,
            addon_phone: receivedData.allMemberData[0].number,
            password: 'Sreyo123',
            role: roleData.id,
            role_types: [roleTypeId],
            individuals: [individualHeadData.id],
            provider: 'local',
            confirmed: true
        });
    

        for (let i = 1; i < ctx.request.body.allMemberData.length; i++) {
            var loopData = {};
            loopData = receivedData.allMemberData[i];
        
            var nameData =  await strapi.query('names').create({ 
                firstName: loopData.firstName,
                middleName: loopData.middleName,
                lastName: loopData.lastName,
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
    
            var individualData =  await strapi.query('individual').create({ 
                type: 'MEMBER',
                relation: loopData.relation,
                //gender: loopData.gender,
               // homeTown: loopData.khm,
                name: [nameData.id],   
               // email: emailData.id,
               // phone: phoneData.id,
              //  address: addressData.id,
            });
            memberIds.push(individualData.id);
        }
        
        var familyData =  await strapi.query('family').create({ 
            name : receivedData.allMemberData[0].firstName + " & Family",
            head : [individualHeadData.id],
            members : memberIds
        });

        if(familyData.id != undefined){
            responseData.status = 'success';
            responseData.message = familyData.name+' added Successfully';
            responseData.details = familyData.id;
            return responseData;
        } else{
            return responseData;
        }
    },

    async add_individual(ctx){
        var responseData ={};
        responseData.message = 'Family Addition Failed';
        responseData.status = 'failed';
        var memberIds = [];

        for (let i = 0; i < ctx.request.body.data.length; i++) {
            var loopData = {};
            loopData = ctx.request.body.data[i];
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
                firstName: loopData.firstName,
                middleName: loopData.middleName,
                lastName: loopData.lastName,
            });
    
            var addressData =  await strapi.query('address').create({ 
                type: 'Home',
                houseNo: loopData.houseNumber,
                street: loopData.street,
                country: loopData.country,
                state: loopData.state,
                city: loopData.city,
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
                number: loopData.mobilePhone,
                phone_type:phoneTypeId
            });
    
            var emailData =  await strapi.query('email').create({ 
                email: loopData.email,
                email_type: emailTypeId
            });
    
            var individualData =  await strapi.query('individual').create({ 
                type: 'MEMBER',
                relation: loopData.relation,
                gender: loopData.gender,
                homeTown: loopData.khm,
                name: [nameData.id],   
                email: emailData.id,
                phone: phoneData.id,
                address: addressData.id,
            });
            memberIds.push(individualData.id);
        }
        var familyData =  await strapi.query('family').create({ 
            name : ctx.request.body.data[0].firstName + " & Family",
            head : [memberIds[0]],
            members : memberIds
        });
        if(familyData.id != undefined){
            responseData.status = 'success';
            responseData.message = familyData.name+' added Successfully';
            responseData.details = familyData;
            return responseData;
        } else{
            return responseData;
        }
        
    },

    
    async check_if_exist(ctx){
        var responseData ={};
        responseData.message = '';
        responseData.status = 'failed';

        const userWithSameEmail = await strapi
        .query('user', 'users-permissions')
        .findOne({ username: ctx.request.body.email.toLowerCase() });

        if(userWithSameEmail != null){
            responseData.message = "Email Already Exists";
            responseData.status = 'error';
            return responseData;
        } else{
            responseData.message = "Email Available";
            responseData.status = 'success';
            return responseData;
        }
    },

    async userSoftDelete(ctx) {
        var  userData = await strapi.query('user', 'users-permissions').update({id:ctx.request.body.id},{
            isActive: false
        });
        return userData;
    },

    async gen_login_otp(ctx){
        var responseData ={};
        responseData.message = '';
        responseData.status = 'failed';

        var digits = '0123456789';
        var otpLength = 6;
        var otp = '';
        for(let i=1; i<=otpLength; i++){
            var index = Math.floor(Math.random()*(digits.length));
            otp = otp + digits[index];
        }

       const userWithEmail = await strapi
        .query('user', 'users-permissions')
        .findOne({ email: ctx.request.body.email.toLowerCase(), blocked: false });
        var timeout = new Date();
        timeout.setSeconds(timeout.getSeconds() - 300);

       if(userWithEmail != null){
            const otpUpdate = await strapi.query('user', 'users-permissions').update({_id:userWithEmail.id}, { otp:otp, otp_timeout:timeout.toISOString()});

            if(otpUpdate != null){
                await strapi.plugins['email'].services.email.send({
                    to: ctx.request.body.email.toLowerCase(),
                    from: 'no-reply@managedorg.io',
                    subject:  'VERIFY YOUR LOGIN - MANAGEDORG ',
                    text:  'LOGIN - OTP',
                    html:  `<span style="font-size: medium;">Below is your One Time Passcode for Login</span>
                    <h2><b style="margin: 10px; border: 1px solid lightgray; padding: 10px; border-radius: 10px; background-color: whitesmoke; letter-spacing: 5px; font-size: x-large;">` +otp+`</b></h2>
                    <span style="font-size: medium;">We are here to help.<br> Visit the <a target="_blank" href="https://managedorg.io/contact/">Managedorg Support</a> for more info.</span>
                    <span style="font-size: medium;">- Managedorg Security</span>`

                });
                responseData.message = "OTP Generated";
                responseData.status = 'success';
                return responseData;
            } else{
                responseData.message = "OTP Generation Failed";
                responseData.status = 'error';
                return responseData;
            }
       } else{
           responseData.message = "User Doesn't Exists";
           responseData.status = 'error';
           return responseData;
       }
    },

    async validate_login_otp(ctx){
        var responseData ={};
        responseData.message = '';
        responseData.status = 'failed';

        const userWithEmail = await strapi
        .query('user', 'users-permissions')
        .findOne({ email: ctx.request.body.email.toLowerCase(), otp: ctx.request.body.otp});
        const jwt = await strapi.plugins['users-permissions'].services.jwt.issue({
            id: userWithEmail.id
        })

        responseData.message = userWithEmail.username+" logged in successfully";
        responseData.jwt = jwt;
        responseData.status = 'success';
        return responseData;
    }

}
