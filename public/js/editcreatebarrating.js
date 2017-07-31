$(document).ready(function(){
  $('.rating').each(function(){
    var styleboxId = this.getAttribute("data-stylebox-id");
    var ratingValue = this.getAttribute("data-rating-value");

    $('.general-rating-'+styleboxId).barrating({
      theme: "fontawesome-stars-o",
      initialRating: ratingValue,
      readonly: true
    });
  })
  $('.delete').on('click', function(){
    var styleboxId = this.getAttribute('data-stylebox-id-remove');
    $.confirm({
      title: 'Supprimer',
      content: 'Etes-vous sûr de vouloir supprimer ce look ? Toutes les photos ainsi que les informations seront définitivement supprimées.',
      buttons: {
          oui: function () {
            $.ajax({
              url: '/styleboxdelete',
              method: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({"styleboxId": styleboxId}),
              success: function(response){
                if(response.list == 0){
                  window.location.replace('http://fason.co/');
                } else {
                  window.location.replace('http://fason.co/mystyleboxes');
                }
              }
            })
          },
          non: function () {
          }
      }
    });
  });
})
