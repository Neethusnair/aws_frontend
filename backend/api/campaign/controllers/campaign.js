'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const serverIP = "https://demo-api.managedorg.io/"
//const serverIP = "http://localhost:1337/"


module.exports = {

    async soft_delete (ctx){
      const entry = await strapi.query('campaign').update({_id:ctx.request.body.campaignID}, { isActive:false});
      return entry;

    },
    
    async getCampaignRequirementsAndDonationDetails(ctx){
      var targetServerIP = ctx.request.body.targetServerIP

      var campaignId = ctx.request.body.campaignId;
      let queryT = `query campaigns {
          campaigns(
            where: {
              id: "${campaignId}"
              goalTypes: { description:"donorDriver" }
            }
          ) {
            id
            campaignName
            campaignDescription
            startDate
            endDate
            Location
            isPublished
            isFeatured
            campaignPictures {
              id
              name
            }
            goalTypes(where: { IsActive: true }) {
              id
              description
            }
            campaign_requirements(where: { isActive: true }) {
              id
              quantity
              product {
                id
                productName
                productDescription
                asin
                itemImageUrl
              }
            }
            shippingAddressId {
              id
              houseNo
              unitNo
              street
              line
              country
              state
              city
              zipCode
            }
          }
          carts(
            where: {
              isActive: true
              campaign: { id: "${campaignId}", goalTypes: { description:"donorDriver" }, isActive: true }
            }
          ) {
            donor {
              firstName
              email
            }
            cart_items {
              quantity
              campaignRequirement{
                  id
                  product{
                      productName
                  }
              }
              id
            }
            cartStage
          }
        }
        `;
      
      require('isomorphic-fetch');

      const response = await fetch(targetServerIP+'graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              query: queryT
          }),
      });
      const entry = await response.json();
      return entry.data;
    },


    async getActiveCampaignsAndRequirements(ctx){
      var targetServerIP = ctx.request.body.targetServerIP

      var sort = ctx.request.body.sort;
      console.log('sort='+sort);
      let queryT = `query campaigns{
            campaigns(where:{isActive:true, goalTypes:{description:"donorDriver"}}, sort: "`+sort+`"){
                id
                campaignName
                campaignDescription
                startDate
                endDate
                Location
                isPublished
                isFeatured 
                campaignPictures {
                    id
                    name
                }
                goalTypes(where:{IsActive:true}){
                    id
                    description
                }
                campaign_requirements(where:{isActive:true}){
                    id
                    quantity
                    product{
                        id
                        productName
                        productDescription
                        asin
                        itemImageUrl
                    }
                }
                shippingAddressId{
                    id
                    houseNo
                    unitNo
                    street
                    line
                    country
                    state
                    city
                    zipCode
                }
            }
        }`;
        
        require('isomorphic-fetch');

        const response = await fetch(targetServerIP+'graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                query: queryT
            }),
        });
        const entry = await response.json();
        return entry.data;
        
    },

    async getFundraisers(ctx){
      var targetServerIP = ctx.request.body.targetServerIP

        // local "goalTypes":["628518c28c9e316220776a4d"] id:"6273d300c8a00c5a48811ec8"
        let queryT = `query campaigns{
            campaigns(where:{isActive:true,goalTypes:{description:"fundRaiser"}}){
                id
                campaignName
                campaignDescription
                startDate
                endDate
                goalCurrent
                goalAmount
                Location
            }
        }`;

        require('isomorphic-fetch');

        const response = await fetch(targetServerIP+'graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                query: queryT
            }),
        });
        const entry = await response.json();
        return entry.data;
    }

};
