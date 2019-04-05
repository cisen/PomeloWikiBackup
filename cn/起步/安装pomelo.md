pomelo是基于Node.js的，目前pomelo已经完全支持Windows、Linux、Mac等多种平台。

准备
========

* 确保你的机器可以上网,因为安装pomelo的过程需要从网上下载其依赖的包。

* 确保你的系统上已经要安装了Node，目前最新的Node提供了已经编译好的二进制安装包，包括Windows，Mac和Linux等平台。想省事的话，直接去[这里](http://nodejs.org/download/ "下载Node安装包")下载对应的安装包，直接安装就好了。Node同时也提供了传统的从源码编译的方式安装，不过比起直接使用二进制的方式要麻烦。

* 确保你的系统中安装有python(2.5 < version < 3.0)以及C++的编译器。Node的源码主要由C++代码和JavaScript代码构成，但是却用[gyp](http://code.google.com/p/gyp/ "gyp")工具来做源码的项目管理，该工具采用Python语言写成的。对于非windows平台，一般都会预装Python以及C++编译工具；对于Windows系统，请确保你的Windows系统包含源码编译工具。在Windows平台上，Node.js采用gyp来生成Visual Studio Solution文件，最终通过VC++的编译器将其编译为二进制文件。

* 虽然pomelo是用Javascript写成，但是pomelo依赖的库中，有使用了C++语言写的扩展，因此安装pomelo的过程中会使用到C++编译器。 所以，在安装之前请确保你的Windows系统满足以下两个条件：
     - [python](http://python.org/)(2.5<version<3.0)。
     - VC++ 编译器，包含在[Visual Studio 2010](http://msdn.microsoft.com/en-us/vstudio/hh388567)中（VC++ 2010 Express亦可）。对于windows8的用户，需要安装Microsoft Visual Studio C++ 2012。

* 如果你使用的是`Mac OS X`系统, 则需要安装[Xcode Command Line Tools](https://developer.apple.com/downloads/index.action?q=xcode)或者[Xcode](https://developer.apple.com/xcode/)的完整包以及make工具.


安装pomelo
===========

使用npm(node包管理工具)全局安装pomelo: 

    $ npm install pomelo -g

可以通过如下命令下载源代码的方式安装

    $ git clone https://github.com/NetEase/pomelo.git
    $ cd pomelo
    $ npm install -g

其中-g表示全局安装，关于npm的使用问题，可以参考[npm的文档](https://npmjs.org/doc/ "npm的文档")，里面有详细的npm使用的介绍。如果安装过程中没有报错误，说明安装成功。

windows下安装经验：

    1. node,vs2010 和 python(2.5<v<3) 都是32位或者都是64位的。
    2. 配置  PYTHON=d:\Python27\python.exe(设置成你自己的路径)。注意不是path里面,而是和path同级的，直接在全局或者当前用户下配置。
    3. 保证环境变量path里面有 %SystemRoot%\system32;%SystemRoot%;%SystemRoot%\System32\Wbem;
      注： 这三个环境变量中貌似只有%SystemRoot%\system32这个环境变量有用，没具体试（没有他会报CreateProcessW找不到的错误)。
    4. 如果在命令行界面安装pomelo失败，可以在Visual Studio的命令行界面安装。

下面我们将通过一个[HelloWorld项目](pomelo的HelloWorld "HelloWorld")来检验我们的安装是否成功。