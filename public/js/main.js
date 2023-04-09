"use strict";
!function (t) {
    t(".site_menu-icon").click(function () {
        t("#site_menu").toggleClass("active"), t("#header_menu").toggleClass("active")
    }), t(".nav-item").hover(function () {
        t(this).has(".header_menu-sub") && t(this).find(".header_menu-sub").toggleClass("active")
    }, function () {
        t(this).has(".header_menu-sub") && t(this).find(".header_menu-sub").toggleClass("active")
    }), t(".nav-item").click(function () {
        t(this).has(".header_menu-sub") && t(this).find(".header_menu-sub").toggleClass("extend")
    }), t(".search-content button").on("click", function () {
        let e = t(".search-content input").val();
        e && (window.location = "/tim-kiem/" + e)
    }), t("input[type=search]").on("search", function () {
        this.value && (window.location = "/tim-kiem/" + this.value)
    }), t("#m-search").on("click", function () {
        t("#search").toggleClass("active")
    }), t(".btn-go-page").click(function () {
        let e = t(".input-page").val();

        if (e && (/filter/.test(window.location.pathname))) {
            window.location = $('.ap__-btn-next a').attr('href').replace(/page=\S+/, "page=" + e);
            return;
        }

        e && (/trang-\d+/.test(window.location.pathname) ? window.location = window.location.pathname.replace(/trang-\S+/, "trang-" + e) : window.location = window.location.pathname + "/trang-" + e)

    }), t("#prevEp").click(function () {
        let e = t("#prevEp").attr("data-current-episode"), a = t("#prevEp").attr("data-episodes"), n = Number(e) - 1;
        n > 0 && n <= a && (/tap-\d+/.test(window.location.pathname) ? window.location = window.location.pathname.replace(/tap-\S+/, "tap-" + n) : window.location = window.location.pathname + "/tap-" + n)
    }), t("#nextEp").click(function () {
        let e = t("#nextEp").attr("data-current-episode"), a = t("#nextEp").attr("data-episodes"), n = Number(e) + 1;
        n > 0 && n <= a && (/tap-\d+/.test(window.location.pathname) ? window.location = window.location.pathname.replace(/tap-\S+/, "tap-" + n) : window.location = window.location.pathname + "/tap-" + n)
    }), t("#comment").click(function () {
        t("html, body").animate({scrollTop: t(".block_area-comment").offset().top}, 2e3)
    }), t("#capture").click(function () {
        let e = document.createElement("canvas"), a = document.getElementById("player_html5_api"),
            n = t(".modal-content")[0], o = t("#modal");
        e.width = 720, e.height = 480;
        e.getContext("2d").drawImage(a, 0, 0, e.width, e.height), n.appendChild(e), o.modal("show")
    }), t("#modal").on("hide.bs.modal", function (e) {
        t(".modal-content").empty()
    }), $(document).on('click', '.block_area-content .dropdown-menu', function (e) {
        e.stopPropagation();
    }), $('#btn-filter-submit').click(function () {
        let query = '/filter?';
        let genres = [];
        let seasons = [];
        let years = []
        let types = [];
        let status;
        let sort;
        let episodes;
        let keyword;

        keyword = $('input[name=filter-keyword]').val();
        if (keyword) {
            query += 'keyword=' + keyword + '&';
        }

        $('.checkbox-genre:checked').each(function (i) {
            genres[i] = $(this).val();
        });
        if (genres.length > 0) {
            query += 'genre=' + genres.join(',') + '&'
        }

        $('.checkbox-season:checked').each(function (i) {
            seasons[i] = $(this).val();
        });
        if (seasons.length > 0) {
            query += 'season=' + seasons.join(',') + '&';
        }

        $('.checkbox-year:checked').each(function (i) {
            years[i] = $(this).val();
        });
        if (years.length > 0) {
            query += 'year=' + years.join(',') + '&';
        }

        $('.checkbox-type:checked').each(function (i) {
            types[i] = $(this).val();
        });
        if (types.length > 0) {
            query += 'type=' + types.join(',') + '&';
        }

        status = $('input[name=radio-status]:checked').val();
        if (status != null && status != 'all') {
            query += 'status=' + status + '&';
        }

        episodes = $('input[name=radio-episodes]:checked').val();
        if (episodes != null && episodes != 'all') {
            query += 'episodes=' + episodes + '&';
        }

        sort = $('input[name=radio-sort]:checked').val();
        if (sort != null && sort != 'all') {
            query += 'sort=' + sort + '&';
        }

        if (query.endsWith('&')) {
            query = query.substring(0, query.length - 1);
        }
        window.location = query;
    });
}(jQuery);