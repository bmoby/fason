$(document).ready(function(){
  $('.select-style').niceSelect();
  $('.select-gender').niceSelect();
  $('.masonryContainer1').imagesLoaded(function(){
    var img21 = $('#1-1');
    var img23 = $('#1-5');
    var height2 = img23.height() + img21.height();
    $('.masonryContainer1').css({"height": height2});
    $('.masonryContainer1').before('<div class="text-center styledescription"><p>Business casual look</p></div>')
    $('#gallery').masonry({
      itemSelector: '.item-masonry',
      columnWidth: '.sizer4',
      percentPosition: true
    });
  });
  $('.masonryContainer2').imagesLoaded(function(){
    var img21 = $('#2-0');
    var img23 = $('#2-5');
    var height2 = img23.height() + img21.height();
    $('.masonryContainer2').css({"height": height2});
    $('.masonryContainer2').before('<div class="text-center styledescription"><p>Bohemian look</p></div>')
    $('#gallery1').masonry({
      itemSelector: '.item-masonry',
      columnWidth: '.sizer4',
      percentPosition: true
    });
  });

  $('.masonryContainer3').imagesLoaded(function(){
    var img32 = $('#3-2');
    var img35 = $('#3-3');
    var height3 = img32.height()+img35.height();
    $('.masonryContainer3').css({"height": height3});
    $('.masonryContainer3').before('<div class="text-center styledescription"><p>Casual look</p></div>')
    $('#gallery2').masonry({
      itemSelector: '.item-masonry',
      columnWidth: '.sizer4',
      percentPosition: true
    });
  });

  $('.masonryContainer4').imagesLoaded(function(){
    var img42 = $('#4-0');
    var img45 = $('#4-3');
    var height4 = img42.height() + img45.height();
    $('.masonryContainer4').css({"height": height4});
    $('.masonryContainer4').before('<div class="text-center styledescription"><p>Chic look</p></div>')
    $('#gallery3').masonry({
      itemSelector: '.item-masonry',
      columnWidth: '.sizer4',
      percentPosition: true
    });
  });

  // changes
  $('.comment-ca-marche').click(function(e){
    e.preventDefault();
    console.log('comment ca marche')
    $('body,html').animate({
          scrollTop: $('.tutorialContainerMain').offset().top
      }, 2000);
      return false;
  });
  // changes

  $('#stylistContainer').imagesLoaded(function(){
    console.log('images loaded')
    $('#stylistContainer').masonry({
      itemSelector: '.stylist-masonry',
      columnWidth: '.stylist-sizer',
      percentPosition: true
    });
  })

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
