if(file=="pdf"){
	let fs = require('fs'),
        PDFParser = require("pdf2json");
 
    let pdfParser = new PDFParser(this,1);
 
    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
    pdfParser.on("pdfParser_dataReady", pdfData => {
        console.log(pdfParser.getRawTextContent());
    });
 
    pdfParser.loadPDF("/Users/nehakapoor/Documents/GitHub/jobshout-server-nodejs/jobshout_server/NehaResume.pdf");
}else{
	var textract = require('textract');
	textract.fromFileWithPath("/Users/nehakapoor/Documents/GitHub/jobshout-server-nodejs/jobshout_server/NehaResume.docx", function( error, text ) {
		console.log(text);
	})
}