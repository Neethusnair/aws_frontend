'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */

//const fs = require("fs");    
const {
    countries
} = require("../../data/data");

const isFirstRun = async () => {
    const pluginStore = strapi.store({
      environment: strapi.config.environment,
      type: "type",
      name: "setup"
    });
    const initHasRun = await pluginStore.get({
      key: "initHasRun"
    });
    await pluginStore.set({
      key: "initHasRun",
      value: true
    });
    return !initHasRun;
};

const createSeedData = async () => {
    // const handleFiles = (data) => {
      
    //       var file = files.find(x => x.includes(data.slug));
    //       file = `./data/uploads/${file}`;
      
    //       const size = getFilesizeInBytes(file);
    //       const array = file.split(".");
    //       const ext = array[array.length - 1]
    //       const mimeType = `image/.${ext}`;
    //       const image = {
    //         path: file,
    //         name: `${data.slug}.${ext}`,
    //         size,
    //         type: mimeType
    //       };
    //       return image
    // }

    // const countriesPromises = countries.map(({
    //     ...rest
    // }) => {
    //     return strapi.services.country.create({
    //         ...rest
    //     });
    // });

    // await Promise.all(countriesPromises);
};



module.exports = async () => {
    const shouldSetDefaultPermissions = await isFirstRun();
    if (shouldSetDefaultPermissions) {
      try {
        console.log("Setting up your starter...");
        // const files = fs.readdirSync(`./data/uploads`);
        // await setDefaultPermissions();
        //await createSeedData(files);
        await createSeedData();
        console.log("Ready to go");
      } catch (e) {
        console.log(e);
      }
    }
    const params = {
      username: process.env.ADMIN_USER || 'admin@managedorg.io',
      password: process.env.ADMIN_PASS || 'Managedorg@123',
      firstname: process.env.ADMIN_USER || 'Managedorg',
      lastname: process.env.ADMIN_USER || 'Admin',
      email: process.env.DEV_EMAIL || 'admin@managedorg.io',
      blocked: false,
      isActive: true,
    };
    //Check if any account exists.
    const admins = await strapi.query('user', 'admin').find();

    if (admins.length === 0) {
     try {
        let tempPass = params.password;
        let verifyRole = await strapi.query('role', 'admin').findOne({ code: 'strapi-super-admin' });
        if (!verifyRole) {
        verifyRole = await strapi.query('role', 'admin').create({
          name: 'Super Admin',
          code: 'strapi-super-admin',
          description: 'Super Admins can access and manage all features and settings.',
         });
        }
        params.roles = [verifyRole.id];
        params.password = await strapi.admin.services.auth.hashPassword(params.password);
        await strapi.query('user', 'admin').create({
          ...params,
        });
        strapi.log.info('Admin account was successfully created.');
        strapi.log.info(`Email: ${params.email}`);
        strapi.log.info(`Password: ${tempPass}`);
      } catch (error) {
        strapi.log.error(`Couldn't create Admin account during bootstrap: `, error);
      }

      // FOR CREATING END USER
      // var userData = await strapi.plugins['users-permissions'].services.user.add({
      //   username:ctx.request.body.email,
      //   email: ctx.request.body.email,
      //   password: ctx.request.body.number,
      //   names: [nameData.id],
      //   addon_email: emailData.id,
      //   addon_phone: phoneData.id,
      //   individuals: [individualData.id]
      // });
    }
};