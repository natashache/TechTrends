angular.module('app',['app.controllers','app.services']);

$(function() {
  var $sidebar   = $("#chart_nav"), 
    $window    = $(window),
    offset     = $sidebar.offset(),
    topPadding = 132;

  $window.scroll(() => {
    if ($window.scrollTop() > offset.top) {
        $sidebar.stop().animate({
            marginTop: $window.scrollTop() - offset.top + topPadding
        });
    } else {
        $sidebar.stop().animate({
            marginTop: 84
        });
    }
  });
});