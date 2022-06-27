module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'mongoose',
      // settings: {
      //   host: env('DATABASE_HOST', 'Cluster0.ytzt1.mongodb.net'),
      //   srv: env.bool('DATABASE_SRV', true),
      //   port: env.int('DATABASE_PORT', 27017),
      //   database: env('DATABASE_NAME', 'Cluster0'),
      //   username: env('DATABASE_USERNAME', 'kiran'),
      //   password: env('DATABASE_PASSWORD', 'test123'),
      // },
      // options: {
      //   authenticationDatabase: env('AUTHENTICATION_DATABASE', null),
      //   ssl: env.bool('DATABASE_SSL', true),
      // },
      settings: {
        host: env('DATABASE_HOST', 'managedorg-jp.mlitf.mongodb.net'),
        srv: env.bool('DATABASE_SRV', true),
        port: env.int('DATABASE_PORT', 27017),
        database: env('DATABASE_NAME', 'KiranTest5'),
         username: env('DATABASE_USERNAME', 'managedorg_jp_user1'),
         password: env('DATABASE_PASSWORD', 'Digits@0510'),
      },
      options: {
        authenticationDatabase: env('AUTHENTICATION_DATABASE', null),
        ssl: env.bool('DATABASE_SSL', true),
      },
    },
  },
});

