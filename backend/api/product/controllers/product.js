'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */



const axios = require('axios');
const qs = require('qs')
const serverIP = "https://demo-api.managedorg.io/"
const baseuri = "na.business-api.amazon.com"      
const absolute_product_path_keyword = "/products/2020-08-26/products/?"
const absolute_product_path_asin = "/products/2020-08-26/products/"

const { sanitizeEntity } = require('strapi-utils');




module.exports = {

    async get_product_by_keyword(ctx){

        var customerID = ctx.request.body.customerID
        var keyword = ctx.request.body.keyword
        var queryPath = "productRegion=US&locale=en_US&&facets=OFFERS,IMAGES&keywords="+keyword

        var path = absolute_product_path_keyword + queryPath
        var url = 'https://' + baseuri + absolute_product_path_keyword + queryPath

        var data = qs.stringify({ 
            path : path,
            url : url,
            customerID : customerID
        })

        const response = await axios({
            method: 'post',
            url: serverIP+"server-connection/sign_request",
            data: data,
            })
             .catch(function (error) {
                console.log('Error ' + error)
                if (error.response){

                    console.log('Error response:  ' + error.response)
                    return error.response
                    
                }else if(error.request){

                    console.log('Error request:  ' + error.request)
                    return error.request
                    
                }else if(error.message){
                    
                    console.log('Error message:  ' + error.message)
                    return error.message
    
                }

        })

        return response.data
        
        
    },

    async get_product_by_asin(ctx){

        var customerID = ctx.request.body.customerID
        var asin = ctx.request.body.asin
        var queryPath = "productRegion=US&locale=en_US&&facets=OFFERS,IMAGES"
        // var queryPath = "productRegion=US&locale=en_US&&facets=OFFERS,IMAGES,TITLE,URL,PRODUCTDETAILS"
        


        var path = absolute_product_path_asin + asin + '?' + queryPath
        
        var url = 'https://' + baseuri + absolute_product_path_asin + asin + '?' + queryPath      

        var data = qs.stringify({ 
            path : path,
            url : url,
            customerID : customerID
        })

        const response = await axios({
            method: 'post',
            url: serverIP+"server-connection/sign_request",
            data: data,
            })
             .catch(function (error) {
                console.log('Error ' + error)
                if (error.response){

                    console.log('Error response:  ' + error.response)
                    return error.response
                    
                }else if(error.request){

                    console.log('Error request:  ' + error.request)
                    return error.request
                    
                }else if(error.message){
                    
                    console.log('Error message:  ' + error.message)
                    return error.message
    
                }

        })

        return response.data
    
        
    },


    async get_product_by_asin_title(ctx){

        var customerID = ctx.request.body.customerID

        var asin = ctx.request.body.asin

        var data = qs.stringify({
            asin : asin, 
            customerID : customerID 

        })
        

        const response = await axios({
            method: 'post',
            url: serverIP+"product/get_product_by_asin",
            data: data,
            })
             .catch(function (error) {
                console.log('Error ' + error)
                if (error.response){

                    console.log('Error response:  ' + error.response)
                    return error.response
                    
                }else if(error.request){

                    console.log('Error request:  ' + error.request)
                    return error.request
                    
                }else if(error.message){
                    
                    console.log('Error message:  ' + error.message)
                    return error.message
    
                }

        })

        return response.data.title
    
        
    },

    async add_product_by_asin(ctx){
        const addProduct = await strapi.query('product').create({
            asin : ctx.request.body.asin
        })
        if (ctx.request.body.quantity != undefined){
            const addProductGoalQuantity = await strapi.query('goal-type').create({
                quantity : ctx.request.body.quantity,
                products : [{_id : addProduct.id}],
                campaigns : [{_id : ctx.request.body.campaignid}],
                description : ctx.request.body.description
            })
            return addProductGoalQuantity
        }
        return addProduct
        
    },

    async soft_delete (ctx){
        const soft_delete = await strapi.query('product').update({_id:ctx.request.body.productID}, { isActive:false});

        return sanitizeEntity(soft_delete,{ model: strapi.query('product').model });
  
    }

};
