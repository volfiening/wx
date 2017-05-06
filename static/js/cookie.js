//main页面加载 判断是否登录
function setCookie(c_name, value, expiredays) {
  var exdate = new Date()
  exdate.setDate(exdate.getDate() + expiredays)
  document.cookie = c_name + "=" + escape(value) +
    ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString())
}
//查询cookie
function getCookie(c_name) {
  if (document.cookie.length > 0) {
    c_start = document.cookie.indexOf(c_name + "=")
    if (c_start != -1) {
      c_start = c_start + c_name.length + 1
      c_end = document.cookie.indexOf(";", c_start)
      if (c_end == -1) c_end = document.cookie.length
      return unescape(document.cookie.substring(c_start, c_end))
    }
  }
  return ""
}
//检查cookie
function checkCookie() {
  username = getCookie('username');
  password = getCookie('password');

  if (username != null && username != "") {
    // alert('Welcome again ' + username + '!')已登录还没超时 不像是登录框
    $('.login_block').fadeOut('900');
    $('.login_after_block').html('欢迎回来：'+username);
    $('.login_after').fadeIn('900');
  } else {
    //显示登录框
    $('.login_block').fadeIn('900');
    $('.login_after').fadeOut('900');
  }
}
//删除cookie
function delCookie()
{
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var username=getCookie('username');
    var password=getCookie('password');
    if(username!=null&&username!='') {
      document.cookie = 'username' + "="+username+";expires="+exp.toGMTString();
      document.cookie = 'password' + "="+password+";expires="+exp.toGMTString();
    }

}
