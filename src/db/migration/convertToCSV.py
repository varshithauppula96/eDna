# converts .tax files to .csv files

import csv
import sys

def convert(filename):
    # read tab-delimited file
    with open("../data/"+filename,'rb') as fin:
        cr = csv.reader(fin, delimiter='\t')
        filecontents = [line for line in cr]

    # write comma-delimited file (comma is the default delimiter)
    with open("../data/"+filename[:-4]+".csv",'wb') as fou:
        cw = csv.writer(fou, quotechar='', quoting=csv.QUOTE_NONE)
        cw.writerows(filecontents)

if __name__ == '__main__':
    convert(sys.argv[1]) # filename given as command line argument