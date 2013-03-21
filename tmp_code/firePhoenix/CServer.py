#!/usr/bin/env python
#coding:utf-8
'''
#=============================================================================
#     FileName: CServer.py
#         Desc: 通信服务器，是客户端与服务器端进行socket连接的入口
#       Author: sunminghong2
#        Email: allen.fantasy@gmail.com
#     HomePage: http://weibo.com/5d13
#      Version: 0.0.1
#   LastChange: 2012-10-10 20:57:25
#      History:
#=============================================================================
'''
from __future__ import absolute_import, division, with_statement

#监听端口
import socket

from tornado.netutil import TCPServer
from tornado.ioloop import IOLoop
from tornado.iostream import IOStream 

from CTransport import CTransport
import CConnectionPool as cpool
from IDAllocor import IDAllocor

import common as com

class CServer(TCPServer):
    def __init__(self,ip,port,CAssignClass,io_loop=None,ssl_options=None, **kwargs):
        self.ip = ip
        self.port = port

        #上一个客户端连接ID
        self._lastClientid = 0
        self._idAllocor = IDAllocor()

        super(CServer, self).__init__(
            io_loop=io_loop, ssl_options=ssl_options,**kwargs)
        if io_loop:
            self.ioloop = io_loop
        else:
            self.ioloop = IOLoop.instance()

        self.cpool = cpool.CConnectionPool.getInstance()
        self.cpool.connect(CAssignClass.getGSArray())

        run()

    def handle_stream(self, stream, address):
        #客户端连接了
        #todo：加入 C -> GS DICT
        clientid = self._idAllocor.alloc()

        ConnectionBase(stream, clientid, address, self._receiveData_from_client,self._clientCconnect,self._clientClose)

    def _receiveData_from_client(self,connection,body):
        '''接受到客户（玩家）的数据包'''
        #转发到GS服务器端
        self.cpool.send(connection.clientid,body)

    def _clientClose(self,connection):
        '''客户端（玩家）断开连接'''
        self.cpool.clear(connection.clientid)

    def run():
        global server

        if not com._cc.ASSIGN_PROCESS_MODE:
            processFuns.assignGS_2(0)

        #processFuns.regGS(com._cc.CurrIp,com._cc.CurrPort)


        #监听game端口
        print 'map server started,listen on %s' % \
                (self.port)

        server = TcpServer(transport)
        if os.name == 'nt':
            server.listen(com._cc.CurrPort)
        else:
            import tornado.netutil
            import tornado.process
            sockets = tornado.netutil.bind_sockets(self.port)
            tornado.process.fork_processes(0)
            server.add_sockets(sockets)

        #server.io_loop.add_timeout(time.time() + com._cc.CLEAR_INTERVAL_TIME ,clearOnline)

        self.ioloop.start()

    def send_message(message):
        stream.write((message + '\n').encode('utf-8'))


#python D:\sgsvn\project_server\dev\src\game/gameserver.py globalConf &
#python D:\sgsvn\project_server\dev\src\game/gameserver.py 127.0.0.1 30000  &
#python D:\sgsvn\project_server\dev\src\game/gameserver.py 127.0.0.1 30000  globalConf&
#python D:\sgsvn\project_server\dev\src\game/gameserver.py &
if len(sys.argv)==2:
    com.init(str(sys.argv[1]))
elif len(sys.argv)==3:    
    com.init('globalConf')
    com._cc.CurrIp = str(sys.argv[1])
    com._cc.CurrPort = int(sys.argv[2])
elif len(sys.argv)==4:
    com.init(str(sys.argv[3]))
    com._cc.CurrIp = str(sys.argv[1])
    com._cc.CurrPort = int(sys.argv[2])
else:
    print 'no run argvs'
    com.init('globalConf')


_gsid = com._cc.CurrIp +":"+ str(com._cc.CurrPort)
com.gsid = com._cc.gsid = _gsid

_pqd = com._cc.PROCESS_MSG_QUEUE_DELAY

if __name__ == '__main__':

