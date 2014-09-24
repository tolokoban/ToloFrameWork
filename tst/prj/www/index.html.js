window.addEventListener('load',function(){
document.body.parentNode.$data={};
$$('wtag.Data',{id:4});
$$('wtag.Bind',{id:5,data:"yourname"});
$$('wtag.Input',{id:6,fire:["@popup"],fireArg:["hello"],data:"yourname"});
$$('wtag.Button',{id:7,fire:["@popup"],fireArg:["hello"]});
$$('wtag.Button',{id:8,fire:["$yourname"],fireArg:[""]});
$$('wtag.List',{id:11,maker:function(tpl,id){id+='.';$$('wtag.Bind',{id:id+9,data:"user"});
$$('wtag.Bind',{id:id+10,data:"yourname"});
},tpl:12,list:"users",item:"user"});
$$('wtag.Bind',{id:13,data:"yourname"});
$$('wtag.Popup',{id:14});
document.body.$widget=$$.App=$$('Main',{id:document.body});$$.App.lang($$.App.lang());

document.body.removeChild(document.getElementById('15'))})