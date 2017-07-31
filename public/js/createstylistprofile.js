$(document).ready(function(){

  function auto_grow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight)+"px";
  }

  $('.create-stylist-profile-experience-text').autogrow();
  $('.create-stylist-profile-steps-text').autogrow();
  $('.create-stylist-profile-availability-text').autogrow();

  var servicesCounter = 0;
  var men = false;
  var women = false;
  var relookingtrue = false;
  var beautetrue = false;
  var corsestrue = false;
  var relookingcounter = 0;
  var beautecounter = 0;
  var corsescounter = 0;
  var relooking = [
		{
			val:"reve-shoppingvotreplace",
			ok:false
		},
		{
			val:"reve-accompshopping",
			ok:false
		},
		{
			val:"reve-trigrdrob",
			ok:false
		},
		{
			val:"reve-tourmagville",
			ok:false
		}
	];

	var beaute = [
		{
			val:"beau-maqui",
			ok:false
		},
		{
			val:"beau-coiff",
			ok:false
		},
		{
			val:"beau-color",
			ok:false
		},
		{
			val:"beau-manuc",
			ok:false
		},
		{
			val:"beau-pedic",
			ok:false
		},
		{
			val:"beau-surci",
			ok:false
		},
		{
			val:"beau-soinviz",
			ok:false
		},
		{
			val:"beau-soincor",
			ok:false
		},
		{
			val:"beau-tailbarb",
			ok:false
		}
	];

	var corses = [
		{
			val:"cour-maqui",
			ok:false
		},
		{
			val:"cour-coiff",
			ok:false
		},
		{
			val:"cour-color",
			ok:false
		},
		{
			val:"cour-manuc",
			ok:false
		},
		{
			val:"cour-pedic",
			ok:false
		},
		{
			val:"cour-surci",
			ok:false
		},
		{
			val:"cour-soinviz",
			ok:false
		},
		{
			val:"cour-soincor",
			ok:false
		},
		{
			val:"cour-tailbarb",
			ok:false
		},
		{
			val:"cour-couleur",
			ok:false
		},
		{
			val:"cour-morpho",
			ok:false
		}
	];

  $('.relook').on('click', function(){
    var service = this.getAttribute("data-rl");
    if($(this).hasClass("off")){
      relooking.forEach(function(rel, index, obj){
        if(rel.val == service){
          rel.ok = true;
          servicesCounter ++;
          relookingcounter ++;
          console.log(rel)
        }
      })
      $(this).removeClass("off");
      $(this).addClass("on");
    } else {
      relooking.forEach(function(rel, index, obj){
        if(rel.val == service){
          rel.ok = false;
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
      beaute.forEach(function(rel, index, obj){
        if(rel.val == service){
          rel.ok = true;
          servicesCounter ++;
          beautecounter ++;
          console.log(rel)
        }
      })
      $(this).removeClass("off");
      $(this).addClass("on");
    } else {
      beaute.forEach(function(rel, index, obj){
        if(rel.val == service){
          rel.ok = false;
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
      corses.forEach(function(rel, index, obj){
        if(rel.val == service){
          rel.ok = true;
          servicesCounter ++;
          corsescounter ++;
          console.log(rel)
        }
      })
      $(this).removeClass("off");
      $(this).addClass("on");
    } else {
      corses.forEach(function(rel, index, obj){
        if(rel.val == service){
          rel.ok = false;
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
    if(men == false){
      $(this).addClass('on');
      $(this).removeClass('off');
      men = true;
      console.log(men);
    } else {
      $(this).addClass('off');
      $(this).removeClass('on');
      men = false;
      console.log(men);
    }
  });

  $('.genderfemme').on('click', function(){
    if(women == false){
      $(this).addClass('on');
      $(this).removeClass('off');
      women = true;
      console.log(women);
    } else {
      $(this).addClass('off');
      $(this).removeClass('on');
      women = false;
      console.log(women);
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
    if(men == false && women == false){
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
      var availability = $('.create-stylist-profile-availability-text').val();
      var generalprocess = $('.create-stylist-profile-steps-text').val();
      var price = $('.priceinputter').val();
      var description = $('.create-stylist-profile-experience-text').val();
      if(relookingcounter > 0){
        relookingtrue = true;
      }
      if(beautecounter > 0){
        beautetrue = true;
      }
      if(corsescounter > 0){
        corsestrue = true;
      }
      $.ajax({
        url: '/createstylebox',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({"relookingtrue":relookingtrue, "beautetrue":beautetrue, "corsestrue":corsestrue, "men":men, "women":women, "availability":availability, "generalprocess":generalprocess, "description":description, "price":price, "relooking": relooking, "beaute": beaute, "corses":corses}),
        success: function(response){
          if(response.created){
            if($('.stylebox-display-avatar').hasClass('noavatar') || $('.stylebox-display-avatar').hasClass("newava")){
              $('.submitavatar').click();
            }

            setTimeout(function(){
              $.confirm({
                title: "Important",
                content: "Félicitations, votre candidature a bien été enregistrée. Veuillez nous adresser le(s) justificatif(s) de vos compétences de relooking (un lien vers votre blogue, profil d’Instagram, diplômes, expériences, CV…) avec votre e-mail et numéro de téléphone à l’adresse e-mail suivant : fason.contact@gmail.com Nous vous contacterons dans un plus bref délai. Merci de l’intérêt que vous portez à Fason.",
                buttons: {
                    "Valider": function () {
                      window.location.replace("https://www.fason.co")
                    },
                    "Annuler": function () {
                      $.ajax({
                        url: "/deletestylebox",
                        success: function(response){
                          if(response.ok){
                            alert("Votre candidature a bien été annulée.");
                            window.location.replace("https://www.fason.co")
                          }
                        }
                      })
                  }
                }
              });
            }, 1000);
          }
        }
      })
    }
  })
});
