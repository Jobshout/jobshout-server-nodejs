var menuxhr;
function load_navigation_data(){
	$("#dashboard-menu").html('');
	var jsonRow = backendDirectory+'/list_forms?start=0&limit=15&collection=modules';
	var keyword= $("#menuSearchBox").val();
	if(keyword!='' && keyword!='undefined'){
		jsonRow +='&s='+keyword;
	}
	
	if(menuxhr) menuxhr.abort();
	menuxhr=$.getJSON(jsonRow,function(result){
		if(result.aaData){
			var urlStr = window.location.pathname;
			var openedFileNameStr = urlStr.substring(urlStr.indexOf('/'));
			var table_html='<li class="treeview';
			
			if(openedFileNameStr=="index"){
				table_html+=' active ';
			}	
			table_html+='"><a href="#"><i class="fa fa-dashboard"></i> <span>Dashboard</span><span class="pull-right-container"><i class="fa fa-angle-left pull-right"></i></span></a></li>';
			
			$.each(result.aaData, function(i,item){
				if(item.active==1){
					var activeMenuFlag=false;
					if(item.module_items){
						if(item.module_items!=""){
							var module_items = JSON.parse(item.module_items); 
							var iconNameStr='';
							if(item.icon_class!=""){
								iconNameStr='<i class="'+item.icon_class+'"></i>';
							}
							if(item.icon_path!=""){
								iconNameStr='<img width="24" height="24" src="'+item.icon_path+'" alt="">';
							}
														
							var subTableHtmlStr="";	
							$.each(module_items, function(i,row){
								if(openedFileNameStr==row.link){
									activeMenuFlag=true;
									subTableHtmlStr+='<li class="active">';
								}else{
									subTableHtmlStr+='<li>';
								}
								subTableHtmlStr+='<a href="'+backendDirectory+row.link+'" ';
								if(row.target==0){
									subTableHtmlStr+=' target="_blank" ';
								}
								subTableHtmlStr+='><i class="fa fa-circle-o"></i> '+row.label+'</a></li>';
							});
									
							if(activeMenuFlag){
								table_html+='<li class="active treeview">';
							}else{
								table_html+='<li class="treeview">';
							}
							table_html+='<a href="#">'+iconNameStr+' <span>'+item.name+'</span><span class="pull-right-container"><i class="fa fa-angle-left pull-right"></i></span></a>';
							table_html+='<ul class="treeview-menu">'+subTableHtmlStr+'</ul>';
						}
					}   
				}             
			});
			$("#dashboard-menu").append(table_html);
		}
	});
}
$(function () {
    
	load_navigation_data();
})




