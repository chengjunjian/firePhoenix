#!/usr/bin/env python
#coding:utf-8
'''
#=============================================================================
#     FileName: CTransport.py
#         Desc: tornado Transport class
#       Author: sunminghong
#        Email: allen.fantasy@gmail.com
#     HomePage: http://weibo.com/5d13
#      Version: 0.0.1
#   LastChange: 2012-11-09 15:29:17
#      History:
#=============================================================================
'''

import struct,random

from tornado import stack_context
from ConnectionBase import ConnectionBase

class CTransport(ConnectionBase):
    def __init__(self,stream,clientid,address,receiveDataCallback,closeCallback,**kwargs):
        super(CTransport,self).__init__(
            stream,clientid,address,receiveDataCallback,closeCallback,**kwargs
            )

    def _on_read_body(self,data):
        _flag1,_flag2 = struct.unpack('bb',data[-2:]) #第一位校验码,#第二位校验码
        if (_flag2 & self.MASK1) == _flag2 and (_flag1 & self.MASK2) == _flag1:
            #trigger a receive message envent
            chead, = struct.unpack('<i',data[0:4])
            ctype = chead >> 24
            #ctype =0 时，表示数据为广播，游戏服务器接收的不可能为0
            if ctype == 0:
                # 等于 == 0 表示为广播
                socketid = 0
            else:
                socketid = chead & 0x7fffffff
            body = data[4:-2]
            self._receive_callback(self,ctype,socketid,body)

            #code, = struct.unpack('<H',data[4:6])
            #body = data[6:-2]
            #self._receive_callback(ctype,socketid,code,body)

            self.stream.read_bytes(self._masklen,self._read_callback)
        else:
            self.stream.read_bytes(self._masklen,self._read_callback)

    def write(self, ctype,socketid, body, callback=None):
        """
        发送数据，ctype =0 时，表示数据为GS向客户端广播，通信层向GS发送的信息不可能为0
        """
        if not self.stream.closed():
            mask1 = self.MASK1 & random.randint(0,0x7f)
            mask2 = self.MASK2 & random.randint(0,0x7f)

            if ctype == 0:
                chead = 0
            else:
                chead = ctype << 24 | socketid
            #data = struct.pack('<bbiiH',mask1,mask2,6+len(body),chead,code)

            data = struct.pack('<bbii',mask1,mask2,4+len(body),chead)
            data += body
            data += struct.pack('bb',mask2,mask1)

            self._write_callback = stack_context.wrap(callback)            
            self.stream.write(data, self._on_write_complete)

