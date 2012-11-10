#!/usr/bin/env python
#coding:utf-8
'''
#=============================================================================
#     FileName: ConnectionBase.py
#         Desc: tornado Transport class
#       Author: sunminghong
#        Email: allen.fantasy@gmail.com
#     HomePage: http://weibo.com/5d13
#      Version: 0.0.1
#   LastChange: 2012-11-09 18:11:11
#      History:
#=============================================================================
'''

import struct,random

from tornado import stack_context

class ConnectionBase(object):
    def __init__(self,stream,clientid,address,receiveDataCallback,closeCallback,**kwargs):
        '''
        @param clientid,int16
        '''
        self.clientid = clientid

        self.stream = stream
        self.address = address
        self.MASK1 = kwargs.get('mask1',0x59) 
        self.MASK2 = kwargs.get('mask2',0x7a)

        self._closeCallback = closeCallback
        self._receive_callback = stack_context.wrap(receiveDataCallback)

        self._masklen = 2 
        self._read_buffer = []

        stream.set_close_callback(self.loseConnection)

        # Save stack context here, outside of any request.  This keeps
        # contexts from one request from leaking into the next.
        self._read_callback = stack_context.wrap(self._on_read_start_mask)
        self._read_length_callback = stack_context.wrap(self._on_read_length)
        self._read_body_callback = stack_context.wrap(self._on_read_body)

        self.stream.read_bytes(self._masklen,self._read_callback)

    def _on_read_start_mask(self,data):
        _flag1,_flag2 = struct.unpack('bb',data) #第一位校验码,#第二位校验码
        if _flag1 & self.MASK1 == _flag1 and _flag2 & self.MASK2 == _flag2:
            self.stream.read_bytes(4,self._read_length_callback)
        else:
            self.stream.read_bytes(self._masklen,self._read_callback)

    def _on_read_length(self,data):
        body_len, = struct.unpack('<i',data)
        self.stream.read_bytes(body_len + 2,self._read_body_callback)

    def _on_read_body(self,data):
        _flag1,_flag2 = struct.unpack('bb',data[-2:]) #第一位校验码,#第二位校验码
        if (_flag2 & self.MASK1) == _flag2 and (_flag1 & self.MASK2) == _flag1:

            #trigger a receive message envent
            body = data[:-2]
            #print repr(body)
            if self._receive_callback:
                self._receive_callback(self,body)

            self.stream.read_bytes(self._masklen,self._read_callback)
        else:
            self.stream.read_bytes(self._masklen,self._read_callback)


    def write(self, body, callback=None):
        """
        发送数据，ctype =0 时，表示数据为GS向客户端广播，通信层向GS发送的信息不可能为0
        """
        if not self.stream.closed():
            mask1 = self.MASK1 & random.randint(0,0x7f)
            mask2 = self.MASK2 & random.randint(0,0x7f)

            data = struct.pack('<bbi',mask1,mask2,len(body))
            data += body
            data += struct.pack('bb',mask2,mask1)

            self._write_callback = stack_context.wrap(callback)            
            self.stream.write(data, self._on_write_complete)

    def _on_write_complete(self):
        """callback when asyn iostream write complete """
        if self._write_callback is not None:
            callback = self._write_callback
            self._write_callback = None
            callback()

    def getHost(self):
        return self.address

    def getPeer(self):
        return '%s(%s)' % (self.address,'peer')

    def getStatus(self):
        """retun true if this stream is connectting """
        return not self.stream.closed() 

    def loseConnection(self):
        if not self.stream.closed():
            self.stream.close()

        if self._closeCallback:
            self._closeCallback(self)

