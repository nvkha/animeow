videojs("player", {
    fluid: !0,
    controls: !0,
    autoplay: !1,
    notSupportedMessage: "Tập phim n\xe0y đ\xe3 bị lỗi! Bạn vui l\xf2ng th\xf4ng b\xe1o cho Admin nh\xe9! Thank you <3"
});

const src = $("video source").attr("src");
console.log(src)