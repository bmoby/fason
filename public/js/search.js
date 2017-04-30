$(document).ready(function(){

  $('.select-style').niceSelect();
  $('.select-gender').niceSelect();

  $('.child').live('click', function(){
    setTimeout(function(){
      $("html, body").animate({ scrollTop: 0 }, "slow");
    }, 200);
  });

})
