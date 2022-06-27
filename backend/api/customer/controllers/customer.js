'use strict';
const axios = require('axios');

module.exports = {

    async addCustomer(ctx){
        var responseData ={};
        responseData.message = '';
        responseData.status = 'failed';

        var counterVal = 1337;

        var deploymentData =  await strapi.query('deployment-data').create({ 
          namePrefix: ctx.request.body.business_url,
          containerPortVal: counterVal,   
          domainName: ctx.request.body.business_url+'-api.managedorg.io',
          portVal: counterVal,
          serviceName: ctx.request.body.business_url,
          hostingType: ctx.request.body.account_type
        });

        var customerData =  await strapi.query('customer').create({ 
          name: ctx.request.body.business_name,
          corporation_type: ctx.request.body.business_type,   
          description: ctx.request.body.business_description,
          taxId: ctx.request.body.business_tax_id,
          email: ctx.request.body.business_email,
          number: ctx.request.body.business_number,
          deploymentData: [deploymentData.id]
        });        

        if(customerData.id != undefined){
            responseData.status = 'success';
            responseData.customerData = customerData;
            return responseData;
        } else{
            return responseData;
        }
    },

    async onboard(ctx){    
      var callbackData =  await strapi.query('callback').create({ 
        type: 'ONBOARDING'
      });


      var customerDataVal = await strapi.query('customer').find({ 
          isActive: true,
          id: ctx.request.body.customerId
      });


      console.log('customerDataVal',customerDataVal);
      var instanceData = JSON.stringify({
        "event_type": "instance",
          "client_payload": {
            "deployment_file": {
              "namePrefix": customerDataVal[0].deploymentData.namePrefix,
              "label": customerDataVal[0].deploymentData.namePrefix+"-customer",
              // "containerPortVal": customerDataVal[0].deploymentData.portVal,
              // "portVal": customerDataVal[0].deploymentData.portVal,
              "containerPortVal": '1337',
              "portVal": '1337',
              "email": customerDataVal[0].email,
              "domainName": customerDataVal[0].deploymentData.domainName,
              "serviceName": customerDataVal[0].deploymentData.serviceName+"-customer-service.default.svc.cluster.local",
              "frontend_domain": customerDataVal[0].deploymentData.namePrefix,
              "backend_domain": customerDataVal[0].deploymentData.namePrefix+"-api",
              "callbackId": callbackData.id
            }
          }
      });
        
        axios({
          method: "post",
          url: "https://api.github.com/repos/managedorg/app-triggers/dispatches",
          headers: { 
            'Authorization': 'token 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', 
            'Content-Type': 'application/json'
          },
          data : instanceData
        })
        return '{"status": "success"}';
    },

};
