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
    "qsdsdf-hqdfhqh-fdhd-hdfh":{
        "hosting" {
            "hosting-provider": "combell",
            "domain": "somedomain.org",
            "renew-date": "27-12-1013",
            "ftp-accounts":[
                { "username": "user" }
            ]
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
    "ftp-accounts":[
        {"username":"(str)",
         "password":"(str)"}
    ]
}


```
As you can see, these are basic templates for your jsondb files. Supported types:


| value    | description                  |
| -------- |----------------------------: |
| (str)    | string                       |
| (bool)   | boolean                      |
| (uuid)   | unique ids                   |
| (int)    | integer                      |
| (date)   | a javascript date object     |
| (link:)  | inner link to another object |

All of there are realy straightforward, except for one: (link:)
exact syntax: `(link:799c8731-071c-4206-989c-8d3671a8436)`, where the last part is an uuid
representing another object (or record, if you prefer that). This allows you to add objects
into objects. for example: I have a master record called "Customer". This record contains
values for Hardware,software,..? which are jsonObjects itself. So when the database is loaded
a "Customer" object may contain a software record id. this id is looked up in all the .jsondb
files. If the record is found, it makes an exact copy of it and puts it into the customer
record. Note that changes made to the software record, doesn't affect the customers record!

The viewer
----------
The basic principe of the viewer is to view the database (duh), able to search through the database, put the database
data in a pretty, readable layout.
It needs to have the following functions:

* search
    * sql style

    ```javascript
    var result = db.q.select('*')
    .where([['hosting-provider','=','combell']])
    .where([['renew-date','>=','11-10-2013'],['renew-date','<=','27-12-2013']],'AND')
    .orderBy('/hosting/hosting-provider','asc')
    ```
* using basic html tags for displaying the results
    * objects as `<ul></ul>`
    * strings as `<li></li>`
    * dates as datepickers
    * arrays as `<table></table>`

###Search SQL-style

Uses the sql like javascript object. Each function returns an instance of itself (`this`),
so you can mix up multiple where,contains,.. filters on the database.

####Supported filters:
##### select(`String/Array`)
Just as the sql version of select, you can select the keys to return. If you want to return
the while object, just use an '*' as parameter. Note that if you define a key of an object,
(in our example `/hosting/ftp-accounts`) it will return that object.
##### where(`Array`,`String`)
* Array: containing an array of arrays of the following format: `['key/path','operator','value']`
    * operator can be one of the following:
        * `=` or `==`
        * `!` or `!=`
        * `<`
        * `>`
        * `<=`
        * `>=`
        * `LIKE` or `~`

* String: containing how multiple filters will be handled; `'OR'` or `'AND'`

##### orderBy(`String`,`String`)
Do you want to return a sorted object? No problem. Just define the path to sort on and the
direction. This is a final function. This means, it won't return a new instance, it will
return the resulted object.

##### done()
Also a final function. Just returns the resulted object.

### Paths you say?

Yup! Like a normal directory listing, but for javascript objects. for example:

* Path `/hosting/hosting-provider' will result in `combell` from our example.
* Path `/hosting/ftp-accounts` will return the ftp-accounts object.
* Path `/hosting/ftp-accounts/[0]` will return the first ftp-account.

You can use DB.getPath(`String`) to get the value of the path.