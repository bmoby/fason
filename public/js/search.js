$(document).ready(function(){

  $('.select-style').niceSelect();
  $('.select-gender').niceSelect();

  $('.child').on('click', function(){
    setTimeout(function(){
      $("html, body").animate({ scrollTop: 0 }, "slow");
    }, 200);
  });

})
