### 测试环境
##### 1.1 服务端测试环境

<table class="table table-bordered table-striped table-condensed">
  <th width="15%">服务</th>
  <th width="30%">机器</th>
  <th width="55%">硬件配置</th>
  <tr>
    <td>GameServer
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


##### 1.2 客户端测试环境

<table class="table table-bordered table-striped table-condensed">
  <th width="15%">服务</th>
  <th width="30%">机器</th>
  <th width="55%">硬件配置</th>
  <tr>
    <td>Clients</td>
    <td>pomelo16~18.server.163.org</td>
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

### 测试结果

#### 场景A

1. `1个`服务进程.
2. `2个`客户端并发, 每隔`1ms`发起一次RPC调用(msg='Hello World'), 每个客户端总计发送`1w`次, 服务器对每个RPC请求回复一个`200`.
3. 服务器完成`2w`次RPC请求的时间为`14.595s`, 平均`1370次/s`.
4. 服务器完成一次RPC调用的时间约为: `1~4ms`
5. 在服务器运行过程中:
 `server`进程对CPU的占用平均值为: 37.8% [CPU占用的采样点为: 36%, 38%, 43%, 35%, 37%]
6. 在客户端运行过程中:
 `client`进程对CPU的占用平均值为: 31.8% [CPU占用的采样点为: 37%, 35%, 31%, 31%, 25%]

#### 场景B

1. `4个connector`和`1个echo`业务进程.
2. `4个`客户端并发且分别连接`1个connector`, 每隔`1ms`发起一次`request`请求(msg='Hello World'), 每个客户端总计发送`1w`次, 服务器对每个`request`回复一个`200`.
3. 服务器完成`4w`次请求的时间为`15.12s`, 平均`2645次/s`.
4. 服务器完成一次RPC调用的时间约为: `1~8ms`
5. 在服务器运行过程中:
 `connector`进程对CPU的占用平均值为: 71.25% [CPU占用的采样点为: 70%, 65%, 76%, 74%];
      `echo`进程对CPU的占用平均值为: 80.75% [CPU占用的采样点为: 85%, 78%, 82%, 78%]
6. 在客户端运行过程中:
    `client`进程对CPU的占用平均值为: 27.6% [CPU占用的采样点为: 26.2%, 26.5%, 28.2%, 29.4%]

