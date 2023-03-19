'use strict';

(function ($) {
    /*------------------
        Header
    --------------------*/
    $('.site_menu-icon').click(function () {
        $('#site_menu').toggleClass('active');
        $('#header_menu').toggleClass('active');
    });

    $('.nav-item').hover(function () {
        if ($(this).has('.header_menu-sub')) {
            $(this).find('.header_menu-sub').toggleClass('active');
        }
    }, function () {
        if ($(this).has('.header_menu-sub')) {
            $(this).find('.header_menu-sub').toggleClass('active');
        }
    });

    $('.nav-item').click(function () {
        if ($(this).has('.header_menu-sub')) {
            $(this).find('.header_menu-sub').toggleClass('extend');
        }
    });

    /*------------------
        Search
    --------------------*/
    $('.search-content button').on('click', function () {
        const keyword = $('.search-content input').val()
        if (keyword) {
            window.location = '/tim-kiem/' + keyword;
        }
    });

    $('input[type=search]').on('search', function () {
        if (this.value) {
            window.location = '/tim-kiem/' + this.value;
        }
    });
})(jQuery);