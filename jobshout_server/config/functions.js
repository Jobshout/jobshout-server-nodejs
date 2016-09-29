	/**********************************************************************
	*  Author: Neha Kapoor (neha@jobshout.org)
	*  Project Lead: Balinder WALIA (bwalia@jobshout.org)
	*  Project Lead Web...: https://twitter.com/balinderwalia
	*  Name..: Jobshout Server NodeJS
	*  Desc..: Jobshout Server (part of Jobshout Suite of Apps)
	*  Web: http://jobshout.org
	*  License: http://jobshout.org/LICENSE.txt
	**/

	/**********************************************************************
	*  functions.js contain all the functions required for requests
	**/
	
	var init = require('./init');
	var mongodb=init.mongodb;

var self = module.exports = 
{
  // These functions which will be called in the main file, which is server.js
  	
  	templateSearch : function (db, templateStr, req, cb){
     	var itemsPerPage = 10, pageNum=1;
		var outputObj = new Object();
	
		db.collection('system_templates').findOne({"code": templateStr , "status": { $in: [ 1, "1" ] } }, function(err, templateResponse) {
			if(err){
				outputObj["error"]   = "No such page exists!";
				cb(outputObj);
			}
			if(templateResponse){
		
				if(req.query.start){
					pageNum=parseInt(req.query.start);
				}
				if(req.query.limit){
					itemsPerPage=parseInt(req.query.limit);
				}
				if(pageNum==0){
					pageNum=1;
				}
				
				var query="{}", fetchFieldsObj="{}", table_name= templateResponse.table ;
				
				outputObj["table"]   = table_name;
				
				if (typeof templateResponse.search_columns !== 'undefined' && templateResponse.search_columns !== null && templateResponse.search_columns !== "")	{
					outputObj["enable_search"]   = true;
				}
				if (typeof templateResponse.enable_editor !== 'undefined' && templateResponse.enable_editor !== null && typeof templateResponse.editor_filename !== 'undefined' && templateResponse.editor_filename !== null && templateResponse.enable_editor==1  && templateResponse.editor_filename!="") {
						outputObj["editor"]   = templateResponse.editor_filename;
				}
				if(templateResponse.listing_columns){
					var listArr= templateResponse.listing_columns.split(',');
					if (typeof templateResponse.enable_editor !== 'undefined' && templateResponse.enable_editor !== null && typeof templateResponse.editor_field !== 'undefined' && templateResponse.editor_field !== null && templateResponse.enable_editor==1  && templateResponse.editor_field!="") {
						outputObj["uniqueField"]   = templateResponse.editor_field;
						listArr.push("Action");
					}
					outputObj["display_columns"]   = listArr;
					
					for(var l_count=0; l_count< listArr.length; l_count++){
						if(l_count==0){
							fetchFieldsObj="{";
							fetchFieldsObj+="'"+listArr[l_count]+"' : 1";
						}else{
							fetchFieldsObj+=", '"+listArr[l_count]+"' : 1";
						}
					}
					if (typeof templateResponse.enable_editor !== 'undefined' && templateResponse.enable_editor !== null && typeof templateResponse.editor_field !== 'undefined' && templateResponse.editor_field !== null && templateResponse.enable_editor==1  && templateResponse.editor_field!="") {
						fetchFieldsObj+=", '"+templateResponse.editor_field+"' : 1";
					}
					fetchFieldsObj+="}";
				}
				
				if(req.query.s){
					query= '{'
					var searchStr = req.query.s;
					
					if(templateResponse.search_columns){
						var searchColumnArr=JSON.parse(templateResponse.search_columns);
						if(searchColumnArr.length>=1){
							
							var subQueryStr="";
							for(var s_count=0; s_count< searchColumnArr.length; s_count++){
								var subObj=  searchColumnArr[s_count];
								if(subQueryStr!=""){
     					 			subQueryStr+=",";
     					 		}
								for (var key in subObj) {
									if( subObj.hasOwnProperty(key) ) {
										var regex = new RegExp(searchStr, "i");
										var tempSeacrhStr=searchStr;
										
     					 				if(isNaN(searchStr)){
											tempSeacrhStr="'"+searchStr+"'";
										}
										
    									if(subObj[key]=="contains"){
     					 					subQueryStr+="{'"+key+"' : "+regex+" }";
     					 				}else if(subObj[key]=="="){
     					 					subQueryStr+="{'"+key+"' : "+tempSeacrhStr+"}";
     					 				}else if(subObj[key]=="!="){
     					 					subQueryStr+="{'"+key+"' : { $ne: "+tempSeacrhStr+" } }";
     					 				}else if(subObj[key]=="starts_with"){
     					 					subQueryStr+="{'"+key+"' : '/^"+regex+"/' }";
     					 				}else if(subObj[key]=="ends_with"){
     					 					subQueryStr+="{'"+key+"' : '/"+regex+"$/' }";
     					 				}
     					 			} 
    							} 
							}
							if(subQueryStr!=""){
								if(templateResponse.search_condition=="and" || templateResponse.search_condition=="AND" ){
									query+= '$and:[';
								}else{
									query+= '$or:[';
								}
								query+=subQueryStr;	
								query+=']';
							}
						}
					}
					query+="}";
				}
				
				if(templateResponse.listing_columns){
					eval('var obj='+query);
					eval('var fetchFieldsobj='+fetchFieldsObj);
					var total_records=0;
					var coll= db.collection(table_name);
					coll.find(obj).count(function (e, count) {
      					total_records= count;
     				});
     	
					coll.find(obj, fetchFieldsobj).sort({Modified: -1}).skip(pageNum-1).limit(itemsPerPage).toArray(function(err, items) {
						if (err) {
							outputObj["total"]   = 0;
      						outputObj["error"]   = 'not found';
							cb(outputObj);
      					} else if (items) {
      						outputObj["total"]   = total_records;
      						outputObj["aaData"]   = items;
							cb(outputObj);
     					}
					});
				}else{
					outputObj["total"]   = 0;
      				outputObj["error"]   = 'No columns to display!';
					cb(outputObj);
				}
      		}else{
				outputObj["total"]   = 0;
      			outputObj["error"]   = "No such page exists!";
				cb(outputObj);
			}
      	});
	},
	
	returnFindOneByMongoID : function (db, collectionName, search_id, cb){
		var outputObj = new Object();
		db.collection(collectionName).findOne({_id: new mongodb.ObjectID(search_id)}, function(err, document_details) {
			if (err) {
				outputObj["error"]   = err;
				cb(outputObj);
      		} else if (document_details) {
      			outputObj["aaData"]   = document_details;
				cb(outputObj);
     		}
		});
	},
	
	
	saveEntry : function(db, table_nameStr, checkForExistence, postContent, parameterStr, findmongoID, unique_fieldStr, unique_fieldVal, cb){
		var link="";
		
		db.collection(table_nameStr).findOne({_id : findmongoID}, function(err, existingDocument) {
			var checkForExistenceObj=checkForExistence;	
			if (existingDocument) {
				if (typeof checkForExistenceObj === 'undefined' || checkForExistenceObj === null || checkForExistenceObj==""){
					checkForExistenceObj= '{'+unique_fieldStr +': \''+unique_fieldVal+'\'}';
				}
				eval('var findObj='+checkForExistenceObj);
				
				db.collection(table_nameStr).find(findObj, {"_id" : 1}).toArray(function(err, items) {
					var alreadyBool=false;
					for(var i=0; i < items.length; i++) {
						var subObject=items[i];
						if(subObject._id.toHexString() != existingDocument._id.toHexString()){
							alreadyBool=true;
						}
					}
					
					if(alreadyBool){
						link+="error_msg=This "+parameterStr+" already exists!"
      					cb(link);
					}else{
						if(existingDocument.Created){
							postContent["Created"]=existingDocument.Created;
						}else{
							postContent['Created']=self.currentTimestamp();
						}
      					db.collection(table_nameStr).update({_id:findmongoID}, postContent, (err1	, result) => {
    						if (err1) link+="error_msg=Error occurred while saving ["+err1+"], please try after some time!";
    						link+="success_msg=Updated successfully!";
    						cb(link);
  						});
					}
				});
			} else{
				if (typeof checkForExistenceObj === 'undefined' || checkForExistenceObj === null || checkForExistenceObj==""){
					var checkForExistenceObj= '{'+unique_fieldStr +': \''+unique_fieldVal+'\'}';
				}
				eval('var findStr='+checkForExistenceObj);
				
				db.collection(table_nameStr).findOne(findStr, function(err3, document) {
					if (err3) {
        				if (err3) link+="error_msg=Error occurred while saving ["+err3+"], please try after some time!";
      					cb(link);
      				}else if(document){
      					link+="error_msg=This "+parameterStr+" already exists!"
      					cb(link);
      				}else{
      					postContent['Created']=self.currentTimestamp();
      					db.collection(table_nameStr).save(postContent, (err4, result) => {
      						if (err4) link+="&error_msg=Error occurred while saving ["+err4+"], please try after some time!";
    						link+="success_msg=Saved successfully!";
    						cb(link);
  						});
      				}
				});
			}	
		});
	},
	
	currentTimestamp : function (){
		var timeStampStr=Math.round(new Date().getTime()/1000)
		return timeStampStr;
	},
	
	returnActivetokens : function (db, cb){
		db.collection('tokens').find({"Status": { $in: [ 1, "1" ] } }, {"name" : 1, "code" : 1}).toArray(function(err, tokens_result) {
			if(err) return cb(null)
			cb(tokens_result);
		});
	},
	
	returnActiveCategories : function (db, cb){
		db.collection('categories').find({"Status": { $in: [ 1, "1" ] } }, {"name" : 1, "code" : 1}).toArray(function(err, tokens_result) {
			if(err) return cb(null)
			cb(tokens_result);
		});
	},
	
	returnAllCollections : function (db, cb){
		db.listCollections().toArray(function(err, coll) {
			if(err) return cb(null)
			var allCollections=new Array();
			for(var i=0; i < coll.length; i++) {
				if(coll[i].name!="system.users"){
					allCollections.push(coll[i].name);
				}
			}
			return cb(allCollections);
		});
	},
	
	guid : function () {
  		function s4() {
    		return Math.floor((1 + Math.random()) * 0x10000)
      		.toString(16)
      		.substring(1);
  		}
  		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	},
	
	fetchTableName : function (filename){
		var table_name="";
		if(filename=="document"  || filename=="document_list" || filename=="documents_test"){
			table_name="documents";
		}else if(filename=="template" || filename=="templates"){
			table_name="templates";
		}else if(filename=="token" || filename=="tokens"){
			table_name="tokens";
		}else if(filename=="web_route" || filename=="web_routes"){
			table_name="web_routes";
		}else if(filename=="category" || filename=="categories"){
			table_name="categories";
		}else if(filename=="bookmark" || filename=="bookmarks"){
			table_name="bookmarks";
		}else if(filename=="emails" || filename=="email"){
			table_name="email_queue";
		}else if(filename=="users" || filename=="user"){
			table_name="users";
		}else if(filename=="contacts" || filename=="contact"){
			table_name="contacts";
		}else if(filename=="system_templates" || filename=="system_template"){
			table_name="system_templates";
		}else if(filename=="leads" || filename=="lead"){
			table_name="leads";
		}else if(filename=="modules" || filename=="module"){
			table_name="modules";
		}
		return table_name;
	},
	
	fetchTableColumns : function (db, table, cb) {
		var allKeys=new Array();
  		db.collection(table).findOne({}, (err, result) => {
   			if(err) return cb(allKeys)
   			for (key in result){
   				allKeys.push(key);
   			}
			return cb(allKeys);
		});
	}
};