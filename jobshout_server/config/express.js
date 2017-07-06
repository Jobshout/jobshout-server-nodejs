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
	*  express.js
	**/
	
	'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
	bodyParser = require('body-parser'),
	passwordHash = require('password-hash'),
	cookieParser = require('cookie-parser'),
	path = require('path');

module.exports = function(init) {
	// Initialize express app
	var app = express();

	app.use(cookieParser());
		
	// Set view engine
	app.set('view engine', 'ejs')
	
	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded({extended: true}))
	
	// CookieParser should be above session
	app.use(cookieParser());
	
	/// Setting the app router and static folder
	app.use('/'+init.backendDirectoryName, express.static(path.resolve('./views/'+init.backendDirectoryName+'/assets')));
	
	app.use('/'+init.backendDirectoryName+'/list', express.static(path.resolve('./views/'+init.backendDirectoryName+'/assets')));
	
	// Return Express server instance
	return app;
};