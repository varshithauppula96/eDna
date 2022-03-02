# edna-app

Web application for users to query, view, and download information from a database of environmental DNA samples. Uses Node.js, with the backend created using Express and the frontend created with Vue.js. The database uses PostgreSQL.

### Learning Node.js
Node.js is an opensource, event-driven Javascript runtime environment that runs javascript code outside of a web browser. The node package manager (NPM) is useful for easily installing Javascript modules that contain useful components. The CLI associated with this project was created as a node.js package called edna-cli, which can be isntalled using an npm install command. Explore more node packages here: https://www.npmjs.com Learn more about node.js at their website: https://nodejs.org/en/about/

### Learning Javascript
New to javascipt? Try starting here: https://javascript.info \
This is also a pretty good reference site: https://www.w3schools.com/jsref/default.asp 

### Learning Vue.js
Vue allows you to easily create versatile, responsive applications. It is based on the component structure. Vue components contain: 1. a template section (html), 2. a script section (javascript), and 3. a style section (css).

Learn the basics at their website: https://vuejs.org/v2/guide/  \
These videos were also extremely helpful for me when learning Vue: https://www.youtube.com/playlist?list=PL4cUxeGkcC9gQcYgjhBoeQH7wiAyZNrYa 

### Learning Express
Express is used for creating the backend server. This is where the application receives a HTTP request from the front end, queries the database based on the request, and sends the data to the frontend. \
Learn more here: https://expressjs.com/en/4x/api.html 

This is the router that's used in this project: https://www.npmjs.com/package/express-promise-router 

### Learning PostgreSQL
PostgreSQL is used to manage the database of environmental DNA information. The Postgres commands in this project are found in the backend router files. Postgres commands can also be run on the eDNA CentOS server (IP: 165.227.126.63) by typing
```
psql edna_db
```
At first, it will likely give you an error since you don't have a postgres acount on the server. To create a user, log in as the postgres user by typing:
```
sudo -i -u postgres
```
Then create a new user by typing the follwing:
```
createuser --interactive --pwprompt your_username_here
```
Follow the prompts, and then try accessing the edna_db database again from our own account.

If it says you don't have permission to access the database, then log in as the postgres user again, and type
```
psql edna_db
```
and then run the following PostgreSQL command:
```
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username_here;
```
Hopefully that should fix it.
* Note: the PostgreSQL commands are case-insensitive

Learn more about PostgreSQL here: https://www.postgresql.org/docs/11/index.html 

#### pgAdmin
pgAdmin is a database management tool similar to Microsoft SQL Server Management Studio. I didn't really use it much, and mostly did queries using the CLI on the CentOS server, but I was able to successfully connect to the database from pgAdmin on my own computer. More info can be found here: https://www.pgadmin.org

#### node-postgres module
Allows interaction with Postgres database from Node.js app. This is used in the src/db/index.js file.
More info here: https://node-postgres.com/guides/async-express 

### eDNA PostgreSQL Database
The eDNA database is a Postgres database hosted on the eDNA CentOS server (IP: 165.227.126.63). There are currently 5 tables in the database: project, site, sample, species, and count. The database_schema PDF file lists the columns and their data types for each of the five tables. Note that the asv column in the species table and the sample_name column in the sample table are blank for all rows. This is intentional, as those columns are only used by the importer in /src/db/migrations/ImportData.py when new data is being imported into the database. Also, the datetimecreated column is blank for the first few entries in each table since that column didn't exist when the first 3 projects of data were imported. However, the datetimecreated column is autofilled for all subsequent inserts with the date & time that the new record in the table is created.

* NOTE: the datetimecreated columns are populated using the Postrges NOW() command, which creates a timestamp based on the current time on the CentOS server (where the db is hosted). The time on the CentOS server seems to be 4 hours ahead of EST for some reason.

#### Adding data to the eDNA database
New data can be added to the database using postgres inserts from pgAdmin or the CLI on the CentOS server. Data can also be imported using ImportData.py in the src/db/migration folder. Using this importer requires the data to be in a very specific format. The details of the files & parameters required for a successful import are described in ImportData.py. The importer can be improved by adding more robust checks for proper parameters and file formats. If necessary, if the importer creates weird data in the db, then the datetimecreated columns in each table can be used to select the data to be deleted (assuming you know when the incorrect data was imported).

### Important File/Directory Descriptions
Most of the files that are changed when adding new features/capabilities are found in the src/components/ and src/routes/ directories, but here are some descriptions of the key parts of this project. 
* vue.config.js: contains webpack configuration settings to determine how webpack interprets the code when compiling
* src/App.vue: the main Vue app, which (indirectly) contains all of the other Vue components
* src/main.js: registers the node modules that Vue needs. Renders the contents of the App.vue file
* src/router.js: frontend router that determines which component is rendered at each path
* src/server/js: the main Express backend file. Registers the modules required by the backend, and starts the backend server
* src/assets/: contains all images
* src/styles: contains the stylesheet to control the styles of all Vue components
    * Note: Currently (as of sept 2020) using the stylesheet instead of the css in the style tags of the individual components causes the Results table to show incorrectly. That needs to be fixed before the style sheet can be used. To use the styles in the stylesheet instead of from the individual components' style tags, uncomment the import line in /src/main.js (around line 18)
* src/components/: contains all of the Vue components. This is where the frontend lives
    * src/components/About.vue: contains content on the About page
    * src/components/Contact.vue: contains content on the Contact page
    * src/components/Body.vue: main content file. contains content on the home page, including the map (Map.vue), search panel (Search.vue), and results section (Results.vue).
* src/db/: contains database interaction files. The only important one is index.js, which contains the credentials necessary to connect to the Postgres database, and allows queries to be made elsewhere in the project. The index.js file also has an "allowable" field which specifies from where the database can be accessed.
    * src/db/migration: contains files I used to import data into the database from csv files. Most of these are very hard coded, and I did some of the imports just using the postgres CLI on the server
    * src/db/data: contains the data files from Nick that were imported into the database
* src/routes/: contains all of the router files. This is where the backend lives
    * src/routes/index.js: registers all of the routes so they'll be used by the backend server

### Running Frontend Development Server (on port 8080)
There is a video (eDNAapp_tutorial.mov) that explains how to run the fronted & backend development servers & get both ready for production, but this is also described within the next few sections here.
From the edna-app directory, run the following:
```
npm run serve
```
The web app will compile and hot-reload at https://edna.bigelow.org:8080 . Hot-realoading works best in Google Chrome, and doesn't always work in other browsers such as Safari.
* Note: The terminal will say "app running at https://edna.bigelow.org", but you need the port number at the end for development, since the publicly available version is running at https://edna.bigelow.org

For development on port XXXX, run:
```
npx vue-cli-service serve --port=XXXX
```
The web app will compile and hot-reload at https://edna.bigelow.org:XXXX (Again, hot-reloading works best in Chrome & doesn't always work in Safari)\
Make sure port XXXX is open in iptables.

#### If you're running into issues the first time trying to run the project, try the following:
```
rm -rf node_modules
npm install
npm update
```

### Running Backend Development Server (on port 3001)
First, make sure the port number in /src/server.js is set to 3001. To ensure that http requests from the frontend are sent to the development backend server, make sure the port number at the end of the base_path variable in /src/components/Body.vue is set to 3001. If you're just doing purely backend work, you can also send http requests to the backend development server using curl commands from any terminal. Such curl commands for each endpoint are listed as comments near the top of each route file in /src/routes. These can be copied and pasted into a terminal to send an HTTP request to the development server. The production backend development server usually is running on port 3000 (this is done using a daemon on the CentOS server called nodeserver.service). You can check the status of the production backend server using the following command on the CentOS server:
```
sudo systemctl status nodeserver
```
To stop the production server you can run the following command. However, you don't have to stop the prod server on port 3000 to run the dev server on port 3001. Both can run simultaneously.
```
sudo systemctl stop nodeserver
```
For backend development, start the backend server using nodemon so it will compile and reload upon file changes. From the edna-app directory, run the following:
```
nodemon src/server.js
```
The backend server will compile and hot-reload on port 3001, assuming the port in src/server.js is set to 3001. \
If you want to run the backend on a different port, change the port in /src/server.js and the number at the end of the base_path field in /src/components/Body.vue. Make sure the new port number is open in iptables on the CentOS server.

### Getting the Frontend Ready for Production
1. Make sure the port number at the end of the base_path in /src/components/Body.vue is set to 3000 so that http requests from the web app are sent to the production backend server running on port 3000.
2. From the edna-app directory, run the following:
```
npm run build
```
3. When the build is finished, copy the contents of the edna-app/dist/ directory into the /var/www/html/ directory so Apache can do its thing and make your changes publicly available at https://edna.bigelow.org

### Getting the Backend Ready for Production (port 3000)
Make sure the port number in /src/server.js is set to 3000, then run the following on the CentOS server:
```
sudo systemctl restart nodeserver
```
Now, the backend server will run continuously on port 3000. The service file that is executed by nodeserver is found on the envdna CentOS server at /etc/systemd/system/nodeserver.service

### Useful Resources
#### Vue.js
* Sharing data between Vue components: https://dev.to/alexmourer/sharing-data-between-components-invuejs-48me 
* Vue props (used for getting data from parent compnent/passing data to child component): https://vuejs.org/v2/guide/components-props.html 
* vue-chartjs documentation: https://vue-chartjs.org/guide/#introduction 
* chart.js documentation: https://www.chartjs.org/docs/latest/ 
* components available through bootstrap-vue: https://bootstrap-vue.js.org/docs/components/alert 
* custom events: https://vuejs.org/v2/guide/components-custom-events.html
* vue-multiselect component: https://vue-multiselect.js.org/#sub-getting-started

#### Zingchart
* Heatmaps: https://www.zingchart.com/gallery?ref=madewithvuejs.com&type=chartType&subType=heatmap
    * heatmap example: https://www.zingchart.com/gallery/heatmap-color-rules-tooltips
* Tokens: https://www.zingchart.com/docs/tutorials/elements/tokens
* zingchart-vue: https://www.zingchart.com/hello/create-interactive-charts-in-vue-with-zingchart
* npm zingchart-vue package: https://www.npmjs.com/package/zingchart-vue

#### PostgreSQL
* Importing data from CSV file: http://www.postgresqltutorial.com/import-csv-file-into-posgresql-table/ 
    * Another good resource for importing from CSV: https://dataschool.com/learn-sql/importing-data-from-csv-in-postgresql/
* Inserting data into a table: https://www.oreilly.com/library/view/practical-postgresql/9781449309770/ch04s03.html 
* Joins in Postges: https://www.tutorialspoint.com/postgresql/postgresql_using_joins.htm

#### Psycopg2 (Accessing Postgres db from Python)
* PostgreSQL - Python Interface: https://www.tutorialspoint.com/postgresql/postgresql_python.htm
* Intro to psycopg2: https://pynative.com/python-postgresql-tutorial/
* Connecting to db: https://www.postgresqltutorial.com/postgresql-python/connect/
* Basic queries: https://pynative.com/python-postgresql-select-data-from-table/
* More queries: https://www.postgresqltutorial.com/postgresql-python/query/
* Inserting data: https://www.postgresqltutorial.com/postgresql-python/insert/

#### Git
If you don't want to type your username/password every time you do a git thing on the server, then I recommend doing the following:
* setting up ssh keys: https://help.github.com/en/articles/connecting-to-github-with-ssh 
* changing remote url: https://help.github.com/en/articles/changing-a-remotes-url 

### Future Projects
* Speed up rendering of heatmap (bottle neck is in creating so many color rules to get the continuous blue-yellow color gradient)
* When downloading data as CSV, add ability to select columns to download via checkboxes.
* More robust error checking on search box & lat/lon input boxes
* Add ability to search by other fields (e.g. other taxonomic levels - Kingdom, Group, Phylum, Order, Genus, etc.)
* Enhance treamlined data input process (see /src/db/migration/ImportData.py)
    * Check input parameters & file formats. Notify user if something is wrong with the inputs.
    * Improve species input query (in buildSpeciesInputString()) to check for duplicate species before adding to the table.
* Add ability to upload files (attempt started in src/components/FileUpload.vue)
    * Example using Vue and Express: https://blog.bitsrc.io/uploading-files-and-images-with-vue-and-express-2018ca0eecd0
* Collapsable side bar for search parameters panel
* Live change results based on search parameter input
* Explore https://datatables.net
* Host the database directly on Digital Ocean (instead of CentOS server)
* More ideas are listed on the Trello/Monday page
* Possibly further develop the command line interface (https://github.com/BigelowLab/edna-cli)

# edna-cli
CLI for downloading eDNA data from the database. The git repo can be found here: https://github.com/BigelowLab/edna-cli . The npm package (where the edna-cli is published) can be found here: https://www.npmjs.com/package/edna-cli .

### About the eDNA CLI
Good news - the eDNA CLI is a Node.js project just like the web app! The CLI basically just has one command for now (download). Although the CLI only has one command (besides help) for now, it was created as a multi-command CLI using oclif. This will allow future commands to be added in the future if necessary.The CLI download command works by using axios to send an http get request to the download endpoint of the backend Express.js nodeserver running on port 3000. This server is the backend server whose endpoints are defined in src/routes/ in the edna-app repository. The search parameters are given via the options using flags with the download command. The options/flags are defined in the edna-cli repository's README.md. The download command uses these options to format a query string, which is then sent to the nodeserver, which returns a data object. The data is then written to a csv file using a filestream writer, and the file is saved as "edna-download-{date}.csv" (or the filename given with the filename flag) in the directory from which the edna command was run.

### Running the eDNA CLI
Since the eDNA CLI is a published npm package, it can be installed and run using an npm install command. This is described on the npm website https://www.npmjs.com/package/edna-cli but the install command is also listed below. Once the package is installed, you can used the eDNA CLI as described in the previous link.
```
npm install -g edna-cli
```
The CLI can also be run locally. To run a command locally, from the edna-cli directory run:
```
./bun/run [COMMAND]
```
The above command will run one CLI command at a time. You can also run the following command and then use the CLI as ou normally would as if you installed the package using npm install.
```
sudo npm link
```
After running the above command, you can use the CLI as described in the edna-cli repo's README.md file. For example, to download all of the data from the db, run the following command:
```
edna download
```
To unlink the edna-cli package, run:
```
sudo npm unlink
```

### Important File/Directory Descriptions
There aren't many files in the edna-cli repo right now, and most of them were created automatically when I created the oclif project, but here are a few notable items.
* src/commmands/: this directory holds all of the commands for your CLI. currently, there's only one command
   * src/commands/download.js: this defines the download command. Some notable features are that this file contains a class that extends Command (from oclif). There are four main parts to this file:
      1. the async run() function, which executes the command's main functionality
      2. the description which describes the command and is shown when the help command is used
      3. the flags (and their desscriptions), which define & describe the flags/options that are available when using the command
      4. finally, the class is exported at the end
* src/test/: oclif created this directory automatically when I created the project. This folder is meant to contain unit tests for each of the commands (I think it uses mocha as a testing framework). I didn't really explore this since there's only one command.

### Publishing the eDNA CLI
Once you've tested your changes to the CLI locally, commit & push your changes to the edna-cli git repo. Then, follow the steps here https://docs.npmjs.com/updating-your-published-package-version-number. Basically, you need to run 2 commands from the edna-cli directory:
```
npm version <update_type>
npm publish
```
where update_type is patch, major, or minor, and is explained in the link above.
The fiest time you run these commands, you'll need to login using:
```
npm login
```
For the bigelow npm account, username: bigelowlab , password: system-eyebrow-slid

### Development Resources
Some resources/examples that I found helpful when originally creating the CLI include the following:
* oclif documentation: https://oclif.io/docs/multi.html
    * command arguments: https://oclif.io/docs/args 
    * command flags: https://oclif.io/docs/flags
* Updating npm package versin: https://docs.npmjs.com/updating-your-published-package-version-number
    * semantic versioning: https://docs.npmjs.com/about-semantic-versioning
    * npm version: https://docs.npmjs.com/cli/version
* Building a CLI with Node.js: https://www.twilio.com/blog/how-to-build-a-cli-with-node-js 
* Simple Node.js example/tutorial: https://www.freecodecamp.org/news/how-to-build-a-cli-tool-in-nodejs-bc4f67d898ec/
* Another example/tutorial: https://www.sitepoint.com/javascript-command-line-interface-cli-node-js/ 
