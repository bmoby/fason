$(document).on('ready', function() {

  $('.select-style').niceSelect();
  $('.select-gender').niceSelect();
  $("#input-44").fileinput({
    showBrowse: false,
    showRemove: false,
    showCaption: false,
    showCancel: false,
    showClose: false,
    uploadUrl: '/load',
    browseOnZoneClick: true,
    initialPreviewAsData: false,
    minFileCount:3,
    msgFilesTooLess:'Look sera plus attractif avec 3 photos ou plus (minimum 3 photos).',
    maxFileSize:5120, //5120kb=5mb
    msgSizeTooLarge: 'Taille de la photo ne peut pas excéder 5 MB',
    allowedFileExtensions: ["png", "jpeg", "jpg"],
    dropZoneTitle: 'Faites glisser et déposez les images ici ou cliquez pour sélectionner.',
    dropZoneClickTitle: '',
  });


//********************************************** STYLEBOX PICS **********************************************
//---------------------------------------------- UPLOADING TO S3 --------------------------------------------

  // Create stylebox event
  $('.createSP2').on('click', function(){
    if($('.file-preview-frame').length >= 3){
      $(this).prop('disabled', true);
    var budget = $('.style-minbudget-input').val();
    var title = $('.style-title-input').val();
    var price = $('.style-price-input').val();
    var style = $('.select-style-proper').val();
    var gender = $('.select-gender-proper').val();
    var minTime = $('.select-minTime-proper').val();
    var city = $('.style-city-input').val();
    var description = $('.stylebox-description').val();
    var styleboxId = $('.stylebox-id-input').val();
    var styleObject = {};
    styleObject.style = $('.select-style-proper').val();

    if(style == "Coiffure" || style == "Barbe" || style == "CoiffureColoration" || style == "CoiffureBarbe" || style == "CoiffureColorationBarbe" || style == "Maquillage" || style == "Manucure" || style == "Pedicure" || style == "ManucurePedicure" || style == "Sourcils" || style == "SoinVisage" || style == "SoinCorp" || style == "SoinVisageCorp" || style == "allbeauty"){
      styleObject.vestimentaire = false;
      styleObject.beaute = true;
    }else{
      styleObject.vestimentaire = true;
      styleObject.beaute = false;
    }

      $.ajax({
        url: '/editstylebox',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({"city": city, "styleboxId": styleboxId, "budget": budget, "title": title, "price": price, "styleObject": styleObject, "gender": gender, "minTime": minTime, "description": description, "style": style}),
        success:function(response){
          if (response){
            if(response.edited){
              $('.fileinput-upload-button').click();
            } else {
              console.log("error please try later")
            }
          }
        }
      });
    } else {
      $('.file-error-message').empty();
      $('.file-error-message').append('<span class="close kv-error-close">×</span> Look sera plus attractif avec 3 photos ou plus (minimum 3 photos).');
      $('.file-error-message').show();
    }
  });

  // creating stylebox after all photos are loaded to S3
  $('#input-44').on('fileuploaded', function(event, data, previewId, index) {
    if(index+1 == data.files.length){
      alert('Look a été modifié. Vous pouvez le modifier ou supprimer dans "looks".');
      window.location.replace('http://fason.co/mystyleboxes');
    }
  });

  $('.backToInfo').on('click', function(){
    $('.stylebox-pics-page').addClass('hidden');
    $('.stylebox-info-page').removeClass('hidden');
  });

})
