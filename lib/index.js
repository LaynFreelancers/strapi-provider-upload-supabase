"use strict";

const { createClient } = require("@supabase/supabase-js");

const getKey = ({ directory, file }) => {
  const path = file.path ? `${file.path}/` : "";
  const fname = file.name.replace(/\.[^/.]+$/, "");

  const filename = `${path}${fname}_${file.hash}${file.ext}`;

  if (!directory) return filename;

  return `${directory}/${filename}`.replace(/^\//g, "");
};

module.exports = {
  provider: "supabase",
  name: "Supabase Storage",
  auth: {
    apiUrl: {
      label:
        "Supabase API Url (e.g. 'https://zokyprbhquvvrleedkkk.supabase.co')",
      type: "text",
    },
    apiKey: {
      label:
        "Supabase API Key (e.g. 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpBNWJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6NOYyNjk1NzgzOCwiZXhwIjoxOTQUNTMzODM4fQ.tfr1M8tg6-ynD-qXkODRXX-do1qWNwQQUt1zQp8sFIc')",
      type: "text",
    },
    bucket: {
      label: "Supabase storage bucket (e.g. 'my-bucket')",
      type: "text",
    },
    directory: {
      label: "Directory inside Supabase storage bucket (e.g. '')",
      type: "text",
    },
    options: {
      label: "Supabase client additional options",
      type: "object",
    },
  },
  init: (config) => {
    const apiUrl = config.apiUrl;
    const apiKey = config.apiKey;

    const bucket = config.bucket || "strapi-uploads";
    const options = config.options || undefined;
    let directory = (config.directory || "").replace(/(^\/)|(\/$)/g, "");

    const year = new Date().getFullYear().toString();
    const month = (new Date().getMonth() + 1).toString();

    if (!directory && options?.dynamic_directory) {
      directory = `${year}/${month}`;
    }

    delete options?.dynamic_directory;

    const supabase = createClient(apiUrl, apiKey, options);

    return {
      upload: (file) => {
        return new Promise((resolve, reject) => {
          file.hash = new Date().getTime();

          const fileBuffer = getKey({ directory, file });

          supabase.storage
              .from(bucket)
              .upload(
                  fileBuffer,
                  Buffer.from(file.buffer, "binary"),
                  {
                    cacheControl: "public, max-age=31536000, immutable",
                    upsert: true,
                    contentType: file.mime,
                  }
              )
              .then(({ error: uploadError }) => {
                if (uploadError) return reject(uploadError);

                const { publicURL, error: getPublicUrlError } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(getKey({ directory, file }));
                if (getPublicUrlError) return reject(getPublicUrlError);

                file.url = publicURL;
                resolve();
              });
        })
      },
      uploadStream: (file) => {
        return new Promise((resolve, reject) => {
          file.hash = new Date().getTime();

          const fileBuffer = getKey({ directory, file });

          supabase.storage
              .from(bucket)
              .upload(
                  fileBuffer,
                  Buffer.from(file.buffer, "binary"),
                  {
                    cacheControl: "public, max-age=31536000, immutable",
                    upsert: true,
                    contentType: file.mime,
                  }
              )
              .then(({ error: uploadError }) => {
                if (uploadError) return reject(uploadError);

                const { publicURL, error: getPublicUrlError } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(getKey({ directory, file }));
                if (getPublicUrlError) return reject(getPublicUrlError);

                file.url = publicURL;
                resolve();
              });
        })
      },
      delete: (file, customParams = {}) => {
        return new Promise((resolve, reject) => {
          supabase.storage
              .from(bucket)
              .remove([getKey({ directory, file })])
              .then(({ error }) => {
                if (error) return reject(error);
                resolve();
              });
        })
      },
    };
  },
};
