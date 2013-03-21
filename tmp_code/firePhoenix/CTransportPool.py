#!/usr/bin/env python
#coding:utf-8
'''
#=============================================================================
#     FileName: CConnectionPool.py
#         Desc: tornado Transport class
#       Author: sunminghong
#        Email: allen.fantasy@gmail.com
#     HomePage: http://weibo.com/5d13
#      Version: 0.0.1
#   LastChange: 2012-11-09 16:57:34
#      History:
#=============================================================================
'''

import socket
import logging

from tornado.iostream import IOStream 
from CTransport import CTransport

class CTansportPool():
    def getInstance(self):
        pass

    def __init__(self,from_gs_receive_callback,**kwargs):
        self._lastid = 0
        self._connpool = {}

        self._from_gs_receive = from_gs_receive_callback
        self.kwargs = kwargs

        logging.info()

    def connect(self,gsArray):
        '''连接游戏服务器'''
        for gs in gsArray:
            self._connpool[gs] = self._connectGS(gs)

    def _connectGS(self,gs):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM, 0)
        cstream = IOStream(s)
        cstream.connect(gs)

        #todo: 记录gsid
        #todo: 不需要common，gamefuns等函数
        #todo: 修改clearOnline 
        #todo: 定时发送广播消息

        self._lastid += 1
        transid = self._lastid
        ctransport = CTransport(cstream,transid,gs,self.from_gs_receive,self.gs_close,**self.kwargs)
        self._connpool[transid] = ctransport
        self._poolsize = len(self._connpool)

    def gs_close(self,connection):

        self._poolsize = len(self._connpool)
        del self._connpool[connection.clientid]

    def mapClientToGS(self,clientid):
        if clientid in self._clientMapToGS:
            poolid = self._clientMapToGs[clientid]
            if poolid in self._connpool:
                return self._connpool[poolid]
            else:
                del self._clientMapToGs[clientid]
        
        poolid = clientid % self._poolsize
        self._clientMapToGS[poolid] = poolid
        return self._connpool[poolid]

    def send(self,clientid,body):
        '''转发到游戏服务器'''

        conn = self.mapClientToGS(clientid)
        try:
            if conn:
                conn.write(1,clientid,body)
        except:
            logging.error('conn is socket !')

    def clearClient(self,clientid):
        if clientid in self._clientMapToGS:
            del self._clientMapToGs[clientid]
       
