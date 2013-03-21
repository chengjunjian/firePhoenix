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
#   LastChange: 2012-10-09 16:53:02
#      History:
#=============================================================================
'''

import struct

from tornado import stack_context

class Transport(object):
    '''将IOStream 进行包装，使他兼容 twisted 的transpot class '''

    def __init__(self,stream,address,receiveDataCallback,mask1=0x59,mask2=0x7a):
        self.stream = stream
        self.address = address
        self.MASK1 = mask1
        self.MASK2 = mask2

        self._receive_callback = stack_context.wrap(receiveDataCallback)

        self._masklen = 2 
        self._read_buffer = []


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
        body_len, = struct.unpack('<I',data)
        self.stream.read_bytes(body_len + 2,self._read_body_callback)

    def _on_read_body(self,data):

        _flag1,_flag2 = struct.unpack('bb',data[-2:]) #第一位校验码,#第二位校验码
        if (_flag2 & self.MASK1) == _flag2 and (_flag1 & self.MASK2) == _flag1:

            #trigger a receive message envent
            body = data[:-2]
            #print repr(body)
            if self._receive_callback:
                self._receive_callback(body)

            self.stream.read_bytes(self._masklen,self._read_callback)
        else:
            self.stream.read_bytes(self._masklen,self._read_callback)

    def write(self, chunk, callback=None):
        """Writes a chunk of output to the stream."""
        if not self.stream.closed():
            self._write_callback = stack_context.wrap(callback)            
            self.stream.write(chunk, self._on_write_complete)

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


