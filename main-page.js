

$(document).ready(function () {
  window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if([32, 34, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);
  $('#splash-button').click(function (event) {
    $('#splashform').hide();
    $('#main-page').show();
    $('.topnav').show();
  });

  $('.row').on('mouseover', '.card', function () {
    $(this).addClass('z-depth-5 grow');
  });

  $('.row').on('mouseleave', '.card', function () {
    $(this).removeClass('z-depth-5 grow still');
  });

  $('#card1').mouseenter(function () {
    $('#gif1').show();
    $('.still').hide();
  });

  $('#card1').click(function () {
    $('#main-page').hide();
    $('#asteroids').fadeIn();
    $('#arcade-background').fadeIn();
    window.scrollTo(0, 0);
  });

  $('#card1').mouseleave(function () {
    $('#gif1').hide();
    $('.still').show();
  });

  $('#card2').mouseenter(function () {
    $('#gif2').show();
    $('.still2').hide();
  });

  $('#card2').mouseleave(function () {
    $('#gif2').hide();
    $('.still2').show();
  });
});
