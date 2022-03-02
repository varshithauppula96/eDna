# Replaces "NA" values with None values, so they can be imported as NULL values into the postgreSQL database

import csv
f = open("SK_18S_env_edit.csv",'rU')
reader = csv.reader(f)
lines = []

for line in reader:
	l = []
	for col in line:
		if col == "NA":
			# print("here")
			l.append(None)
		else:
			l.append(col)
	lines.append(l)

f.close()
# print(len(lines),len(lines[0]))

fp = open("SK_18S_env_edit.csv",'w')
writer = csv.writer(fp)
writer.writerows(lines)
fp.close()
