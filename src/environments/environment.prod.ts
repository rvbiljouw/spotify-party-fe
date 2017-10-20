const tenant = window.location.host.split('.')[0];

export const environment = {
  tenant: tenant,
  apiHost: `http://${tenant}.panel-service.munamana.com`,
  proxyHost: `http://${tenant}.forwarder-service.munamana.com`,
  production: true,
};
