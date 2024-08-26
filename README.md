# TravelCTM

Tech test for TravelCTM

This repo contains two main directories:

-   `\backend` contains the NodeJs environment
-   `\frontend` the intent is to contain the ReactJs environment (empty for now)

To get the npm pagackes installed:

-   Navigate to the `\backend` directory.
-   Using your chosen CLI, run `npm install` to assign the packages found in the `package.json` file.
-   -   This creates a `\node_modules` dir in the `\backend` dir.
-   From here you should run the command `npm run dev` in your CLI.
-   -   You will see some worker clusters start up (for load balancing/concurrency purposes).
-   If all is good so far, you can now run `localhost:3000` in your browser; you will see a generic message telling you to choose a route.
-   -   These routes can be found in `\routes\index.js`; they are purposely lightweight to emulate Node/React endpoints for the purpose of this tech test.
-   -   Some of the url endpoints (used with `localhost:3000`) are: `/cities`, `/airlines`, `/flights`.
-   -   The main endpoint for the purpose of this test is `/trip/:city1?/:city2?/:persons?`.
-   -   -   This `/trip` endpoint accepts optional parameters with checks inside to halt unneccessary processing.
-   -   -   Currently I've only set up data for `:city1` (aka departure city) to equal `London`, but the `:city2` (destination city) can be one of either `Sydney`, `Vancouver`, `Johannesburg`, `Toronto`, `Manchester`.
-   -   -   The `:persons` parameter should be numeric, and is used to calculate the CO2 emissions between cities.
-   -   -   I've added an arbitrary value (115g per person per km) for the emissions calculation, but this is loosely based on a Boeing 737-400 (thanks Google).
-   For example, a URL for the `/trip` endpoint could look like so: `localhost:3000/trip/London/Vancouver/2`.
-   Currently there is no React/UI frontend code, so all valid results will appear as json in the browser window (use: `/errLogs` to see reasons -> currenty limited to 10).
-   -   Ideally these results should be consumed and dealt with in the UI frontend environment - but the large scope of this tech test was a deterrent IMO.
-   If an error has occurred, the application logs it in MongoDB, and returns a error string to the browser.
-   Redis is used as a cache wrapper for all outgoing queries and its' relative datasets - to assist with speed/data retrieval.
