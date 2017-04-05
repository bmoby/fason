$(document).ready(function() {

  $("#input-44").fileinput({
    showBrowse: false,
    showRemove: false,
    showCaption: true,
    showCancel: false,
    showClose: true,
    uploadUrl: '/load',
    browseOnZoneClick: true,
    initialPreviewAsData: false,
    minFileCount:3,
    msgFilesTooLess:'Look sera plus attractif avec 3 photos ou plus (minimum 3 photos).',
    maxFileSize:5120, //5120kb=5mb
    msgSizeTooLarge: 'Taille de la photo ne peut pas excéder 5 MB',
    allowedFileExtensions: ["png", "jpeg", "jpg"],
    dropZoneTitle: 'Glissez les images ici ou cliquez pour sélectionner.',
    dropZoneClickTitle: '',
  });


//********************************************** STYLEBOX PICS **********************************************
//---------------------------------------------- UPLOADING TO S3 --------------------------------------------

  // Create stylebox event
  $('.createSP').on('click', function(){
    var budget = $('.style-minbudget-input').val();
    var title = $('.style-title-input').val();
    var price = $('.style-price-input').val();
    var city = $('.style-city-input').val();
    var style = $('.select-style-proper').val();
    var gender = $('.select-gender-proper').val();
    var minTime = $('.select-minTime-proper').val();
    var description = $('.stylebox-description').val();
    var styleObject = {};
    if(style == "Coiffure" || style == "Barbe" || style == "CoiffureColoration" || style == "CoiffureBarbe" || style == "CoiffureColorationBarbe" || style == "Maquillage" || style == "Manucure" || style == "Pedicure" || style == "ManucurePedicure" || style == "Sourcils" || style == "SoinVisage" || style == "SoinCorp" || style == "SoinVisageCorp"){
      styleObject.vestimentaire = false;
      styleObject.beaute = true;
    }else{
      styleObject.vestimentaire = true;
      styleObject.beaute = false;
    }
    $.ajax({
      url: '/createstylebox',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({"budget": budget, "title": title, "price": price, "city": city, "styleObject": styleObject, "gender": gender, "minTime": minTime, "description": description}),
      success:function(response){
        if (response){
          // alert('Votre look a été publié. Vous pouvez le modifier ou supprimer dans "Looks".');
          // window.location.replace('https://fason.herokuapp.com/');
          $('.fileinput-upload-button').click();
        }
      }
    });
  });

  // creating stylebox after all photos are loaded to S3
  $('#input-44').on('fileuploaded', function(event, data, previewId, index) {
    console.log(data)
  });

  $('.backToInfo').on('click', function(){
    $('.stylebox-pics-page').addClass('hidden');
    $('.stylebox-info-page').removeClass('hidden');
  });

})
