$(document).ready(function(){
  $('.select-style').niceSelect();
  $('.select-gender').niceSelect();

  $('.rating').each(function(){
    var styleboxId = this.getAttribute("data-stylebox-id");
    var ratingValue = this.getAttribute("data-rating-value");

    $('.general-rating-'+styleboxId).barrating({
      theme: "fontawesome-stars-o",
      initialRating: ratingValue,
      readonly: true
    });
  })

})
