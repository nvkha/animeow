"use strict";
!function (e) {
    e(".site_menu-icon").click(function () {
        e("#site_menu").toggleClass("active"), e("#header_menu").toggleClass("active")
    }), e(".nav-item").hover(function () {
        e(this).has(".header_menu-sub") && e(this).find(".header_menu-sub").toggleClass("active")
    }, function () {
        e(this).has(".header_menu-sub") && e(this).find(".header_menu-sub").toggleClass("active")
    }), e(".nav-item").click(function () {
        e(this).has(".header_menu-sub") && e(this).find(".header_menu-sub").toggleClass("extend")
    }), e(".search-content button").on("click", function () {
        let t = e(".search-content input").val();
        t && (window.location = "/tim-kiem/" + t)
    }), e("input[type=search]").on("search", function () {
        this.value && (window.location = "/tim-kiem/" + this.value)
    }), e("#m-search").on("click", function () {
        e("#search").toggleClass("active")
    }), e(".btn-go-page").click(function () {
        let t = e(".input-page").val();
        if (t && /filter/.test(window.location.pathname)) {
            window.location = $(".ap__-btn-next a").attr("href").replace(/page=\S+/, "page=" + t);
            return
        }
        t && (/trang-\d+/.test(window.location.pathname) ? window.location = window.location.pathname.replace(/trang-\S+/, "trang-" + t) : window.location = window.location.pathname + "/trang-" + t)
    }), e("#prevEp").click(function () {
        let t = e("#prevEp").attr("data-current-episode"), n = e("#prevEp").attr("data-episodes"), a = Number(t) - 1;
        a > 0 && a <= n && (/tap-\d+/.test(window.location.pathname) ? window.location = window.location.pathname.replace(/tap-\S+/, "tap-" + a) : window.location = window.location.pathname + "/tap-" + a)
    }), e("#nextEp").click(function () {
        let t = e("#nextEp").attr("data-current-episode"), n = e("#nextEp").attr("data-episodes"), a = Number(t) + 1;
        a > 0 && a <= n && (/tap-\d+/.test(window.location.pathname) ? window.location = window.location.pathname.replace(/tap-\S+/, "tap-" + a) : window.location = window.location.pathname + "/tap-" + a)
    }), e("#comment").click(function () {
        e("html, body").animate({scrollTop: e(".block_area-comment").offset().top}, 2e3)
    }), e("#capture").click(function () {
        let t = document.createElement("canvas"), n = document.getElementById("player_html5_api"),
            a = e(".modal-content")[0], i = e("#modal");
        t.width = 768, t.height = 432, t.getContext("2d").drawImage(n, 0, 0, t.width, t.height), a.appendChild(t), i.modal("show")
    }), e("#modal").on("hide.bs.modal", function (t) {
        e(".modal-content").empty()
    }), $(document).on("click", ".block_area-content .dropdown-menu", function (e) {
        e.stopPropagation()
    }), $("#btn-filter-submit").click(function () {
        let e = "/filter?", t = [], n = [], a = [], i = [], o, c, l, s;
        (s = $("input[name=filter-keyword]").val()) && (e += "keyword=" + s + "&"), $(".checkbox-genre:checked").each(function (e) {
            t[e] = $(this).val()
        }), t.length > 0 && (e += "genre=" + t.join(",") + "&"), $(".checkbox-season:checked").each(function (e) {
            n[e] = $(this).val()
        }), n.length > 0 && (e += "season=" + n.join(",") + "&"), $(".checkbox-year:checked").each(function (e) {
            a[e] = $(this).val()
        }), a.length > 0 && (e += "year=" + a.join(",") + "&"), $(".checkbox-type:checked").each(function (e) {
            i[e] = $(this).val()
        }), i.length > 0 && (e += "type=" + i.join(",") + "&"), null != (o = $("input[name=radio-status]:checked").val()) && "all" != o && (e += "status=" + o + "&"), null != (l = $("input[name=radio-episodes]:checked").val()) && "all" != l && (e += "episodes=" + l + "&"), null != (c = $("input[name=radio-sort]:checked").val()) && "all" != c && (e += "sort=" + c + "&"), e.endsWith("&") && (e = e.substring(0, e.length - 1)), window.location = e
    }), $("#login").submit(function (e) {
        e.preventDefault();
        let t = $("#username").val(), n = $("#password").val();
        $.ajax({
            url: "/api/v1/users/login",
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({username: t, password: n}),
            success: function (e) {
                alert("Login success")
            },
            error: function (e) {
                alert(e.responseJSON.message)
            }
        })
    }), $("body").on("click", function () {
        let e = ["https://shope.ee/8zZX7sNTOq", "https://shope.ee/3AbkBCi3Wq", "https://shope.ee/9KCNWVd7lB"],
            t = new Date().getTime(), n = JSON.parse(localStorage.getItem("click_time"));
        if (void 0 != n) {
            if (t - n > 36e5) {
                let a = JSON.parse(localStorage.getItem("url_key"));
                a = a > e.length - 1 ? 0 : a, localStorage.setItem("url_key", JSON.stringify(a + 1)), localStorage.setItem("click_time", JSON.stringify(t)), window.open(e[a], "_blank")
            }
        } else localStorage.setItem("click_time", JSON.stringify(t)), localStorage.setItem("url_key", JSON.stringify(1)), window.open(e[0], "_blank")
    })
}(jQuery);