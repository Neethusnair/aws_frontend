'use strict';
const axios = require('axios');


/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    async createInvoice(ctx){
        console.log(ctx.request.header.origin);
        var responseData ={};
        responseData.message = 'Invoice Creation Failed';
        responseData.status = 'failed';
        var initiatePayment = false;
        if(ctx.request.body.initiatePayment){
            initiatePayment = true;
        }

        var invoiceData =  await strapi.query('invoice').create({ 
            date : ctx.request.body.date,
            dueDate : ctx.request.body.date,
            family : ctx.request.body.familyId,
            description : ctx.request.body.description,
            amount : ctx.request.body.amount,
            package : ctx.request.body.package
        });

        const stripe = require('stripe')('sk_test_51KjUWZKtq3efRhNUYmSwRBAHTZ35ohVhbZSldBNdoSwskWSW6kjPWwDBDVFme8gZQSuEMRbHVhBYhbhAVJCS8cj200ol2ylLFl');
        var amount = ctx.request.body.amount * 100;
        var callBackUrl = 'http://127.0.0.1:5501/Frontend/public/paymentStatus.html';
        if(ctx.request.header.origin != "http://127.0.0.1:5501"){
            var callBackUrl = ctx.request.header.origin+'/public/paymentStatus.html';
        }
        
        const session = await stripe.checkout.sessions.create({
              success_url: callBackUrl,
              cancel_url: callBackUrl,
              customer_email: ctx.request.body.email,
              line_items: [
                {
                  price_data: {
                    currency: 'usd',
                    product_data: {
                      name: ctx.request.body.description,
                    },
                    unit_amount: amount,
                  },
                  quantity: 1,
                },
              ],
              mode: 'payment',
        });
        if(session.id != null){
            var receiptData =  await strapi.query('receipt').create({ 
                date : ctx.request.body.date,
                transactionId : session.id,
                invoice : invoiceData.id,
                status : 'PROCESSING',
                amount : ctx.request.body.amount
            });

            if(receiptData.id != undefined){
                responseData.status = 'success';
                responseData.message = 'Invoice Created added Successfully';
                responseData.details = receiptData.id;
                responseData.session = session;
                return responseData;
            } else{
                return responseData;
            }
        }            
    },

    async checkReceiptStatus(ctx){
        var responseData ={};
        responseData.message = 'Payment Failed';
        responseData.status = 'failed';

        var receiptStatusData = await strapi.query('receipt').find({ 
            isActive: true,
            transactionId:ctx.request.body.sessionId
        });

        if(receiptStatusData.length > 0 && receiptStatusData[0].id != null){
            responseData.status     = 'success';
            responseData.message    = 'Payment Falied';
            responseData.beforeData = receiptStatusData[0];
            if(receiptStatusData[0].status == 'PROCESSING'){
                var receiptStatus = 'FALIED';
                var config = {
                    method: 'get',
                    url: 'https://api.stripe.com/v1/checkout/sessions/'+ctx.request.body.sessionId,
                    headers: { 
                      'Authorization': 'Bearer sk_test_51KjUWZKtq3efRhNUYmSwRBAHTZ35ohVhbZSldBNdoSwskWSW6kjPWwDBDVFme8gZQSuEMRbHVhBYhbhAVJCS8cj200ol2ylLFl'
                    }
                };
                  
                await axios(config)
                .then(function (response) {
                    var receiptStatus = 'FALIED';
                    if(response.data.payment_status == 'paid'){
                        receiptStatus = 'SUCCESS';
                        strapi.query('invoice').update({id:receiptStatusData[0].invoice.id},{ 
                            isPaid: true
                        });
                        responseData.status     = 'success';
                        responseData.message    = 'Payment Success';
                    } else{
                        
                        responseData.status     = 'error';
                        responseData.message    = 'Payment Failed';
                    }
                    strapi.query('receipt').update({id:receiptStatusData[0].id},{ 
                        status: receiptStatus
                    });
                })
                .catch(function (error) {
                    responseData.status = 'error';
                    responseData.message = error;
                });
            } else if(receiptStatusData[0].status == 'SUCCESS'){
                responseData.status     = 'success';
                responseData.message    = 'Payment Success';
                responseData.details    = receiptStatusData[0];
            } else {
                responseData.status     = 'error';
                responseData.message    = 'Payment Failed';
                responseData.details    = receiptStatusData[0];
            }
               
        } else{
            responseData.status     = 'error';
            responseData.message    = 'Payment Details Not Found';
        }       
        return responseData;
    },
    // async client_token(ctx){
    //     var braintree = require('braintree');
    //     var gateway = new braintree.BraintreeGateway({
    //         environment:  braintree.Environment.Production,
    //         merchantId:   'vpq8zpfp6qhcztfk',
    //         publicKey:    'hny9q5hdcxpjc2b8',
    //         privateKey:   '1d97c15ea7952d841c30815527a21cc0'
    //     });
    //     let token = (await gateway.clientToken.generate({})).clientToken;
    //     var invoiceData = await strapi.query('invoice').find({ 
    //         isActive: true,
    //         family:ctx.state.user.family,
    //         isPaid: false
    //     });
        
    //     var passData = {};
    //     passData['token'] = token;
    //     passData['invoiceData'] = invoiceData;
    //     return passData;

    // },

    async client_token(ctx){
        var invoiceDataFetch = await strapi.query('invoice').find({ 
            isActive: true,
            id:ctx.request.body.id
        });

        var invoiceData = {};
        if(!invoiceDataFetch[0].isPaid){
            invoiceData.amount = invoiceDataFetch[0].amount;
            invoiceData.invoiceNo = invoiceDataFetch[0].invoiceNo;
            invoiceData.isPaid = invoiceDataFetch[0].isPaid;
            invoiceData.date = invoiceDataFetch[0].date;
            invoiceData.description = invoiceDataFetch[0].description;
            invoiceData.familyName = invoiceDataFetch[0].family.name;
            invoiceData.invId = invoiceDataFetch[0].id;
        } else{
            invoiceData.isPaid = invoiceDataFetch[0].isPaid;
        }
        
        return invoiceData;

    },

    async make_payment(ctx) {
        var braintree = require('braintree');
        var gateway = new braintree.BraintreeGateway({
            environment:  braintree.Environment.Sandbox,
            merchantId:   'mj8f8x9ngw7hcdxy',
            publicKey:    'vsqyp29hg3q9tc45',
            privateKey:   'fea98c1a4b86df8a31bae7a1853fc7f4'
        });
        return new Promise(function (resolve, reject) {
            gateway.transaction.sale({
                amount: ctx.request.body.amount,
                paymentMethodNonce: ctx.request.body.nonce,
                options: {
                  submitForSettlement: true
                }
              }).then(
                (response) => {
                    console.log(response);
                    var result = response;
                    var tranStatus = 'PENDING';
                    if(response.success === true){
                        tranStatus = 'SUCCESS';
                        strapi.query('invoice').update({id:ctx.request.body.invId},{ 
                            isPaid: true
                        });
                    } else{
                        tranStatus = 'FAILED';
                        resolve(result);
                    }
                    strapi.query('receipt').create({ 
                        status: tranStatus,
                        invoice: ctx.request.body.invId,
                        amount: ctx.request.body.amount,
                        transactionId: response.transaction.id,
                        date: response.transaction.createdAt
                    });

                    resolve(result);
                    
                
                    // var emailSub = 'PENDING';
                    // var emailBody = 'PENDING';
                    // var emailClient = 'PENDING';
                    // var emailOur = 'areghunath@sreyo.com';
                    // strapi.plugins['email'].services.email.send({
                    //     to: 'akarsh.reghunath@gmail.com',
                    //     from: 'areghunath@sreyo.com',
                    //     replyTo: 'akarsh.reghunath@gmail.com',
                    //     subject: 'Use strapi email provider successfully',
                    //     text: 'Hello world!',
                    //     html: 'Hello world!',
                    // });
                },
                    (error) => {
                    reject(error);
                }
            );
        });
    },

};
