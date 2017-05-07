// Initialize your app
var myApp = new Framework7();



// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main');
var secondView = myApp.addView('#tab-second');
var thirdView = myApp.addView('#tab-third');
var fourthView = myApp.addView('#tab-fourth');


//检查cookie
$(document).ready(function() {
  checkCookie();
  // myApp.alert(getCookie('username'));

});



//main页面初始化
$$(document).on('pageInit', function(e) {


    var page = e.detail.page;

    //标题初始化
    if (page.name === "leveldetail") {

      var param = page.query.level;
      var id = page.query.id;
      // alert(id);

      if (param === "basic") {
        $$(page.container).find('.content-block-title.caption').html('您选择的是：基础课程');
      } else if (param === "strengthen") {
        $$(page.container).find('.content-block-title.caption').html('您选择的是：巩固课程');
      } else {
        $$(page.container).find('.content-block-title.caption').html('您选择的是：提高课程');
      }
      //加载评论
      $.post({
        url:"/leveldetail",
        dataType: "json",
        data: JSON.stringify({
          'id': id
        }),
        contentType: 'application/json,charset=UTF-8',
        success: function(data) {
          //加载对应视频
          console.log(JSON.stringify(data));
          var url = (data[0])[3];
          var thumbnail = (data[0])[4];

          var anotherplayer = videojs('anotherplayer', {
            controls: true,
            autoplay: false,
            preload: 'metadata',
            poster: thumbnail,
            sources: [{
              src: url,
              type: 'video/mp4'
            }]
          });
          //计算尺寸
          $("#anotherplayer").css({
            'width': $(window).width() * .95,
            'height': ($(window).height()) * .4
          });
          //返回销毁播放器
          $('.leveldetailback').click(function(event) {
            anotherplayer.dispose();
          });


          // myApp.alert(data);
          var html = '';
          for (var i = 0; i < data.length; i++) {
            if (data[i][0] != null) {
              html = html + '<div class="list-block inset"><ul><li class="item-content">' + data[i][0] + ':' + data[i][1] +
                // '<p style="float:right;font-size:.5em;">'+data[i][0]+
                '<p style="float:right;font-size:.3em;">' + data[i][2] +
                '</p></li></ul></div>';
            }
          }
          // alert(html);
          $(html).insertBefore(".edit");
        }
      });


      //难度页面添加评论编辑框
      $$('.content-block-title.comment a').on('click', function(e) {
        // $$(".edit").css({
        //   'display':'block'
        // });
        $('.edit').fadeIn('slow');
      });

      $$('.text a').on('click', function(e) { //发表按钮

        if (($$('.text textarea').val()).length == 0) {

          myApp.addNotification({
            title: '',
            message: '不能为空'
          });

        } else {


          if (getCookie('username') === '') {
            myApp.addNotification({
              title: '',
              message: '请登录来评论'
            });
          } else {
            //var time = (new Date()).toLocaleString();


            // alert(getCookie('username'));
            console.log(getCookie('username')+' '+id+ ' '+$('.text textarea').val());

            $.post({
              url: "/review",
              dataType: "json",
              data: JSON.stringify({
                'user_id':getCookie('username'),
                'resource_id':id,
                'review':$('.text textarea').val()
              }),
              contentType: 'application/json,charset=UTF-8',
              success: function(data) {

                var html = '<div class="list-block inset">' +
                  '<ul><li class="item-content">' +getCookie('username')+':'+ $$('.text textarea').val() +
                  '<p style="float:right;font-size:.7em;">' +data +
                  '</p></li></ul></div>';

                  $$(html).insertBefore('.edit');

                  myApp.addNotification({
                    title: '',
                    message: '评论成功'
                  });
                  $('.edit').fadeOut('900');

              }});


          }



        }


      });

    }
    //查询错题
    if (page.name === "error_set") {
      $("#query").click(function(event) {
        start = $("#calendar-start").val()
        end = $("#calendar-end").val()
        starttime =new Date(Date.parse(start.replace(/-/g,'/')));
        endtime =new Date(Date.parse(end.replace(/-/g,'/')));

        if(start.length === 0||end.length === 0) {
          myApp.alert("请填写开始时间和结束时间","");
        }
        else if(starttime > endtime) {
          myApp.alert("开始时间不得大于结束时间","");
        }
        else if(getCookie('username') === '') {
          myApp.alert('请登录来查询错题','');
        }
        else {
          //开始查询错题
          $.post({
            url: "/error_set",
            dataType: "json",
            contentType: 'application/json,charset=UTF-8',
            data:JSON.stringify({'start':start,'end':end,'userid':getCookie('username')}),  //向服务器发送json字符串
            success: function(data) {
              //处理返回的数据
              // myApp.alert(JSON.stringify(data));

              if (data.length === 0) {
                myApp.alert('没有错题','');
              }
              else {
                var outer = '';
                var inner = '';

                for (var i =0;i<data.length;i++) {
                  outer = outer + '<div><p class="question">'+ data[i][0] + '</p></div>' +
                    '<div class="candidate">';
                  candidate = data[i][1].split(",");
                  for(var k = 0;k < candidate.length;k++) {
                    inner = inner + '<input type="radio" value="' + candidate[k] + '"><span>' + candidate[k] + '</span>';
                  }
                  outer = outer + inner + '</div>'+'<div class="candidate error"><span>你的回答：</span><span>'+data[i][3]+'</span></div>'
                          +'<div class="candidate right"><span>正确答案：</span><span>'+data[i][2]+
                          '</span><span>作答时间：</span><span>'
                          +data[i][4]+'</span></div>';
                  inner = "";
                }
                $("div.errorblock").html(outer);
              }

            }
          });
        }
      });

    }

    // 在线测试
    if (page.name === "olexam") {
      //检查是否支持storage
      if (typeof(Storage) !== "undefined") {

        //计数
        var count = 0;
        var time = 0;
        //读取题目再加载
        //ajax请求
        $.get({
          url: "/olexam",
          dataType: "json",
          contentType: 'application/json,charset=UTF-8',
          success: function(data) {
            //处理返回的数据
            //从服务器返回的json字符串转换成转换成json对象
            //---------------------------- 读取后台题库到前台生成html
            var inner = '';
            var outer = '';

            for (i = 0; i < data.length; i++) {
              outer = outer + '<div><p class="question"><span>' + data[i][0] + '</span><span>.</span>' + data[i][1] + '</p></div>' +
                '<div class="candidate">';
              candidate = data[i][3].split(","); //备选答案分开
              for (k = 0; k < candidate.length; k++) {

                inner = inner + '<input type="radio" name="' + data[i][0] + '" value="' + candidate[k] + '"><span>' + candidate[k] + '</span>';
              }
              outer = outer + inner + '</div>';
              inner = '';
            }
            // alert(outer);
            count = data.length;
            $("#count").text("本次测试：总计" + count + "道题");
            $(".time").text(data[0][4]);
            time = data[0][4];
            $("#exam-form").html(outer);
            //-------------------读取后台题库到前台生成html结束

          }
        });



        $(".content-block.examblock").fadeOut('fast');
        //倒计时函数
        var count = $$('.time').html();
      //  var time = Number(count);

        function cal() {
          time -= 1;
          if (time === 0) {
            clearInterval(timer);
            $$(".time").html('还剩下:' + '0' + '分钟');

            myApp.alert('时间到，没能完成测试', '');
            mainView.router.loadPage('index.html');
            $(".toolbar-inner").fadeIn('500');
          } else {
            $$(".time").html('还剩下:' + parseInt(time) + '分钟');
          }
        }
        var timer;

        $$("#start").on('click', function(e) {

          //检查是否登录否则不予测试
          if (getCookie('username') === '') {
            myApp.alert("请登录来测试", '');
          } else {
            // myApp.alert(getCookie('username'),'');
            $$(".time").html('还剩下:' + time + '分钟');
            $(".label").hide('500');
            $("#start").hide('500');
            $(".toolbar-inner").hide('500');
            $(".navbar").hide('500');
            $(".content-block.examblock").fadeIn('fast');
            timer = setInterval(function() {
              cal()
            }, 1000);

          }

        });


        //提交测试函数
        function commitExam() {
          //得到所有作答

          var input = $("input:radio:checked")
          if (count != input.length) {
            myApp.alert("有未答之题,全部做完再提交",'');
          }
          else {
            var postData = JSON.stringify($("#exam-form").serializeArray());

            $.post({
              url: "/olexam",
              dataType:"json",
              contentType:'application/json,charset=UTF-8',
              data: postData.replace(/(.{1}$)/, ',{"userid":' + '"' + getCookie("username") + '"' + '}]'), //向服务器发送json字符串
              success: function(data) {
                //处理返回的数据

              }
            });
          }




        }

        // 提交按钮动作
        $$('#submit').on('click', function(e) {
          myApp.confirm('确定提交？', '警告', function() {
            // clearInterval(timer);
            var input = $("input:radio:checked")
            if (count != input.length) {
              myApp.alert("有未答之题,全部做完再提交",'');
            }
            else {
              var postData = JSON.stringify($("#exam-form").serializeArray());

              //提交后台
              $.post({
                url: "/olexam",
                dataType: "json",
                contentType: 'application/json,charset=UTF-8',
                data: postData.replace(/(.{1}$)/, ',{"userid":' + '"' + getCookie("username") + '"' + '}]'), //向服务器发送json字符串
                success: function(data) {
                  //处理返回的数据
                }
              });
              mainView.router.loadPage('index.html');
              myApp.alert('提交成功','');
              $(".toolbar-inner").fadeIn('500');
            }

          }, function() {
            myApp.alert('请继续做题吧', '');
          });
        });


      } else {
        myApp.alert("您的浏览器不支持webstorage");
      }
    }

    //错题集页加载
    if (page.name === 'error_set') {
      //初始化日历
      var calendarStart = myApp.calendar({
        input: '#calendar-start',
        monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        dayNamesShort: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      });

      var calendarEnd = myApp.calendar({
        input: '#calendar-end',
        monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        dayNamesShort: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      });

    }

    //注册界面
    if (page.name === 'signup') {
      $("#register").click(function(event) {

        if (($.trim($("#username").val()).length === 0) && ($.trim($("#password").val()).length === 0)) {
          myApp.alert("用户名密码不能为空", "");
        } else {
          //ajax请求
          $.post({
            url: "/registerpy",
            dataType: "json",
            contentType: 'application/json,charset=UTF-8',
            data: JSON.stringify({
              'username': $('#username').val(),
              'password': $('#password').val()
            }), //向服务器发送json字符串
            success: function(data) {
              //处理返回的数据
              //t = JSON.parse(data) //从服务器返回的json字符串转换成转换成json对象
              if (data === 'ok') {
                myApp.alert('注册成功,请返回登录', '提示');
              } else {
                myApp.alert('注册失败', '错误');
              }

            }
          });
        }

      });
    }

    //videodetail视频详情页面加载
    if (page.name === 'videodetail') {
      var id = page.query.id;
      //myApp.alert(id);
      //向后台查询该资源的详细信息
      $.post({
        url: "/videodetail",
        dataType: "json",
        contentType: 'application/json,charset=UTF-8',
        data: JSON.stringify({
          'id': id
        }), //向服务器发送json字符串''
        success: function(data) {

          //处理返回的数据
          var player = videojs('myplayer', {
            controls: true,
            autoplay: false,
            preload: 'metadata',
            poster: data['rs'][1],
            sources: [{
              src: data['rs'][0],
              type: 'video/mp4'
            }]
          });
          //计算尺寸
          $("#myplayer").css({
            'width': $(window).width() * .95,
            'height': ($(window).height()) * .4
          });
          //每次返回必须销毁player
          $('.videodetailback').bind('click', function(event) {
            player.dispose(); //销毁播放器
          });
        }
      });
    }


  }


);


//隐藏欢迎
$('.login_after').hide();

//main登录界面
$("#login_button").click(function(event) {
  if (($.trim($("#login_username").val()).length === 0) && ($.trim($("#login_password").val()).length === 0)) {
    myApp.alert("用户名密码不能为空", "登录失败");
  } else {
    //ajax请求
    $.post({
      url: "/loginpy",
      dataType: "json",
      contentType: 'application/json,charset=UTF-8',
      data: JSON.stringify({
        'login_username': $('#login_username').val(),
        'login_password': $('#login_password').val()
      }), //向服务器发送json字符串
      success: function(data) {
        //处理返回的数据
        //t = JSON.parse(data) //从服务器返回的json字符串转换成转换成json对象
        if (data['status'] === 'ok') {
          myApp.alert('登录成功', ''); //success
          $('.login_block').fadeOut('900');
          $('.login_after_block').html('欢迎回来：' + $('#login_username').val());
          $('.login_after').fadeIn('900');
          //设置cokkie
          setCookie('username', $('#login_username').val(), 1);
          setCookie('password', $('#login_password').val(), 1);

        } else
          myApp.alert('登录失败', '');
        // myApp.alert(data)
      }
    });
  }
});

//注销
$('.logout_button').click(function(event) {
  delCookie();
  checkCookie();
});
