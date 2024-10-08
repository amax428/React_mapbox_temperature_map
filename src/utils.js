export const preprocessTemperatureData = (json) => {
  const temperatureMap = {
    "hot": 50,
    "warm": 20,
    "cold": -30
  };

  // Loop through each feature in the JSON and update the temperature
  json.features.forEach(feature => {
    const temperature = feature.properties.temperature;
    if (temperatureMap.hasOwnProperty(temperature)) {
      feature.properties.temperature = temperatureMap[temperature];
    }
  });

  return json;
}