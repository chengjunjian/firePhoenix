<!--=============================================================================
#     FileName: design.md
#         Desc: 设计文档
#       Author: sunminghong
#        Email: allen.fantasy@gmail.com
#     HomePage: http://weibo.com/5d13
#      Version: 0.0.1
#   LastChange: 2012-11-09 15:34:06
#      History:
=============================================================================-->

##数据包结构

	flag1(byte) + flag2(byte) + 消息尺寸(int32) + 消息体 + flag3(byte) + flag4(byte)  
	flag1 = 0x59,  
	flag2 = 0x7a,  
	flag3 = 0x7a,  
	flag4 = 0x59,

后面的“协议”部分，只包含“消息正文”的定义，其他都省略了。


###通讯服务器数据包
内部通信头（int32） = 消息类别（0=广播，高位一个byte，即0～7bit，=0表示为广播）+ clientid(高位3bytes，即8~31byte) 
flag1(byte) + flag2(byte) + 消息尺寸(int32,原尺寸加4) + 通信头（int32） +  消息体 + flag3(byte) + flag4(byte)  
 
