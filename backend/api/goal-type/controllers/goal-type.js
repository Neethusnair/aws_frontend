'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

require('isomorphic-fetch');
const axios = require('axios');



module.exports = {

    async product_quantity (ctx){
        
        var goal_quantity = await strapi.query('goal-type').find({
            _id: ctx.request.body.goal_typeID
            
        })
        console.log(goal_quantity[0].quantity);
        

        return goal_quantity[0].quantity;
    },

    async get_goalType_ID(ctx){
        
    var goalName = ctx.request.body.goalName;

    var targetServerIP = ctx.request.body.targetServerIP

      


      const response = await axios({
          method: 'POST',
          url: targetServerIP+'graphql',
          headers: { 'Content-Type': 'application/json' },
          data: {
              query: `query goalTypes{
                goalTypes(where:{description:"`+goalName+`"}){
                    id
                }
            }`
               
          },
      });
      const entry = await response.data.data.goalTypes[0].id;
      return entry;
    
    }






};
