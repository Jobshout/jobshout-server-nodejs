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
	*  server.js handles the http requests
	**/

const express = require('express');
const bodyParser= require('body-parser')
var mongodb = require('mongodb')

const app = express();
var MongoClient = mongodb.MongoClient;
var currentTimestamp =Math.round(new Date().getTime()/1000)
// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/jobshout_live';

app.use(bodyParser.urlencoded({extended: true}))

app.set('view engine', 'ejs')

app.use('/jobshout_server/list', express.static(__dirname + '/public'));
app.use('/jobshout_server', express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));

//connect to mongodb
var db
// Use connect method to connect to the Server
MongoClient.connect(url, function (err, database) {
	db=database;
  	if (err) {
    	console.log('Unable to connect to the mongoDB server. Error:', err);
  	} else {
   		console.log('Connection established to', url);
  	}
});

app.listen(3000, function() {
	//console.log('listening on 3000')	
})

//index page
app.get('/', function(req, res) {
	returnNavigation(function(resultNav) {
      	res.render('pages/index', {
      	 	navigation : resultNav 
       	});
    });
		
	/**db.collection("tokens").findOne({"code" : "about-tenthmatrix", "Status" : "1"}, {"token_content" : 1}, function(err, tokenResult) {
		if(err){
			res.render('pages/index');
		}else if(tokenResult){
			res.render('pages/index', {
				token : tokenResult.token_content
    		});
		}
	});**/
});

//clients testimonials
app.get('/client-testimonials', function(req, res) {
	returnNavigation(function(resultNav) {
      	res.render('pages/client-testimonial', {
      	 	navigation : resultNav 
       	});
    });
})

//projects undertaken
app.get('/projects-undertaken', function(req, res) {
	returnNavigation(function(resultNav) {
      	db.collection('documents').findOne({"Code" : "projects-undertaken"}, function(err, document) {
      		if (err) {
      			res.redirect('/not_found');
      		}else if(document){
				res.render('pages/projects-undertaken', {
      				resultData : document,
      	 			navigation : resultNav 
       			});
       		}else{
       			res.redirect('/not_found');
       		}
		});
	});
});

//web mail
app.get('/webmail', function(req, res) {
	res.render('pages/webmail');
}); 

//our clients
app.get('/our-clients', function(req, res) {
	returnNavigation(function(resultNav) {
      	db.collection('documents').findOne({"Code" : "our-clients"}, function(err, document) {
      		if (err) {
      			res.redirect('/not_found');
      		}else if(document){
      			res.render('pages/our-clients', {
      				resultData : document,
      	 			navigation : resultNav 
       			});
       		}else{
       			res.redirect('/not_found');
       		}
		});
	});
});

//search page
app.get('/search', function(req, res) {
	returnNavigation(function(result) {
      	res.render('pages/search', {
      		queryString : req.query.s,
      	 	navigation : result 
       	});
    });
});

//search page
app.get('/sitemap', function(req, res) {
	returnNavigation(function(resultNav) {
       	db.collection('bookmarks').find({"categories" : "sitemap"}).toArray(function(err, document) {
			res.render('pages/sitemap', {
      	 		resultData : document,
      	 		navigation : resultNav 
       		});
		});
    });
});

//search results page
app.get('/search-results', function(req, res) {
	var itemsPerPage = 10, pageNum=1;
	if(req.query.start){
		pageNum=parseInt(req.query.start);
	}
	if(req.query.limit){
		itemsPerPage=parseInt(req.query.limit);
	}
	if(pageNum==0){
		pageNum=1;
	}
	var type = req.query.type, data='', truncate = 250;
	var query="{}", fetchFieldsObj="{}";
	if(req.query.s){
		var searchStr = req.query.s;
		var regex = new RegExp(searchStr, "i");
		
		if(type=="site"){
			query= '{'
		}else{
			query= '{ "Type" : "'+type+'", "Status": { $in: [ 1, "1" ] },  ';
		}
		query+= '$or:[';
		query+="{'Document' : "+regex+" }, {'Code' :  "+regex+"}, {'Body' :  "+regex+" }, {'MetaTagDescription' :  "+regex+" }";
		query+=']';
		query+='}';
		fetchFieldsObj='{"Document" : 1, "Code" : 1, "Body" : 1}';
	}	else	{
		query= '{ "Type" : "'+type+'", "Status": { $in: [ 1, "1" ] } }';
	}
		eval('var obj='+query);
		eval('var fetchFieldsobj='+fetchFieldsObj);
		
		//console.log(itemsPerPage * (pageNum-1));
		db.collection('documents').find(obj, fetchFieldsobj).skip(pageNum-1).limit(itemsPerPage).toArray(function(err, document) {
			
			if (err) {
				var myObj = new Object();
      			myObj["total"]   = 0;
      			myObj["error"]   = 'not found';
				res.send(myObj);
      		} else if (document) {
      			if(document!=""){
      				db.collection('documents').find(obj).count(function (e, count) {
      					
      					var myObj = new Object();
      					myObj["total"]   = count;
      					myObj["aaData"]   = document;
						res.send(myObj);
     				});
					
				}else{
					var myObj = new Object();
      				myObj["total"]   = 0;
      				myObj["error"]   = 'not found';
					res.send(myObj);
				}
      		}
      	});
    /**}else{
    	var errMsg= "{ 'error' : 'not found'} ";
    	eval('var errMsg='+errMsg);
        res.send(errMsg);
    }**/
});

//404 page
app.get('/not_found', function(req, res) {
	returnNavigation(function(resultNav) {
      	res.render('pages/not_found', {
      	 	navigation : resultNav 
       	});
    });
	
});

//blog page
app.get('/blog', function(req, res) {
	returnNavigation(function(resultNav) {
      	res.render('pages/blog', {
      	 	navigation : resultNav 
       	});
    });
});

//news page
app.get('/news', function(req, res) {
	returnNavigation(function(resultNav) {
      	res.render('pages/news', {
      	 	navigation : resultNav 
       	});
    });
});

//contact page
app.get('/contact', function(req, res) {
    returnNavigation(function(resultNav) {
      	res.render('pages/contact', {
      	 	navigation : resultNav ,
      	 	queryStr : req.query
       	});
    });
});

//save contact
app.post('/contact/save', (req, res) => {
	var link="/contact";
	var postJson=req.body;
	var currentTimestamp =Math.round(new Date().getTime()/1000)
	postJson.Created=currentTimestamp;
    db.collection("contacts").save(postJson, (err, result) => {
		if (err){
    		return console.log(err);
    		link+="?msg=error";
    		res.redirect(link)
    	}else{ 
    		link+="?msg=success";
    		
    		var insertEmail=new Object();
			insertEmail["sender_name"]=req.body.name;
			insertEmail["sender_email"]=req.body.email;
			insertEmail["subject"]=req.body.subject;
			insertEmail["body"]=req.body.message;
			insertEmail["created"]=currentTimestamp;
			insertEmail["modified"]=currentTimestamp;
			insertEmail["recipient"]='bwalia@tenthmatrix.co.uk';
			insertEmail["status"]=0;
			db.collection("email_queue").save(insertEmail, (err, e_result) => {
				//console.log(e_result)
				res.redirect(link);
			})
    	} 	
  	});	
})

//save blog comment
app.post('/saveblogcomment', (req, res) => {
	var postJson=req.body;
	var currentTimestamp =Math.round(new Date().getTime()/1000)
	postJson.created=currentTimestamp;
	postJson.modified=currentTimestamp;
	postJson.status=0;
	postJson.uuid=guid();
	var blogID= req.body.blog_uuid;
	if(blogID!=""){
		var mongoIDField= new mongodb.ObjectID(blogID);
		var table_nameStr="documents";
    	db.collection(table_nameStr).findOne({_id : mongoIDField}, function(err, existingDocument) {
			var myObj = new Object();
			if(existingDocument){
				db.collection(table_nameStr).update({_id:mongoIDField}, { $push: { "BlogComments": postJson } }, (err, result) => {
    				if(result){
    					var insertEmail=new Object();
    					var nameStr=req.body.name;
						insertEmail["sender_name"]=nameStr;
						insertEmail["sender_email"]=req.body.email;
						insertEmail["subject"]=nameStr+" has posted a comment";;
						insertEmail["body"]=req.body.comment;
						insertEmail["created"]=currentTimestamp;
						insertEmail["modified"]=currentTimestamp;
						insertEmail["recipient"]='bwalia@tenthmatrix.co.uk';
						insertEmail["status"]=0;
						db.collection("email_queue").save(insertEmail, (err, e_result) => {
							myObj["success"]   = "Thanks your comment has been posted OK and will be visible soon!";
							res.send(myObj);
						})
    				}else{
    					myObj["error"]   = "Error posting comment. Please try again later!!!";
						res.send(myObj);
    				}
    			});
				
			}else{
				myObj["error"]   = "Error posting comment. Please try again later!!!";
				res.send(myObj);
			}	
  		});	
  	}
})

//content page

app.get('/:id', function(req, res) {
	returnNavigation(function(resultNav) {
      	db.collection('documents').findOne({Code: req.params.id}, function(err, document) {
			if (err) {
        		console.log(err);
      		} else if (document) {
      			res.render('pages/content', {
        			document_details: document,
        			db_connection : db,
        			navigation : resultNav 
    			});
      		} else {
        		res.redirect('/not_found');
      		}
    	}); 
    });
}); 

//jobshout_server pages
app.get('/jobshout_server/index', function(req, res) {
	res.render('jobshout_server/index');
}); 

//jobshout_server pages
app.get('/jobshout_server/test', function(req, res) {
	res.render('jobshout_server/test');
}); 
app.get('/jobshout_server/web_route', function(req, res) {
	var allCollections=new Array();
	var queryString= req.query;
	
	var contentObj= "";
	var pageRequested = "web_route";
	db.listCollections().toArray(function(err, coll) {
		for(var i=0; i < coll.length; i++) {
			allCollections.push(coll[i].name);
		}
		if(queryString.id){
			var o_id = new mongodb.ObjectID(queryString.id);
			
			db.collection("web_routes").findOne({_id: o_id}, function(err, document) {
				if (err) {
        			console.log(err);
      			} else if (document) {
      				contentObj=document;
      			} 
      			res.render('jobshout_server/'+pageRequested, {
      	 			db_connection : db,
       				queryStr : req.query,
       				contentObj : contentObj,
       				collectionName : allCollections
    			});
    		}); 
		}else{
			res.render('jobshout_server/'+pageRequested, {
      	 		db_connection : db,
       			queryStr : req.query,
       			contentObj : contentObj,
       			collectionName : allCollections
    		});		
  	  	}
	});   	
}); 

app.get('/jobshout_server/list/:id', function(req, res) {
	var itemsPerPage = 25;
	var pageRequested = req.params.id;
	var table_name=fetchTableName(pageRequested);
	var queryString= req.query;
	var pageNum=1, query="{}";
	var keywordStr="";
	
	if(queryString.page){
		pageNum=queryString.page;
	}
	//console.log(table_name)
	if(queryString.keyword){
		keywordStr=queryString.keyword;
		
		var regex = new RegExp(queryString.keyword, "i");
		query= '{'
		query+= '$or:[';
		if(table_name=="documents"){
			query+="{'Document' : "+regex+" }, {'Code' :  "+regex+"}, {'Body' :  "+regex+" } ";
		}else if(table_name=="web_routes"){
			query+="{'route_url' : "+regex+" }, {'document' :  "+regex+"}, {'template' :  "+regex+" }, {'table_selected' :  "+regex+" } ";
		}else if(table_name=="tokens" || table_name=="templates" || table_name=="categories"){
			query+="{'name' : "+regex+" }, {'code' :  "+regex+"}, {'description' :  "+regex+" } ";
		}else if(table_name=="bookmarks"){
			query+="{'categories' : "+regex+" }, {'label' :  "+regex+"}, {'content' :  "+regex+" }, {'type' :  "+regex+" }, {'bookmark_items' :  "+regex+" } ";
		}else if(table_name=="email_queue"){
			query+="{'sender_name' : "+regex+" }, {'sender_email' :  "+regex+"}, {'recipient' :  "+regex+" } , {'subject' :  "+regex+" } ";
		}else if(table_name=="contacts"){
			query+="{'name' : "+regex+" }, {'email' :  "+regex+"}, {'phone' :  "+regex+" } , {'subject' :  "+regex+" }, {'message' :  "+regex+" } ";
		}
		query+=']';
		query+='}';
	}
	
	eval('var obj='+query);
	if(table_name!=""){
		var total_records=0;
		var coll= db.collection(table_name);
		coll.find(obj).count(function (e, count) {
      		total_records= count;
     	});

		db.collection(table_name).find(obj).skip(itemsPerPage * (pageNum-1)).limit(itemsPerPage).toArray(function(err, document) {
			if (err) {
        		console.log(err);
      		} else if (document) {
				res.render('jobshout_server/'+pageRequested, {
        			document_details: document,
        			db_connection : db,
        			total_count : total_records,
        			itemsPerPage : itemsPerPage,
        			currentPage : pageNum,
        			currentUrl : pageRequested,
        			searched_keyword : keywordStr
    			});
      		} else {
        		res.redirect('/jobshout_server/index');
      		}
      });
      
	}else {
    	res.redirect('/jobshout_server/index');
    }	
}); 

function returnNavigation(cb){
	db.collection('bookmarks').find({"Status": { $in: [ 1, "1" ] } , categories: { $in: [ 'footer-nav', 'top-navigation' ] }}).sort( { order_by_num: 1 } ).toArray(function(err, tokens_result) {
		if(err) return cb(null)
		cb(tokens_result);
	});
}

function returnActivetokens(cb){
	db.collection('tokens').find({"Status": { $in: [ 1, "1" ] } }, {"name" : 1, "code" : 1}).toArray(function(err, tokens_result) {
		if(err) return cb(null)
		cb(tokens_result);
	});
}
function returnActiveCategories(cb){
	db.collection('categories').find({"Status": { $in: [ 1, "1" ] } }, {"name" : 1, "code" : 1}).toArray(function(err, tokens_result) {
		if(err) return cb(null)
		cb(tokens_result);
	});
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

app.get('/jobshout_server/:id', function(req, res) {
	var pageRequested = req.params.id;
	var queryString= req.query;
	var contentObj= "";
	var table_name =fetchTableName(pageRequested);
	
	if(table_name!=""){
		var tokensArr= new Array();
		
		if(queryString.id){
			var o_id = new mongodb.ObjectID(queryString.id);
			db.collection(table_name).findOne({_id: o_id}, function(err, document) {
				if (err) {
        			console.log(err);
      			} else if (document) {
      				contentObj=document;
      			} 
      			if(table_name=="templates"){
      				returnActivetokens(function(result) {
      					res.render('jobshout_server/'+pageRequested, {
      	 					db_connection : db,
       						queryStr : req.query,
       						contentObj : contentObj,
       						tokens : result 
       					});
    				});
      			}else if(table_name=="bookmarks"){
      				returnActiveCategories(function(result) {
      					res.render('jobshout_server/'+pageRequested, {
      	 					db_connection : db,
       						queryStr : req.query,
       						contentObj : contentObj,
       						categoriesdropdown : result 
       					});
    				});
      			}else{
      				res.render('jobshout_server/'+pageRequested, {
      	 				db_connection : db,
       					queryStr : req.query,
       					contentObj : contentObj,
       					tokens : tokensArr
    				});
    			}
    		}); 
		}else{
			if(table_name=="templates"){
      			returnActivetokens(function(result) {
      				res.render('jobshout_server/'+pageRequested, {
      	 				db_connection : db,
       					queryStr : req.query,
       					contentObj : contentObj,
       					tokens : result 
       				});
    			});
      		}else if(table_name=="bookmarks"){
      			returnActiveCategories(function(result) {
      				res.render('jobshout_server/'+pageRequested, {
      	 				db_connection : db,
       					queryStr : req.query,
       					contentObj : contentObj,
       					categoriesdropdown : result 
       				});
    			});
      		}else{
      			res.render('jobshout_server/'+pageRequested, {
      	 			db_connection : db,
       				queryStr : req.query,
       				contentObj : contentObj,
       				tokens : tokensArr
    			});
    		}	
  	  	}
  	  	
    }else {
    	res.redirect('/jobshout_server/index');
    }	
}); 

/**app.post('/jobshout_server/save', (req, res) => {
	var postJson=req.body;
	db.collection('documents_new').save(postJson, (err, result) => {
      	if (err) return console.log(err)
    	res.end();
  	});       
})**/


app.post('/jobshout_server/:id/save', (req, res) => {
	var postJson=req.body;
	var idField="";
	var currentTimestamp =Math.round(new Date().getTime()/1000)
	postJson.Modified=currentTimestamp;
	var table_nameStr=postJson.table_name;
	var unique_fieldStr=postJson.unique_field;
	var unique_fieldVal="";
	var link ="/jobshout_server/"+req.params.id;
	
	for(var key in postJson) {
		if(key==unique_fieldStr){
   		 unique_fieldVal= postJson[key];
   		}
	}
	if(postJson.id){
		idField=postJson.id;
		var mongoIDField= new mongodb.ObjectID(idField);
		delete postJson.id;
	}
	
	var checkForExistence= '{'+unique_fieldStr +': \''+unique_fieldVal+'\'}';
	
	eval('var obj='+checkForExistence);
	//console.log(obj+" "+table_nameStr)
	if(table_nameStr=="documents"){
		var insertDocument=new Object();
		insertDocument["Document"]=req.body.Document;
		insertDocument["Code"]=req.body.Code;
		insertDocument["Title"]=req.body.Title;
		insertDocument["MetaTagDescription"]=req.body.MetaTagDescription;
		insertDocument["MetaTagKeywords"]=req.body.MetaTagKeywords;
		insertDocument["PageTitle"]=req.body.PageTitle;
		insertDocument["Body"]=req.body.Body;
		insertDocument["Type"]=req.body.type;
		if(req.body.image_path){
			var virtualObject = new Object();
			virtualObject["image_path"]=req.body.image_path;
			insertDocument["virtualFields"]=virtualObject;
		}
		
		if(req.body.chk_manual){
			insertDocument["chk_manual"]=1;
		}else{
			insertDocument["chk_manual"]=0;
		}
		
		if(req.body.Status==1 || req.body.Status=="1"){
			insertDocument["Status"]=1;
		}else{
			insertDocument["Status"]=0;
		}
		
		insertDocument["Modified"]=currentTimestamp;
		var objectArr= new Array();
		if(req.body.new_obj_code!="" && req.body.new_obj_code!=null && req.body.new_obj_code!="undefined"){
			var insertObject = new Object();
			insertObject["uuid"]=guid();
			insertObject["code"]=req.body.new_obj_code;
			insertObject["Modified"]=currentTimestamp;
			insertObject["name"]=req.body.new_obj_heading;
			insertObject["content"]=req.body.new_obj_content;
			insertObject["order_by"]=req.body.new_obj_order;
			insertObject["status"]=req.body.new_obj_status;
			if(req.body.new_obj_chk_manual){
				insertObject["chk_manual"]=1;
			}else{
				insertObject["chk_manual"]=0;
			}
			objectArr.push(insertObject);
		}
		
		if(req.body.obj_id){
			var subObjects=req.body.obj_id;
			for(var count=0; count < subObjects.length; count++){
				var uniqueStr=subObjects[count];
				if(req.body["obj_code_"+uniqueStr]!="" && req.body["obj_code_"+uniqueStr]!=null && req.body["obj_code_"+uniqueStr]!="undefined"){
				
				var insertObject = new Object();
				insertObject["uuid"]=guid();
				insertObject["code"]=req.body["obj_code_"+uniqueStr];
				insertObject["Modified"]=currentTimestamp;
				insertObject["name"]=req.body["obj_heading_"+uniqueStr];
				insertObject["content"]=req.body["obj_content__"+uniqueStr];
				insertObject["order_by"]=req.body["obj_order__"+uniqueStr];
				insertObject["status"]=req.body["obj_status_"+uniqueStr];
				if(req.body["obj_chk_manual__"+uniqueStr]){
					insertObject["chk_manual"]=1;
				}else{
					insertObject["chk_manual"]=0;
				}
				objectArr.push(insertObject);
				}
			}
		}
		insertDocument["Objects"]=objectArr;
		
		if(req.body.type=="blog"){
			var BlogCommentsArr= new Array();
			if(req.body.blog_id){
				var blogComments=req.body.blog_id;
				for(var count=0; count < blogComments.length; count++){
					var uniqueStr=blogComments[count];
					if(req.body["blog_name_"+uniqueStr]!="" && req.body["blog_name_"+uniqueStr]!=null && req.body["blog_name_"+uniqueStr]!="undefined"){
						var insertComment = new Object();
						insertComment["uuid"]=guid();
						insertComment["modified"]=currentTimestamp;
						insertComment["name"]=req.body["blog_name_"+uniqueStr];
						insertComment["email"]=req.body["blog_email_"+uniqueStr];
						insertComment["website"]=req.body["blog_website_"+uniqueStr];
						insertComment["comment"]=req.body["blog_comment_"+uniqueStr];
						insertComment["created"]=req.body["blog_created__"+uniqueStr];
						insertComment["status"]=req.body["blog_status__"+uniqueStr];
						BlogCommentsArr.push(insertComment);
					}
				}
			}
			insertDocument["BlogComments"]=BlogCommentsArr;
			//console.log(BlogCommentsArr)
		}
		
		db.collection(table_nameStr).findOne(obj, function(err, document) {
			if (err) {
        		console.log(err);
      		} else if (document) {
      			db.collection(table_nameStr).findOne({_id : mongoIDField}, function(err1, existingDocument) {
      				if (existingDocument) {
      					insertDocument["Created"]=existingDocument.Created;
      					db.collection(table_nameStr).update({_id:mongoIDField}, insertDocument, (err, result) => {
    						if (err) return console.log(err)
							link+="?id="+idField;
    						res.redirect(link)
  						});
      				}else{
      					link+="?error_msg=This "+req.params.id+" already exists!"
      					res.redirect(link)
      				}
      			});
      		} else {
      			insertDocument["Created"]=currentTimestamp;
      			db.collection(table_nameStr).save(insertDocument, (err, result) => {
      				if (err) return console.log(err)
    				link+="?success_msg=Saved successfully!";
    				res.redirect(link)
  				});
      	  	}
      });
		
	}else if(table_nameStr=="bookmarks"){
		var checkForExistence= '{'+unique_fieldStr +': \''+unique_fieldVal+'\', "categories": \''+req.body.categories+'\'}';
		eval('var obj='+checkForExistence);
		//console.log(obj)
		db.collection(table_nameStr).findOne(obj, function(err, document) {
		if (err) {
        	console.log(err);
      	} else if (document) {
      		//console.log(mongoIDField);
      		db.collection(table_nameStr).findOne({_id : mongoIDField}, function(err1, existingDocument) {
      			if (existingDocument) {
      				postJson["Created"]=existingDocument.Created;
      				db.collection(table_nameStr).update({_id:mongoIDField}, postJson, (err, result) => {
    					if (err) return console.log(err)
						//console.log('updated to database')
						link+="?id="+idField;
    					res.redirect(link)
  					});
      			}else{
      				link+="?error_msg=This "+req.params.id+" already exists!"
      				res.redirect(link)
      			}
      		});
      	} else {
      		postJson.Created=currentTimestamp;
      		db.collection(table_nameStr).save(postJson, (err, result) => {
      			//console.log(result);
    			if (err) return console.log(err)
    			link+="?success_msg=Saved successfully!";
    			res.redirect(link)
  			});
        }
      	});
	}else if(table_nameStr=="email_queue"){
		db.collection(table_nameStr).findOne({_id : mongoIDField}, function(err1, existingDocument) {
      		if (existingDocument) {
      			postJson["Created"]=existingDocument.Created;
      			db.collection(table_nameStr).update({_id:mongoIDField}, postJson, (err, result) => {
    				if (err) return console.log(err)
					link+="?id="+idField;
    				res.redirect(link)
  				});
      		}else{
      			postJson.Created=currentTimestamp;
      			db.collection(table_nameStr).save(postJson, (err, result) => {
      				if (err) return console.log(err)
    				link+="?success_msg=Saved successfully!";
    				res.redirect(link)
  				});
      		}
      	});
	}else{
	db.collection(table_nameStr).findOne(obj, function(err, document) {
		
		if (err) {
        	console.log(err);
      	} else if (document) {
      		//console.log(mongoIDField);
      		db.collection(table_nameStr).findOne({_id : mongoIDField}, function(err1, existingDocument) {
      			if (existingDocument) {
      				postJson["Created"]=existingDocument.Created;
      				db.collection(table_nameStr).update({_id:mongoIDField}, postJson, (err, result) => {
    					if (err) return console.log(err)
						//console.log('updated to database')
						link+="?id="+idField;
    					res.redirect(link)
  					});
      			}else{
      				link+="?error_msg=This "+req.params.id+" already exists!"
      				res.redirect(link)
      			}
      		});
      	} else {
      		postJson.Created=currentTimestamp;
      		db.collection(table_nameStr).save(postJson, (err, result) => {
      			//console.log(result);
    			if (err) return console.log(err)
    			link+="?success_msg=Saved successfully!";
    			res.redirect(link)
  			});
        }
      
	});
	
	}
})

function closeDBConnection(db){
	db.close();
}

function fetchTableName(filename){
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
	}else if(filename=="contacts" || filename=="contact"){
		table_name="contacts";
	}
	return table_name;
}

app.locals.backendDirectory = "jobshout_server";

app.locals.timeConverter = function(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = month + ' ' + date + ' ' + year + ', ' + hour + ':' + min ;
  return time;
}

app.locals.dynamicSort = function(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}