# LordOfPomelo介绍
[LordOfPomelo](https://github.com/NetEase/lordofpomelo)是一个基于Pomelo框架开发的分布式MMORPG游戏[Demo](http://pomelo.netease.com/lordofpomelo/).

## LordOfPomelo的主要内容
涵盖了主流MMORPG的核心内容: 多个不同游戏场景, 两种职业, 多种类型的任务, 丰富多彩的道具和武器, 组队, 副本, 以及与各种怪物和Boss的战斗. 玩家可以在多个虚拟场景中穿梭, 完成各种任务, 提升等级, 并和其他玩家互动.

LordOfPomelo采用了基于分区的场景管理, 一张地图表示一个游戏场景, 与一个独立的场景服务器对应, 由该服务器提供对应的服务. 这种设计在避免了复杂的跨服事务的同时提供了对服务器扩展的支持, 开发者可以通过加入新的游戏场景来提高整个服务端的负载能力. 为了考察Pomelo服务器的响应能力, 我们在场景中采用了实时游戏模式: 玩家的攻击, 技能释放, 道具的检取、使用等行为都是实时进行的. 

整个游戏采用了Pomelo框架的标准开发模式, 实现了集群化服务器管理, 并且可以使用LordOfPomelo中对线性扩展的支持, 加入新的服务器来提高总体的负载能力. 在经过多轮性能测试与优化后, 达到了单场景800人的负载能力, 同时可以保证良好的响应时间(100ms左右). 

## LordOfPomelo整体架构

<img src="http://pomelo.netease.com/resource/documentImage/lordofpomelo/lordofpomelo-all-arch.png" alt="lordofpomelo overall architecture" width="600px"></img>

如上图所示, LordOfPomelo包括两种类型的服务器: game-server和web-server. web-server是基于HTTP的web服务器, 玩家通过web-server实现注册和登录逻辑. 在玩家完成验证之后就会通过websocket连接到game-server集群, 进入实际的游戏场景之中. game-server是LordOfPomelo的核心服务器集群, 包括一组前端的websocket服务器, 以及后端的游戏逻辑服务器集群, game-server的架构如下图: 

<img src="http://pomelo.netease.com/resource/documentImage/lordofpomelo/game-server.png" alt="game server" width="600px"></img>

上图中的Client可以是任何支持websocket的客户端, LordOfPomelo中自带的客户端是通过HTML5实现的, 不但可以运行在PC的浏览器上, 而且可以运行在其它支持HTML5的终端中（如iPhone, iPad和配置较高的android设备）. 不同平台之间的玩家可以进行对等、实时的互动. 

如图所示, game-server中的服务器也分为两类: frontend server和backend server, frontend server是一组websocket服务器集群, 用来处理与websoket客户端之间消息通讯, 负责消息的转发, 过滤, 以及消息广播等功能. backend server则主要用来处理游戏逻辑, 包括各种不同类型的游戏逻辑服务器. 其中, 场景服务器是最重要的游戏服务器, 主要负责游戏场景管理, 游戏数据的更新和保存, 客户端请求的处理, 以及怪物和NPC行为的驱动等. 这些功能是通过与其他服务器的协同工作来实现的. 同时, 场景服务器也采取了可扩展的形式, 每个场景对应一个独立的场景服务器. 可以通过增加游戏场景来分散单个服务器的压力, 提高整体负载. 

## LordOfPomelo分析
* [LordOfPomelo服务器介绍](LordOfPomelo-服务器介绍)
* [LordOfPomelo中的数据压缩](https://github.com/NetEase/pomelo/wiki/Pomelo-%E6%95%B0%E6%8D%AE%E5%8E%8B%E7%BC%A9%E5%8D%8F%E8%AE%AE)
* [LordOfPomelo代码组织](LordOfPomelo-代码组织)
* [LordOfPomelo启动流程](LordOfPomelo-启动流程)

