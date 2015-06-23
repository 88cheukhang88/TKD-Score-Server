"use strict";angular.module("tkdscore",["ngAnimate","ngCookies","ngSanitize","ngTouch","ui.router","ui.bootstrap","ngDialog","cfp.hotkeys","ngNotify","bsol.session","bsol.common","sails.io","qtime.services","tkdscore.match","tkdscore.mat"]).config(["$stateProvider","$urlRouterProvider","$locationProvider",function(a,b,c){c.html5Mode(!1),c.hashPrefix(""),b.otherwise("/"),a.state("front",{url:"/",templateUrl:"core/views/main.html"})}]).config(["$provide",function(a){a.decorator("$state",["$delegate","$stateParams",function(a,b){return a.forceReload=function(){return a.go(a.current,b,{reload:!0,inherit:!1,notify:!0})},a}])}]).run(["$sailsSocket","$state","AlertService",function(a,b,c){a.subscribe("connect",function(a){console.log("Socket conneted:",a)}),a.subscribe("disconnect",function(a){console.log("Socket conneted:",a)}),a.subscribe("reconnecting",function(a){console.log("Socket conneted:",a)}),a.subscribe("reconnect",function(a){console.log("Socket conneted:",a)}),a.subscribe("error",function(a){console.log("Socket error:",a)})}]).run(["$log","$rootScope","$state","$stateParams","SessionService","AlertService","$cookieStore",function(a,b,c,d,e,f){FastClick.attach(document.body),b.APP_VERSION="0.0.0",b.server_version="0.0.0",b.loading=!1,b.showLoading=function(){b.loading=!0},b.hideLoading=function(){b.loading=!1},b.$log=a,b.alerts=f,b.$on("$stateChangeStart",function(){b.showLoading()}),b.$on("$stateChangeSuccess",function(){b.hideLoading(),a.debug("State change success")}),b.$on("$stateChangeError",function(a,c,d,e,f,g){throw b.hideLoading(),alert("Navigation error: "+g),g}),b.$on("$stateNotFound",function(c,d){b.hideLoading(),a.debug("State not found: "+d.to),a.debug(d.toParams),a.debug(d.options)}),e.status().then(function(){console.log("Already logged in")},function(){})}]),angular.module("bsol.common",["ui.bootstrap","ngDialog"]).filter("bsolFilter_newlineBr",["$sce",function(a){return function(b){var c=b.replace(/\n/g,"<br>");return a.getTrustedHtml(c)}}]).filter("bsol_objectArrayAsString",[function(){return function(a,b){var c="";return _.forEach(a,function(a){c+=a[b]+"; "}),c}}]).filter("bsolFilter_arrayIndexValue",function(){return function(a,b){var c=b[Number(a)];return c}}).filter("bsolFilter_inArray",function(){return function(a,b){if(a){var c={};for(var d in b)b[d]in a&&(c[b[d]]=a[b[d]]);return c}}}).filter("bsolFilter_listDescription",[function(){return function(a,b,c,d){c||(c="id"),d||(d="description");for(var e in b)if(b[e][c]===a)return b[e][d];return a}}]).service("ErrorHandler",["AlertService",function(a){var b=function(b){var c=b;c.$response&&(c=c.$response.data),c?a.addAlert(c):(console.error(c),a.addAlert("Critical Error - check console log","danger"))};return b}]).directive("bsolLoading",[function(){return{scope:{ngModel:"="},controller:["$scope","$element","$attrs","$transclude",function(a){a.loading=a.ngModel}],restrict:"AE",templateUrl:"bsol/views/loading.html",link:function(){}}}]).directive("bsolDashboard",[function(){return{scope:!1,controller:["$scope","$element","$attrs","$transclude",function(){}],restrict:"AE",templateUrl:"bsol/views/dashboard.html",transclude:!0,link:function(){}}}]).directive("bsolDashboardWidget",[function(){return{scope:{heading:"@",width:"@"},controller:["$scope","$element","$attrs","$transclude",function(a,b){b[0].style.width=a.width}],restrict:"AE",templateUrl:"bsol/views/dashboard-widget.html",transclude:!0,link:function(){}}}]),function(){angular.module("bsol.common",["ngDialog","ngNotify"]).service("AlertService",["$modal","ngDialog","ngNotify",function(a,b,c){var d=[];return d.addAlert=function(a,b){d.push({type:b,msg:a})},d.closeAlert=function(a){d.splice(a,1)},d.alert=function(a){b.open({plain:!0,template:'<div class="modal-body">'+a+"</div>"})},d.areYouSure=function(a,c,d){if(!a)var a="Are you sure";b.open({plain:!0,template:'<div class="modal-body">'+a+'?</div><button class="btn btn-md btn-danger" ng-click="onYesClick($event)">Yes</button><button class="btn btn-md btn-success" ng-click="onNoClick($event)">No</button>',controller:["$scope",function(a){a.onYesClick=function(){c(),a.closeThisDialog("doit")},a.onNoClick=function(){d&&d(),a.closeThisDialog("cancel")}}]})},d.notify=function(a){c.set(a)},d}])}(),angular.module("bsol.session",["ngSanitize","bsol.common","ui.bootstrap","ui.router"]).service("NetworkErrorService",[function(){var a=function(a){var b="";switch(a){case"ECONNREFUSED":b="Unable to connect to server - Connection Refused";break;default:b="An error occurred - "+a}return b};return{translate:a}}]).service("SessionService",["$log","$q","$http","$rootScope",function(a,b,c){var d={session:{},params:{},login:function(a,e){var f=b.defer();return c({url:"/api/login",method:"POST",data:JSON.stringify({username:a,password:e}),headers:{"Content-Type":"application/json"}}).success(function(a){d.session=a.session,f.resolve(a.session)}).error(function(a,b){console.log("error logging in"),console.log("Got: "+b);for(var c in a.errors)console.log(a.errors[c].message);f.reject(a)}),f.promise},status:function(){var e=b.defer();return c({url:"/api/login",method:"GET",headers:{"Content-Type":"application/json"}}).success(function(a){a.session?(d.session=a.session,e.resolve(a.session)):e.reject(a)}).error(function(b,c){a.debug("error with getting user status"),a.debug("Got: "+c);for(var d in b.errors)a.debug(b.errors[d].message);e.reject(b)}),e.promise},logout:function(){var e=b.defer();return c({url:"/api/logout",method:"GET",headers:{"Content-Type":"application/json"}}).success(function(a){d.session={},e.resolve(a.session)}).error(function(b){for(var c in b.errors)a.debug("Error: "+b.errors[c].message);e.reject(b),d.session={}}),e.promise},updateUser:function(a){d.session.user.id===a.id&&(d.session.user=a)}};return d}]).controller("SessionController",["$scope","SessionService","$stateParams","$state","AlertService",function(a,b,c,d,e){a.user=b.session.user,a.contact=b.session.contact,a.session=b.session,a.getOrgId=function(){return c.organisation_id},a.navbar_isCollapsed=!0,a.onLoginClick=function(){b.login(a.loginFormModel.username,a.loginFormModel.password).then(function(){console.log("logging in"),a.user=b.session.user,a.contact=b.session.contact,a.session=b.session,d.go("organisation_home",{organisation_id:b.session.contact.organisation})},function(a){e.addAlert(a,"danger")})},a.onLogoutClick=function(){b.logout().then(function(){a.session=b.session,a.contact=b.session.contact,a.user=b.session.user},function(a){alert(a)})},a.onAccountSettingsClick=function(){d.go("user_detail",{organisation_id:b.session.contact.organisation,user_id:b.session.user.id})},a.onOrgSettingsClick=function(){d.go("organisation_detail",{organisation_id:b.session.contact.organisation,user_id:b.session.user.id})}}]);var Module=angular.module("qtime.services",["bsol.session","ui.bootstrap"]).factory("ListManager",[function(){var a=function(a){this.parentDataModel=a.parentDataModel,this.dataModel=a.dataModel,this.defaultNewData=a.defaultNewData,this.hasParent=angular.isDefined(a.hasParent)?a.hasParent:!0,this.populate=a.populate,this.getParent=a.getParent||function(){throw new Error("Unable to get parent as no parent and no getParent function provided")},this.sort=a.sort||null,this.data=[],this.parent={}};return a.prototype={get:function(a){var b=this,c=function(a){if(!a)var a={};a.sort&&(this.sort=a.sort),b.defaultNewData[b.parentDataModel.$name]=b.parent.id,console.log("Getting "+b.dataModel.$name+" for "+b.parentDataModel.$name+": ",b.parent.id);var c={};c[b.parentDataModel.$name]=b.parent.id,b.populate&&(c.populate=b.populate),b.sort&&(c.sort=b.sort),b.data=b.dataModel.find(c)},d=function(){console.log("Getting all "+b.dataModel.$name+"(s)");var a={};b.populate&&(a.populate=b.populate),b.data=b.dataModel.find(a)};if(b.hasParent){if(a||(a=b.getParent(),b.parent=a),b.parent.id!==a.id){var e=parseInt(a);angular.isNumber(e)&&!isNaN(e)?parentDataModel.findOne({id:e}).$promise.then(function(a){b.parent=a,c()}):(b.parent=a,c())}}else d();return b.data},add:function(a){var b=a||angular.copy(this.defaultNewData),c=this.dataModel.create(b);return this.data.push(c),c},destroy:function(a){var b=_.find(this.data,{id:a.id},this.data);b.$destroy(),this.data.splice(this.data.indexOf(b),1)},findWithId:function(a){return _.find(this.data,{id:a})}},a}]).service("StoreService",["$rootScope","$cookieStore",function(a,b){var c={};this.get=function(a){return c[a]||b.get(a)},this.put=function(a,b){c[a]=b},this.store=function(a,c){b.put(a,c)},this.remove=function(a){b.remove(a),delete c[a]}}]);!function(){angular.module("tkdscore.mat",["bsol.session","bsol.common","ui.bootstrap","sailsResource","ngDialog","cfp.hotkeys"]).config(["$stateProvider",function(a){a.state("matlist",{url:"/matlist/",template:"<mat-list></mat-list>",controller:"MatlistController",controllerAs:"MatlistController"}).state("mat",{url:"/mat/:matId",template:'<div ui-view=""></div>',"abstract":!0,controller:"MatController",controllerAs:"MatController",resolve:{resolvedMat:["$stateParams","Mat","MatService",function(a,b,c){return c.get(a.matId).$promise}]}}).state("controls",{url:"/controls",template:'<mat-controls mat="MatController.mat"></mat-controls>',parent:"mat"}).state("scoreboard",{url:"/scordboard",template:'<scoreboard mat="MatController.mat"></scoreboard>',parent:"mat"}).state("master",{url:"/master",templateUrl:"mat/views/template-master.html",parent:"mat"}).state("judge",{url:"/judge",template:'<mat-judge mat="MatController.mat"></mat-judge>',parent:"mat"})}]).controller("MatlistController",["$scope","$stateParams","MatUI","Mat","$cookieStore",function(){}]).controller("MatController",["resolvedMat",function(a){this.mat=a}]).factory("Mat",["$sailsResource","$sailsSocket","$cookieStore",function(a,b){var c=a("mat","/api/mat/:id",{id:"@id"});return c.$name="mat",c.changeRound=function(a,c){b.post("/api/mat/controls/changeRound",{id:a,value:c}).success(function(){}).error(function(a){console.error("controls error",a)})},c.points=function(a,c,d){b.post("/api/mat/controls/points",{id:a,player:c,points:d}).success(function(){}).error(function(a){console.error("controls error",a)})},c.penalties=function(a,c,d){b.post("/api/mat/controls/penalties",{id:a,player:c,points:d}).success(function(){}).error(function(a){console.error("controls error",a)})},c.resetMat=function(a){b.post("/api/mat/controls/resetMat",{id:a}).success(function(){}).error(function(a){console.error("controls error",a)})},c.pauseResume=function(a){b.post("/api/mat/controls/pauseResume",{id:a}).success(function(){}).error(function(a){console.error("controls error",a)})},c.soundHorn=function(a){b.post("/api/mat/controls/soundhorn",{id:a}).success(function(){}).error(function(a){console.error("controls error",a)})},c.registerScore=function(a,c,d,e){b.post("/api/mat/controls/registerscore",{id:a,player:c,target:d,turning:e}).success(function(){}).error(function(a){console.error("controls error",a)})},c.registerTurn=function(a,c){b.post("/api/mat/controls/registerturn",{id:a,player:c}).success(function(){}).error(function(a){console.error("controls error",a)})},c.registerJudge=function(a){b.post("/api/mat/judge",{id:a}).success(function(){}).error(function(a){console.error("Judge Registration Error",a)})},c.declareWinner=function(a,c){b.post("/api/mat/winner",{id:a,winner:c}).success(function(){}).error(function(a){console.error("Declare Winner Error",a)})},c}]).service("MatManager",["ListManager","Mat",function(a,b){return new a({parentDataModel:null,dataModel:b,defaultNewData:{},hasParent:!1})}]).filter("formatTime",function(){return function(a,b){var c=a;b&&(c=a+999);var d=Math.round(c/100)+"",e=Math.floor(c/1e3),f=Math.floor(c/6e4);return d=d.charAt(d.length-1),e=e-60*f+"",e=""!==e.charAt(e.length-2)?e.charAt(e.length-2)+e.charAt(e.length-1):0+e.charAt(e.length-1),f+="",f=""!==f.charAt(f.length-2)?f.charAt(f.length-2)+f.charAt(f.length-1):0+f.charAt(f.length-1),f+":"+e}}).filter("formatPenalties",function(){return function(a){for(var b="",c=a/2,d=0,e=0;e<Math.floor(c);e++)b+='<img src="images/mark_gamjeom.png" class="scoreboard-mark">',d++;for(Math.floor(a/2)!==c&&0!==c&&(b+='<img src="images/mark_kyongo.png" class="scoreboard-mark">',d++);4>d;)b+='<img src="images/mark_blank.png" class="scoreboard-mark">',d++;return b}}).directive("matList",function(){return{scope:{},controllerAs:"matListVm",controller:["$scope","$state","MatUI","MatManager","AlertService",function(a,b,c,d,e){function f(a){b.go("controls",{matId:a.id})}function g(){d.add()}function h(a){e.areYouSure(null,function(){d.destroy(a)})}function i(a){b.go("master",{matId:a.id})}function j(a){b.go("scoreboard",{matId:a.id})}function k(a){b.go("judge",{matId:a.id})}this.mates=d.get(),this.openEdit=c.openEdit,this.gotoControls=f,this.gotoScoreboard=j,this.gotoMaster=i,this.gotoJudge=k,this.newMat=g,this.destroy=h}],restrict:"AE",templateUrl:"mat/views/template-list.html",link:function(){}}}).service("MatUI",["ngDialog",function(a){this.openEdit=function(b){var c=a.open({plain:!0,className:"ngdialog-theme-normal",template:'<div><mateditor item="item"></mateditor></div>',controller:["$scope",function(a){a.item=b}]});return c.closePromise}}]).directive("mateditor",function(){return{scope:{item:"="},restrict:"AE",templateUrl:"mat/views/template-edit.html",controllerAs:"matEditorVm",controller:["$scope","AlertService","Mat",function(a,b,c){function d(){this.mat.$save()}function e(a){c.removeJudge(this.mat.id,a)}this.mat=angular.isNumber(this.item)?c.findOne(a.item):a.item,this.save=d,this.removeJudge=e}],link:function(){}}}).directive("matControls",function(){return{scope:{mat:"="},restrict:"AE",templateUrl:"mat/views/template-controls.html",controllerAs:"matControlsVm",controller:["$scope","AlertService","Mat","MatUI","$cookieStore","hotkeys",function(a,b,c,d,e,f){function g(a){c.changeRound(p.id,p.round+a)}function h(a,b){c.points(p.id,a,b)}function i(a,b){c.penalties(p.id,a,b)}function j(){b.areYouSure("Are you sure you want reset the match?",function(){c.resetMat(p.id)})}function k(){c.pauseResume(p.id)}function l(){c.soundHorn(p.id)}function m(){d.openEdit(p)}function n(){c.registerTurn(p.id)}function o(a){c.declareWinner(p.id,a)}var p={};p=angular.isNumber(a.mat)?c.findOne(a.mat):a.mat,f.bindTo(a).add({combo:"space",description:"Register Turning Kick",callback:function(a){a.preventDefault(),n()}}),this.mat=p,this.edit=m,this.points=h,this.penalties=i,this.resetMat=j,this.pauseResume=k,this.soundHorn=l,this.changeRound=g,this.registerTurn=n,this.declareWinner=o}],link:function(){}}}).directive("matJudge",function(){return{scope:{mat:"="},restrict:"AE",templateUrl:"mat/views/template-judge.html",controllerAs:"matJudgeVm",controller:["$scope","AlertService","Mat","MatUI","SessionService",function(a,b,c,d,e){function f(a,b){j.judgeTurning?(l[a][b]+=1,null===k[a]&&(k[a]=setTimeout(function(){g(a,l[a][b],b),k[a]=null,l[a][b]=0},250))):g(a,1,b)}function g(a,b,d){var e=!1;b>1&&(e=!0),c.registerScore(j.id,a,d,e)}function h(){c.registerJudge(j.id)}function i(){var a=[j.judge1,j.judge2,j.judge3,j.judge4],b=e.session.ident,c=!1;return _.forEach(a,function(a,d){a===b&&(c="Judge "+(d+1))}),c}var j={};j=angular.isNumber(a.mat)?c.findOne(a.mat):a.mat;var k={1:null,2:null},l={1:{body:0,head:0},2:{body:0,head:0}};this.tap=f,this.register=h,this.registered=i,this.mat=j}],link:function(){}}}).directive("highlightOnChange",["$timeout",function(a){return{scope:{ngBind:"=",highlightOnChange:"@",highlightOnChangeTime:"@"},restrict:"AE",link:function(b,c){b.$watch("ngBind",function(){c.addClass(b.highlightOnChange),a(function(){c.removeClass(b.highlightOnChange)},b.highlightOnChangeTime||1e3)})}}}]).controller("scoreboardController",["$scope","$timeout","$sailsSocket","ngNotify","Mat","MatUI",function(a,b,c,d,e){function f(a,c,d){j[c][a-1]=d,b(function(){j[c][a-1]="-"},.75*g.mat.scoreTimeout)}var g=this,h=new Audio("sounds/beep1.wav"),i={};i=angular.isNumber(a.mat)?e.findOne(a.mat):a.mat,this.timer={roundTimeMS:i.roundTimeMS,breakTimeMS:i.breakTimeMS,pauseWatchMS:0},c.subscribe("roundtime",function(a){g.timer.roundTimeMS=a.ms}),c.subscribe("pausetime",function(a){g.timer.pauseWatchMS=a.ms}),c.subscribe("breaktime",function(a){g.timer.breakTimeMS=a.ms}),c.subscribe("soundhorn",function(){h.play()});var j={};j[1]=["-","-","-","-"],j[2]=["-","-","-","-"],c.subscribe("judge",function(a){console.log("JUDGE: ",a.source,a.player,a.target);var b=a.target.charAt(0).toUpperCase();f(a.judge,a.player,b)}),this.judgeIndicator=j,this.mat=i}]).directive("scoreboard",function(){return{scope:{mat:"="},restrict:"AE",templateUrl:"mat/views/template-scoreboard.html",controllerAs:"scoreboardVm",controller:"scoreboardController",link:function(){}}}).directive("miniboard",function(){return{scope:{mat:"="},restrict:"AE",templateUrl:"mat/views/template-miniboard.html",controllerAs:"scoreboardVm",controller:"scoreboardController",link:function(){}}}).service("MatService",["Mat",function(a){this.Model=a,this.item={};var b=this;this.get=function(a){return console.log("getting item from server"),b.item=this.Model.findOne({id:a}),b.item}}])}(),function(){angular.module("tkdscore.match",["bsol.session","ui.bootstrap","sailsResource","ngDialog"]).config(["$stateProvider",function(a){a.state("matchlist",{url:"/matchlist/",template:"<match-list></match-list>",controller:"MatchlistController",controllerAs:"MatchlistController"}).state("match",{url:"/match/:matchId",template:'<div ui-view=""></div>',"abstract":!0,controller:"MatchController",controllerAs:"MatchController",resolve:{resolvedMatch:["$stateParams","Match","MatchService",function(a,b,c){return c.get(a.matchId).$promise}]}})}]).controller("MatchlistController",["$scope","$stateParams","MatchUI","Match","$cookieStore",function(){}]).controller("MatchController",["resolvedMatch",function(a){this.match=a}]).factory("Match",["$sailsResource","$sailsSocket","$cookieStore",function(a){var b=a("match","/api/match/:id",{id:"@id"});return b.$name="match",b}]).service("MatchService",["Match",function(a){this.Model=a,this.item={};var b=this;this.get=function(a){return a?b.item.id===a?this.item:(b.item=this.Model.findOne({id:a}),b.item):b.item}}]).service("MatchManager",["ListManager","Match","Mat",function(a,b){return new a({parentDataModel:null,dataModel:b,defaultNewData:{},hasParent:!1})}]).directive("matchList",[function(){return{scope:{},controllerAs:"matchListVm",controller:["$scope","$state","MatchUI","MatchManager",function(a,b,c,d){function e(){d.add()}function f(a){d.destroy(a)}var g=d.get();this.openEdit=c.openEdit,this.matches=g,this.newMatch=e,this.destroy=f}],restrict:"AE",templateUrl:"match/views/template-list.html",link:function(){}}}]).service("MatchUI",["ngDialog",function(a){this.openEdit=function(b){var c=a.open({plain:!0,className:"ngdialog-theme-normal",template:'<div><matcheditor item="item"></matcheditor></div>',controller:["$scope",function(a){a.item=b}]});return c.closePromise}}]).directive("matcheditor",[function(){return{scope:{item:"="},restrict:"AE",templateUrl:"match/views/template-edit.html",controllerAs:"matchEditorVm",controller:["$scope","AlertService","Match",function(a,b,c){function d(a){a.$save()}var e={};e=angular.isNumber(this.item)?c.findOne(a.item):a.item,this.match=e,this.save=d}],link:function(){}}}])}();