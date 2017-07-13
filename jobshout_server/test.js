/**const exec = require('child_process').exec;
exec('ls -A', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});



var emailApiKey = process.env.emailApiKey;
console.log(emailApiKey);**/
var str="hi abc, this is to inform you that abc is abc"
var find = 'abc';
var re = new RegExp(find, 'g');

str = str.replace(re, 'def');
console.log(str)
var tokensArr= new Array();

function loopThroughArrays (templateContentStr) {
	var searchParaCount=4, tempContentStr=templateContentStr;
	var findTokenStartingPos = tempContentStr.indexOf("<*--");

    if(tempContentStr!="" && findTokenStartingPos>=1){
      	var findTokenEndingPos = tempContentStr.indexOf("--*>");
      	var tokenStr=tempContentStr.substring(findTokenStartingPos+searchParaCount, findTokenEndingPos);

      	tokensArr.push(tokenStr.trim());
      	tempContentStr=tempContentStr.substring(findTokenEndingPos+searchParaCount);

      	if(tempContentStr!=""){
      		loopThroughArrays(tempContentStr);
      	}
    }						
}


var tokenStr="hi <*--page-header--*>, abc <*--footer--*> <bR> this is just for testing purpose, now one more token : <*--body-content--*>";
loopThroughArrays(tokenStr);
console.log(tokensArr);
function findTokensListInTemplate (templateContentStr) {
	var findTokensStr= '', searchParaCount=4, tempContentStr=templateContentStr;
	var findTokenStartingPos = tempContentStr.indexOf("<*--");

    if(tempContentStr!="" && findTokenStartingPos>=1){
    	var findTokenEndingPos = tempContentStr.indexOf("--*>");
      	var tokenStr=tempContentStr.substring(findTokenStartingPos+searchParaCount, findTokenEndingPos);
		if(findTokensStr!=""){
			findTokensStr+=","+tokenStr.trim();
		}else{
      		findTokensStr+=tokenStr.trim();
      	}
      	tempContentStr=tempContentStr.substring(findTokenEndingPos+searchParaCount);

      	if(tempContentStr!=""){
      		if(findTokensStr!=""){
				findTokensStr+=","+findTokensListInTemplate(tempContentStr);
			}else{
      			findTokensStr+=findTokensListInTemplate(tempContentStr);
      		}
      	}
    }	
    if(findTokensStr.charAt(findTokensStr.length - 1)==","){
    	findTokensStr = findTokensStr.substring(0, findTokensStr.length - 1);
    }
    return findTokensStr;					
}


var tokenStr="hi this is just for testing purpose, now one more token ";
console.log(findTokensListInTemplate(tokenStr));

