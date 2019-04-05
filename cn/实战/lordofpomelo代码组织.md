# LordOfPomelo代码组织

LordOfPomelo的代码主要包括两部分: 后端服务器代码game-server和前端客户端代码web-server. game-server是游戏服务端, 包括所有的游戏逻辑代码和游戏服务器代码. web-server是游戏客户端, 包括用户注册和登录界面代码, 以及一个用HTML5编写的游戏客户端. 除了这两部分之外, 还有一个公用的shared目录, 用来存放前后端共用的代码和配置. 

作为一个分布式的游戏服务器, LordOfPomelo可以同时运行在多台服务器上, 却统一使用同一套代码, 不同的服务器会根据配置加载各自的目录代码. 下图是LordOfPomelo的代码结构: 

![lordofpomelo_arch](http://pomelo.netease.com/resource/documentImage/lordofpomelo/code/LOP_arch.png)

## game-server服务端代码分析

![game-server](http://pomelo.netease.com/resource/documentImage/lordofpomelo/code/game-server.png)

game-server根目录下的app.js是服务器代码的入口, 其他目录的功能如下: 
* /app    : 服务端js代码, 包括服务器代码和游戏逻辑代码. 
* /config : LordOfPomelo中的配置文件. 
* /logs   : 服务器端运行时产生的日志文件. 
* /scripts: 统计模块对应的本地脚本. 
* /test   : LordOfPomelo中的测试用例

### 逻辑代码

逻辑代码主要用来完成具体的业务逻辑, 如用来驱动怪物的AI代码, 用来计算地图中路径的寻路代码等, 逻辑代码在/app/domain目录下: 

![logic](http://pomelo.netease.com/resource/documentImage/lordofpomelo/code/logic.png)

* /action : 负责处理客户端的请求. 由于场景是由tick驱动的, 而tick的间隔一般较短(默认100ms), 当请求需要在多个tick中执行的时候就会被封装为一个action来执行. 
* /aoi    : aoi相关逻辑, 包括aoi消息的封装, 以及对aoi消息的处理. 
* /area   : 场景相关逻辑, 提供场景中的主要接口. 包括: 场景中实体的加入、更新和删除, 广播消息的推送, 场景中服务的访问(AOI, AI等), 场景信息的获取等. 同时还包括一个Timer, 用来驱动场景中的逻辑. 
* /entity : 场景中的所有实体, 包括玩家, 怪物, npc, 宝物, 装备, 队伍等. 
* /event  : 用来集中处理场景逻辑中产生的各种事件, 包括玩家消息, 怪物消息等. 
* /map    : 用来完成地图的加载和解析, 以及地图中区域的抽象. 
* /task   : 任务相关的代码, 控制任务的执行和取消, 以及任务奖励的获得. 

### 服务器代码. 

![servers](http://pomelo.netease.com/resource/documentImage/lordofpomelo/code/servers.png)

服务器代码在/servers目录下, 通过规约的形式组织, 对外提供rpc接口, 处理客户端和服务端的请求并返回结果. LordOfPomelo中使用的服务器包括: 
* /area     : 场景服务器, 用来储存场景信息, 处理客户端的请求, 如用户添加, 删除, 攻击等操作. 
* /chat     : 聊天服务器, 处理聊天信息
* /connector: 连接服务器, 负责维护用户session, 接受用户数据, 并将服务端的广播数据推送给玩家
* /login    : 登录服务器, 用来验证用户登录信息
* /path     : 寻路服务器, 用来完成路径计算功能. 
* /manager  : 副本/组队服务器, 用来管理全局的副本和组队功能. 

## web-server代码架构

![web server](http://pomelo.netease.com/resource/documentImage/lordofpomelo/code/web_server.png)

LordOfPomelo的页面端代码主要分为两个部分: 基于HTML5开发的ui代码和使用colorbox开发的游戏逻辑代码. ui代码包括注册/登录页面, 游戏场景中的各种选项和菜单. 这些代码基于HTML5开发, 使用css3进行渲染. 游戏场景的绘制和游戏逻辑的驱动则是基于colorbox开发, 并使用到了HTML5中的很多特性. 

除此之外, web-server中还包括用户注册代码和oauth验证的逻辑, 这些代码在lib目录下. 

下图是页面端的内容: 

![client & html](http://pomelo.netease.com/resource/documentImage/lordofpomelo/code/client_html.png)

* /animation_json : 动画相关的json描述.
* /css            : 代码中所用到的css文件. 
* /image          : 客户端中用到的图片资源.
* /js             : 所有客户端的js文件.
* /index.html     : 是LordOfPomelo的入口文件.

下图是游戏js代码组织: 

![client & html](http://pomelo.netease.com/resource/documentImage/lordofpomelo/code/game_client.png)

* /config   : 客户端的配置信息.
* /handler  : 客户端的handler, 用来处理服务端response请求.
* /lib      : colorbox和pomelo的客户端通讯库代码.
* /model    : 客户端的游戏逻辑代码.
* /ui       : ui代码.
* /utils    : 客户端用到的工具类.
* /app.js   : 客户端的初始化入口, 负责初始化客户端的逻辑代码. 

