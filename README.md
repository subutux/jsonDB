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

~~Allong the way, I'll write a python UI app to be able to edit the database, for easier input of data.~~
UPDATE: I'll be using a java applet for writing to the .jsondb files. (I know, java..). The advantage of this applet
is that is't cross-platform and usable directly from the browser!

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
Structure of the database files (.jsondb)
------------------------------------------
All the json data you could think of! But, structured with uniqe ids (uuid):
```json
{
    'qsdsdf-hqdfhqh-fdhd-hdfh':{
        "hosting" {
            "hosting-provider": "combell",
            "domain": "somedomain.org",
            "renew-date": "27-12-1013"
        }
    }
}
```

How to keep structure in this unstructure?
------------------------------------------
Using .jsonObj files:
```json
        "hosting" {
            "hosting-provider": "(str)",
            "domain": "(str)",
            "renew-date": "(date)"
        }
    }

```
As you can see, these are basic templates for your jsondb files. Supported types:
|value  |               description |
|-------|--------------------------:|
|(str)  | string                    |
|(bool) | boolean                   |
|(uuid) | unique ids                |
|(int)  | integer                   |
|(date) | a javascript date object  |


The viewer
----------
The basic principe of the viewer is to view the database (duh), able to search through the database, put the database
data in a pretty, readable layout.

