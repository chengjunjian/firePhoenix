#coding:utf-8
#=============================================================================
#     FileName: index.wsgi
#         Desc: QR TEST
#       Author: sunminghong
#        Email: allen.fantasy@gmail.com
#     HomePage: http://weibo.com/5d13
#      Version: 0.0.1
#   LastChange: 2012-11-22 14:15:57
#      History:
#=============================================================================


#def app(environ, start_response):
#    status = '200 OK'
#    response_headers = [('Content-type', 'text/html; charset=utf-8')]
#    start_response(status, response_headers)
#    return ['<strong>Welcome to SAE!</strong>']
#
#application = sae.create_wsgi_app(app)

import tornado.wsgi
import sys
import os.path
import tornado.options
import tornado.web

import time

sys.path.append('..')

from tornado.options import define, options

define('projectname',default='Dashboard',
       help='项目名称',type=str)
define("port", default=8888, help="run on the given port", type=int)
#define("mysql_host", default="127.0.0.1:3306", help="blog database host")
#define("mysql_database", default="blog", help="blog database name")
#define("mysql_user", default="blog", help="blog database user")
#define("mysql_password", default="blog", help="blog database password")

import handler

urls = [
	(r"/", handler.Index),
	(r"/qr", handler.QR),
]
settings = dict(
	blog_title=options.projectname,
	template_path=os.path.join(os.path.dirname(__file__), "templates"),
	static_path=os.path.join(os.path.dirname(__file__), "static"),
	xsrf_cookies=True,
	cookie_secret="salkd$sfdksdj",
	login_url="/auth/login",
	autoescape=None,
	debug = True,	
)

app = tornado.wsgi.WSGIApplication(urls, **settings)

import sae
application = sae.create_wsgi_app(app)

