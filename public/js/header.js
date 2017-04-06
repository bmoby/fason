$(document).ready(function(){

  setTimeout(function(){
    $.ajax({
      url: '/checkevals',
      method: 'GET',
      success: function(response){
        if(response.evals){
          $('.evalsheaderlink').removeClass('hidden');
          $('.newevalsnotifs').text(response.evals);
          var newnotif = parseInt($('.notifCountIcon').text());
          newnotifcount = 0;
          if(newnotif > 0){
           newnotifcount = newnotif + response.evals;
         } else {
           newnotifcount = response.evals;
         }
          $('.notifCount').removeClass('hidden');
          $('.notifCountIcon').text(newnotifcount);
        }

        if(response.noevals){
          console.log("no evals")
        }
      }
    })

    
  }, 1000);


  $('.close-icon').on('click', function(){
    if(document.referrer){
      window.location.replace(document.referrer);
    } else {
      window.location.replace("https://fason.herokuapp.com/");
    }
  });

  $('.close-icon-hider').on('click', function(){
    $('.full-page').addClass('hidden');
  })

  $('.select-avatar').on('click', function(){
    $('.avatarUpload').click();
  })

  function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        $('.select-avatar').attr('src', e.target.result);
      }
      reader.readAsDataURL(input.files[0]);
    }
  }

  $(".avatarUpload").change(function(){
      readURL(this);
  });

  $('.header-ava').on('click', function(e){
    e.stopPropagation();
    $('.header-menu').toggleClass('hidden');
  })

  $(window).click(function(){
    if(!$(this).hasClass("menuitem")){
      $('.header-menu').addClass('hidden');
    }
  });

});
