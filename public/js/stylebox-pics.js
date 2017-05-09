$(document).ready(function() {

  $('.select-style').niceSelect();
  $('.select-gender').niceSelect();

  $("#input-44").fileinput({
    showBrowse: false,
    showRemove: false,
    showCaption: true,
    showCancel: false,
    showClose: true,
    uploadUrl: '/',
    browseOnZoneClick: true,
    initialPreviewAsData: false,
    minFileCount:3,
    msgFilesTooLess:'Look sera plus attractif avec 3 photos ou plus (minimum 3 photos).',
    maxFileSize:5120,
    msgSizeTooLarge: 'Taille de la photo ne peut pas excéder 5 MB',
    allowedFileExtensions: ["png", "jpeg", "jpg"],
    dropZoneTitle: 'Glissez les images ici ou cliquez pour sélectionner.',
    dropZoneClickTitle: ''
  });



//********************************************** STYLEBOX PICS **********************************************
//---------------------------------------------- UPLOADING TO S3 --------------------------------------------



var CLOUD = "https://api.cloudinary.com/v1_1/fason/upload";
var CLOUD_PRES = "puxsf4pt";

var photos = [];
$('#input-44').on('change', function(e){
  $('.createSP').prop('disabled', true);
  var file = e.target.files[0];
  var formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUD_PRES);

  axios({
    url: CLOUD,
    method: "POST",
    headers: {'content-Type': 'application/x-www-form-urlencoded'},
    data: formData
  }).then(function(res){
    photos.push(res.data.secure_url);
    $('.kv-file-content').last().attr( "key", res.data.secure_url );
    setTimeout(function(){
      $('.createSP').prop('disabled', false);
    }, 2500);
  }).catch(function(err){
  console.log(err);
  })
})



  // Create stylebox event
  $('.createSP').on('click', function(){
    if($('.file-preview-frame').length >= 3){
      var pics = [];
      $('.kv-file-content').each(function(){
        pics.push(this.getAttribute( "key" ));
      });
      $(this).prop('disabled', true);
      var budget = $('.style-minbudget-input').val();
      var title = $('.style-title-input').val();
      var price = $('.style-price-input').val();
      var city = $('.style-city-input').val();
      var style = $('.select-style-proper').val();
      var gender = $('.select-gender-proper').val();
      var minTime = $('.select-minTime-proper').val();
      var description = $('.stylebox-description').val();
      var styleObject = {};
      if(style == "Coiffure" || style == "Barbe" || style == "CoiffureColoration" || style == "CoiffureBarbe" || style == "CoiffureColorationBarbe" || style == "Maquillage" || style == "Manucure" || style == "Pedicure" || style == "ManucurePedicure" || style == "Sourcils" || style == "SoinVisage" || style == "SoinCorp" || style == "SoinVisageCorp" || style == "allbeauty"){
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
        data: JSON.stringify({"budget": budget, "title": title, "price": price, "city": city, "styleObject": styleObject, "gender": gender, "minTime": minTime, "description": description, "style": style, "pics": pics, "allphotos": photos}),
        success:function(response){
          if (response.stylebox){
            alert('Look a été publié. Vous pouvez le modifier ou supprimer dans "Looks".');
            window.location.replace('https://fason.co/');
          }

          if(response.nouser) {
            $.confirm({
              title: "Faible réseau",
              content: "Votre réseau est faible et vous avez été déconnecté. Etes-vous sûr que vous avez un réseau fiable et voulez-vous réessayer tout de suite?",
              buttons: {
                  oui: function () {
                    window.location.replace('https://fason.co/login');
                  },
                  non: function () {
                    window.location.replace('https://fason.co/');
                }
              }
            });
          }
        }
      });
    } else {
      $('.file-error-message').empty();
      $('.file-error-message').append('<span class="close kv-error-close">×</span> Look sera plus attractif avec 3 photos ou plus (minimum 3 photos).');
      $('.file-error-message').show();
    }
  });



  $('.backToInfo').on('click', function(){
    $('.stylebox-pics-page').addClass('hidden');
    $('.stylebox-info-page').removeClass('hidden');
  });

})
