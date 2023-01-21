// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  embedServiceUrl: "",
  uploadImageHostname: "node.deso.org",
  verificationEndpointHostname: "https://api.love4src.com",
  uploadVideoHostname: "node.deso.org",
  identityURL: "https://identity.love4src.com",
  supportEmail: "",
  dd: {
    apiKey: "DCEB26AC8BF47F1D7B4D87440EDCA6",
    jsPath: "https://bitclout.com/tags.js",
    ajaxListenerPath: "love4src.com/api",
    endpoint: "https://love4src.com/js/",
  },
  amplitude: {
    key: '',
    domain: '',
  },
  node: {
    id: 8,
    name: 'Love4src',
    url: 'https://api.love4src.com',
    logoAssetDir: '/assets/img/'
  },
  megaswapURL: 'https://megaswap.xyz',
};
