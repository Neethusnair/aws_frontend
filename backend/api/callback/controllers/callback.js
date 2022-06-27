'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const axios = require('axios');
const { channel } = require('diagnostics_channel');
const qs = require('qs')
const serverIP = "https://demo-api.managedorg.io/"
const currentServerIP = ""
const url = require('url');


module.exports = {
    async updateCallback(ctx){
        var responseData ={};
        responseData.message = '';
        responseData.status = 'failed';
        var status = "SUCCESS";
        if(ctx.request.body.status == 'falied'){
            status = "FAILED";
        }

        
        const entry = await strapi.query('callback').update({_id:ctx.request.body.callbackid}, { 
            isCompleted: true,
            status: status
        });

        // SEND EMAIL HERE
        
        return entry;
    },

    async updateAccessToken(ctx){
                
        
        var customerID = ctx.request.query.state 

        var code = ctx.request.query.code
        
        console.log("hi")

        var customerServerData = await axios.post(serverIP+"server-connection/get_server_data",JSON.stringify({ customerID : customerID, targetServerIP : serverIP}),{headers:{"Content-Type":"application/json"}});
        
        console.log("2")

        var refinedCustServerData = customerServerData.data.data.serverConnections[0]

        var customerServerIP = refinedCustServerData.databaseUrl

        console.log(customerServerIP)

        var customerServerConId = await axios.post(customerServerIP+"server-connection/get_server_data",JSON.stringify({ customerID : customerID, targetServerIP : customerServerIP}),{headers:{"Content-Type":"application/json"}});

        var finalCustomerServerConId = customerServerConId.data.data.serverConnections[0].id
        
        console.log(finalCustomerServerConId)
        

        var serverConId = refinedCustServerData.id

        console.log(serverConId)

        var encrypt_Code = await axios.post(customerServerIP+"server-connection/encrypt_data",JSON.stringify({message : code}),{headers:{"Content-Type":"application/json"}});


        var data2 = qs.stringify({
            Code: encrypt_Code.data
        })

        const amendData = await axios.put(customerServerIP+"server-connections/"+ finalCustomerServerConId, data2)

        

        console.log(amendData.data)



        // var serverData = await axios.post(customerServerIP+"establish_initial_connection",JSON.stringify({ customerID : customerID}),{headers:{"Content-Type":"application/json"}});


        return amendData.data
        

        
        
    }

};