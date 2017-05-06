import sqlite3

con=sqlite3.connect('enjoyo2o')

con.execute('''
create table test(
name text
);
''')

print "创建成功"

con.close()
