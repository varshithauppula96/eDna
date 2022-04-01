import csv
import psycopg2
from psycopg2 import Error

# -------------------------------- eDNA Data Importer --------------------------------
# This class is used to import data into the eDNA database.
# The importer can currently be used to import counts data that is part of ONE project and ONE site at a time.
# Multiple different samples with different dates and species, but at the same site are okay.
# When using this importer, it is EXTREMELY important to TRIPLE CHECK your file formats and make sure the correct columns are present.
# The importer currently does not do much file format checking, so importing an improperly formatted file could create weird things in the database.
#
# -------------------------------- READ THIS SECTION CAREFULLY!!! --------------------------------
# To use the importer, provide the following REQUIRED INFORMATION in the getUserDefinedParameters() function towards the bottom of this file:
#   parameters:
#       project_name - string containing only letters, numbers, hyphens, and underscores
#       site_name - string containing only letters, numbers, hyphens, and underscores
#       site_lat - float -90 to 90
#       site_lon - float -180 to 180
#       data_type - string (typically '18S' or '16S')
#
#   files:
#       samples_file: CSV file containing the sample metadata information for each sample (sample name, date collected)
#           - Must contain one column per sample. First column contains the row labels
#           - The column headers must be the sample names (these 'sample names' are for identificatin purposes during import. they aren't displayed anywhere in the web app)
#           - Must contain the following rows in the following order: Sample ID, Month, Day, Year
#           - See edna-app/src/db/data/highland_lake_dates.csv for an example
#       taxonomy_file: CSV file containing the taxonomic information for all species being imported
#           - Must contain all or a subset of the columns listed in species_file_columns below (in the getUserDefinedParameters() function).
#           - The asv and sequence columns are REQUIRED (check yourself because the code doesn't currently check for you)
#           - The order in which the columns are listed in species_file_columns is the order in which the columns must appear in your CSV file
#           - See edna-app/src/db/data/HL18S_species.csv for an example
#       counts_file: CSV file containing the counts for each ASV in each sample.
#           - Rows must each represent one ASV
#           - Columns must each represent one sample
#           - ASV column is required (in addition to the sample columns)
#           - Column headers must be the sample names.
#           - Sample names must be the same sample names that are in your samples_file.
#           - See edna-app/src/db/data/HL18S_counts.csv for an example
#
#       * Note: The species_file and the counts_file contain the data & columns that typically come out of the data processing pipeline in one file.
#               This importer separates that information into two files to simplify the Postgres insert commands.
#               (i.e. The species_file can be imported directly into the species table using the Postgres COPY command)
#
#   species_file_columns:
#       Uncomment the elements from the list of potential columns provided in getUserDefinedParameters() if they are in your species_file.
#       Comment out the elements from the provided list if they're not present in your species_file
#
# -------------------------------- LASTLY, TRIPLE CHECK YOUR FILES AND PARAMETERS!!! --------------------------------
# Make sure adequate values are given for all of the parameters listed above.
# This importer currently does not check for proper parameters and file formats. Improper inputs could cause the data to be imported into the database incorrectly or not at all.


class ImportData:

    def __init___(self):
        self.siteName = None            # string containing only letters, numbers, hyphens, and underscores
        self.projectName = None         # string containing only letters, numbers, hyphens, and underscores
        self.siteLat = None             # float -90 to 90
        self.siteLon = None             # float -180 to 180
        self.dataType = None            # string (typically '18S' or '16S')
        self.speciesFileColumns = None  # list of strings (further restrictions apply. see comments in getUserDefinedParameters() function below for details)
        
    # siteName getter
    def get_siteName(self):
        return self.siteName
    
    # siteName setter
    def set_siteName(self, siteName):
        self.siteName = siteName
    
    # projectName getter
    def get_projectName(self):
        return self.projectName
    
    # projectName setter
    def set_projectName(self, projectName):
        self.projectName = projectName

    # siteLat getter
    def get_siteLat(self):
        return self.siteLat
    
    # siteLat setter
    def set_siteLat(self, siteLat):
        self.siteLat = float(siteLat)

    # siteLon getter
    def get_siteLon(self):
        return self.siteLon
    
    # siteLon setter
    def set_siteLon(self, siteLon):
        self.siteLon = float(siteLon)

    # dataType getter
    def get_dataType(self):
        return self.dataType
    
    # dataType setter
    def set_dataType(self, dataType):
        self.dataType = dataType

    # speciesFileColumns getter
    def get_speciesFileColumns(self):
        return self.speciesFileColumns

    # speciesFileColumns setter
    def set_speciesFileColumns(self,speciesFileColumns):
        self.speciesFileColumns = speciesFileColumns

    # read given csv file & return list of rows
    def read_csv(self,filename):
        fp = open(filename,'r')
        reader = csv.reader(fp)
        rows = []
        for line in reader:
            rows.append(line)
        return rows

    # Build postgres query string to insert data into Project table
    def buildProjectInsertString(self):
        return "INSERT INTO project (name) VALUES ('{}');".format(self.projectName)

    # Build postgres query string to insert data into Site table
    def buildSiteInsertString(self):
        return "INSERT INTO site (lat,lon,name) VALUES ({},{},'{}');".format(self.siteLat,self.siteLon,self.siteName)

    # Build postgres query strings to insert data into Sample table
    def buildSampleInsertStrings(self,filename):
        # Read samples file 
        dates = self.read_csv(filename)
        sample_names = dates[0]     # first row = sample names
        months = dates[1]           # second row = month (number)
        days = dates[2]             # third row: day (number)
        years = dates[3]            # fourth row: year (number)
        queries = [] # list of postgres query strings to insert sample rows into sample table
        # start from 1 instead of 0 because rows include row label
        for i in range(1,len(sample_names)):
            # Date format: YYYY-MM-DD
            date = ('20'+years[i] if len(years[i]) == 2 else years[i]) + '-' + ('0'+months[i] if len(months[i]) == 1 else months[i]) + '-' + ('0'+days[i] if len(days[i]) == 1 else days[i])
            # The way the name_num is created here could cause issues (i.i non-distinct name_nums in the db) if data is being imported for a site that already exists and has samples in the db
            name_num = self.siteName + '_' + str(i)
            qstring = "INSERT INTO sample (site_id, project_id, date, name_num, sample_name) VALUES ( (SELECT id FROM site WHERE name='{}'),(SELECT id FROM project WHERE name='{}'),'{}','{}','{}');".format(self.siteName,self.projectName,date,name_num,sample_names[i])
            queries.append(qstring)
        return queries

    # Build postgres query string to insert data into Species table
    def buildSpeciesInsertString(self):
        # Join speciesFileColumns list into a string with elements separated by comma
        species_cols = ','.join(self.speciesFileColumns)
        return "COPY species ({}) FROM STDIN WITH CSV HEADER DELIMITER AS ','".format(species_cols)

    # Build postgres query strings to insert data into Count table
    def buildCountInsertStrings(self,filename):
        # read counts file
        counts = self.read_csv(filename)
        headers = counts[0]
        queries = []
        # loop through rows of asv's
        # start from 1 instead of 0 because first row counts[0] is headers
        for i in range(1,len(counts)):
            row = counts[i] # one row of counts for an ASV
            asv_num = row[0].strip()
            # loop through columns of samples
            for j in range(1,len(row)-1):
                # Only insert counts row if count > 0
                if( row[j] > 0 ):
                    qstring = "INSERT INTO count (sample_id,species_id,count,type) VALUES ((SELECT id FROM sample WHERE sample_name='{}'),(SELECT id FROM species WHERE asv='{}'),{},'{}')".format(headers[j],asv_num,row[j],self.dataType)
                    queries.append(qstring)
        return queries

    # Build list of all PostgreSQL query strings required to update tables in order: project, site, sample, species, count
    def buildAllStrings(self,samples_file,counts_file):
        # Separate queries because executeAll() needs to handle Species query differently (copying data directly from file)
        queriesBeforeSpecies = []
        queriesAfterSpecies = []
        # Queries after Species query 
        queriesBeforeSpecies.append( self.buildProjectInsertString() )
        queriesBeforeSpecies.append( self.buildSiteInsertString() )
        queriesBeforeSpecies.extend( self.buildSampleInsertStrings(samples_file) )
        # Species query
        speciesQuery = self.buildSpeciesInsertString()
        # Queries after Species query 
        queriesAfterSpecies.extend( self.buildCountInsertStrings(counts_file) )
        # Clear temporary sample_name column from species table (only used for imports)
        queriesAfterSpecies.append("UPDATE sample SET sample_name = NULL WHERE sample_name IS NOT NULL;")
        # Clear asv column from species table (only used for imports)
        queriesAfterSpecies.append("UPDATE species SET asv = NULL WHERE asv IS NOT NULL;")
        return [queriesBeforeSpecies,speciesQuery,queriesAfterSpecies]

    # Connect to the eDNA db and execute all query strings to insert data into all tables
    def executeAll(self,queries,species_file):
        try:
            connection = psycopg2.connect(user = "testuser",
                                        password = "c7JAb7U2wcngrZPf",
                                        host = "edna.bigelow.org",
                                        port = "5432",
                                        database = "edna_db")

            cursor = connection.cursor()
            # Print PostgreSQL Connection properties
            print( "You have connected to the eDNA database." )

            # Total number of PostgreSQL queries
            numQueries = len(queries[0]) + len(queries[1]) + len(queries[2])

            # Execute PostgreSQL queries before species insert (project, site, & sample inserts)
            for i in range(len(queries[0])):
                print( "Executing PostgreSQl query {} of {}.".format( i+1,numQueries ) )
                cursor.execute(queries[0][i])
                connection.commit()
            
            # Execute species insert (copy from file)
            f = open(species_file)
            print( "Executing PostgreSQl query {} of {}.".format( len(queries[0])+1,numQueries ) )
            cursor.copy_expert(queries[1],f)
            connection.commit()

            # Execute PostgreSQL queries after species insert (counts inserts & column clean up)
            for j in range(len(queries[2])):
                print( "Executing PostgreSQl query {} of {}.".format( len(queries[0])+len(queries[1])+j+1,numQueries ) )
                cursor.execute(queries[2][j])
                connection.commit()

        except (Exception, psycopg2.Error) as error :
            print ("Error while connecting to PostgreSQL", error)

        finally:
            #closing database connection.
            if(connection):
                cursor.close()
                connection.close()
                print("PostgreSQL connection is closed")

    # Test ability to connect to the eDNA database
    def testConnection(self):
        try:
            connection = psycopg2.connect(user = "testuser",
                                        password = "c7JAb7U2wcngrZPf",
                                        host = "edna.bigelow.org",
                                        port = "5432",
                                        database = "edna_db")

            cursor = connection.cursor()
            # Print PostgreSQL Connection properties
            print( connection.get_dsn_parameters(),"\n")

            # Print PostgreSQL version
            cursor.execute("SELECT version();")
            record = cursor.fetchone()
            print("You are connected to - ", record,"\n")

        except (Exception, psycopg2.Error) as error :
            print ("Error while connecting to PostgreSQL", error)

        finally:
            #closing database connection.
            if(connection):
                cursor.close()
                connection.close()
                print("PostgreSQL connection is closed")


# Define USER GIVEN import parameters. CHECK ALL OF THESE VALUES THESE FOR EVERY IMPORT!
def getUserDefinedParameters():
    # Set import parameters
    #   Update the values for the project_name, site_name, site_lat, site_lon, and data_type arguments below.
    project_name = 'example_project_name'
    site_name = 'example_site_name'
    site_lat = 43.77806
    site_lon = -70.35814
    data_type = '18S'

    # Set file source locations
    #   Update the file locations for the samples_file, species_file, and counts_file arguments below.
    samples_file = '/path/to/samples_file.csv'
    species_file = '/path/to/species_file.csv'
    counts_file = '/path/to/counts_file.csv'

    # Set species_file columns
    #   Update the list below to reflect the columns in the species_file
    #   The items in this list are the names of all the columns available in the species table of the db.
    #   DO NOT change the elements in this list. Changing the elements in the list will confuse the importer and could cause strange things to be inserted in the database.
    #   COMMENT out list elements that are NOT columns in your species_file. UNCOMMENT list elements that ARE columns in your species_file.
    species_file_columns = [
        'asv',                  # text, REQUIRED
        'sequence',             # text, REQUIRED
        'tax_kingdom',          # text
        'tax_supergroup',       # text, typically not in 16S data
        'tax_division',         # text, typically not in 16S data
        # 'tax_phylum',           # text, typically not in 18S data
        'tax_class',            # text
        'tax_order',            # text
        'tax_family',           # text
        'tax_genus',            # text
        'tax_species',          # text
        'boot_kingdom',         # integer
        'boot_supergroup',      # integer
        'boot_division',        # integer
        # 'boot_phylum',          # integer, typically not in 18S data
        'boot_class',           # integer
        'boot_order',           # integer
        'boot_family',          # integer
        'boot_genus',           # integer
        'boot_species'          # integer
    ]
    return [ project_name, site_name, site_lat, site_lon, data_type, samples_file, species_file, counts_file, species_file_columns ]

# Create an instance of the ImportData class & use it to import data into the db based on the user-given parameters
def main():
    # get user-defined parameters
    params = getUserDefinedParameters()
    project_name = params[0]
    site_name = params[1]
    site_lat = params[2]
    site_lon = params[3]
    data_type = params[4]
    samples_file = params[5]
    species_file = params[6]
    counts_file = params[7]
    species_file_columns = params[8]

    # Create instance of the data importer
    i = ImportData()
    # Test connection to the database
    # i.testConnection()
    # Set ImportData parameters
    i.set_projectName( project_name )
    i.set_siteLat( site_lat )
    i.set_siteLon( site_lon )
    i.set_siteName( site_name )
    i.set_dataType( data_type )
    i.set_speciesFileColumns( species_file_columns )
    # Build PostgreSQL query strings
    queryStrings = i.buildAllStrings( samples_file, counts_file )
    # Execute PostgreSQL query strings
    i.executeAll( queryStrings, species_file )

# Run the main() function when this file is called using the command 'python ImportData.py'
if __name__ == '__main__':
    main()
