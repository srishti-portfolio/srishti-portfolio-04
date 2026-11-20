/* =========================================================
   Main page behaviour (from the original template, trimmed
   to what this site uses):
   1. Hide the page loader once the page is ready
   2. Phone menu button
   3. Smooth scroll when a menu link is clicked
   4. Menu bar changes style after scrolling down
   5. Sections fade up as they scroll into view
   Needs: jquery.min.js, jquery.waypoints.min.js
   ========================================================= */
(function ($) {
  "use strict";

  // 1. Page loader
  setTimeout(function () {
    $("#ftco-loader").removeClass("show");
  }, 1);

  // 2. Phone menu button
  $("body").on("click", ".js-fh5co-nav-toggle", function (event) {
    event.preventDefault();
    if ($("#ftco-nav").is(":visible")) {
      $(this).removeClass("active");
    } else {
      $(this).addClass("active");
    }
  });

  // 3. Smooth scroll for menu links like #about-section
  $(document).on("click", '#ftco-nav a[href^="#"]', function (event) {
    event.preventDefault();
    var target = $($.attr(this, "href"));
    if (!target.length) return;
    $("html, body").animate({ scrollTop: target.offset().top - 70 }, 500);
  });

  // 4. Menu bar style after scrolling
  $(window).scroll(function () {
    var st = $(this).scrollTop();
    var navbar = $(".ftco_navbar");

    if (st > 150) {
      if (!navbar.hasClass("scrolled")) navbar.addClass("scrolled");
    }
    if (st < 150) {
      if (navbar.hasClass("scrolled")) navbar.removeClass("scrolled sleep");
    }
    if (st > 350) {
      if (!navbar.hasClass("awake")) navbar.addClass("awake");
    }
    if (st < 350) {
      if (navbar.hasClass("awake")) {
        navbar.removeClass("awake");
        navbar.addClass("sleep");
      }
    }
  });

  // 5. Fade sections up as they come into view
  $(".ftco-animate").waypoint(function (direction) {
    if (direction === "down" && !$(this.element).hasClass("ftco-animated")) {
      $(this.element).addClass("item-animate");
      setTimeout(function () {
        $("body .ftco-animate.item-animate").each(function (k) {
          var el = $(this);
          setTimeout(function () {
            var effect = el.data("animate-effect");
            if (effect === "fadeIn") {
              el.addClass("fadeIn ftco-animated");
            } else if (effect === "fadeInLeft") {
              el.addClass("fadeInLeft ftco-animated");
            } else if (effect === "fadeInRight") {
              el.addClass("fadeInRight ftco-animated");
            } else {
              el.addClass("fadeInUp ftco-animated");
            }
            el.removeClass("item-animate");
          }, k * 50);
        });
      }, 100);
    }
  }, { offset: "95%" });

})(jQuery);
