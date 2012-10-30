jsonDB
======

A json file and dir based database.

Idea
----
The idea behind this project comes from my work enviroment. Our data about all our customers is a private SVN,
containing .docx, .html, .pdf ... with all the relevant documentation about the customer. I want to create a
simple file based database, containing the data about the customer in a structured way. It must be readable by
any program (txt files) and must be accessable by a public class, available in different languages. (js,python,php)

These files (.jsondb) are saved into the SVN along with a .html and .js file to be able to simply view the database.

Allong the way, I'll write a python UI app to be able to edit the database, for easier input of data.

structure of database
----------------------------
```
[database_1]/
    |_______________ table1.jsondb
    |_______________ table2.jsondb
    |_______________ table3.jsondb
[database_2]/
    |_______________ table1.jsondb
    |_______________ table2.jsondb
    |_______________ table3.jsondb
[database_3]/
    |_______________ table1.jsondb
    |_______________ table2.jsondb
    |_______________ table3.jsondb
```
Sturucture of the database files (.jsondb)
------------------------------------------

Example:
```json
{ "DATA":[{
    "col1": "content_col1_row1",
    "col2": "content_col2_row1",
    "col3": "content_col3_row1",
    "col_tags": ["tag1","tag2"]
    },{
    "col1": "content_col1_row2",
    "col2": "content_col2_row2",
    "col_tags": ["tag2"],
    "col3": "content_col3_row2"
    },{
    "col1": "content_col1_row3",
    "col_tags": ["tag1"],
    "col2": "content_col2_row3",
    "col3": "content_col3_row3"
    }
],
"TABLE_ATTR":{
    "col_tags": ["col_tags"]
    }
}
```

The viewer
----------
The basic principe of the viewer is to view the database (duh), able to search through the database, put the database
data in a pretty, readable layout.

