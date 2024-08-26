# TravelCTM

## Tech test for TravelCTM

This repo contains two main directories:

-   `\backend` contains the NodeJs environment
-   `\frontend` the intent is to contain the ReactJs environment (empty for now)

## Install NPM packages

-   Using your chosen CLI, navigate to the `\backend` directory.
-   Run `npm install` to download the packages found in the `package.json` file (needed for the app to run).
-   -   This creates a `\node_modules` dir in the `\backend` dir.

## Run the app

-   From here you should run the command `npm run dev` in your CLI.
-   -   You will see some worker clusters start up (for load balancing/concurrency purposes).
-   If all is good so far, you can now run `localhost:3000` in your browser; you will see a generic message telling you to choose a route.

## Endpoints / Routes

-   These routes can be found in `\routes\index.js`; they are purposely lightweight to emulate Node/React endpoints for the purpose of this tech test.
-   Some of the url endpoints (used with `localhost:3000`) are: `/cities`, `/airlines`, `/flights`.
-   -   These lightweight endpoints were built to showcase some NoSQL syntax; the end goal was to use them in a ReactJs / form-page environment.
-   The main endpoint for the purpose of this test is `/trip/:city1?/:city2?/:persons?`.
-   -   This `/trip` endpoint accepts optional parameters with checks inside to halt unneccessary processing.
-   -   Currently I've only set up data for `:city1` (a.k.a. departure city) to equal `London`, but the `:city2` (destination city) can be one of either `Sydney`, `Vancouver`, `Johannesburg`, `Toronto`, `Manchester`.
-   -   The `:persons` parameter should be numeric, and is used to calculate the CO2 emissions between cities.
-   -   I've added an arbitrary value (115g per person per km) for the emissions calculation, but this is loosely based on a Boeing 737-400 (thanks Google).
-   For example, a URL for the `/trip` endpoint could look like so: `localhost:3000/trip/London/Vancouver/2`.
-   I would prefer to use GUIDs instead of city strings (for security / pseudo-encryption purposes), but for the purpose of this test - it's functional. (Of course this caveat is ignored when using the verb `POST` - hence the method check inside the endpoint code)

## Frontend / ReactJs / UI

-   Currently there is no React/UI frontend code, so all valid results will appear as json in the browser window (if an error occurrs, use: `/errLogs` to see reasons -> currenty limited to 10; sorted by date descending).
-   -   Ideally these results should be consumed and dealt with in the UI frontend environment (e.g. ReactJs) - but the large scope of this tech test acted as a deterrent to build IMO.

## Error Logs / Databases

-   If an error has occurred, the application logs it in MongoDB, and returns a error string to the browser.
-   Redis is used as a cache wrapper for all outgoing queries and its' relative datasets - to assist with speed/data retrieval.

## Configuration

-   The environment config files can be found in the `\config` directory. You would ideally add these files to the `.gitignore` file, but for the purposes of this test, I've allowed them. I plan on making this repository `private` after the tech test assessment.
