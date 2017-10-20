// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  apiHost: 'http://192.168.0.100:8080',
  proxyHost: 'http://sample2.forwarder-service.munamana.com',
  production: false,
};
