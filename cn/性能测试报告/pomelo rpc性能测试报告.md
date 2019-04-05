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
1. `connector`和`echo`业务进程各`1个`.
2. `2个`客户端并发, 每隔`1ms`发起一次`request`请求(msg='Hello World'), 每个客户端总计发送`1w`次, 服务器对每个`request`回复一个`200`.
3. 服务器完成`2w`次请求的时间为`14.835s`, 平均`1348次/s`.
4. 服务器完成一次RPC调用的时间约为: `2~8ms`
5. 在服务器运行过程中:
 `connector`进程对CPU的占用平均值为: 91.6% [CPU占用的采样点为: 92%, 94%, 95%, 87%, 84%, 96%, 93%];
      `echo`进程对CPU的占用平均值为: 28.1% [CPU占用的采样点为: 30%, 20%, 33%, 22%, 25%, 46%, 21%]
6. 在客户端运行过程中:
    `client`进程对CPU的占用平均值为: 30.1% [CPU占用的采样点为: 18%, 24%, 25%, 40%, 16%, 49%, 39%]

#### 场景B
1. `4个connector`和`1个echo`业务进程.
2. `4个`客户端并发且分别连接`1个connector`, 每隔`1ms`发起一次`request`请求(msg='Hello World'), 每个客户端总计发送`1w`次, 服务器对每个`request`回复一个`200`.
3. 服务器完成`4w`次请求的时间为`14.866s`, 平均`2690次/s`.
4. 服务器完成一次RPC调用的时间约为: `1~25ms`
5. 在服务器运行过程中:
 `connector`进程对CPU的占用平均值为: 71.8% [CPU占用的采样点为: 75%, 71%, 71%, 74%, 68%];
      `echo`进程对CPU的占用平均值为: 81.3% [CPU占用的采样点为: 81%, 82%, 83%, 79%]
6. 在客户端运行过程中:
    `client`进程对CPU的占用平均值为: 28.0% [CPU占用的采样点为: 28%, 29%, 29%, 26%]
