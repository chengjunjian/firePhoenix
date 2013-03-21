#!/usr/bin/env python
#coding:utf-8
'''
#=============================================================================
#     FileName: TornadoTransport.py
#         Desc: tornado Transport class
#       Author: sunminghong
#        Email: allen.fantasy@gmail.com
#     HomePage: http://weibo.com/5d13
#      Version: 0.0.1
#   LastChange: 2012-10-09 16:21:00
#      History:
#=============================================================================
'''
import struct

import libs.net.tornado.Transport  as transport
import libs.net.Datagram as DG

import libs.helper.Logger as log

_logger= log.Logger('protocolerror')
def getLogger():
    return _logger

_socketid = 0
def getSocketid():
    '''自增长socketid'''
    global _socketid
    _socketid += 1
    return _socketid

class Factory(object):
    connectionNums = 0

class ProtocolBase(object):
    """Handles a connection to an HTTP client, executing HTTP requests.

    We parse HTTP headers and bodies, and execute the request callback
    until the HTTP conection is closed.
    """

    def __init__(self, stream, address):
        #初始化逻辑
        self.transport = transport.Transport(stream,address,self._dataReceived)
        self._write_callback = None

        self._datagram=DG.Datagram()        

        #self.factory = ProtocolBase._factory
        self.factory = Factory
        self.socketid = 0

        self.connectionMade()
        stream.set_close_callback(self.connectionLost)

    def close(self):
        self.transport.loseConnection()

    def getid(self):
        return self.socketid

    def getHost(self):
        return self.transport.getHost()

    def getStatus(self):
        '''得到连接的状态，=0表示断开了连接，=1表示正在连接'''
        return self.transport.getStatus()
        
    def connectionMade(self):
        self.socketid = getSocketid()
        self.factory.connectionNums += 1
    
    def connectionLost(self):
        self.factory.connectionNums -= 1
        
    def _dataReceived(self, data):
        #self.transport.write(data)
        #协议号 第6-第8位
        code, = struct.unpack('<H',data[0:2])
        body = data[2:]

        #ProtocolBase.sequenum += 1

        self.messageHandler([(code,body)])
                    
    def sendmsg(self,code,body):
        data=self._datagram.pack(code,body)
        self.transport.write(data)
        #print repr(body)
                    
    def sendmsgs(self,msgs):
        data=self._datagram.packs(msgs)
        self.transport.write(data)
                    
    def messageHandler(self,msgs):
        '''
        @(self,(code,body))：对接收到的消息进行处理的回调函数
        '''
        pass
        #for msg in msgs:
        #    code=msg[0]
        #    body=msg[1]
        #    funs.com.ut.debug('messagerHandler:',code,repr(body))
        #    
        #    try:
        #        import gameFuns as funs
        #        funs.com.mysql.connect()
        #        procfun=__import__('procmsg'+str(code))
        #        procfun.proc(self,code,body)
        #        funs.com.mysql.close()
        #    except :
        #        getLogger().error()
        #        self.transport.write('last msg has error!')
        #    finally:
        #        pass


