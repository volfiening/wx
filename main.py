# -- coding: utf-8 --
import web
import json,sys
import sqlite3,datetime


urls = ("/registerpy","register",
        "/loginpy","login",
        "/","show",
        "/videodetail","videodetail",
        "/olexam","olexam",
        "/leveldetail","leveldetail",
        "/review","review",
        "/error_set","errorset"
)

render = web.template.render('templates/')

app = web.application(urls,globals())
# session = web.session.Session(app,web.session.DiskStore('sessions'),initializer={'islogin':False,'username':None,'password':None})

class show:
    def GET(self):
        #mainview所有数据返回前台
        try:
            con = sqlite3.connect('static/db/enjoyo2o')
            cr = con.cursor()
            cr.execute("select id,category,notes,level from resource where category = '数学'")
            math = cr.fetchall()
            cr.execute("select id,category,notes,level from resource where category = '围棋'")
            weiqi = cr.fetchall()
            cr.execute("select id,category,notes,level from resource where category = '英语'")
            eng = cr.fetchall()
            con.close()
            return render.index(math,weiqi,eng)
        except:
            print "发生错误:", sys.exc_info()

class olexam:
    def GET(self):
        try:
            con = sqlite3.connect('static/db/enjoyo2o')
            cr = con.cursor()
            cr.execute("select id,subject,tag,candidate,deadline from exam")
            data = cr.fetchall()
            # print data
            return json.dumps(data)
        except:
            print "发生错误:", sys.exc_info()
        finally:
            con.close()

    def POST(self):
        try:
            con = sqlite3.connect('static/db/enjoyo2o')
            cr = con.cursor()
            data = web.data()
            postData = json.loads(data)
            result = []
            time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            for i in range(len(postData)-1):
                result.append((postData[i]['value'],time,postData[len(postData)-1]['userid'],postData[i]['name']))

            cr.executemany("update exam set answer_result = ?,time = ?,user_id = ? where id = ?",result)
            con.commit()
            #插入到错题归档表
            cr.execute('''insert into archive_error
                        select subject,candidate,real_result,answer_result,time,user_id
                        from exam
                        where real_result!=answer_result and time = ? and user_id = ?''',(time,postData[len(postData)-1]['userid']))
            con.commit()
        except:
            print "发生错误:", sys.exc_info()
            con.rollback()
        finally:
            con.close()

class errorset:
    def POST(self):
        data = web.data()
        t = json.loads(data)
        starttime = t['start'].replace('-','')
        endtime = t['end'].replace('-','')
        username = t['userid']
        try:
            con = sqlite3.connect('static/db/enjoyo2o')
            cr = con.cursor()
            cr.execute('''select subject,candidate,real_result,answer_result,time
                            from archive_error
                           where CAST(replace(substr(time,1,10),'-','') as integer) >=?
                           and CAST(replace(substr(time,1,10),'-','') as integer) <= ?
                           and user_id = ?''',(int(starttime),int(endtime),username))
            postData = cr.fetchall()
            return json.dumps(postData)
        except:
            print "发生错误:", sys.exc_info()
        finally:
            con.close()


class leveldetail:
    def POST(self):
        data = web.data()
        print(data)
        t = json.loads(data)
        id = t['id']
        try:
            con = sqlite3.connect('static/db/enjoyo2o')
            cr = con.cursor()
            cr.execute('''select review_name,b.review,time,url,thumbnail
                            from resource a left join level_review b
                            on b.resource_id = a.id where a.id = ?''',(id,))
            review = cr.fetchall()
            print json.dumps(review)
            return json.dumps(review)
        except:
            print "发生错误:", sys.exc_info()
        finally:
            con.close()


class review:
    def POST(self):
        data = web.data()
        t = json.loads(data)
        try:
            con = sqlite3.connect('static/db/enjoyo2o')
            cr = con.cursor()
            cr.execute('select max(id) from level_review')
            maxid = cr.fetchone()[0]
            time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            # print (maxid+1,t['user_id'],t['review'],time,t['resource_id'])
            cr.execute('insert into level_review values (?,?,?,?,?)',(maxid+1,t['user_id'],t['review'],time,t['resource_id']))
            con.commit()
            return json.dumps(time)
        except:
            print "发生错误:", sys.exc_info()
        finally:
            con.close()

class register:
    def POST(self):
        data = web.data()
        t = json.loads(data)#转换成字典

        username = t['username']
        password = t['password']


        try:
            con = sqlite3.connect('static/db/enjoyo2o')
            cr = con.cursor()

            #取出最大用户id
            cr.execute("select max(id) from user")
            userid = cr.fetchone()

            if not len(str(userid[0])):
                uid = 1
            else:
                uid = userid[0] + 1

            record = (uid,username,password)
            cr.execute('insert into user(id,username,password) values (?,?,?)',record)
            con.commit()
            con.close()
            return json.dumps('ok')

        except:
            print "发生错误:", sys.exc_info()
            con.rollback()
class login:
    # def GET(self):
    #     # ck = web.cookies().get('islogin')
    #     if ck:
    #         return json.dumps('ok')
    #     else:
    #         return json.dumps('no')


    def POST(self):
        data = web.data()
        t = json.loads(data)
        username = t['login_username']
        password = t['login_password']

        #简单的比较用户名和密码  密码没有在后台加密
        try:
            con = sqlite3.connect('static/db/enjoyo2o')
            cr = con.cursor()

            #能否取出符合前台的用户
            cr.execute('select count(1) from user where username = ? and password = ?',(username,password))
            usr = cr.fetchone()
            if usr[0]:
                # ck = web.input(islogin = 'ok',username=username,password=password)
                # web.setcookie('islogin', ck.islogin, 60)
                return json.dumps({'status':'ok'})
            else:
                return json.dumps({'status':'no'})
            # return json.dumps(usr)
        except:
            print "发生错误:", sys.exc_info()
        finally:
            con.close()

class videodetail:
    def POST(self):
        try:
            data = web.data()
            id = (json.loads(data))['id']
            con = sqlite3.connect('static/db/enjoyo2o')
            cr = con.cursor()
            cr.execute("select url,thumbnail from resource where id = ?",(id,))
            content = cr.fetchone()
            print content
            return json.dumps({'rs':content})
        except:
            raise





application=app.wsgifunc()
