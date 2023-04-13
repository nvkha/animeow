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
        if (e && /filter/.test(window.location.pathname)) {
            window.location = $(".ap__-btn-next a").attr("href").replace(/page=\S+/, "page=" + e);
            return
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
        e.width = 768, e.height = 432, e.getContext("2d").drawImage(a, 0, 0, e.width, e.height), n.appendChild(e), o.modal("show")
    }), t("#modal").on("hide.bs.modal", function (e) {
        t(".modal-content").empty()
    }), $(document).on("click", ".block_area-content .dropdown-menu", function (t) {
        t.stopPropagation()
    }), $("#btn-filter-submit").click(function () {
        let t = "/filter?", e = [], a = [], n = [], o = [], c, i, l, s;
        (s = $("input[name=filter-keyword]").val()) && (t += "keyword=" + s + "&"), $(".checkbox-genre:checked").each(function (t) {
            e[t] = $(this).val()
        }), e.length > 0 && (t += "genre=" + e.join(",") + "&"), $(".checkbox-season:checked").each(function (t) {
            a[t] = $(this).val()
        }), a.length > 0 && (t += "season=" + a.join(",") + "&"), $(".checkbox-year:checked").each(function (t) {
            n[t] = $(this).val()
        }), n.length > 0 && (t += "year=" + n.join(",") + "&"), $(".checkbox-type:checked").each(function (t) {
            o[t] = $(this).val()
        }), o.length > 0 && (t += "type=" + o.join(",") + "&"), null != (c = $("input[name=radio-status]:checked").val()) && "all" != c && (t += "status=" + c + "&"), null != (l = $("input[name=radio-episodes]:checked").val()) && "all" != l && (t += "episodes=" + l + "&"), null != (i = $("input[name=radio-sort]:checked").val()) && "all" != i && (t += "sort=" + i + "&"), t.endsWith("&") && (t = t.substring(0, t.length - 1)), window.location = t
    }), $("form").submit(function (e) {
        e.preventDefault();
        const username = $("#username").val();
        const password = $("#password").val();
        $.ajax({
            url: "/api/v1/users/login",
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                username: username,
                password: password
            }),
            success: function (data) {
                alert("Login success")
            },
            error: function (data) {
                alert(data.responseJSON.message);
            }
        });
    });
}(jQuery);