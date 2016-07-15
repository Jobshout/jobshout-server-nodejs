var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var db


var recursionArr = new Array();
var returnErrorStr = "";

function loopthroughTokenContent(startPatternStr, endPatternStr, string, callback){
   	var tokenNameStr= '', leftSubStr= string, contentSubStr="";
   	
	if (string.indexOf(startPatternStr) != -1){
		if(string.indexOf(startPatternStr)>=1){
			contentSubStr= string.substring(0, string.indexOf(startPatternStr));
		}
		if (string.indexOf(endPatternStr) !== false){
			if(contentSubStr==""){
				tokenNameStr= string.substring(startPatternStr.length, (string.indexOf(endPatternStr)-startPatternStr.length));
				
			}else{
				var s=string.indexOf(startPatternStr)+startPatternStr.length;
				var e= string.indexOf(endPatternStr)-(string.indexOf(startPatternStr)+startPatternStr.length);
				tokenNameStr= string.substr(parseInt(s), e);
			}
			
			leftSubStr= string.substring((string.indexOf(endPatternStr)) + startPatternStr.length);
			//if(leftSubStr!=""){
			//	leftSubStr="";
			//}
		}
	}
	
   	callback(contentSubStr, tokenNameStr, leftSubStr);     
}

function fetchTokenContentFromDB(pTokenCodeStr, callback){
	if(recursionArr.indexOf(pTokenCodeStr) == -1){
		recursionArr.push(pTokenCodeStr);
		db.collection('tokens').findOne({"code": pTokenCodeStr}, function(err, document) {
			if (document) {
      			findSubTokens(document.token_content, function(err, result) {
      				callback(err, result);
      			});
			}
		});
	}else{
		callback("Err: RECURSION");
	}	
}
function printTokenContent(tokenCodeStr, callback){
	var returnContentStr="";
	fetchTokenContentFromDB(tokenCodeStr, function(err, result) {
		if(err){
			callback(err);
		}else{
    		var tokenContentStr=result;
			if(tokenContentStr.indexOf("Err: RECURSION")!=-1){
				returnContentStr= "Token ("+tokenCodeStr+") RECURSION!";
			}else if(tokenContentStr.indexOf("Err: NOT FOUND")!=-1){
				returnContentStr= "Token ("+tokenCodeStr+") NOT FOUND!";
			}else{
				returnContentStr= tokenContentStr;
			}
			callback(null, returnContentStr);
		}
		
	});
}

function printTemplateContent(codeStr, callback){
	db.collection('templates').findOne({"code": codeStr}, function(err, template) {
		if (template) {
      		findSubTokens(template.template_content, function(err, result) {
      			callback(err, result);
      		});
		}
	});
}
function findSubTokens(e, callback){
	var returnResultStr= "";
	var startStr="<*--"; var startStrLength=4;
	var endStr="--*>";
	var tempTokenStr=e;
	var startPosNum = tempTokenStr.indexOf(startStr);
	var tokensArr=new Array();
	
	if (startPosNum === false) {
    	returnResultStr= tempTokenStr;
    	callback(null, returnResultStr);
	} else {
		
		endPosNum = tempTokenStr.indexOf(endStr);
		if (endPosNum === -1) {
   	 		returnResultStr= tempTokenStr;
   	 		callback(null, returnResultStr);
   	 	} else {
   	 		loopthroughTokenContent(startStr, endStr, tempTokenStr, function(contentSubStr, tokenCode, leftSubStr) {
   	 			if(tokenCode!=""){
					tokensArr.push(tokenCode);
					fetchTokenContentFromDB(tokenCode, function(err, dbToken) {
						if(leftSubStr!=""){
							var subTokenStr= leftSubStr;
							findSubTokens(subTokenStr, function(err, subTokenResult) {
								returnResultStr=contentSubStr+dbToken+subTokenResult;
      							callback(err, returnResultStr);
      						});
						}else{
							returnResultStr=contentSubStr+dbToken;
      						callback(err, returnResultStr);
						}
					});
				}else{
					if(leftSubStr!=""){
						var subTokenStr= leftSubStr;
						findSubTokens(subTokenStr, function(err, subTokenResult) {
							returnResultStr=contentSubStr+subTokenResult;
      						console.log("subTokenResult  2 : "+subTokenResult);
      						callback(err, returnResultStr);
      					});
					}else{
						returnResultStr=contentSubStr;
      					callback(err, returnResultStr);
					}
				}
			});
		}
   	}
}

MongoClient.connect('mongodb://localhost:27017/jobshout_live', function (err, database) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
  	db=database;
	
	var pTokenCodeStr="test-template";
	
	printTemplateContent(pTokenCodeStr, function(err, result) {
		if(err){
			console.log(err);  
		}else{
    		console.log(result);  
    	}  
    	db.close();
	});
  }
});

