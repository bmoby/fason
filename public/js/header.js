$(document).ready(function(){
  var oneTime = 0;
  function runonetime(counter){
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
        } else {
          console.log("check evals completed")
        }
      }
    })
    oneTime++;
  }

  if(oneTime == 0){
    runonetime(oneTime)
  }

  setTimeout(function(){
    $.ajax({
      url: '/currentUser',
      method: 'GET',
      success: function(response){
        if(window.location.pathname == '/inbox'){
          var messagesnumber = parseInt($('.newmessagesnotifs').text());
          var allnotifs = parseInt($('.notifCountIcon').text());
          if (allnotifs - messagesnumber >=1){
            $('.notifCountIcon').text(allnotifs - messagesnumber);
          } else {
            $('.notifCountIcon').addClass('hidden');
          }
        }

        if(window.location.pathname == '/demandes'){
          var demandsnumber = parseInt($('.newdemandsnotifs').text());
          var allnotifs = parseInt($('.notifCountIcon').text());
          if (allnotifs - demandsnumber >=1){
            $('.notifCountIcon').text(allnotifs - demandsnumber);
          } else {
            $('.notifCountIcon').addClass('hidden');
          }
        }

        if(response.userId){
         var pusher = new Pusher('095ff3028ab7bceb6073', {
           encrypted: true
         });

         var channel = pusher.subscribe(response.userId);

           channel.bind('emailVerify', function(data) {
             if(data.emailverified){
               if(data.phoneV == false){
                 $('.email-verify-row').empty();
                 $('.email-verify-row').append(
                   '<div class="row envoyer-un-message-btn login-register-btn-row">'+
                   '<div class="col-lg-9 col-md-9 col-sm-9 col-xs-9">'+
                       '<h4 class="success-msg">Votre email est confirmé</h4></div>'+
                   '<div class="col-lg-3 col-md-3 col-sm-3 col-xs-3"><i class="glyphicon glyphicon-ok success-icon"></i></div>'+
                   '</div>'
                 );
               } else {
                 $('.all-demand-container').empty();
                 $('.haveVerified').removeClass('hidden');
               }
             }
           })

           channel.bind('phoneVerify', function(data){
             if(data.phoneverified){
               if(data.emailV == false){
                 $('.phone-verify-row').empty();
                 $('.phone-verify-row').append(
                   '<div class="row envoyer-un-message-btn login-register-btn-row">'+
                   '<div class="col-lg-9 col-md-9 col-sm-9 col-xs-9">'+
                       '<h4 class="success-msg">Votre numéro est confirmé</h4></div>'+
                   '<div class="col-lg-3 col-md-3 col-sm-3 col-xs-3"><i class="glyphicon glyphicon-ok success-icon"></i></div>'+
                   '</div>'
                 )
               } else {
                 $('.all-demand-container').empty();
                 $('.haveVerified').removeClass('hidden');
               }
             }
           })

         channel.bind('new-message', function(data) {
           if(data){
             if(window.location.pathname != '/inbox'){
               $('.notifCount').removeClass('hidden');
               var notifs = parseInt($('.notifCountIcon').text());
               var messagescout = parseInt($('.newmessagesnotifs').text());
               $('.notifCountIcon').text(notifs+1);

               if(messagescout){
                 $('.newmessagesnotifs').text(messagescout+1)
               } else {
                 $('.newmessagesnotifs').text("1");
               }
             }
           }
         });

         channel.bind('demands', function(data) {
           if(data){
             $('.notifCount').removeClass('hidden');
             var notifs = parseInt($('.notifCountIcon').text());
             var demandcout = parseInt($('.newdemandsnotifs').text());
             $('.notifCountIcon').text(notifs+1);

             if(demandcout){
               $('.newdemandsnotifs').text(demandcout+1)
             } else {
               $('.newdemandsnotifs').text("1");
             }
           }
         })
        } else {
          console.log(response)
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
