module.exports = ({ config }) => {
  const iosMapsKey = process.env.GOOGLE_MAPS_IOS_API_KEY;
  const androidMapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;

  return {
    ...config,
    ios: {
      ...config.ios,
      config: {
        ...(config.ios?.config || {}),
        ...(iosMapsKey ? { googleMapsApiKey: iosMapsKey } : {}),
      },
    },
    android: {
      ...config.android,
      config: {
        ...(config.android?.config || {}),
        googleMaps: {
          ...(config.android?.config?.googleMaps || {}),
          ...(androidMapsKey ? { apiKey: androidMapsKey } : {}),
        },
      },
    },
  };
};
