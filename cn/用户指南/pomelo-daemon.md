##pomelo-daemon
pomelo-daemon 提供了一个 daemon 服务，可以用这个服务来进行分布式部署以及日志收集

### 安装
```
npm install -g pomelo-daemon
```

### 使用
#### 启动pomelo集群  
* 在服务器上面部署代码  
* 把servers.json上面的host配置称为正确的host，而不是 '127.0.0.1'  
* 在config文件夹下面添加daemon.json文件  
daemon.json 例子
```json
{
    "id": "dh37fgj492je",
    "key": "agarxhqb98rpajloaxn34ga8xrunpagkjwlaw3ruxnpaagl29w4rxn",
    "algorithm": "sha256",
    "user": "pomelo"
}
```
**注意**：pomelo-daemon 使用 [hawk](https://github.com/hueniverse/hawk) 来提供服务间的请求认证  
* cd 到 /game-server 路径下面  
* 在master服务器上，敲入命令  
```
pomelo-daemon
```
* 在其它服务器上，敲入命令  
```
pomelo-daemon --mode=server
```
**注意**：你可以使用nohup来部署daemon  
```
nohup pomelo-daemon --mode=server
```
* 在master服务器上，pomelo-daemon client，敲入命令  
```
start all
```
* pomelo 集群启动起来了  

#### daemon rpc 日志收集  
pomelo-daemon 提供了 pomelo rpc 日志收集同步到 mongodb，然后可以通过 [pomelo-admin-web](https://github.com/NetEase/pomelo-admin-web) 来进行分析查看  
* 添加 mongo.json 文件到 config 文件夹下面  
mongo.json 例子  
```json
{
    "host": "localhost",
    "port": 27017,
    "username": "pomelo",
    "password": "pomelo",
    "database": "test",
    "collection": "cpomelo"
}
```
* 启动 pomelo-daemon rpc logger 收集，使用 --pattern 参数来设置 rpc-log 文件的patterns  
```
pomelo-daemon --mode=server --log --pattern=rpc-log
```
**注意**：rpc-logs 日志收集仅仅用于调试，在生产环境下面不建议使用rpc-logs模式  
