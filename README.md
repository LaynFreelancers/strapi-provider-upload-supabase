# Strapi Upload Provider for Supabase storage

## Parameters

- **apiUrl** : [Supabase API Url](https://supabase.io/docs/reference/javascript/initializing)
- **apiKey** : [Supabase API Key](https://supabase.io/docs/reference/javascript/initializing)
- **bucket** : [Supabase storage bucket](https://supabase.io/docs/guides/storage)
- **directory** : [Directory inside Supabase storage bucket](https://supabase.io/docs/guides/storage)
- **options** : [Supabase client additional options](https://supabase.io/docs/reference/javascript/initializing#with-additional-parameters)

## How to use

1. Update config in `./config/plugins.js` with content

```
module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: "strapi-provider-upload-supabase",
      providerOptions: {
        apiUrl: env("SUPABASE_API_URL"),
        apiKey: env("SUPABASE_API_KEY"),
        bucket: env("SUPABASE_BUCKET"),
        directory: env("SUPABASE_DIRECTORY"),
        options: {},
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  // ...
});
```

3. Create `.env` and add to them

```
SUPABASE_API_URL="<Your Supabase url>"
SUPABASE_API_KEY="<Your Supabase api key>"
SUPABASE_BUCKET="strapi-uploads"
SUPABASE_DIRECTORY=""
```

4. Create middleware in `./middlewares.js` with content

```
module.exports = ({ env }) => [
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "img-src": ["'self'", "data:", "blob:", env("SUPABASE_API_URL")],
        },
      },
    },
  },
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];

```

with values obtained from this page:

> https://app.supabase.io/project/<your-project>/settings/api

Parameters `options`, `bucket` and `directory` are optional and you can omit it, they will take the values shown in the example above.
