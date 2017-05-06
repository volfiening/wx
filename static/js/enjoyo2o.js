var myApp = new Framework7({
          pushState: true
    });

var $$ = Dom7;

var mainView = myApp.addView('.view-main');

$$(document).on('pageInit',function (e) {
  var page = e.detail.page;
// 详情页
  if(page.name === "enjoyo2odetail") {
    var param = page.query.course;
    var html = '您选择的课程: ';
    if (param === 'seven1') {
      $$(page.container).find('.detailcaption').html(html+'七年级数学上');
    }
    if (param === 'seven2') {
      $$(page.container).find('.detailcaption').html(html+'七年级数学下');
    }
    if (param === 'eight1') {
      $$(page.container).find('.detailcaption').html(html+'八年级数学上');
    }
    if (param === 'eight2') {
      $$(page.container).find('.detailcaption').html(html+'八年级数学下');
    }
    if (param === 'nine1') {
      $$(page.container).find('.detailcaption').html(html+'九年级数学上');
    }
    if (param === 'nine2') {
      $$(page.container).find('.detailcaption').html(html+'九年级数学下');
    }
    if (param === 'eng') {
      $$(page.container).find('.detailcaption').html(html+'英语口语');
    }
    if (param === 'lecture') {
      $$(page.container).find('.detailcaption').html(html+'百家讲堂');
    }
    if (param === 'weiqi') {
      $$(page.container).find('.detailcaption').html(html+'围棋课堂');
    }
    if (param === 'dance') {
      $$(page.container).find('.detailcaption').html(html+'舞蹈课堂');
    }
    if (param === 'calligraphy') {
      $$(page.container).find('.detailcaption').html(html+'书法课堂');
    }
    if (param === 'music') {
      $$(page.container).find('.detailcaption').html(html+'音乐课堂');
    }
  }
});
