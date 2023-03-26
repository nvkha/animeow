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

    $('#m-search').on('click', function () {
        $('#search').toggleClass('active');
    });

    /*------------------
       Pagination
   --------------------*/
    $('.btn-go-page').click(function () {
        const val = $('.input-page').val()
        if (val) {
            if (window.location.pathname.split('/').length <= 3) {
                window.location = window.location.pathname + '/trang-' + val;
            } else {
                window.location = window.location.pathname.replace(/trang-\S+/, 'trang-' + val);
            }
        }
    });
})(jQuery);