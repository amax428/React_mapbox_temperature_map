# React_mapbox_temperature_map
Project structure
- src/data
sample data file in json
- TemperatureMap.js
final module for drawing temperature map
- Heatmap.js
normal heatmap(density map) with given data
- Heatmap1.js
use normal heatmap api but regenerate data points from given json data to avoid density map feature
- Heatmap2.js
the same with Heatmap2.js but using detailed zoom level
- Heatmap3.js
case for using normal heatmap but show circles on the higher zoom level
- utils.js
converting data json into readable temperature value data

The other detailed instructions are commented on each line of the code

How to run:
npm install followed by npm run start

If you want to test with other json file, just put it inside data folder and import it in TemperatureMap.js