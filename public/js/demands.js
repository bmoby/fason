$(document).ready(function(){
  var pusher = new Pusher('095ff3028ab7bceb6073', {
    encrypted: true
  });

  $('.accept-demand').on('click', function(){
    var demandId = this.getAttribute("data-demand-id");
    $.confirm({
      title: 'Accepter',
      content: 'Voulez-vous vraiment accepter la demande de relooking ? En appuyant sur le bouton "Oui", vous vous engagez à rendre ce service de relooker à ce client.',
      // content: 'Voulez-vous vraiment faire la demande de relooking pour ce look ? En appuyant sur le bouton "Oui", vous vous engagez à rencontrer le Relooker.',
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
                  $('.demande-menu-bottom-row-'+demandId).append("<div class='row text-center'><h4>L'heure de rendez-vous de relooking est expirée.</h4></div>")
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
      title: 'Décliner',
      content: 'Voulez-vous vraiment décliner cette demande de relooking ?',
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
