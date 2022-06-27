'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const axios = require('axios');
const qs = require('qs')
const aws4 = require('aws4')
// const path = require('path')
const fetch = require('node-fetch');
const Crypto = require('crypto')


require('dotenv').config('/Users/kiran/Documents/managedorg-jp-server/.env')

const token_access_url = "https://api.amazon.com/auth/o2/token"
const serverIP = "https://demo-api.managedorg.io/"
const grant_type_authorization = "authorization_code"
//////////

var secret_key_internal = 'kahfusflidflsi-aqejkds'

var secret_iv_internal = 'sdjhjd'

var encryptionMethod = 'AES-256-CBC'

var key = Crypto.createHash('sha512').update(secret_key_internal,'utf-8').digest('hex').substr(0,32);

var iv = Crypto.createHash('sha512').update(secret_iv_internal,'utf-8').digest('hex').substr(0,16);

//////////
const grant_type_refresh_token = "refresh_token"

const awsRegion = "us-east-1"
const baseuri = "na.business-api.amazon.com"
const email = "managedorg@sreyo.com"




module.exports = {



    async encrypt_data(ctx){

        var messageToEncrypt = ctx.request.body.message

        var encryptedMessage = encrypt_string(messageToEncrypt,encryptionMethod,key,iv)

        

        return encryptedMessage

        function encrypt_string(plain_text, encryptionMethod, secret, iv){
            var encryptor = Crypto.createCipheriv(encryptionMethod, secret, iv)
            var aes_encrypted = encryptor.update(plain_text, 'utf8', 'base64') + encryptor.final('base64')
            return Buffer.from(aes_encrypted).toString('base64')
        }


    },

    async decrypt_data(ctx){

        var messageToDecrypt = ctx.request.body.message

        var decryptedMessage = decrypt_string(messageToDecrypt ,encryptionMethod,key,iv)

        

        return decryptedMessage

        function decrypt_string(encryptedMessage, encryptionMethod, secret, iv){
            const buff = Buffer.from(encryptedMessage,'base64')
            encryptedMessage = buff.toString('utf-8')
            var decryptor = Crypto.createDecipheriv(encryptionMethod, secret, iv)
            return decryptor.update(encryptedMessage, 'base64', 'utf-8') + decryptor.final('utf-8')
        }



    },

    async amend_server_data(ctx){

        var customerID = ctx.request.body.customerID
        var abEmail = ctx.request.body.abEmail
        var identity = ctx.request.body.identity
        var sharedSecret = ctx.request.body.sharedSecret
        var poRequestURL = ctx.request.body.poRequestURL

        var adEmailFinal = ""
        var identityFinal = ""
        var sharedSecretFinal = ""
        var poRequestURLFinal = ""

        console.log("1")

        var serverData = await axios.post(serverIP+"server-connection/get_server_data",JSON.stringify({ customerID : customerID, targetServerIP : serverIP}),{headers:{"Content-Type":"application/json"}});

        console.log("2")

        var refinedServerData = serverData.data.data.serverConnections[0]
        console.log("3")

        var serverConId = refinedServerData.id
        console.log("4")

        var customerServerIP = refinedServerData.databaseUrl
        console.log("5")

        var custserverData = await axios.post(customerServerIP+"server-connection/get_server_data",JSON.stringify({ customerID : customerID, targetServerIP : customerServerIP}),{headers:{"Content-Type":"application/json"}});
        console.log("6")

        var refinedCustServerData = custserverData.data.data.serverConnections[0]
        console.log("7")

        var custserverConId = refinedCustServerData.id

        console.log("customerServerIP",customerServerIP)

        console.log("8")

        if (abEmail!=""){
            var encryptedabEmail = await axios.post(customerServerIP+"server-connection/encrypt_data",JSON.stringify({message : abEmail}),{headers:{"Content-Type":"application/json"}});
            adEmailFinal = encryptedabEmail.data
        }
        console.log("9")

        if (identity!=""){
            var encryptedidentity = await axios.post(customerServerIP+"server-connection/encrypt_data",JSON.stringify({message : identity}),{headers:{"Content-Type":"application/json"}});
            identityFinal = encryptedidentity.data
        }
        console.log("10")
        
        if (sharedSecret!=""){
            var encryptedsharedSecret = await axios.post(customerServerIP+"server-connection/encrypt_data",JSON.stringify({message : sharedSecret}),{headers:{"Content-Type":"application/json"}});
            sharedSecretFinal = encryptedsharedSecret.data
        }
        console.log("11")

        if (poRequestURL!=""){
            var encryptedpoRequestURL = await axios.post(customerServerIP+"server-connection/encrypt_data",JSON.stringify({message : poRequestURL}),{headers:{"Content-Type":"application/json"}});
            poRequestURLFinal = encryptedpoRequestURL.data
        }

        console.log("12")


    
        


        var data2 = qs.stringify({
            admin_email : adEmailFinal,  
            Identity : identityFinal,
            sharedSecret : sharedSecretFinal,
            punchoutUrl : poRequestURLFinal

        })
        console.log("13")

        const amendData = await axios.put(customerServerIP+"server-connections/"+ custserverConId, data2)
        console.log("14")

        return amendData.data
        

    },

    async access_url(ctx){

        var hostUrl = ctx.request.header.host

    
        var access_url = "https://www.amazon.com/b2b/abws/oauth?state=" + customerID + "&redirect_uri=https://demo-api.managedorg.io/callback/updateAccessToken&applicationId=amzn1.sp.solution.fa7abf8b-673c-4c83-b956-d0b18ce0bc26&"
    
        console.log("changedresult7",changedresult)
         
        return access_url
    
    },


    async create_new_org(ctx){

        
            var result2           = '';
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for ( var i = 0; i < 5; i++ ) {
            result2 += characters.charAt(Math.floor(Math.random() * 
        charactersLength));
        }
        
        
        var hostUrl = ctx.request.header.host

        var fullChangedURL = "https://" + hostUrl + "/"


        var responseData = {}
        responseData.message = ""
        responseData.status= 'failed'

        
        const initialCustomerID = result2


        const customerFinder = await axios({
            method: "post",
            url: serverIP+"graphql",
            headers: {'Content-Type': 'application/json'},
            data: {
                query: `query{
                    serverConnections(where:{databaseUrl:"`+fullChangedURL+`"}) {
                        organization{internal_id}
                    }
                }`, 
            }
        })

        var customerID = ''


        if (customerFinder.data.data.serverConnections[0] != undefined){
            
            customerID = customerFinder.data.data.serverConnections[0].organization.internal_id
        }
        else {
            const populateServer = await axios.post(serverIP+"organizations",JSON.stringify({name : prefix, internal_id: initialCustomerID}),{headers:{"Content-Type":"application/json"}});
            const populateServer2 = await axios.post(serverIP+"server-connections",JSON.stringify({databaseUrl: fullChangedURL, organization: [populateServer.data.id]}),{headers:{"Content-Type":"application/json"}});
            // const entry3 = await strapi.query('organization').create({name: "ManagedOrg", internal_id: "001"});  
            const entry = await axios.post(fullChangedURL+"organizations",JSON.stringify({name: prefix, internal_id: initialCustomerID}),{headers:{"Content-Type":"application/json"}});
            // const entry = await strapi.query('organization').create({name: prefix, internal_id: initialCustomerID});
            const entry2 = await axios.post(fullChangedURL+"server-connections",JSON.stringify({databaseUrl: fullChangedURL, organization: [entry.data.id]}),{headers:{"Content-Type":"application/json"}});
            const entry3 = await axios.post(fullChangedURL+"organizations",JSON.stringify({name: "managedOrg", internal_id: "001"}),{headers:{"Content-Type":"application/json"}});
            // const entry = await strapi.query('organization').create({name: prefix, internal_id: initialCustomerID});
            const entry4 = await axios.post(fullChangedURL+"server-connections",JSON.stringify({databaseUrl: serverIP, organization: [entry3.data.id]}),{headers:{"Content-Type":"application/json"}});
            // const entry2 = await strapi.query('server-connection').create({databaseUrl: fullChangedURL, organization: [entry.id]})
            customerID = initialCustomerID
        }

        console.log(customerID)
        
        return customerID

    },

    

    
    async get_server_data(ctx){

        var customerID = ctx.request.body.customerID

        var targetServerIP = ctx.request.body.targetServerIP




        const graphqlResponse = await axios({
            method: "post",
            url: targetServerIP+"graphql",
            headers: {'Content-Type': 'application/json'},
            data: {
                query: `query{
                            serverConnections(where:{organization:{internal_id:"`+ customerID +`"}}) {
                                id
                                Code
                                Client_id
                                Client_secret
                                redirect_uri
                                refresh_token
                                awsSecretKey
                                awsAccessKey
                                punchoutUrl
                                Identity
                                sharedSecret
                                admin_email
                                deploymentMode
                                databaseUrl
                                accessRenewal
                            }
                        }`, 
            }
                
        }).catch(function (error) {
            console.log('Error ' + error)
            if (error.response){

                //do something

                console.log('Error response:  ' + error.response)
                return error.response
                
            }else if(error.request){
                
                //do something else

                console.log('Error request:  ' + error.request)
                return error.request
                
            }else if(error.message){
                
                //do something other than the other two
                
                console.log('Error message:  ' + error.message)
                return error.message


            }
        })

        console.log("graphqlResponse.data",graphqlResponse.data)

        return graphqlResponse.data


    },

    async fetch_code(ctx){


        // async function getResponse() {
        //     const response = await fetch(
        //         'https://www.amazon.com/b2b/abws/oauth?state=100&redirect_uri=https://dev.managedorg.com&applicationId=amzn1.sp.solution.fa7abf8b-673c-4c83-b956-d0b18ce0bc26',
        //         {
        //             method: 'GET',
                   
        //         }
        //     );

        //     console.log(response)
        // }
        // getResponse()
        function makeGetRequest(path) {
            axios.get(path).then(
                (response) => {
                    var result = response.data;
                    console.log('Processing Request');
                    return (result);
                },
                (error) => {
                    console.log(error);
                }
            );
        }
        function main() {
            var response = makeGetRequest('https://dev.managedorg.com/');
            console.log(response);
            console.log('Statement 2');
        }
        main();

    },

    //API to establish initial connection to AWS by passing CODE, CLIENTID, CLIENTSECRET, REDIRECTURI
    //ONLY NEEDS TO BE ESTABLISHED ONCE TO RETURN REFRESH TOKEN
    //Required: CustomerID to be parsed in body
    async establish_initial_connection(ctx){

        var customerID = ctx.request.body.customerID

        
        var serverData = await axios.post(serverIP+"server-connection/get_server_data",JSON.stringify({ customerID : "001", targetServerIP : serverIP}),{headers:{"Content-Type":"application/json"}});
       


        var refinedServerData = serverData.data.data.serverConnections[0]



        
        var customerServerData = await axios.post(serverIP+"server-connection/get_server_data",JSON.stringify({ customerID : customerID, targetServerIP : serverIP}),{headers:{"Content-Type":"application/json"}});  
        
        
        var refinedCustServerData = customerServerData.data.data.serverConnections[0]

        
        var customerServerIP = refinedCustServerData.databaseUrl

        
        var finalcustomerServerData = await axios.post(customerServerIP+"server-connection/get_server_data",JSON.stringify({ customerID : customerID, targetServerIP : customerServerIP}),{headers:{"Content-Type":"application/json"}});  
        
        
        var refinedfinalCustServerData = finalcustomerServerData.data.data.serverConnections[0]
        

        var customerServerDBID = refinedfinalCustServerData.id

       
        var client_id = await axios.post(customerServerIP+"server-connection/decrypt_data",JSON.stringify({message : refinedServerData.Client_id}),{headers:{"Content-Type":"application/json"}});
        
        
        var client_secret = await axios.post(customerServerIP+"server-connection/decrypt_data",JSON.stringify({message : refinedServerData.Client_secret}),{headers:{"Content-Type":"application/json"}});

        
        var redirect_uri = await axios.post(customerServerIP+"server-connection/decrypt_data",JSON.stringify({message : refinedServerData.redirect_uri}),{headers:{"Content-Type":"application/json"}});
        
        var code = await axios.post(customerServerIP+"server-connection/decrypt_data",JSON.stringify({message : refinedfinalCustServerData.Code}),{headers:{"Content-Type":"application/json"}});
        
        
        var dataStruct = qs.stringify({ 
            grant_type : grant_type_authorization,
            code : code.data, // customer specific (params). (Create url and post to give to customer to accept. Create an api to wait for response)
            client_id : client_id.data,
            client_secret : client_secret.data,
            redirect_uri : redirect_uri.data
        })
        
        const response2 = await axios({
            method: 'post',
            url: token_access_url,
            data: dataStruct,
            headers:{'content-type': 'application/x-www-form-urlencoded;charset=utf-8'}
        })
        .catch(error => {
            if (error.response){

                //do something

                console.log('Error response:  ' + error.response)
                return error.response
                
                }else if(error.request){
                
                //do something else

                console.log('Error request:  ' + error.request)
                return error.request
                
                }else if(error.message){
                
                //do something other than the other two
                
                console.log('Error message:  ' + error.message)
                return error.message


                }
            
        })
        //add refresh token to db

        var storeRefreshToken = await axios.post(customerServerIP+"server-connection/encrypt_data",JSON.stringify({message : response2.data.refresh_token}),{headers:{"Content-Type":"application/json"}});

        var storeAccessToken = await axios.post(customerServerIP+"server-connection/encrypt_data",JSON.stringify({message : response2.data.access_token}),{headers:{"Content-Type":"application/json"}});


        var data2 = qs.stringify({
            refresh_token : storeRefreshToken.data,  
            access_token : storeAccessToken.data

        })

        console.log(customerServerDBID)

        const amendData = await axios.put(customerServerIP+"server-connections/"+ customerServerDBID, data2)


        return response2.data


    },


    //Required to generate amazon access token which is only active for 1 HOUR
    //Need to pass refresh token, clientID and Client Secret
    async get_tokens(ctx){


        var customerID = ctx.request.body.customerID


        
        var serverData = await axios.post(serverIP+"server-connection/get_server_data",JSON.stringify({ customerID : "001", targetServerIP : serverIP}),{headers:{"Content-Type":"application/json"}});
   
        var refinedServerData = serverData.data.data.serverConnections[0]
    
        var client_id = await axios.post(serverIP+"server-connection/decrypt_data",JSON.stringify({message : refinedServerData.Client_id}),{headers:{"Content-Type":"application/json"}});
   
        var client_secret = await axios.post(serverIP+"server-connection/decrypt_data",JSON.stringify({message : refinedServerData.Client_secret}),{headers:{"Content-Type":"application/json"}});

        
        var customerServerData = await axios.post(serverIP+"server-connection/get_server_data",JSON.stringify({ customerID : customerID, targetServerIP : serverIP}),{headers:{"Content-Type":"application/json"}});
  
        var refinedCustServerData = customerServerData.data.data.serverConnections[0]
   
        var customerServerIP = refinedCustServerData.databaseUrl
      
        var finalcustomerServerData = await axios.post(customerServerIP+"server-connection/get_server_data",JSON.stringify({ customerID : customerID, targetServerIP : customerServerIP}),{headers:{"Content-Type":"application/json"}});
      
        var refinedfinalcustomerServerData = finalcustomerServerData.data.data.serverConnections[0]
 

        var refresh_token = await axios.post(customerServerIP+"server-connection/decrypt_data",JSON.stringify({message : refinedfinalcustomerServerData.refresh_token}),{headers:{"Content-Type":"application/json"}});
        

        console.log(refresh_token.data)

       

        var data2 = qs.stringify({ 
            grant_type : grant_type_refresh_token,
            refresh_token : refresh_token.data, //customer specific
            client_id : client_id.data,
            client_secret : client_secret.data
        })



       
        const response2 = await axios({
            method: 'post',
            url: token_access_url,
            data: data2,
            headers:{'content-type': 'application/x-www-form-urlencoded;charset=utf-8'}
            })
             .catch(function (error) {
                console.log('Error ' + error)
                if (error.response){

                    //do something
    
                    console.log('Error response:  ' + error.response)
                    return error.response
                    
                }else if(error.request){
                    
                    //do something else
    
                    console.log('Error request:  ' + error.request)
                    return error.request
                    
                }else if(error.message){
                    
                    //do something other than the other two
                    
                    console.log('Error message:  ' + error.message)
                    return error.message
    
    
                }

          })

        var access_token = response2.data.access_token
        refresh_token = response2.data.refresh_token


        var encrypt_access_token = await axios.post(customerServerIP+"server-connection/encrypt_data",JSON.stringify({message : access_token}),{headers:{"Content-Type":"application/json"}});

        var encrypt_access_token_final = encrypt_access_token.data
         

        var data2 = qs.stringify({ 
            access_token : encrypt_access_token_final
        })

        

        const amendData = await axios.put(customerServerIP+"server-connections/"+ refinedfinalcustomerServerData.id, data2)


        // return response2.data

        console.log(amendData.data)

        return amendData.data.access_token


        },

        async personal_data_expired(ctx){

            var customerID = ctx.request.body.customerID
        
            var customerServerData = await axios.post(serverIP+"server-connection/get_server_data",JSON.stringify({ customerID : customerID, targetServerIP : serverIP}),{headers:{"Content-Type":"application/json"}});
        
            var refinedCustServerData = customerServerData.data.data.serverConnections[0]

            var customerServerIP = refinedCustServerData.databaseUrl

            var finalcustomerServerData = await axios.post(customerServerIP+"server-connection/get_server_data",JSON.stringify({ customerID : customerID, targetServerIP : customerServerIP}),{headers:{"Content-Type":"application/json"}});

            var finalrefinedCustServerData = finalcustomerServerData.data.data.serverConnections[0]
            
            var finalcustomerServerID = finalrefinedCustServerData.id


            var data2 = qs.stringify({ 
                punchoutUrl : "",
                Identity : "",
                sharedSecret : "",
                admin_email : ""                
            })
    
            const amendData = await axios.put(customerServerIP+"server-connections/"+ finalcustomerServerID, data2)
    
            return amendData.data

        },

        async check_personal_data_expiry(ctx){

            var customerID = ctx.request.body.customerID

            var serverCustData = await axios.post(serverIP+"server-connection/get_server_data",JSON.stringify({ customerID : customerID, targetServerIP : serverIP}),{headers:{"Content-Type":"application/json"}});
            
            var refinedServerCustData = serverCustData.data.data.serverConnections[0]
            var customerServerIP = refinedServerCustData.databaseUrl

            var finalcustomerServerData = await axios.post(customerServerIP+"server-connection/get_server_data",JSON.stringify({ customerID : customerID, targetServerIP : customerServerIP}),{headers:{"Content-Type":"application/json"}});

            var finalrefinedCustServerData = finalcustomerServerData.data.data.serverConnections[0]
            



            var access_renewal_date = finalrefinedCustServerData.accessRenewal
            var formatted_renewal_date = new Date(access_renewal_date)
            var format_date_plus_thirty = formatted_renewal_date.setDate(formatted_renewal_date.getDate() + 30)
            const current_Date = new Date()
            if (current_Date<=format_date_plus_thirty){
                return "Active"
            }
            else{
                var serverCustData = await axios.post(customerServerIP+"server-connection/personal_data_expired",JSON.stringify({ customerID : customerID}),{headers:{"Content-Type":"application/json"}});
                return "Renew"
            }
        },


       
        //Required for authentification under AWSSignature. Pass path and url and request will be sent
        async sign_request(ctx){

            

            var customerID = ctx.request.body.customerID

            var serverCustData = await axios.post(serverIP+"server-connection/get_server_data",JSON.stringify({ customerID : customerID, targetServerIP : serverIP}),{headers:{"Content-Type":"application/json"}});
            
            var refinedServerCustData = serverCustData.data.data.serverConnections[0]

            var customerServerIP = refinedServerCustData.databaseUrl

            var personalDataActive = await axios.post(customerServerIP+"server-connection/check_personal_data_expiry",JSON.stringify({ customerID : customerID}),{headers:{"Content-Type":"application/json"}});

            if (personalDataActive.data == "Active"){


                var res = await axios.post(customerServerIP+"server-connection/get_tokens",JSON.stringify({ customerID : customerID}),{headers:{"Content-Type":"application/json"}});

                
                var access_token = res.data
                
                var access_token_decrypt = await axios.post(customerServerIP+"server-connection/decrypt_data",JSON.stringify({message : access_token}),{headers:{"Content-Type":"application/json"}});
                

                var access_token_decrypt_temp = access_token_decrypt.data
                

                var serverData = await axios.post(serverIP+"server-connection/get_server_data",JSON.stringify({ customerID : "001", targetServerIP : serverIP}),{headers:{"Content-Type":"application/json"}});
                
                var refinedServerData = serverData.data.data.serverConnections[0]
                
                var awsSK = await axios.post(customerServerIP+"server-connection/decrypt_data",JSON.stringify({message : refinedServerData.awsSecretKey}),{headers:{"Content-Type":"application/json"}});
                
                var awsAK = await axios.post(customerServerIP+"server-connection/decrypt_data",JSON.stringify({message : refinedServerData.awsAccessKey}),{headers:{"Content-Type":"application/json"}});
                
                var awsSKFinal = awsSK.data
                
                var awsAKFinal = awsAK.data

                var finalserverCustData = await axios.post(customerServerIP+"server-connection/get_server_data",JSON.stringify({ customerID : customerID, targetServerIP : customerServerIP}),{headers:{"Content-Type":"application/json"}});
            
                var finalrefinedServerCustData = finalserverCustData.data.data.serverConnections[0]
    
                
                
                
                var access_email_decrypt = await axios.post(customerServerIP+"server-connection/decrypt_data",JSON.stringify({message : finalrefinedServerCustData.admin_email}),{headers:{"Content-Type":"application/json"}});
        
                var path = ctx.request.body.path
                var url = ctx.request.body.url

                const response = await axios(aws4.sign({
                    service: 'execute-api',
                    region: awsRegion,
                    method: 'GET',
                    host:  baseuri,
                    path: path,
                    url: url,      
                    // url: 'https://na.business-api.amazon.com/products/2020-08-26/products/B0722L14L3?productRegion=US&locale=en_US&facets=OFFERS,IMAGES&quantity=10&shippingPostalCode=98121',
                    headers: {
                        'x-amz-access-token': access_token_decrypt_temp, //customer specific
                        'x-amz-user-email': access_email_decrypt.data, //customer specific
                        'Content-Type': 'application/x-www-form-urlencoded',     
                    }
                    }, {
                        secretAccessKey: awsSKFinal,
                        accessKeyId: awsAKFinal
                    })).catch(function (error){
                        console.log('Error ' + error)
                        if (error.response){
            
                            //do something
            
                            console.log('Error response:  ' + error.response)
                            return error.response
                            
                        }else if(error.request){
                            
                            //do something else
            
                            console.log('Error request:  ' + error.request)
                            return error.request
                            
                        }else if(error.message){
                            
                            //do something other than the other two
                            
                            console.log('Error message:  ' + error.message)
                            return error.message
            
            
                        }
                    })

                return response.data
            }

            else{
                return "renew"
            }


        },


        async create_order(ctx){

            var customerID = ctx.request.body.customerID


            //should parse cart or order
            //order should include goaltype and quantity 
            var orderId = ctx.request.body.orderId

            var serverCustData = await axios.post(serverIP+"server-connection/get_server_data",JSON.stringify({ customerID : customerID, targetServerIP : serverIP}),{headers:{"Content-Type":"application/json"}});
            
            var refinedServerCustData = serverCustData.data.data.serverConnections[0]

            var customerServerIP = refinedServerCustData.databaseUrl



            var personalDataActive = await axios.post(customerServerIP+"server-connection/check_personal_data_expiry",JSON.stringify({ customerID : customerID}),{headers:{"Content-Type":"application/json"}});


            if (personalDataActive.data == "Active"){


                const graphqlResponse = await axios({
                    method: "post",
                    url: customerServerIP+"graphql",
                    headers: {'Content-Type': 'application/json'},
                    data: {
                        query: `query{
                            orders(where:{id:"`+orderId+`"}) {
                                orderStatus
                                cart{id, cart_items{id, quantity, campaignRequirement{id, campaign{id, organization{name},billingAddress{houseNo,state,street,unitNo,line,country,city,zipCode},shippingAddressId{houseNo,state,street,unitNo,line,country,city,zipCode}},product{asin}}}}
                              }
                            }`, 
                    }
                        
                }).catch(function (error) {
                    console.log('Error ' + error)
                    if (error.response){
    
                        //do something
        
                        console.log('Error response:  ' + error.response)
                        return error.response
                        
                    }else if(error.request){
                        
                        //do something else
        
                        console.log('Error request:  ' + error.request)
                        return error.request
                        
                    }else if(error.message){
                        
                        //do something other than the other two
                        
                        console.log('Error message:  ' + error.message)
                        return error.message
        
        
                    }
                })
    
    
                
                var responseData = graphqlResponse.data.data.orders[0]
                // console.log(responseData)
    
                var orderStatus = responseData.orderStatus
    
    
                var ordernumbers = []
                var unique_campaignId = [];
                var orderData = [];
                for (var i = 0; i < responseData.cart.cart_items.length; i++) {
                    var unique = responseData.cart.cart_items[i].campaignRequirement.campaign.id;
                    var match = false;
                    for (var j = 0; j < unique_campaignId.length; j++) {
                        if (unique == unique_campaignId[j]) {
                        match = true;
                        }
                    }
                    if (!match) {
                        unique_campaignId.push(responseData.cart.cart_items[i].campaignRequirement.campaign.id);
                    }
                };
    
                var serverData = await axios.post(serverIP+"server-connection/get_server_data",JSON.stringify({ customerID : "001", targetServerIP : serverIP}),{headers:{"Content-Type":"application/json"}});
                
                var refinedServerData = serverData.data.data.serverConnections[0]
                
               
    
                var finalserverCustData = await axios.post(customerServerIP+"server-connection/get_server_data",JSON.stringify({ customerID : customerID, targetServerIP : customerServerIP}),{headers:{"Content-Type":"application/json"}});
            
                var finalrefinedServerCustData = serverCustData.data.data.serverConnections[0]
                
    
    
                var custEmail = await axios.post(customerServerIP+"server-connection/decrypt_data",JSON.stringify({message : finalrefinedServerCustData.admin_email}),{headers:{"Content-Type":"application/json"}});
    
                var punchoutUrl = await axios.post(customerServerIP+"server-connection/decrypt_data",JSON.stringify({message : finalrefinedServerCustData.punchoutUrl}),{headers:{"Content-Type":"application/json"}});
    
                var identity = await axios.post(customerServerIP+"server-connection/decrypt_data",JSON.stringify({message : finalrefinedServerCustData.Identity}),{headers:{"Content-Type":"application/json"}});
                
                var sharedSecret = await axios.post(customerServerIP+"server-connection/decrypt_data",JSON.stringify({message : finalrefinedServerCustData.sharedSecret}),{headers:{"Content-Type":"application/json"}});
                    
               
                var tempdeploymentMode = finalrefinedServerCustData.deploymentMode
    
                var deploymentMode = ''
    
                if (tempdeploymentMode.data==true){
                    deploymentMode = "production"
                }
                else{
                    deploymentMode = "test"
                }
                
               
               
                for (var k = 0; k < unique_campaignId.length; k++) {   
    
                    var r = (Math.random() + 1).toString(36).substring(2);
                    // console.log("random", r);
                    var date = new Date();
                    var dateString = date.toISOString();
                    let payloadID = dateString + r 
    
                    var orderXML = '';
                    orderXML += `<?xml version="1.0" encoding="utf-8"?>
                    <cXML version="1.2.007" payloadID="`+payloadID+`" timestamp="`+dateString+`" xml:lang="en-US">
                        <Header>
                            <From>
                                <Credential domain="NetworkID">
                                    <Identity>`+identity.data+`</Identity>
                                </Credential>
                            </From>
                            <To>
                                <Credential domain="NetworkID">
                                    <Identity>Amazon</Identity>
                                </Credential>
                            </To>
                            <Sender>
                                <Credential domain="NetworkID">
                                    <Identity>`+identity.data+`</Identity>
                                    <SharedSecret>`+sharedSecret.data+`</SharedSecret>
                                </Credential>
                                <UserAgent>fm</UserAgent>
                            </Sender>
                        </Header>
                        <Request deploymentMode="`+ deploymentMode +`">
                            <OrderRequest>
                                <OrderRequestHeader orderID="`+r+`" orderDate="`+dateString+`" orderType="regular" type="new">
                                    <Total>
                                        <Money currency="USD">142.00</Money>
                                    </Total>
                                    <ShipTo>
                                        <Address isoCountryCode="US">
                                            <Name xml:lang="en-US">Test User</Name>
                                            <PostalAddress name="default">
                                                <DeliverTo>Test User</DeliverTo>
                                                <Street>`+responseData.cart.cart_items[k].campaignRequirement.campaign.shippingAddressId.houseNo+` `+responseData.cart.cart_items[k].campaignRequirement.campaign.shippingAddressId.street+`</Street>
                                                <City>`+responseData.cart.cart_items[k].campaignRequirement.campaign.shippingAddressId.city+`</City>
                                                <State>`+responseData.cart.cart_items[k].campaignRequirement.campaign.shippingAddressId.state+`</State>
                                                <PostalCode>`+responseData.cart.cart_items[k].campaignRequirement.campaign.shippingAddressId.zipCode+`</PostalCode>
                                                <Country isoCountryCode="US">US</Country>
                                            </PostalAddress>
                                            <Email preferredLang="en-US">`+custEmail.data+`</Email>
                                        </Address>
                                    </ShipTo>
                                    <BillTo>
                                        <Address isoCountryCode="US">
                                            <Name xml:lang="en-US">Test User</Name>
                                            <PostalAddress name="default">
                                                <Street>`+responseData.cart.cart_items[k].campaignRequirement.campaign.billingAddress.houseNo+` `+responseData.cart.cart_items[k].campaignRequirement.campaign.shippingAddressId.street+`</Street>
                                                <City>`+responseData.cart.cart_items[k].campaignRequirement.campaign.billingAddress.city+`</City>
                                                <State>`+responseData.cart.cart_items[k].campaignRequirement.campaign.billingAddress.state+`</State>
                                                <PostalCode>`+responseData.cart.cart_items[k].campaignRequirement.campaign.billingAddress.zipCode+`</PostalCode>
                                                <Country isoCountryCode="US">US</Country>
                                            </PostalAddress>
                                            <Email preferredLang="en-US">`+custEmail.data+`</Email>
                                        </Address>
                                    </BillTo>
                                </OrderRequestHeader>
                                `
                                ;
                    var m = 0;
                    for (var l = 0; l < responseData.cart.cart_items.length; l++) {  // items loop
                        if(responseData.cart.cart_items[l].campaignRequirement.campaign.id == unique_campaignId[k]){ 
                            var productAsin = responseData.cart.cart_items[l].campaignRequirement.product.asin;
                            var m = m + 1;
                            
                            
                            var itemQuantity = responseData.cart.cart_items[l].quantity
              
                            
                            var asinParsing = qs.stringify({ 
                                asin : productAsin,
                                customerID : customerID
                            })
    
                            const getProductDetails = await axios({
                                method: "post",
                                url: customerServerIP+"product/get_product_by_asin",
                                data: asinParsing,
                            }).catch(function (error) {
                                console.log('Error ' + error)
                                if (error.response){
    
                                    //do something
                    
                                    console.log('Error response:  ' + error.response)
                                    return error.response
                                    
                                }else if(error.request){
                                    
                                    //do something else
                    
                                    console.log('Error request:  ' + error.request)
                                    return error.request
                                    
                                }else if(error.message){
                                    
                                    //do something other than the other two
                                    
                                    console.log('Error message:  ' + error.message)
                                    return error.message
                    
                    
                                }
                            })
    
                          
    
                            var itemTotal = getProductDetails.data.includedDataTypes.OFFERS[0].price.value.amount
                            var offerID = getProductDetails.data.includedDataTypes.OFFERS[0].offerId
                            
                            var itemTitle = getProductDetails.data.title
                          
    
    
    
    
                            orderXML += 
                            `<ItemOut quantity="`+itemQuantity+`" lineNumber="`+(m)+`">
                                <ItemID>
                                    <SupplierPartID>`+productAsin+`</SupplierPartID>
                                </ItemID>
                                <ItemDetail>
                                    <UnitPrice>
                                        <Money currency="USD">`+itemTotal+`</Money>
                                    </UnitPrice>
                                    <Description xml:lang="en-US">`+itemTitle+`</Description>
                                    <UnitOfMeasure>EA</UnitOfMeasure>
                                </ItemDetail>
                            </ItemOut>
                            `;
                        }
                    }
                    orderXML += `</OrderRequest>
                        </Request>
                    </cXML>`;
    
                    
    
    
                    const sendOrder = await axios.post(
                        punchoutUrl.data, 
                        orderXML, 
                        {
                            headers: { 
                                'Content-Type' : 'text/plain' 
                            }
                        }
                    ).then(response => {
                        return response.data
                    
                    })
                    .catch((error) => {
                        return error
                    });
        
                    
    
                    ordernumbers.push(r)
    
                }
    
             
                return(ordernumbers)
            }
            else{
                return "renew"
            }


            
            


            
        }

    
    
   
    
};
