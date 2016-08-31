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
var passwordHash = require('password-hash');
var cookieParser = require('cookie-parser');

const app = express();
var MongoClient = mongodb.MongoClient;
var currentTimestamp =Math.round(new Date().getTime()/1000)
// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/jobshout_live';

var backendDirName="jobshout_server";
var cookieName="jobshout_login";

app.use(cookieParser());
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
	console.log('listening on 3000')	
})

//index page
app.get('/', function(req, res) {
	returnNavigation(function(resultNav) {
      	res.render('pages/index', {
      	 	navigation : resultNav 
       	});
    });
});

//clients testimonials
app.get('/client-testimonials', function(req, res) {
	returnNavigation(function(resultNav) {
      	res.render('pages/client-testimonial', {
      	 	navigation : resultNav 
       	});
    });
})

//unsubscribe
app.get('/unsubscribe', function(req, res) {
	var email_to='', contact_uuid= '', uuid='', unsubscribed=1;
	if(req.query.email_to){
		email_to=req.query.email_to;
	}
	if(req.query.contact_uuid){
		contact_uuid=req.query.contact_uuid;
	}
	if(req.query.uuid){
		uuid=req.query.uuid;
	}
	if(req.query.s){
		unsubscribed=req.query.s;
	}
	if(email_to!="" && uuid!=""){
		var queryStr='email_to='+email_to+'&contact_uuid='+contact_uuid+'&uuid='+uuid+'&s=0';
		db.collection('mailing_preferences').findOne({"email_address" : email_to, "uuid" : uuid}, function(err, foundRecord) {
			if (typeof foundRecord !== 'undefined' && foundRecord !== null && foundRecord.uuid!="") {
    	  		var updateContent=new Object();
    	  		updateContent["modified"]=nowTimestamp();
    	  		updateContent["uuid"]=foundRecord.uuid;
    	  		updateContent["contact_uuid"]=foundRecord.contact_uuid;
    	  		updateContent["email_address"]=email_to;
    	  		updateContent["unsubscribed"]=unsubscribed;
    	  		db.collection('mailing_preferences').update({"email_address" : email_to, "uuid" : uuid}, updateContent, (updateErr, result) => {
    	  			var tokenFlag=false;
    	  			if(result){
    	  				tokenFlag=true;
    	  			}
    	  			returnNavigation(function(resultNav) {
      					res.render('pages/unsubscribe', {
      	 					navigation : resultNav,
      	 					tokenBool : tokenFlag,
      	 					emailAddress : email_to,
      	 					queryString : queryStr,
      	 					unsubscribed : unsubscribed
       					});
    				});
    	  		});
    	  	}else{
    	  		var addContent=new Object();
    	  		addContent["modified"]=nowTimestamp();
    	  		addContent["uuid"]=uuid;
    	  		addContent["contact_uuid"]=contact_uuid;
    	  		addContent["unsubscribed"]=unsubscribed;
    	  		addContent["email_address"]=email_to;
    	  		db.collection("mailing_preferences").save(addContent, (insertErr, result) => {
    	  			var tokenFlag=false;
    	  			if(result){
    	  				tokenFlag=true;
    	  			}
    	  			returnNavigation(function(resultNav) {
      					res.render('pages/unsubscribe', {
      	 					navigation : resultNav,
      	 					tokenBool : tokenFlag,
      	 					emailAddress : email_to,
      	 					queryString : queryStr,
      	 					unsubscribed : unsubscribed
       					});
    				});
    			});
    	  	}
    	});
    }else{
    	returnNavigation(function(resultNav) {
      		res.render('pages/unsubscribe', {
      	 		navigation : resultNav,
      	 		tokenBool : false
       		});
    	});
    }
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
    	db.collection('tokens').findOne({"code" : "contact-page-address"}, function(errdoc, addressContent) {
			res.render('pages/contact', {
      	 		navigation : resultNav ,
      	 		address_token: addressContent,
      	 		queryStr : req.query
       		});
		});
   	});
});

//save contact
app.post('/contact/save', (req, res) => {
	var link="/contact";
	var postJson=req.body;
	var currentTimestamp =Math.round(new Date().getTime()/1000)
	postJson.Created=currentTimestamp;
    db.collection("website_enquiries").save(postJson, (err, result) => {
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
app.get('/'+backendDirName+'/index', requireLogin, function(req, res) {
	res.render(backendDirName+'/index', {
      	 authenticatedUser : req.authenticatedUser
    });
}); 

app.get('/'+backendDirName+'/test', function(req, res) {
	res.render(backendDirName+'/test');
}); 

//jobshout_server logout
app.get('/'+backendDirName+'/logout', function(req, res) {
	if(req.cookies[cookieName] != null && req.cookies[cookieName] != 'undefined' && req.cookies[cookieName]!=""){
		var mongoIDField= new mongodb.ObjectID(req.cookies[cookieName]);
		res.clearCookie(cookieName);
		db.collection('sessions').remove({"_id":mongoIDField},function(err,result){
    		res.redirect('/'+backendDirName+'/sign-in');
    	});
   	}else{
   		res.redirect('/'+backendDirName+'/sign-in');
   	}	
}); 

//sign in page
app.get('/'+backendDirName+'/sign-in', function(req, res) {
	res.render(backendDirName+'/sign-in', {
      	 queryStr : req.query
    });
})

//validate user
app.post('/'+backendDirName+'/validlogin', (req, res) => {
	var postJson=req.body;
	
	var checkForExistence= '{"email": \''+postJson.email+'\', "status": { $in: [ 1, "1" ] }}';
	eval('var obj='+checkForExistence);
	db.collection('users').findOne(obj, function(err, document) {
		if (document) {
			if(passwordHash.verify(postJson.password, document.password)){
				db.collection('sessions').save({"user_id": document._id, "status" : true}, (err, result) => {
					if (result){
      					res.cookie(cookieName , result["ops"][0]["_id"])
      					res.redirect('/'+backendDirName+'/index');
      				}else{
      					res.redirect('/'+backendDirName+'/sign-in?error=no');
    				}
  				});
				
			}else{
      			res.redirect('/'+backendDirName+'/sign-in?error=password');
      		}
      	} else {
      		res.redirect('/'+backendDirName+'/sign-in?error=no');
        }
      
	});
	
})

app.get('/'+backendDirName+'/web_route', requireLogin, function(req, res) {
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
      			res.render(backendDirName+'/'+pageRequested, {
      	 			db_connection : db,
       				queryStr : req.query,
       				contentObj : contentObj,
       				collectionName : allCollections,
       				authenticatedUser : req.authenticatedUser
    			});
    		}); 
		}else{
			res.render(backendDirName+'/'+pageRequested, {
      	 		db_connection : db,
       			queryStr : req.query,
       			contentObj : contentObj,
       			collectionName : allCollections,
       			authenticatedUser : req.authenticatedUser
    		});		
  	  	}
	});   	
}); 

app.get('/'+backendDirName+'/list_forms/', requireLogin, function(req, res) {
	var itemsPerPage = 10, pageNum=1, templateStr="";
	var outputObj = new Object();
	if(req.query.templateStr){
		templateStr=req.query.templateStr;
	}
	if(templateStr!=""){
		db.collection('system_templates').findOne({"code": templateStr , "status": { $in: [ 1, "1" ] } }, function(err, templateResponse) {
			if(err){
				outputObj["error"]   = "No such page exists!";
				res.send(outputObj);
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
							res.send(outputObj);
      					} else if (items) {
      						outputObj["total"]   = total_records;
      						outputObj["aaData"]   = items;
							res.send(outputObj);
     					}
					});
				}else{
					outputObj["total"]   = 0;
      				outputObj["error"]   = 'No columns to display!';
					res.send(outputObj);
				}
      		}else{
				outputObj["total"]   = 0;
      			outputObj["error"]   = "No such page exists!";
				res.send(outputObj);
			}
      	});
	}else{
		outputObj["total"]   = 0;
      	outputObj["error"]   = "No such page exists!";
		res.send(outputObj);
	}
}); 

app.get('/'+backendDirName+'/list/:id', requireLogin, function(req, res) {
	var pageRequested = req.params.id;
	var queryString= req.query;
	var keywordStr="";
	
	if(queryString.keyword){
		keywordStr=queryString.keyword;
	}
	
	res.render(backendDirName+'/standard_listing', {
        currentTemplate : pageRequested,
        searched_keyword : keywordStr,
        authenticatedUser : req.authenticatedUser
    });
})

app.get('/'+backendDirName+'/fetchTableColumns', requireLogin, function(req, res) {
	fetchTableColumns(req.query.e, function(result) {	
		res.send(result);
	})
});

app.get('/'+backendDirName+'/:id', requireLogin, function(req, res) {
	var pageRequested = req.params.id;
	var queryString= req.url;
	var removeUrl='/'+backendDirName+'/'+req.params.id+'?';
	
	queryString= queryString.substr(removeUrl.length);
	
	if(queryString.indexOf("&")>-1){
		queryString= queryString.substr(0,queryString.indexOf("&"));
	}
	
	var editFieldName="", editFieldVal="";
	
	if(queryString.indexOf("=")>-1){
		editFieldName=queryString.substr(0,queryString.indexOf("="));
		editFieldVal=queryString.substr(queryString.indexOf("=")+1);
	}
	
	//console.log(editFieldName+" : "+editFieldVal)
	var contentObj= "";
	var table_name =fetchTableName(pageRequested);
	
	if(table_name!=""){
		var tokensArr= new Array();
		if (typeof editFieldVal !== 'undefined' && editFieldVal !== null) {
			
			if(editFieldName=="_id"){
				db.collection(table_name).findOne({_id: new mongodb.ObjectID(editFieldVal)}, function(err, document) {
					if (err) {
        				console.log(err);
      				} else if (document) {
      					contentObj=document;
      				} 
      				if(table_name=="templates"){
      					returnActivetokens(function(result) {
      						res.render(backendDirName+'/'+pageRequested, {
      	 						editorField : editFieldName,
      	 						editorValue : editFieldVal,
       							queryStr : req.query,
       							contentObj : contentObj,
       							tokens : result,
       							authenticatedUser : req.authenticatedUser
       						});
    					});
      				}else if(table_name=="bookmarks"){
      					returnActiveCategories(function(result) {
      						res.render(backendDirName+'/'+pageRequested, {
      	 						editorField : editFieldName,
      	 						editorValue : editFieldVal,
       							queryStr : req.query,
       							contentObj : contentObj,
       							categoriesdropdown : result,
       							authenticatedUser : req.authenticatedUser 
       						});
    					});
      				}else if(table_name=="system_templates"){
      					returnAllCollections(function(result) {	
							res.render(backendDirName+'/'+pageRequested, {
      	 						editorField : editFieldName,
      	 						editorValue : editFieldVal,
      	 						collectionsArr : result,
       							queryStr : req.query,
       							contentObj : contentObj,
       							tokens : tokensArr,
       							authenticatedUser : req.authenticatedUser
    						});
						});
      				}else{
      					res.render(backendDirName+'/'+pageRequested, {
      	 					editorField : editFieldName,
      	 					editorValue : editFieldVal,
       						queryStr : req.query,
       						contentObj : contentObj,
       						tokens : tokensArr,
       						authenticatedUser : req.authenticatedUser
    					});
    				}
    			}); 
			}else{
				var queryStr="{'"+editFieldName+"': '"+editFieldVal+"'}";
				eval('var queryObj='+queryStr);
				db.collection(table_name).findOne(queryObj, function(err, document) {
					if (err) {
        				console.log(err);
      				} else if (document) {
      					contentObj=document;
      				} 
      				if(table_name=="templates"){
      					returnActivetokens(function(result) {
      						res.render(backendDirName+'/'+pageRequested, {
      	 						editorField : editFieldName,
      	 						editorValue : editFieldVal,
       							queryStr : req.query,
       							contentObj : contentObj,
       							tokens : result,
       							authenticatedUser : req.authenticatedUser
       						});
    					});
      				}else if(table_name=="bookmarks"){
      					returnActiveCategories(function(result) {
      						res.render(backendDirName+'/'+pageRequested, {
      	 						editorField : editFieldName,
      	 						editorValue : editFieldVal,
       							queryStr : req.query,
       							contentObj : contentObj,
       							categoriesdropdown : result,
       							authenticatedUser : req.authenticatedUser 
       						});
    					});
      				}else if(table_name=="system_templates"){
      					returnAllCollections(function(result) {	
							res.render(backendDirName+'/'+pageRequested, {
      	 						editorField : editFieldName,
      	 						editorValue : editFieldVal,
      	 						collectionsArr : result,
       							queryStr : req.query,
       							contentObj : contentObj,
       							tokens : tokensArr,
       							authenticatedUser : req.authenticatedUser
    						});
						});
      				}else{
      					res.render(backendDirName+'/'+pageRequested, {
      	 					editorField : editFieldName,
      	 					editorValue : editFieldVal,
       						queryStr : req.query,
       						contentObj : contentObj,
       						tokens : tokensArr,
       						authenticatedUser : req.authenticatedUser
    					});
    				}
    			});
    		} 
		}else{
			if(table_name=="templates"){
      			returnActivetokens(function(result) {
      				res.render(backendDirName+'/'+pageRequested, {
      	 				queryStr : req.query,
       					contentObj : contentObj,
       					tokens : result,
       					authenticatedUser : req.authenticatedUser 
       				});
    			});
      		}else if(table_name=="system_templates"){
      			returnAllCollections(function(result) {	
					res.render(backendDirName+'/'+pageRequested, {
      	 				collectionsArr : result,
       					queryStr : req.query,
       					contentObj : contentObj,
       					authenticatedUser : req.authenticatedUser
    				});
						
				});
      		}else if(table_name=="bookmarks"){
      			returnActiveCategories(function(result) {
      				res.render(backendDirName+'/'+pageRequested, {
      	 				queryStr : req.query,
       					contentObj : contentObj,
       					categoriesdropdown : result,
       					authenticatedUser : req.authenticatedUser 
       				});
    			});
      		}else{
      			res.render(backendDirName+'/'+pageRequested, {
      	 			queryStr : req.query,
       				contentObj : contentObj,
       				tokens : tokensArr,
       				authenticatedUser : req.authenticatedUser
    			});
    		}	
  	  	}
  	}else {
    	res.redirect('/'+backendDirName+'/index');
    }	
}); 

app.post('/'+backendDirName+'/save/:id', requireLogin, (req, res) => {
	var postJson=req.body;
	var idField="", editorFieldName="", editorFieldVal="", checkForExistence="";
	postJson.Modified=currentTimestamp;
	postJson.Created=currentTimestamp;
	var table_nameStr=postJson.table_name;
	var unique_fieldStr=postJson.unique_field;
	var unique_fieldVal="";
	var link ="/"+backendDirName+"/"+req.params.id;
	
	for(var key in postJson) {
		if(key==unique_fieldStr){
   		 unique_fieldVal= postJson[key];
   		}
	}
	if (typeof postJson.editorField !== 'undefined' && postJson.editorField !== null && postJson.editorField !== "") { 
		editorFieldName=postJson.editorField;
		delete postJson.editorField;
	}else if(postJson.editorField){
		delete postJson.editorField;
	}
	
	if (typeof postJson.editorValue !== 'undefined' && postJson.editorValue !== null && postJson.editorValue !== null) { 
		editorFieldVal=postJson.editorValue;
		delete postJson.editorValue;
	}else if(postJson.editorValue){
		delete postJson.editorValue;
	}
	if(postJson.id){
		idField=postJson.id;
		var mongoIDField= new mongodb.ObjectID(idField);
		delete postJson.id;
		if(editorFieldName=="" && editorFieldVal==""){
    		editorFieldName="id";
    		editorFieldVal=idField;
    	}
	}
	if(postJson.table_name){
		delete postJson.table_name;
	}
	if(postJson.unique_field){
		delete postJson.unique_field;
	}
	
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
		var publishedTimestamp=req.body.Published_timestamp;
		var publishedTimestampNum= (new Date(publishedTimestamp).getTime() / 1000).toFixed(0);
		insertDocument["Published_timestamp"]=publishedTimestampNum;
		
		if(req.body.image_path){
			var virtualObject = new Object();
			virtualObject["image_path"]=req.body.image_path;
			insertDocument["virtualFields"]=virtualObject;
		}
		
		
		if(req.body.chk_manual){
			insertDocument["AutoFormat"]=1;
		}else{
			insertDocument["AutoFormat"]=0;
		}
		
		if(req.body.chk_manual_metatags){
			insertDocument["AutoFormatMetaData"]=1;
		}else{
			insertDocument["AutoFormatMetaData"]=0;
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
		}
		
		saveEntry(table_nameStr, checkForExistence, insertDocument, req.params.id, mongoIDField, unique_fieldStr, unique_fieldVal, function(result) {
			var tempLink="";
			if(editorFieldName!="" && editorFieldVal!=""){
    			tempLink+="?"+editorFieldName+"="+editorFieldVal;
    			link+=tempLink;
    		}
    		if(result){
    			if(tempLink!=""){
    				link+="&"+result;
    			}else{
    				link+="?"+result;
    			}
    		}
    		
			res.redirect(link);
  		});
		
	}else if(table_nameStr=="bookmarks"){
		checkForExistence= '{\''+unique_fieldStr +'\': \''+unique_fieldVal+'\', "categories": \''+req.body.categories+'\'}';

		saveEntry(table_nameStr, checkForExistence, postJson, req.params.id, mongoIDField, unique_fieldStr, unique_fieldVal, function(result) {
			var tempLink="";
			if(editorFieldName!="" && editorFieldVal!=""){
    			tempLink+="?"+editorFieldName+"="+editorFieldVal;
    			link+=tempLink;
    		}
    		if(result){
    			if(tempLink!=""){
    				link+="&"+result;
    			}else{
    				link+="?"+result;
    			}
    		}
    		
			res.redirect(link);
  		});
	}else if(table_nameStr=="email_queue"){
		db.collection(table_nameStr).findOne({_id : mongoIDField}, function(err1, existingDocument) {
      		if (existingDocument) {
      			postJson["Created"]=existingDocument.Created;
      			db.collection(table_nameStr).update({_id:mongoIDField}, postJson, (err, result) => {
    				if (err) link+="?error_msg=Error occurred while saving ["+err+"], please try after some time!";
					if(editorFieldName!="" && editorFieldVal!=""){
    					link+="?"+editorFieldName+"="+editorFieldVal;
    				}else{
						link+="?_id="+idField;
					}
    				res.redirect(link)
  				});
      		}else{
      			postJson.Created=currentTimestamp;
      			db.collection(table_nameStr).save(postJson, (err, result) => {
      				if (err) link+="?error_msg=Error occurred while saving ["+err+"], please try after some time!";
    				link+="?success_msg=Saved successfully!";
    				res.redirect(link)
  				});
      		}
      	});
	}
	else if(table_nameStr=="users"){
		if (typeof postJson.password !== 'undefined' && postJson.password !== null && postJson.password != "") {
      		postJson['password'] = passwordHash.generate(postJson.password);
      	}
      	checkForExistence= '{'+unique_fieldStr +': \''+unique_fieldVal+'\'}';
      	eval('var obj='+checkForExistence);
		db.collection(table_nameStr).findOne(obj, function(err, document) {
			if (err) {
        		if (err) link+="?error_msg=Error occurred while saving ["+err+"], please try after some time!";
      		} else if (document) {
      			db.collection(table_nameStr).findOne({_id : mongoIDField}, function(err1, existingDocument) {
      				if (existingDocument) {
      					postJson["Created"]=existingDocument.Created;
      				
      					var  updaTeContent="{ $set: { ";
      					for(var key in postJson) {
							updaTeContent+="'"+key+"' : '"+postJson[key]+"',";
						}
						updaTeContent = updaTeContent.replace(/,([^,]*)$/,'$1');
						updaTeContent+="}	} ";
					 
						eval('var obj='+updaTeContent);
					 
						db.collection(table_nameStr).update({_id:mongoIDField}, obj, (err, result) => {
    						if (err) link+="?error_msg=Error occurred while saving ["+err+"], please try after some time!";
							
							if(editorFieldName!="" && editorFieldVal!=""){
    							link+="?"+editorFieldName+"="+editorFieldVal;
    						}
    						res.redirect(link)
  						});
      				}else{
      					link+="?error_msg=This "+req.params.id+" already exists!"
      					res.redirect(link)
      				}
      			});
      		} else {
      			postJson.Created=currentTimestamp;
      			db.collection(table_nameStr).findOne({_id : mongoIDField}, function(err1, existingDocument) {
      				if (existingDocument) {
      					postJson["Created"]=existingDocument.Created;
      				
      					var  updaTeContent="{ $set: { ";
      					for(var key in postJson) {
							updaTeContent+="'"+key+"' : '"+postJson[key]+"',";
						}
						updaTeContent = updaTeContent.replace(/,([^,]*)$/,'$1');
						updaTeContent+="}	} ";
					 
						eval('var obj='+updaTeContent);
					 
						db.collection(table_nameStr).update({_id:mongoIDField}, obj, (err, result) => {
    						if (err) link+="?error_msg=Error occurred while saving ["+err+"], please try after some time!";
							
							if(editorFieldName!="" && editorFieldVal!=""){
    							link+="?"+editorFieldName+"="+editorFieldVal;
    						}
    						res.redirect(link)
  						});
      				}else{
      					db.collection(table_nameStr).save(postJson, (err, result) => {
      						if (err) link+="?error_msg=Error occurred while saving ["+err+"], please try after some time!";
    						link+="?success_msg=Saved successfully!";
    						res.redirect(link)
  						});
      				}
      			});
      		}
      	});
	}else{
		saveEntry(table_nameStr, checkForExistence, postJson, req.params.id, mongoIDField, unique_fieldStr, unique_fieldVal, function(result) {
			var tempLink="";
			if(editorFieldName!="" && editorFieldVal!=""){
    			tempLink+="?"+editorFieldName+"="+editorFieldVal;
    			link+=tempLink;
    		}
    		if(result){
    			if(tempLink!=""){
    				link+="&"+result;
    			}else{
    				link+="?"+result;
    			}
    		}
    		
			res.redirect(link);
  		});
	}
})


function saveEntry(table_nameStr, checkForExistence, postContent, parameterStr, findmongoID, unique_fieldStr, unique_fieldVal, cb){
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
							postContent['Created']=currentTimestamp;
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
      					postContent['Created']=currentTimestamp;
      					db.collection(table_nameStr).save(postContent, (err4, result) => {
      						if (err4) link+="&error_msg=Error occurred while saving ["+err4+"], please try after some time!";
    						link+="success_msg=Saved successfully!";
    						cb(link);
  						});
      				}
				});
			}	
		});
}

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

function returnAllCollections(cb){
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
	}else if(filename=="users" || filename=="user"){
		table_name="users";
	}else if(filename=="contacts" || filename=="contact"){
		table_name="contacts";
	}else if(filename=="system_templates" || filename=="system_template"){
		table_name="system_templates";
	}else if(filename=="leads" || filename=="lead"){
		table_name="leads";
	}
	return table_name;
}

function nowTimestamp(){
	return Math.round(new Date().getTime()/1000);
}

app.locals.backendDirectory = backendDirName;

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


var fetchTableColumns =function (table, cb) {
	var allKeys=new Array();
   db.collection(table).findOne({}, (err, result) => {
   		if(err) return cb(allKeys)
   		for (key in result){
   			allKeys.push(key);
   		}
		return cb(allKeys);
	});
}

function checkForCookie (req, res, next) {
	if(req.cookies['ucs'] != null && req.cookies['ucs'] != 'undefined' && req.cookies['ucs']=="ok"){
   		req.ucsCookie = false;
	}else{
   		req.ucsCookie = true;
   	}
   	next();
}

function requireLogin (req, res, next) {
	if(req.cookies[cookieName] != null && req.cookies[cookieName] != 'undefined' && req.cookies[cookieName]!=""){
   		authenticatedUser(req, function(user) {
   			if(user === null){
   				res.redirect('/'+backendDirName+'/sign-in');
   			}else{
				req.authenticatedUser = user;
				next();
			}
		});
	}else{
   		res.redirect('/'+backendDirName+'/sign-in');
   	}
}

var authenticatedUser =function (req, cb) {
	if(req.cookies[cookieName] != null && req.cookies[cookieName] != 'undefined' && req.cookies[cookieName]!=""){
		var mongoIDField= new mongodb.ObjectID(req.cookies[cookieName]);
   		db.collection('sessions').findOne({_id: mongoIDField, "status" : true}, (err, session_result) => {
   			if(err)  return cb(null)
			db.collection("users").findOne({_id : session_result.user_id}, function(err1, userDetails) {
				if(err1) return cb(null)
				return cb(userDetails);
			});
		});
   	}else{
   		return cb(null);
   	}
}