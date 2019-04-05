LordOfPomelo的启动流程采用了Pomelo中的启动模式. 在阅读下面内容前, 请先阅读[pomelo启动流程](https://github.com/NetEase/pomelo/wiki/pomelo%E5%90%AF%E5%8A%A8%E6%B5%81%E7%A8%8B).

app.js是LordOfPomelo的入口, 主要负责所有服务器的配置, 以及组件的加载和启动. LordOfPomelo的启动主要分为两步：启动master服务器, 再由master服务器分别启动其他服务器. 

### 组件的配置和加载
LordOfPomelo中使用了多个外部组件, 这些组件在服务器启动时加载, 提供各种服务：如数据统计, 路由功能的替换, 游戏场景的初始化等. 

LordOfPomelo中使用了基于脚本的统计, 这些组件通过运行自定义的脚本, 收集服务器运行数据并生成报告, 更加具体的功能, 请见：

``` javascript
	var sceneInfo = require('./app/modules/sceneInfo');
	var onlineUser = require('./app/modules/onlineUser');
	if(typeof app.registerAdmin === 'function'){
    app.registerAdmin('sceneInfo', new sceneInfo());
    app.registerAdmin('onlineUser',new onlineUser(app));
	}
```

LordOfPomelo启动时还会加载areas的配置文件, 用来建立场景和服务器之间的映射:

``` javascript
  //Set areasIdMap, a map from area id to serverId.
	if (app.serverType !== 'master') {
	  var areas = app.get('servers').area;
	  var areaIdMap = {};
	  for(var id in areas){
	  	areaIdMap[areas[id].area] = areas[id].id;
	  }
	  app.set('areaIdMap', areaIdMap);
	}
```

为了能在多个场景服务器中正确的路由, LordOfPomelo中加载了自定义的路由组件, 通过使用场景与服务器之间的映射信息, 可以确保玩家的请求被分发到对应的场景服务器上:

``` javascript
  // route configures
	app.route('area', routeUtil.area);
	app.route('connector', routeUtil.connector);
```

除了服务器的通用配置以外, app.js中还负责不同服务的初始化工作: 如全局服务器的初始化, 场景的初始化, 以及寻路服务器的初始化, 这些初始化会根据服务器的类型进行不同的初始化过程: 

``` javascript
app.configure('production|development', 'area', function(){
  app.filter(pomelo.filters.serial());
  app.before(playerFilter());
  //Load scene server and instance server
  var server = app.curServer;
  if(server.instance){
    instancePool.init(require('./config/instance.json'));
    app.areaManager = instancePool;
  }else{
    scene.init(dataApi.area.findById(server.area));
    app.areaManager = scene;
  }
  //Init areaService
  areaService.init();
});
```

数据同步插件和MySql的初始化:

``` javascript
// Configure database
app.configure('production|development', 'area|auth|connector|master', function() {
  var dbclient = require('./app/dao/mysql/mysql').init(app);
  app.set('dbclient', dbclient);
  app.use(sync, {sync: {path:__dirname + '/app/dao/mapping', dbclient: dbclient}});
}); 
```

### 服务器的启动

LordOfPomelo的启动也采用了Pomelo框架中的启动方式, 即将master作为一个默认组件, 在app.js调用app.start()方法后加载, 启动master服务. 

master组件会负责启动其他所有服务. 这个启动过程分为两个阶段：第一阶段, master服务启动其他所有服务器, 在服务器启动完毕后, 其中的monitor组件会连到master对应的监听端口上, 表明该服务器启动完毕. 第二阶段, 在所有服务器都启动完毕之后, mater会调用所有服务器上的afterStart接口, 来进行启动后的处理工作. 

