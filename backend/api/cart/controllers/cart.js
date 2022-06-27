'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = { 
  async soft_delete (ctx) {
    const entry = await strapi.query('cart').update({_id:ctx.request.body.cartID}, { isActive:false});
    return entry;
  },
  async save_cart (ctx) {
    const entry = await strapi.query('cart').create({
      isActive: ctx.request.body.isActive,
      donor: [ctx.request.body.donor],
      campaign: [ctx.request.body.campaign],
      taxAmount: ctx.request.body.taxAmount,
      shippingCharge: ctx.request.body.shippingCharge,
      handlingCharge: ctx.request.body.handlingCharge,
      discount: ctx.request.body.discount,
      totalProductAmount: ctx.request.body.totalProductAmount,
      totalAmount: ctx.request.body.totalAmount
    //}, { transacting });
    });

    if(entry.id != null){
      var items = ctx.request.body.cart_items;
      console.log(items);
      for(var i=0;i<items.length;i++){
        console.log(i);
        var entryItem = await strapi.query('cart-item').create({
          isActive: items[i].isActive,
          cart: [entry.id],
          campaignRequirement: [items[i].campaignRequirement],
          quantity: items[i].quantity,
          productRate: items[i].productRate,
          productAmount: items[i].productAmount
        });
      }
    }

    return entry;
  },

  async createCheckoutSession(ctx) {
    const stripe = require('stripe')('sk_test_51KjUWZKtq3efRhNUYmSwRBAHTZ35ohVhbZSldBNdoSwskWSW6kjPWwDBDVFme8gZQSuEMRbHVhBYhbhAVJCS8cj200ol2ylLFl');

    const session = await stripe.checkout.sessions.create({
      success_url: 'https://example.com/success.html',
      cancel_url: 'https://example.com/cancel.html',
      line_items: [
        //{price: 'price_H5ggYwtDq4fbrJ', quantity: 2}, 
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'T-shirt',
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
    });

    console.log(session);
    return session;
  }
    
};
