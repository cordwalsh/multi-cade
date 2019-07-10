

$(document).ready(function () {
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
