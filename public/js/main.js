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
            if (/trang-\d+/.test(window.location.pathname)) {
                window.location = window.location.pathname.replace(/trang-\S+/, 'trang-' + val);
            } else {
                window.location = window.location.pathname + '/trang-' + val;
            }
        }
    });
    /*------------------
        Player-controls
    --------------------*/
    $('#prevEp').click(function () {
        const currentEpisode = $('#prevEp').attr('data-current-episode');
        const episodes = $('#prevEp').attr('data-episodes');
        const prevEpVal = Number(currentEpisode) - 1;
        if (prevEpVal > 0 && prevEpVal <= episodes) {
            if (/tap-\d+/.test(window.location.pathname)) {
                window.location = window.location.pathname.replace(/tap-\S+/, 'tap-' + prevEpVal);
            } else {
                window.location = window.location.pathname + '/tap-' + prevEpVal;
            }
        }
    });

    $('#nextEp').click(function () {
        const currentEpisode = $('#nextEp').attr('data-current-episode');
        const episodes = $('#nextEp').attr('data-episodes');
        const nextEpVal = Number(currentEpisode) + 1;
        if (nextEpVal > 0 && nextEpVal <= episodes) {
            if (/tap-\d+/.test(window.location.pathname)) {
                window.location = window.location.pathname.replace(/tap-\S+/, 'tap-' + nextEpVal);
            } else {
                window.location = window.location.pathname + '/tap-' + nextEpVal;
            }
        }
    });

    $('#comment').click(function () {
        $('html, body').animate({
            scrollTop: $('.block_area-comment').offset().top
        }, 2000);
    });
})(jQuery);