jsonDB
======

A json file and dir based database.

Idea
----
The idea behind this project comes from my work enviroment. Our data about all our customers is a private SVN,
containing .docx, .html, .pdf ... with all the relevant documentation about the customer. I want to create a
simple file based database, containing the data about the customer in a structured way. It must be readable by
any program (txt files) and must be accessable by a public class, available in different languages. (js,python,php)

structure of database files
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