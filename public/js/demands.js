$(document).ready(function(){
  var pusher = new Pusher('095ff3028ab7bceb6073', {
    encrypted: true
  });

  $('.accept-demand').on('click', function(){
    var demandId = this.getAttribute("data-demand-id");
    $.confirm({
      title: 'Accepter',
      content: 'Etes vous sure de vouloir accépter cette demande? En acceptant cette demande, vous vous engagez de rendre le service décrit dans le stylebox en question. Vous ne pourriez plus annuler le rendez-vous.',
      buttons: {
          oui: function () {
            $.ajax({
              url: '/acceptdemand',
              method: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({"demandId": demandId}),
              success: function(response){
                if(response.status){
                  $('.demande-menu-bottom-row-'+demandId).empty();
                  $('.demande-menu-bottom-row-'+demandId).append(
                    '<div class="row text-center"><p>Demande acceptée</p></div>'
                  )
                } else if(response.expired){
                  $('.demande-menu-bottom-row-'+demandId).empty();
                  $('.demande-menu-bottom-row-'+demandId).append('<div class="row text-center"><h4>Vous avez accépté cette demand après le rendez-vous fixé.</h4></div>')
                } else {
                  console.log("an error occured")
                }
              }
            })
          },
          non: function () {
          }
      }
    });
  });

  $('.decline-demand').on('click', function(){
    var demandId = this.getAttribute("data-demand-id");
    $.confirm({
      title: 'Accepter',
      content: 'Etes vous sure de vouloir décliner cette demande?',
      buttons: {
          oui: function () {
            $.ajax({
              url: '/declinedemand',
              method: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({"demandId": demandId}),
              success: function(response){
                $('.demand'+demandId).remove();
              }
            });
          },
          non: function () {
          }
      }
    });
  });
});
