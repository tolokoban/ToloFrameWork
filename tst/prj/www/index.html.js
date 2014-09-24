window.addEventListener('load',function(){
document.body.parentNode.$data={};
$$('wtag.Data',{id:1});
$$('wtag.Bind',{id:2,data:"yourname"});
$$('wtag.Input',{id:3,fire:["@popup"],fireArg:["hello"],data:"yourname"});
$$('wtag.Button',{id:4,fire:["@popup"],fireArg:["hello"]});
$$('wtag.Button',{id:5,fire:["$yourname"],fireArg:[""]});
$$('wtag.List',{id:8,maker:function(tpl,id){id+='.';$$('wtag.Bind',{id:id+6,data:"user"});
$$('wtag.Bind',{id:id+7,data:"yourname"});
},tpl:9,list:"users",item:"user"});
$$('wtag.Bind',{id:10,data:"yourname"});
$$('wtag.Popup',{id:11});
document.body.$widget=$$.App=$$('Main',{id:document.body});$$.App.lang($$.App.lang());

document.body.removeChild(document.getElementById('12'))})