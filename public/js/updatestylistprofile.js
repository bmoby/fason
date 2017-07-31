$(document).ready(function(){
  var stylebox = {};
  var relookingcounter = 0;
  var beautecounter = 0;
  var corsescounter = 0;
  function auto_grow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight)+"px";
  }
  $('.create-stylist-profile-experience-text').autogrow();
  $('.create-stylist-profile-steps-text').autogrow();
  $('.create-stylist-profile-availability-text').autogrow();
  setTimeout(function(){
    $('.create-stylist-profile-experience-text').keyup();
    $('.create-stylist-profile-steps-text').keyup();
    $('.create-stylist-profile-availability-text').keyup();
    $.ajax({
      url: '/getStylebox',
      method: 'GET',
      success: function(response){
        stylebox = response.stylebox;
        stylebox.relooking.forEach(function(rel, index, object){
          if(rel.ok){
            relookingcounter ++;
          }
        })

        stylebox.beaute.forEach(function(rel, index, object){
          if(rel.ok){
            beautecounter ++;
          }
        })

        stylebox.corses.forEach(function(rel, index, object){
          if(rel.ok){
            corsescounter ++;
          }
        })
        console.log(stylebox);
      }
    })
  }, 500);

  var servicesCounter = 0;

  $('.relook').on('click', function(){
    var service = this.getAttribute("data-rl");
    if($(this).hasClass("off")){
      stylebox.relooking.forEach(function(rel, index, obj){
        if(rel.val == service){
          stylebox.relooking[index].ok = true;
          servicesCounter ++;
          relookingcounter ++;
          console.log(stylebox.relooking[index].ok)
        }
      })
      $(this).removeClass("off");
      $(this).addClass("on");
    } else {
      stylebox.relooking.forEach(function(rel, index, obj){
        if(rel.val == service){
          stylebox.relooking[index].ok = false;
          servicesCounter --;
          relookingcounter --;
          console.log(rel)
        }
      })
      $(this).removeClass("on");
      $(this).addClass("off");
    }
  });

  $('.beauty').on('click', function(){
    var service = this.getAttribute("data-be");
    if($(this).hasClass("off")){
      stylebox.beaute.forEach(function(rel, index, obj){
        if(rel.val == service){
          stylebox.beaute[index].ok = true;
          servicesCounter ++;
          beautecounter ++;
          console.log(rel)
        }
      })
      $(this).removeClass("off");
      $(this).addClass("on");
    } else {
      stylebox.beaute.forEach(function(rel, index, obj){
        if(rel.val == service){
          stylebox.beaute[index].ok = false;
          servicesCounter --;
          beautecounter --;
          console.log(rel)
        }
      })
      $(this).removeClass("on");
      $(this).addClass("off");
    }
  });

  $('.corses').on('click', function(){
    var service = this.getAttribute("data-co");
    if($(this).hasClass("off")){
      stylebox.corses.forEach(function(rel, index, obj){
        if(rel.val == service){
          stylebox.corses[index].ok = true;
          servicesCounter ++;
          corsescounter ++;
          console.log(rel)
        }
      })
      $(this).removeClass("off");
      $(this).addClass("on");
    } else {
      stylebox.corses.forEach(function(rel, index, obj){
        if(rel.val == service){
          stylebox.corses[index].ok = false;
          servicesCounter --;
          corsescounter --;
          console.log(rel)
        }
      })
      $(this).removeClass("on");
      $(this).addClass("off");
    }
  });

  $('.genderhomme').on('click', function(){
    if(stylebox.men == false){
      $(this).addClass('on');
      $(this).removeClass('off');
      stylebox.men = true;
      console.log(stylebox.men);
    } else {
      $(this).addClass('off');
      $(this).removeClass('on');
      stylebox.men = false;
      console.log(stylebox.men);
    }
  });

  $('.genderfemme').on('click', function(){
    if(stylebox.women == false){
      $(this).addClass('on');
      $(this).removeClass('off');
      stylebox.women = true;
      console.log(stylebox.women);
    } else {
      $(this).addClass('off');
      $(this).removeClass('on');
      stylebox.women = false;
      console.log(stylebox.women);
    }
  });

  $('.stylebox-display-avatar').on('click', function(){
    $('.avatarUpload').click()
  })

  function readURL(input){
    if (input.files && input.files[0]){
      $('.stylebox-display-avatar').removeClass('noavatar');
      var reader = new FileReader();
      reader.onload = function(e){
        $('.stylebox-display-avatar').css('background-image', "url("+e.target.result+")");
        $('.stylebox-display-avatar').addClass("newava");
      }
      reader.readAsDataURL(input.files[0]);
    }
  }

  $(".avatarUpload").change(function(){
      readURL(this);
  });

  $('.finaliserbtn').on('click', function(){
    $('.errorblock').empty();
    $('.animation-target').removeClass('animation-target');
    $('.errorblock').removeClass("errorsoccured")
    var errorcounter = 0;

    // If no avatar
    if($('.stylebox-display-avatar').hasClass('noavatar')){
      errorcounter ++;
       $('.errorblock').append("<p>Veuillez sélectionner une image d’avatar.</p>");
       if(errorcounter == 1){
         $("html, body").animate({ scrollTop: 0 }, "slow");
         setTimeout(function(){
           $('.errorblock').addClass('animation-target');
         }, 1000);
       }
    }

    // If no description
    if($('.create-stylist-profile-experience-text').val().length < 200){
      errorcounter ++;
       $('.errorblock').append("<p>Veuillez compléter le champ de “À propos de moi” (minimum 200 caractères).</p>");
       if(errorcounter == 1){
         $("html, body").animate({ scrollTop: 0 }, "slow");
         setTimeout(function(){
           $('.errorblock').addClass('animation-target');
         }, 1000);
       }
    }

    // If no men and no women selected
    if(stylebox.men == false && stylebox.women == false){
      errorcounter ++;
       $('.errorblock').append("<p>Veuillez sélectionner “Relooking homme” / “Relooking femme”. Vous pouvez sélectionner les deux.</p>");
       if(errorcounter == 1){
         $("html, body").animate({ scrollTop: 0 }, "slow");
         setTimeout(function(){
           $('.errorblock').addClass('animation-target');
         }, 1000);
       }
    }

    // If no price
    if(!$('.priceinputter').val()){
      errorcounter ++;
       $('.errorblock').append("<p>Veuillez indiquer le prix horaire de votre (vos) service(s).</p>");
       if(errorcounter == 1){
         $("html, body").animate({ scrollTop: 0 }, "slow");
         setTimeout(function(){
           $('.errorblock').addClass('animation-target');
         }, 1000);
       }
    }

    // If no services
    if(servicesCounter == 0){
      errorcounter ++;
       $('.errorblock').append("<p>Veuillez sélectionner au moins un service de “Services relooking vestimentaire”, “Services relooking beauté”, “Cours de relooking”.</p>");
       if(errorcounter == 1){
         $("html, body").animate({ scrollTop: 0 }, "slow");
         setTimeout(function(){
           $('.errorblock').addClass('animation-target');
         }, 1000);
       }
    }

    // If no general proceeding
    if($('.create-stylist-profile-steps-text').val().length < 200){
      errorcounter ++;
       $('.errorblock').append("<p>Veuillez compléter le champ de “Étapes de relooking” (minimum 200 caractères).</p>");
       if(errorcounter == 1){
         $("html, body").animate({ scrollTop: 0 }, "slow");
         setTimeout(function(){
           $('.errorblock').addClass('animation-target');
         }, 1000);
       }
    }

    // If no general proceeding
    if($('.create-stylist-profile-availability-text').val().length < 10){
      errorcounter ++;
       $('.errorblock').append("<p>Veuillez compléter le champ de “Disponibilités hebdomadaires” (minimum 10 caractères).</p>");
       if(errorcounter == 1){
         $("html, body").animate({ scrollTop: 0 }, "slow");
         setTimeout(function(){
           $('.errorblock').addClass('animation-target');
         }, 1000);
       }
    }

    if(errorcounter > 0){
      $('.errorblock').addClass("errorsoccured");
    } else {
      if(relookingcounter > 0){
        stylebox.relookingtrue = true;
      } else {
        stylebox.relookingtrue = false;
      }
      if(beautecounter > 0){
        stylebox.beautetrue = true;
      } else {
        stylebox.beautetrue = false;
      }
      if(corsescounter > 0){
        stylebox.corsestrue = true;
      } else {
        stylebox.corsestrue = false;
      }

      stylebox.availability = $('.create-stylist-profile-availability-text').val();
      stylebox.generalprocess = $('.create-stylist-profile-steps-text').val();
      stylebox.price = $('.priceinputter').val();
      stylebox.description = $('.create-stylist-profile-experience-text').val();

      $.ajax({
        url: '/updatestylistprofile',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({"modifiedStylebox": stylebox}),
        success: function(response){
          if(response.updated){
            if($('.stylebox-display-avatar').hasClass('noavatar') || $('.stylebox-display-avatar').hasClass("newava")){
              $('.submitavatar').click();
            }
            alert("Votre profile a bien été mis à jour")
            window.location.replace("https://www.fason.co");
          }
        }
      })
    }
  })
});
