/**
 * @author Stijn Van Campenhout <subutux@gmail.com>
 * @package jsonDB.js
 * @version 0.1
 * @copyright Copyright (C) 2013 Stijn Van Campenhout
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

/**
 * Serialize an Object
 * @return {Array} Array of the object
 */
$.fn.serializeObject = function () {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function () {
    if (o[this.name] !== undefined) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};
/**
 * The jsonDB Object
 * @type {Object}
 */
var jsonDB = {
  that: this,
  loadedDatbases: {

  },
  /**
   * Get the current operating system
   * @return {String} Operating system name
   */
  __os: function () {
    var OSName = "Unknown OS";
    if (navigator.appVersion.indexOf("Win") !== -1) { OSName = "Windows"; }
    if (navigator.appVersion.indexOf("Mac") !== -1) { OSName = "MacOS"; }
    if (navigator.appVersion.indexOf("X11") !== -1) { OSName = "UNIX"; }
    if (navigator.appVersion.indexOf("Linux") !== -1) { OSName = "Linux"; }
    return OSName;
  },
  /**
   * Collection of utilities
   * @type {Object}
   */
  utils: {
    /**
     * Set the value of a path in an object
     * @param {String} key          the path in the object
     * @param {String} value        the to set value of the key
     * @param {Object} targetObject The target object to change
     */
    setKey: function (key, value, targetObject) {
          var keys = key.split('/'), obj = targetObject || window, keyPart;
          keys.shift();
         while ((keyPart = keys.shift()) && keys.length) {
           keyPart = keyPart.replace('[','').replace(']','');
             obj = obj[keyPart];
          }
          obj[keyPart] = value;
      },
    /**
     * Generate an UUID
     * @return {String} an UUID
     */
    UUID: function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
      });
    },
    /**
     * Gets a key value from an object
     * @param  {String} key key or path for the object
     * @param  {Object} obj the object to search in
     * @return {String}     the value. if the value is an object, it will be stringified
     */
    getKey: function(key,o) {

        function find (Obj,key) {
          for (var i in Obj){
            console.log('key',i,'!=',key);
            if (i == key){
              console.log('got key',i);
              if (typeof(Obj[i]) == 'object'){
                return JSON.stringify(Obj[i]);
              } else {
                return Obj[i];  
              }
            } else if (typeof(Obj[i]) == "object"){
              return find(Obj[i],key);
            }
          }
        }
      if (~key.indexOf('/')){
        console.log();
        // if it's a path, find the path and return the value
        var keys = key.split('/'), obj = o|| window, keyPart;
        // there was a leading slash
          if (keys[0] === '') { keys.shift(); }
         while ((keyPart = keys.shift()) && keys.length) {
           keyPart = keyPart.replace('[','').replace(']','');
             obj = obj[keyPart];
          }
          return (typeof(obj[keyPart]) == "object")? JSON.stringify(obj[keyPart]): obj[keyPart];
      } else {
        // if it's just a simple string, look trough the object for the first occurence
        // of the key and return it's value. (Not recommered. you should use paths!)

        return find(o);
      }
    }
  },
  /**
   * returns the local path of a file
   * @param  {String} file filename, relative the the current directory
   * @return {String}      Full path of the file
   */
  __getLocalPath: function(file){
    splitter = (this.__os() == "Windows") ? '\\' : '/';
    localPath = $.twFile.convertUriToLocalPath(document.location.href);
    WinNetworkDrive = (localPath.indexOf('\\\\') === 0)? true : false;
    localPath = localPath.split(splitter);
    console.log(localPath);
    delete localPath[localPath.length-1];

    localPath = localPath.join(splitter);
    if (WinNetworkDrive){
      localPath = '\\\\' + localPath;
    }
    return localPath + file;
  },
  /**
   * Constructor for a new database
   * @param {String} DB Path of the database file
   * @return {Object} A __DB object
   */
  DB: function (DB) {
      path = this.__getLocalPath(DB);
    console.log("load",path);
    tmp = $.twFile.load(path);
    console.log(tmp);
    tmp = JSON.parse(tmp);
    return new this.__DB(tmp,path);
  },
  /**
   * a database class
   * @private
   * @param  {Object} DB   The database object
   * @param  {String} path The full path of the database
   * @return {Object}      a new __DB instance
   */
  __DB: function (DB,path) {
    this.__path = path;
    this.__db = DB;
    /**
     * writes the in-memory database to the database file
     * @return {None} Nothing
     */
    this.write = function () {
      $.twFile.save(this.__path,JSON.stringify(this.__db));
    };
    this.getPath = function (key) {
      return jsonDB.utils.getKey(key,this.__db);
    };
    /**
     * Adds a record to the in-memory database
     * @param {Object} Record A jsonDB.jsonDBRecord instance
     */
    this.addRecord = function (Record) {
      this.__db[jsonDB.utils.UUID()] = Record.Obj;
      this.query = jsonDB.__QueryDB(this);
    };
    /**
     * same as write
     */
    this.save = function () {
      this.write();
    };
    this.query = new jsonDB.__QueryDB(this);
  },
  /**
   * A query class for executing queries on the database
   * @private
   * @param  {Object} db A jsonDB.__DB instance
   * @return {Object}    A jsonDB.__QueryDB instance
   */
  __QueryDB: function (db) {
    this.result = [];
    this.selectors = "";
    this.db = db.__db;
    /**
     * Select which keys to return
     * @param  {Arr/str} keys Array or string, use '*' for all
     * @return {Object}       A jsonDB.__QueryDB instance
     */
    this.select = function (keys) {
      this.selectors = keys;
      this.result = this.db;
      return this;
    };
    /**
     * Do some equasions on the previous returned results
     * @param  {Array} whereClauses  Where clauses in de form of [key,operator,val]
     * @param  {String} ANDOR        AND or OR
     * @return {Object}              A jsonDB.__QueryDB instance
     */
    this.where = function (whereClauses,ANDOR) {
      var ao = ANDOR || "OR";
      var currResults = this.results;
      /**
       * Execute an OR statement on the given object
       * @param {Object} obj The object to filter
       * @param {Array}  wc  The equasions to use
        * @return {Object}    A jsonDB.__QueryDB instance
       */
      function OR (obj,wc) {
        var ret = [];
        for (var w in wc){
          //[key,operator,val]
          for (var r in obj){
            var val = (typeof(wc[w][2]) == "object")? JSON.stringify(wc[w][2]): wc[w][2];
            var key = wc[w][0];
            if (wc[w][1] == '=' || wc[w][1] == '=='){
              if (jsonDB.utils.getKey(key,obj[r]) == val){
                ret.push(obj[r]);
              }
            } else if (wc[w][1] == '<') {

              if (jsonDB.utils.getKey(key,obj[r]) < val){
                ret.push(obj[r]);
              }
            } else if (wc[w][1] == '>') {

              if (jsonDB.utils.getKey(key,obj[r]) > val){
                ret.push(obj[r]);
              }
            } else if (wc[w][1] == '<=') {

              if (jsonDB.utils.getKey(key,obj[r]) <= val){
                ret.push(obj[r]);
              }
            } else if (wc[w][1] == '>=') {

              if (jsonDB.utils.getKey(key,obj[r]) > val){
                ret.push(obj[r]);
              }
            } else if (wc[w][1] == '!' || wc[w][1] == '!=') {

              if (jsonDB.utils.getKey(key,obj[r]) != val){
                ret.push(obj[r]);
              }
            } else if (wc[w][1] == 'LIKE' || wc[w][1] == '~') {

              var getkey = jsonDB.utils.getKey(key,obj[r]);
              getkey = (typeof(getkey) == "undefined")? "" : getkey;
              if (~getkey.toLowerCase().indexOf(val.toLowerCase())){
                ret.push(obj[r]);
              }
            } else {
              throw('jsonDB.DB.q.where:OR:Unknown operator:' + wc[w][1]);
            }
          }

        }
        return ret;
      }
      /**
       * Loop through the WhereClauses and execute an OR function for
       * every WhereClause with the previous returned object as its
       * search object
       * @param {Object} obj Object to filter
       * @param {Array}  wc  Where Clauses to use
        * @return {Object}    A jsonDB.__QueryDB instance
       */
      function AND(obj,wc){
        var ret = obj;
        for (var a in wc){
          ret = OR(ret,[wc[a]]);
        }
        return ret;
      }
      if (ao == 'OR'){

        this.result = OR(this.result,whereClauses);
        
      } else if (ao == 'AND'){

        this.result = AND(this.result,whereClauses);
      }
      return this;
    };
    /**
     * Old where function
     * @deprecated This one only does '=' matches
     * @param  {String} key The key to search for
     * @param  {String} val Its needed value
     * @return {Object}     A jsonDB.__QueryDB instance
     */
    this._where = function(key,val){
      var currResults = [];
      for (var i in this.result){
        if (this.__getKey(this.result[i],key) == val){

          console.log(i,this.result[i]);
          currResults.push(this.result[i]);

          console.log(currResults);
        } else if (typeof(this.__getKey(this.result[i],key)) == "object" && JSON.stringify(this.__getKey(this.result[i],key)) == val ){
          currResults.push(this.result[i]);
        }
      }
      this.result = currResults;
      return this;
    };
    /**
     * Returns the results of the previous filters combined
     * @return {Array} Array containing the results
     */
    this.done = function (){
      var ret;
      if (this.selectors == "*"){
        ret = this.result;
      } else if (typeof(this.selectors) == "string"){
        ret = this.result[this.selectors];
      } else if (this.selectors instanceof Array){
          ret = [];
        for (var r in this.result){

          for (var s in this.selectors){
            ret.push({r:this.result[r][s]});
          }
        }
      }
      return ret;
    };
    /**
     * Returns the result sorted by defined key and sortorder
     * @beta Untested, should work
     * @param  {String} key   The key or path to sort on
     * @param  {String} order 'asc'/'desc', defaults to 'asc'
     * @return {Array}        Array containing the results
     */
    this.sortBy = function(key,ordr){
      var order = ordr || 'asc';
      var path = key;
      /**
       * The sorting function. Compares path values.
       * @param  {Object} a left compare
       * @param  {Object} b right compare
       * @return {int}    1,-1 or 0
       */
      function sorter(a,b){
        pa = jsonDB.utils.getKey(path,a);
        pb = jsonDB.utils.getKey(path,b);
        if (pa < pb) {
          return -1;
        } else if (pa > pb) {
          return 1;
        } else {
          return 0;
        }
      }
      result = this.done();
      return ( order = 'asc' ) ? result.sort(sorter(a,b)) : result.sort(sorter(a,b)).reverse() ;

    };
    this.__getKey = function(obj,key){
      function find(Obj,key){
        for (var i in Obj){
          console.log('key',i);
          if (i == key){
            console.log('got key',i);
            if (typeof(Obj[i]) == 'object'){
              return JSON.stringify(Obj[i]);
            } else {
              return Obj[i];  
            }
          } else if (typeof(Obj[i]) == "object"){
            return find(Obj[i],key);
          }
        }
      }
      return find(obj,key);
    };

  },
  /**
   * Returns a jsonObj. used for creating new records
   * @param  {String} RecordObjFile File containing the template
   * @param  {Bool}   raw           If true, return as string
   * @return {str/obj}            the content of the template
   */
  jsonDBRecordObj: function(RecordObjFile,raw){
    Obj = $.twFile.load(this.__getLocalPath(RecordObjFile));
    return (raw)? Obj : JSON.parse(Obj);
  },
  /**
   * Returns a new json record, based in the given template
   * @param  {String} RecordObj file of the recordObj to use as template
   * @return {Object}           a new instance of jsonDB.jsonDBRecord
   */
  jsonDBRecord: function(RecordObj){
    var parent = this;
    this.recordObj = jsonDB.jsonDBRecordObj(RecordObj,true);
    this.Obj = JSON.parse(this.recordObj);
    
    this.ObjReplacesHTMLInput = {
      "(str)"  : "<input type=\"text\" name=\"-UUID-\" data-path=\"-PATH-\"/>",
      "(uuid)" : "<input type=\"text\" name=\"-UUID-\" data-path=\"-PATH-\" value=\"" + jsonDB.utils.UUID() + "\" disabled />", 
      "(bool)" : "<ul><li>true: <input data-path=\"-PATH-\" type=\"radio\" name=\"-UUID-\" value=\"true\"/></li><li>false:<input type=\"radio\" data-path=\"-PATH-\" name=\"-UUID-\" value=\"false\"/></li></ul>",
      "(int)"  : "<input type=\"text\" name=\"-UUID-\" data-path=\"-PATH-\"/>"
    };
    var html = "";
    /**
     * Create a html form to fill in the records
     * @param  {String} appendTo jQuery selector to where the form will be appended to
     */
    this.createForm = function(appendTo){
      path = "/";
      /**
       * Loops trough the Object and generates a html form content
       * @param  {Object}  Obj                The object to loop trough
       * @param  {Object}  findReplaceMatches Find and replace this with html
       * @param  {String}  path               The current path
       * @param  {Boolean} array              If the object is an array or not
       * @return {String}                     The html form content
       */
      function generateForm(Obj,findReplaceMatches,p,a){
        var html = "";
        var path =  p || "";
        var array = a || false;
        var me = "";
        for (var i in Obj){
          if (typeof(Obj[i]) == "object"){
            if (array){
              me = "[" + i + "]";
            } else {
              me = i;
            }
            if (Obj[i] instanceof Array){
              array = true;
            }
            d = generateForm(Obj[i],findReplaceMatches,path + "/" + me,array);
            html += "<li>" + i + ":<ul>" + d + "</ul></li>";
          } else if (typeof(Obj[i]) == "string"){
            id = jsonDB.utils.UUID();
            html += "<li>" + i + ":" + findReplaceMatches[Obj[i]].replace('-UUID-',id).replace('-PATH-',path + '/' + i).replace('-PATH-',path + '/' + i) + "</li>";
          }
        }
        return html;
      }
      result = generateForm(this.Obj,this.ObjReplacesHTMLInput);
      formid = jsonDB.utils.UUID();
      html =  "<form id=\"" + formid + "\"><ul>" + result + "</ul><input type=\"submit\" value=\"save\"><form>";
      $(appendTo).append(html);
      $('#' + formid).on('submit',function(e){
        e.preventDefault();
        $.each($('#' + formid).serializeArray(),function (){
          path = $("input[name=" + this.name + "]").attr('data-path');
          jsonDB.utils.setKey(path,this.value,parent.Obj);
        });
        $("#" + formid).remove();
      });
      };
  }
};