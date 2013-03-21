#!/usr/bin/env python
#coding:utf-8
'''
#=============================================================================
#     FileName: utils.py
#         Desc: tornado Transport class
#       Author: sunminghong
#        Email: allen.fantasy@gmail.com
#     HomePage: http://weibo.com/5d13
#      Version: 0.0.1
#   LastChange: 2012-11-09 18:37:34
#      History:
#=============================================================================
'''

import struct,random


def iptoint(ip):
    '''convert ip to int'''
    f = sum( [ int(k)*v for k, v in zip(ip.split('.'), [1<<24, 65536, 256, 1])] )

    return f
    
def iptostr(ip):
    '''convert ip to str'''
    f = sum( [ int(k)*v for k, v in zip(ip.split('.'), [1<<24, 65536, 256, 1])] )

    return f

