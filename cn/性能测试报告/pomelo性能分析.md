# Pomelo-性能测试(以LordOfPomelo为测试对象)


### 目 录
##### 测试环境
1. 服务端测试环境
2. 客户端测试环境


##### 测试结果
1. 多进程多角色同时战斗场景(最多486个角色)
2. 多进程多角色同时行走场景(最多800个角色)
3. 多进程多角色同时战斗/行走场景(最多558个角色)


### 测试环境
##### 1.1 服务端测试环境
<table class="table table-bordered table-striped table-condensed">
  <th width="15%">服务</th>
  <th width="30%">机器</th>
  <th width="55%">硬件配置</th>
  <tr>
    <td>GameServer<br>
      &<br>
      WebServer
    </td>
    <td>pomelo3.server.163.org</td>
    <td>
      云主机<br>
      1CPU 8核心<br>
      CPU型号 GenuineIntel QEMU Virtual CPU version 1.1.2@2.0GHz<br>
      16G 内存<br>
      1网卡<br>
      linux/64位 OS<br>
    </td>
  </tr>
</table>

###### 说明:
* 服务端采用Node.js开发, 磁盘IO主要为log写入, 所有game-server服务器均配置toobusy(MAXLAG为默认的70ms), 出现瓶颈的部分在CPU.

##### 1.2 客户端测试环境

<table class="table table-bordered table-striped table-condensed">
  <th width="15%">服务</th>
  <th width="30%">机器</th>
  <th width="55%">硬件配置</th>
  <tr>
    <td>Clients</td>
    <td>pomelo16~25.server.163.org</td>
    <td>
      云主机<br>
      1CPU 1核心<br>
      CPU型号 GenuineIntel Westmere E56xx/L56xx/X56xx (Nehalem-C)@2.6GHz<br>
      1G 内存<br>
      1网卡<br>
      linux/64位 OS<br>
    </td>
  </tr>
</table>
###### 说明:
* 客户端是全部走内网的。


### 测试结果

##### 1. 多进程多角色同时战斗场景(最多486个角色同时处于area3场景)
* 9台云主机上各启动1个客户端进程, 每个客户端进程上运行1个代理, 每个代理负责55个角色, 这样会有495个角色登录游戏. 9个客户端代理并发, 每2秒发起一次角色登录操作, 最终会有486个角色同时处于area3场景, 登录成功的角色每隔2~5秒发起一次攻击(攻击对象为附近的其他角色或者怪物)或者捡道具操作. 攻击的成功率为98.29%. 如下图:

![attack-1](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/attackJpg/1.jpg)
![attack-2](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/attackJpg/2.jpg)


* 每个角色的出生点随机分布于15个点上, 如下图:

![attack-3](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/attackJpg/3.jpg)
![attack-4](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/attackJpg/4.jpg)

* 486个角色都登录成功并开始发起攻击时, 服务器和pomelo16客户端的top:

![attack-5](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/attackJpg/5.jpg)

* 测试完毕时服务器和pomelo16客户端的top:


![attack-6](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/attackJpg/6.jpg)

* 测试过程中服务器状态:

![attack-7](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/attackJpg/7.jpg)
![attack-8](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/attackJpg/8.jpg)
![attack-9](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/attackJpg/9.jpg)
![attack-10](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/attackJpg/10.jpg)

* 9台云主机上各启动1个客户端进程, 每个客户端进程上运行1个代理, 每个代理负责90个角色, 这样会有810个角色登录游戏. 9个客户端代理并发, 每2秒发起一次角色登录操作, 最终会有800个角色同时处于area3场景, 登录成功的角色每隔2~5秒发起一次移动操作. 移动的成功率为99.95%. 如下图:

![move-1](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/moveJpg/1.jpg)
![move-2](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/moveJpg/2.jpg)

* 这800个角色随机出生于地图上的15个点. 每一个角色的移动操作都是有规律的, 8次移动为一轮动作循环, 每次的步长为随机值(1~walkSpeed), 8次移动后该角色大致可以回到起点. 这么做的目的是尽量将角色限定在其出生点附近, 以使得所有角色尽量均匀分布于整张地图. 如下图:

![move-3](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/moveJpg/3.jpg)
![move-4](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/moveJpg/4.jpg)

* 800个角色都登录成功并开始移动时, 服务器和pomelo16客户端的top:

![move-5](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/moveJpg/5.jpg)

* 测试完毕时服务器和pomelo16客户端的top:

![move-6](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/moveJpg/6.jpg)

* 测试过程中服务器状态:

![move-7](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/moveJpg/7.jpg)
![move-8](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/moveJpg/8.jpg)
![move-9](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/moveJpg/9.jpg)
![move-10](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/moveJpg/10.jpg)

##### 3. 多进程多角色同时战斗/行走场景(最多558个角色)
* 9台云主机上各启动1个客户端进程, 每个客户端进程上运行1个代理, 每个代理负责63个角色, 这样会有567个角色登录游戏. 9个客户端代理并发, 每2秒发起一次角色登录操作, 最终会有558个角色同时处于area3场景, 登录成功的角色每隔2~5秒发起一次攻击(50%)或者移动(50%)操作. 攻击的成功率为99.50%. 移动的成功率为99.57%.  如下图:

![both-1](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/bothJpg/1.jpg)
![both-2](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/bothJpg/2.jpg)
![both-3](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/bothJpg/3.jpg)

* 这558个角色随机出生于地图上的15个点. 角色攻击时的对象为附近的其他角色或者怪物. 角色的移动操作都是有规律的, 8次移动为一轮动作循环, 每次的步长为随机值(1~walkSpeed), 8次移动后该角色大致可以回到起点. 这么做的目的是尽量将角色限定在其出生点附近, 以使得所有角色尽量均匀分布于整张地图. 如下图:

![both-4](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/bothJpg/4.jpg)
![both-3](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/bothJpg/5.jpg)

* 558个角色都登录成功并开始攻击/移动时, 服务器和pomelo16客户端的top:

![both-5](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/bothJpg/6.jpg)

* 测试完毕时服务器和pomelo16客户端的top:

![both-7](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/bothJpg/7.jpg)

* 测试过程中服务器状态:

![both-8](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/bothJpg/8.jpg)
![both-9](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/bothJpg/9.jpg)
![both-10](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/bothJpg/10.jpg)
![both-11](http://pomelo.netease.com/resource/documentImage/lordofpomelo/performanceTest/bothJpg/11.jpg)

