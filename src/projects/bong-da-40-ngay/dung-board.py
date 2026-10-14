#!/usr/bin/env python3
"""Sinh board.json cho video bong-da-40-ngay (storytime châm biếm bóng đá).

Viết board bằng Python cho gọn: hàm nhỏ dựng shot/diễn viên/mốc act, rồi ghi JSON.
Chạy: python3 src/projects/bong-da-40-ngay/dung-board.py
Nhịp trắng `trong` chèn sau, theo mốc thật (kiem-tra-v2 --moc) — xem TRONG ở cuối file.
"""
import json, os

def a(tai, dang=None, **kw):
    m = {"tai": tai}
    if dang: m["dang"] = dang
    m.update(kw)
    return m

def dv(kieu, x, dang="dung", act=None, **kw):
    d = {"kieu": kieu, "x": x, "dang": dang}
    d.update(kw)
    if act: d["act"] = act
    return d

def shot(say, loai, co=None, dien=None, **kw):
    s = {"say": say, "loai": loai}
    if co: s["co"] = co
    if dien: s["dien"] = dien
    s.update(kw)
    return s

def td(say, act, chu=None, **kw):
    """Nam nói trực diện, x 0.72, cận."""
    s = shot(say, "truc-dien", "can", [dv("nam", 0.72, act[0].get("dang", "haiTayXoe"), act=act, noi=True)], **kw)
    if chu: s["chu"] = chu
    return s

def the(text, vao="tuc-thi", **kw):
    c = {"noi_dung": text, "kieu": "the", "vao": vao}; c.update(kw); return c

def kem(text, vi_tri="tren", tai=0.25, **kw):
    c = {"noi_dung": text, "kieu": "kem", "vi_tri": vi_tri, "tai": tai}; c.update(kw); return c

def nhan(text, tai=0.3, **kw):
    c = {"noi_dung": text, "kieu": "nhan", "vi_tri": "tren", "tai": tai}; c.update(kw); return c

def tay(text, vi_tri="canh-dau", tai=0.3, **kw):
    c = {"noi_dung": text, "kieu": "tay", "vi_tri": vi_tri, "tai": tai}; c.update(kw); return c

def p(ten, x, y, co=1.0, **kw):
    d = {"ten": ten, "x": x, "y": y, "co": co}; d.update(kw); return d

DO = "#c0392b"  # thẻ punchline đỏ

# ───────────────────────── nhân vật riêng của chuyện ─────────────────────────
NHAN_VAT = {
    "ha-lon": {"ten": "Chủ quán bia", "khung": "phu",
                 "toc": {"mau": "#1c1a22", "mai": "ngang", "lon": 0, "sau": "ngan"},
                 "phongCach": {"mat": "lech", "mui": "moc", "tai": True, "mauAo": "#f7e7a9", "mauQuan": "#5a3b1e"}},
    "cho": {"ten": "Chó quán (bị vẽ cờ)", "co": 0.8,
                 "toc": {"mau": "#f81000", "mai": "ngang", "lon": 0, "sau": "khong"},
                 "phongCach": {"mat": "tron-nguoi", "mauAo": "#f7e7a9"},
                 "thu": {"tai": "cup", "mom": "ngan", "mauLong": "#f81000", "duoi": "xu"}},
    "ha": {"ten": "Cô dâu", "toc": {"mau": "#2e1310", "mai": "re-giua", "lon": 2, "sau": "dai"},
               "phongCach": {"mat": "hat-dau", "mui": "gach", "mauAo": "#fdfdfd", "mauQuan": "#fdfdfd"}},
    "nam-lon": {"ten": "Chú rể", "toc": {"mau": "#1c1a22", "mai": "lech-phai", "lon": 0, "sau": "ngan"},
               "phuKien": "ca-vat",
               "phongCach": {"mat": "hat-dau", "mui": "gach", "mauAo": "#1c1a22", "mauQuan": "#1c1a22", "coAo": "so-mi"}},
    "mai": {"ten": "Cầu thủ Thái (chung chung)", "toc": {"mau": "#1c1a22", "mai": "ngang", "lon": 0, "sau": "ngan"},
                "phongCach": {"mat": "lech", "mui": "gach", "tai": True, "mauAo": "#2f6fd6", "mauQuan": "#2f6fd6", "coAo": "tron"}},
    "gau": {"ten": "Cầu thủ Malaysia (chung chung)", "toc": {"mau": "#2e1310", "mai": "re-giua", "lon": 0, "sau": "ngan"},
                 "phongCach": {"mat": "tron-nguoi", "mui": "moc", "tai": True, "mauAo": "#f1c40f", "mauQuan": "#1c1a22", "coAo": "tron"}},
    "tho": {"ten": "Cầu thủ Việt Nam (chung chung)", "toc": {"mau": "#1c1a22", "mai": "lech-trai", "lon": 0, "sau": "ngan"},
              "phongCach": {"mat": "hat-dau", "mui": "gach", "tai": True, "mauAo": "#d62828", "mauQuan": "#fdfdfd", "coAo": "tron"}},
}

DO_CAM = {
    "co-to": {"moTa": "cờ đỏ sao vàng cầm tay, cán dài", "dai": 1.3, "nam": "doc",
              "hinh": [{"loai": "gach", "x1": 0, "y1": -0.15, "x2": 0, "y2": 1.25},
                       {"loai": "to", "d": "M 0 0.78 L 0.78 0.78 L 0.78 1.25 L 0 1.25 Z", "mau": "#f81000"},
                       {"loai": "hop", "x": 0, "y": 0.78, "w": 0.78, "h": 0.47, "bo": 0.01},
                       {"loai": "to", "d": "M 0.39 0.86 L 0.42 0.96 L 0.52 0.96 L 0.44 1.02 L 0.47 1.12 L 0.39 1.06 L 0.31 1.12 L 0.34 1.02 L 0.26 0.96 L 0.36 0.96 Z", "mau": "#f7e7a9"}]},
    "ken": {"moTa": "kèn cổ vũ hình loa (vuvuzela)", "dai": 1.0, "nam": "ngang",
            "hinh": [{"loai": "to", "d": "M 0.12 -0.03 L -0.9 -0.2 L -0.9 0.2 L 0.12 0.03 Z", "mau": "#f81000"},
                     {"loai": "net", "d": "M 0.12 -0.03 L -0.9 -0.2 L -0.9 0.2 L 0.12 0.03 Z"},
                     {"loai": "bau", "cx": -0.9, "cy": 0, "rx": 0.05, "ry": 0.2}]},
}

C = []  # chương

# ───────────────────────── mở bài ─────────────────────────
C.append({"id": "mo-bai", "nhac": "24-grand-chase", "shots": [
    shot("Ba giờ sáng", "tieu-canh", "nho", boi_canh="dem", sfx="tick",
         dien=[dv("nam", 0.5, "ngoi", mat="chan", mieng="thang", ma=True, cam="co-to",
                  act=[a(0, "ngoi", mat="chan"), a(0.4, mat="nham"), a(0.8, nhin=0.4, mat="chan")])],
         chu=[tay("3:00 SÁNG", tai=0.2)]),
    shot("tôi ngồi vỉa hè, mặt vẽ cờ", "minh-hoa", "trung",
         prop=[p("den-duong", 0.86, 1.0, 1.0), p("thung-rac", 0.12, 1.0, 0.9)],
         dien=[dv("nam", 0.5, "ngoi", mat="chan", mieng="meu", ma=True, cam="co-to", goc="ba-phan-tu",
                  act=[a(0, "ngoi"), a(0.5, "chongCam", mat="nham"), a(1.0, mat="chan", nhin=-0.4)])]),
    shot("Cái kèn hết pin", "phan-ung", "can", sfx="deflate",
         dien=[dv("nam", 0.5, "cam", mat="cham", mieng="ba", ma=True, cam="ken", goc="nghieng",
                  act=[a(0, "cam", mat="cham"), a(0.35, mat="nham", mieng="o"), a(0.7, mat="chan", mieng="ba")])],
         chu=[tay("phèèè...", tai=0.3)]),
    td("Tôi là Nam", [a(0, "haiTayXoe", mat="oval"), a(0.35, "chi"), a(0.7, "motTayHong", mieng="smirk")],
       chu=[kem("NAM", vi_tri="trai", tai=0.1)], sfx="whoosh-short"),
    shot("cổ động viên ruột", "minh-hoa", "trung", sfx="pop",
         dien=[dv("nam", 0.5, "gioTay", mat="cung", mieng="cuoi-toe", ma=True, cam="co-to", mau="nhay-mung",
                  act=[a(0, "gioTay"), a(0.4, mat="cung"), a(0.8, "gioHaiTay", mieng="cuoi-toe")])],
         chu=[nhan("CĐV RUỘT", tai=0.2)]),
    shot("xem bóng thì dốt", "minh-hoa", "trung",
         prop=[p("man-hinh", 0.24, 1.0, 0.9, chu="1 – 2 ?")],
         dien=[dv("nam", 0.62, "gaiDau", mat="gach", mieng="meu", flip=True,
                  act=[a(0, "gaiDau", mat="gach"), a(0.4, nhin=-0.6), a(0.8, "nhunVai", mat="cham")])],
         chu=[tay("???", tai=0.3)]),
    shot("đi bão thì chăm", "tieu-canh", "nho", sfx="whoosh-up",
         dien=[dv("nam", 0.3, "chay1", mat="cung", mieng="cuoi-toe", cam="co-to", mau="chay-den",
                  mau_tham_so={"den": 0.75}, act=[a(0, "chay1"), a(0.4, mat="cung"), a(0.8, "gioTay")])],
         chu=[kem("× 100 LẦN", tai=0.3)]),
    td("Hôm nay kể các bạn chuyện bốn mươi ngày",
       [a(0, "chi", mat="oval"), a(0.6, "haiTayXoe"), a(1.2, "chiLen", mat="cung")],
       chu=[kem("40 NGÀY", vi_tri="trai", tai=0.6)]),
    shot("vừa vô địch", "dac-ta", "sat", sfx="ding",
         prop=[p("cup-vo-dich", 0.5, 0.95, 1.6)], chu=[kem("HẠNG 1", tai=0.15)]),
    shot("vừa hạng tư", "chu", sfx="record-scratch",
         chu=[the("HẠNG TƯ.", vao="phong", mau=DO)]),
]})

# ───────────────────────── đêm chung kết ─────────────────────────
C.append({"id": "dem-chung-ket", "nhac": "21-electro-cabello", "shots": [
    shot("Đêm hai sáu tháng tám nhá", "chu", sfx="whoosh-short", chu=[the("ĐÊM 26/8", vao="tung-tu")]),
    shot("tôi với Long ngồi quán bia hơi", "minh-hoa", "trung", boi_canh="quan-nhau",
         dien=[dv("long", 0.42, "ngoi", mat="cung", mieng="cuoi", goc="ba-phan-tu",
                  act=[a(0, "ngoi"), a(0.5, "chi", mat="cung"), a(1.0, "ngoi", nhin=0.5)]),
               dv("nam", 0.6, "ngoi", mat="nho", mieng="cuoi-nhe", goc="ba-phan-tu", flip=True, ma=True,
                  act=[a(0, "ngoi"), a(0.4, nhin=-0.5), a(0.9, "vayTay", mat="cung")])]),
    shot("ghế nhựa", "dac-ta", "sat", sfx="pop",
         prop=[p("ghe-nha-hang", 0.5, 0.95, 0.5)], chu=[nhan("GHẾ NHỰA", tai=0.1)]),
    shot("mười hai cốc", "dac-ta", "sat", sfx="pop-high",
         prop=[p("ban-nhau", 0.5, 0.95, 1.0)], chu=[kem("× 12", tai=0.15)]),
    shot("Phút chín mươi, thua một hai", "minh-hoa", "trung", zoom={"tu": 1, "den": 1.08},
         prop=[p("man-hinh", 0.5, 0.62, 1.1, chu="VN 1 – 2 THÁI\n90'")],
         dien=[dv("long", 0.2, "ngoi", mat="soc", mieng="o", goc="sau",
                  act=[a(0, "ngoi"), a(0.6, "omDau", mat="soc"), a(1.2, mat="soc-lon")]),
               dv("nam", 0.82, "ngoi", mat="soc", mieng="hoang", goc="sau", moHoi=True,
                  act=[a(0, "ngoi"), a(0.5, "epNguc"), a(1.1, mat="soc-lon")])]),
    shot("Long úp mặt khóc", "phan-ung", "can", sfx="deflate",
         dien=[dv("long", 0.5, "ngoiGuc", mat="nham", mieng="meu", goc="nghieng",
                  act=[a(0, "ngoiGuc"), a(0.35, mat="xoan"), a(0.7, mat="nham", mieng="hoang")])]),
    shot("hết rồi mày ơi", "chu",
         dien=[dv("long", 0.2, "omDau", mat="xoan", co=0.9, noi=True,
                  act=[a(0, "omDau"), a(0.4, "cuiNguoi"), a(0.8, "omDau", mat="nham")])],
         chu=[the("HẾT RỒI\nMÀY ƠI.", vao="tung-tu", vi_tri="phai")]),
    shot("Tôi khóc theo", "phan-ung", "can",
         prop=[p("giot-mo-hoi", 0.6, 0.45, 1.0, tai=0.2)],
         dien=[dv("nam", 0.5, "cuiNguoi", mat="xoan", mieng="meu", ma=True,
                  act=[a(0, "cuiNguoi"), a(0.3, mat="nham"), a(0.6, mieng="hoang")])],
         chu=[tay("huhu", tai=0.2)]),
    shot("Hai thằng không ai biết cộng", "minh-hoa", "can",
         dien=[dv("long", 0.3, "ngoiGuc", mat="nham", mieng="meu",
                  act=[a(0, "ngoiGuc"), a(0.5, mat="xoan"), a(1.0, "omDau")]),
               dv("nam", 0.72, "ngoiGuc", mat="nham", mieng="meu", flip=True,
                  act=[a(0, "ngoiGuc"), a(0.45, mat="xoan"), a(0.95, "omDau", mat="nham")])],
         chu=[kem("2 + 1 = ?", tai=0.3)]),
    shot("tổng hai trận mình vẫn dẫn", "chu", sfx="correct-ding",
         chu=[the("TỔNG: 3 – 2\nVẪN DẪN.", vao="tung-tu")]),
    shot("Xong phút chín mươi cộng ba", "dac-ta", "sat", sfx="suspense",
         prop=[p("man-hinh", 0.5, 0.95, 1.3, chu="90+3'")]),
    shot("cầu thủ Thái đánh đầu vào lưới nhà", "minh-hoa", "trung", boi_canh="san-bong", sfx="boing",
         dien=[dv("mai", 0.55, "laoVao", mat="soc", mieng="o", goc="nghieng", mau="giat-minh",
                  mau_tham_so={"tai": 0.5, "huong": "trai"},
                  act=[a(0, "laoVao", mat="nho"), a(0.9, "omDau", mat="soc-lon", mieng="hoang"), a(1.4, "quy", mat="nham")])],
         chu=[nhan("PHẢN LƯỚI", tai=0.8)]),
    shot("Long trèo lên ghế hét", "minh-hoa", "trung", sfx="airhorn",
         prop=[p("ghe-nha-hang", 0.4, 1.0, 1.0)],
         dien=[dv("long", 0.4, "gioHaiTay", mat="cung", mieng="cuoi-toe", y=0.86, cam="co-to",
                  act=[a(0, "gioHaiTay"), a(0.35, "gioTay", mat="soc"), a(0.7, "gioHaiTay", mat="cung")]),
               dv("nam", 0.74, "gioTay", mat="soc", mieng="o", flip=True, mau="nhay-mung",
                  act=[a(0, "gioTay"), a(0.4, mat="cung", mieng="cuoi-toe"), a(0.8, "gioHaiTay")])]),
    shot("Chúng ta vô địch", "chu", sfx="vine-boom",
         dien=[dv("long", 0.2, "gioHaiTay", mat="cung", co=0.9, noi=True, cam="co-to",
                  act=[a(0, "gioHaiTay"), a(0.3, "gioTay"), a(0.6, "gioHaiTay")])],
         chu=[the("CHÚNG TA\nVÔ ĐỊCH!", vao="phong", mau=DO, vi_tri="phai")]),
]})

# ───────────────────────── đi bão ─────────────────────────
def dam_dong_bao():
    toc = [{"mau": "#5a3b1e", "mai": "ngang", "lon": 2, "sau": "bob"}, {"mau": "#1c1a22", "mai": "lech-phai", "lon": 0, "sau": "ngan"},
           None, {"mau": "#2b1a12", "mai": "lech-trai", "lon": 2, "sau": "dai"}, None]
    out = []
    for i, x in enumerate([0.1, 0.24, 0.62, 0.76, 0.9]):
        d = dv("trang", x, "gioTay", co=0.8, mat="cung", mieng="cuoi-toe", cam="co-to" if i % 2 == 0 else "",
               act=[a(0, "gioTay"), a(0.3 + 0.05 * i, "gioHaiTay"), a(0.75 + 0.05 * i, "gioTay", nhin=0.4)])
        if not d["cam"]: del d["cam"]
        if toc[i]: d["toc"] = toc[i]
        out.append(d)
    out.append(dv("long", 0.38, "gioHaiTay", co=0.8, mat="cung", mieng="cuoi-toe", cam="co-to",
                  act=[a(0, "gioHaiTay"), a(0.4, "nhay1"), a(0.8, "nhay2")]))
    out.append(dv("nam", 0.5, "gioTay", co=0.8, mat="cung", mieng="cuoi-toe", cam="ken",
                  act=[a(0, "gioTay"), a(0.35, "cam"), a(0.8, "gioTay")]))
    return out

C.append({"id": "di-bao", "nhac": "23-got-funk", "shots": [
    shot("Xong nhá, cả phố đổ ra đường", "dong-nguoi", "rong", boi_canh="duong-pho", sfx="whoosh-long",
         dien=dam_dong_bao()),
    shot("Tôi vẽ cờ lên má", "minh-hoa", "can",
         dien=[dv("nam", 0.5, "chi", mat="cung", mieng="cuoi-toe", ma=True, cam="but",
                  act=[a(0, "chi"), a(0.35, mat="nho"), a(0.7, "motTayHong", mat="cung")])],
         chu=[tay("★", tai=0.4)]),
    shot("Vẽ ngược", "dac-ta", "sat", sfx="boing",
         prop=[p("mui-ten", 0.66, 0.5, 1.0, flip=True)],
         dien=[dv("nam", 0.5, "dung", mat="soc", mieng="o", ma=True,
                  act=[a(0, mat="cung"), a(0.3, mat="soc"), a(0.6, mat="soc-lon", mieng="hoang")])],
         chu=[tay("(ngược)", vi_tri="tren", tai=0.25)]),
    shot("Toang", "chu", sfx="vine-boom", chu=[the("TOANG.", vao="phong", mau=DO)]),
    shot("Long vẽ lên cả mặt", "minh-hoa", "can",
         dien=[dv("long", 0.32, "haiTayXoe", mat="cung", mieng="cuoi-toe", ma=True, goc="ba-phan-tu",
                  act=[a(0, "haiTayXoe"), a(0.4, "gioTay", mat="cung"), a(0.8, "motTayHong", mieng="smirk")]),
               dv("nam", 0.74, "dung", mat="cham", mieng="thang", flip=True, ma=True,
                  act=[a(0, mat="cham"), a(0.4, nhin=-0.5), a(0.8, "khoanhTay", mat="gach")])],
         chu=[nhan("KÍN MẶT", tai=0.3)]),
    shot("Ông chủ quán vẽ lên con chó", "minh-hoa", "trung", sfx="rimshot",
         dien=[dv("ha-lon", 0.3, "chi", mat="cung", mieng="cuoi-toe", goc="ba-phan-tu", cam="but",
                  act=[a(0, "chi"), a(0.5, "motTayHong", mat="cung"), a(1.0, "chi", mieng="smirk")]),
               dv("cho", 0.66, "dung", mat="cham", mieng="thang", goc="nghieng", flip=True,
                  act=[a(0, mat="cham"), a(0.5, mat="gach", nhin=-0.4), a(1.0, "nhunVai", mat="chan")])],
         chu=[nhan("ĐỎ CẢ CON", tai=0.6)]),
    shot("Ngã tư có cặp đang chụp ảnh cưới", "minh-hoa", "trung", sfx="ding",
         prop=[p("den-giao-thong", 0.9, 1.0, 0.9)],
         dien=[dv("nam-lon", 0.4, "khoacVai", mat="cung", mieng="cuoi", goc="ba-phan-tu",
                  act=[a(0, "khoacVai"), a(0.5, mat="cung"), a(1.0, "vayTay")]),
               dv("ha", 0.56, "dung", mat="cung", mieng="cuoi-toe", goc="ba-phan-tu", cam="co-to",
                  act=[a(0, "dung"), a(0.5, "gioTay"), a(1.0, mat="cung", nhin=0.3)]),
               dv("trang", 0.12, "cam", co=0.9, mat="nho", mieng="thang", goc="nghieng",
                  act=[a(0, "cam"), a(0.6, mat="nham"), a(1.1, mat="nho")])]),
    shot("cô dâu cầm cờ thay hoa", "dac-ta", "can",
         dien=[dv("ha", 0.5, "gioTay", mat="cung", mieng="cuoi-toe", cam="co-to", goc="ba-phan-tu",
                  act=[a(0, "gioTay"), a(0.4, mat="cung"), a(0.8, "gioHaiTay", mieng="cuoi-toe")])],
         chu=[nhan("THAY HOA", tai=0.3)]),
    td("các bạn ạ", [a(0, "haiTayXoe", mat="cung"), a(0.3, "chi"), a(0.6, "nhunVai")]),
    shot("Ba giờ sáng Long đăng Facebook", "minh-hoa", "can",
         dien=[dv("long", 0.5, "soCam", mat="cung", mieng="cuoi-toe", cam="dien-thoai", goc="ba-phan-tu", ma=True,
                  act=[a(0, "soCam"), a(0.5, mat="nho"), a(1.0, "chi", mat="cung")])],
         chu=[kem("3:00", vi_tri="trai", tai=0.2)]),
    shot("thầy Kim thiên tài, chúng ta số một châu Á", "chu", boi_canh="man-hinh-dien-thoai", sfx="pop",
         chu=[{"noi_dung": "THẦY KIM THIÊN TÀI\nCHÚNG TA SỐ 1 CHÂU Á", "kieu": "tay", "vi_tri": "giua", "tai": 0.1}]),
    shot("Mẹ Long bình luận", "minh-hoa", "can", sfx="error-buzz",
         dien=[dv("me", 0.5, "soCam", co=0.9, mat="khe", may="tuc", mieng="gat", cam="dien-thoai", goc="ba-phan-tu",
                  act=[a(0, "soCam"), a(0.4, mat="khe"), a(0.8, "tayHong", mieng="thang")])]),
    shot("VỀ NGỦ ĐI CON", "chu", sfx="vine-boom",
         dien=[dv("me", 0.2, "chi", co=0.8, mat="khe", may="tuc", noi=True,
                  act=[a(0, "chi"), a(0.4, "tayHong"), a(0.8, "chi")])],
         chu=[the("VỀ NGỦ\nĐI CON.", vao="phong", mau=DO, vi_tri="phai")]),
]})

# ───────────────────────── hai giải ─────────────────────────
C.append({"id": "hai-giai", "nhac": "25-silly-fun", "shots": [
    shot("Đúng một tháng sau", "chu", sfx="whoosh-short", chu=[the("MỘT THÁNG SAU", vao="tung-tu")]),
    shot("Long gọi", "minh-hoa", "can", sfx="error-buzz",
         dien=[dv("long", 0.28, "camDT", mat="cung", mieng="cuoi", cam="dien-thoai", goc="ba-phan-tu",
                  act=[a(0, "camDT"), a(0.3, mat="nho"), a(0.6, "camDT", mat="cung")]),
               dv("nam", 0.74, "camDT", mat="chan", mieng="thang", cam="dien-thoai", flip=True,
                  act=[a(0, "camDT"), a(0.3, mat="nham"), a(0.6, mat="chan")])]),
    shot("tối nay đá ASEAN Cup đấy", "chu",
         dien=[dv("long", 0.2, "camDT", co=0.9, mat="cung", cam="dien-thoai", noi=True,
                  act=[a(0, "camDT"), a(0.5, "chi"), a(1.0, "camDT")])],
         chu=[the("TỐI NAY\nĐÁ ASEAN CUP.", vao="tung-tu", vi_tri="phai")]),
    shot("Tôi bảo: mày say à", "minh-hoa", "can",
         dien=[dv("nam", 0.6, "camDT", mat="khe", mieng="smirk", cam="dien-thoai", flip=True, noi=True,
                  act=[a(0, "camDT"), a(0.4, mat="gach"), a(0.8, "motTayHong", mat="khe")])],
         chu=[kem("say à?", vi_tri="trai", tai=0.5)]),
    shot("vô địch rồi còn đá gì", "minh-hoa", "trung",
         prop=[p("cup-vo-dich", 0.24, 1.0, 1.0)],
         dien=[dv("nam", 0.6, "motTayHong", mat="cung", mieng="smirk", flip=True, cam="dien-thoai",
                  act=[a(0, "motTayHong"), a(0.4, "chi", mat="cung"), a(0.8, "khoanhTay", mieng="smirk")])]),
    shot("Ơ, hoá ra năm nay có hai giải ASEAN Cup thật", "minh-hoa", "trung", sfx="pop-high",
         prop=[p("cup-vo-dich", 0.2, 1.0, 1.0), p("cup-vo-dich", 0.8, 1.0, 1.0)],
         dien=[dv("nam", 0.5, "dung", mat="soc", mieng="o", mau="giat-minh", mau_tham_so={"tai": 0.2},
                  act=[a(0, "dung", mat="nho"), a(0.9, "omDau", mat="soc-lon", mieng="hoang"), a(1.6, nhin=-0.6), a(2.0, nhin=0.6)])],
         chu=[kem("× 2", tai=0.6)]),
    shot("Chết dở", "phan-ung", "can", sfx="record-scratch",
         prop=[p("giot-mo-hoi", 0.63, 0.42, 1.0, tai=0.1)],
         dien=[dv("nam", 0.5, "omDau", mat="soc-lon", mieng="hoang", moHoi=True,
                  act=[a(0, "omDau"), a(0.25, mat="soc"), a(0.5, mat="soc-lon")])]),
    shot("Một của AFF", "dac-ta", "sat", prop=[p("cup-vo-dich", 0.5, 0.95, 1.6)], chu=[kem("AFF", tai=0.1)]),
    shot("một của FIFA", "dac-ta", "sat", prop=[p("cup-vo-dich", 0.5, 0.95, 1.6, flip=True)], chu=[kem("FIFA", tai=0.1)]),
    shot("Cùng tên luôn", "chu", sfx="ding", chu=[the("CÙNG TÊN.", vao="phong")]),
    td("Kiểu đi học có hai bài kiểm tra trùng tên ấy các bạn",
       [a(0, "haiTayXoe", mat="oval"), a(0.6, "chi", mat="cung"), a(1.2, "chiLen"), a(1.8, "nhunVai", mieng="smirk")]),
    shot("Bài đầu mình được mười", "minh-hoa", "trung", boi_canh="lop-hoc", sfx="correct-ding",
         dien=[dv("nam", 0.5, "ngoi", mat="cung", mieng="cuoi-toe", cam="sach",
                  act=[a(0, "ngoi"), a(0.4, "gioTay", mat="cung"), a(0.8, "gioHaiTay", mieng="cuoi-toe")])],
         chu=[kem("10 ĐIỂM", tai=0.4)]),
    shot("Bài sau", "minh-hoa", "trung", sfx="suspense",
         prop=[p("ban-giao-vien", 0.3, 1.0, 1.0)],
         dien=[dv("thay", 0.3, "khoanhTay", mat="khe", may="tuc", mieng="thang", cam="la-thu",
                  act=[a(0, "khoanhTay"), a(0.3, "chi", mieng="gat"), a(0.6, mat="khe")]),
               dv("nam", 0.72, "dung", mat="soc", mieng="mim", flip=True,
                  act=[a(0, mat="nho"), a(0.3, mat="soc"), a(0.6, "epNguc", moHoi=True)])]),
    shot("mời phụ huynh", "chu", sfx="vine-boom",
         dien=[dv("thay", 0.2, "chi", co=0.8, mat="khe", may="tuc", cam="la-thu",
                  act=[a(0, "chi"), a(0.4, "khoanhTay"), a(0.8, "chi")])],
         chu=[the("MỜI\nPHỤ HUYNH.", vao="phong", mau=DO, vi_tri="phai")]),
]})

# ───────────────────────── phút bù giờ ─────────────────────────
C.append({"id": "phut-bu-gio", "nhac": "22-flutey-funk", "shots": [
    shot("Hai chín tháng chín, gặp lại Thái", "minh-hoa", "trung", boi_canh="phong-khach",
         dien=[dv("long", 0.42, "ngoi", mat="cung", mieng="cuoi", cam="co-to", goc="ba-phan-tu",
                  act=[a(0, "ngoi"), a(0.6, "chi", mat="cung"), a(1.2, "ngoi", nhin=0.6)]),
               dv("nam", 0.58, "ngoi", mat="nho", mieng="mim", goc="ba-phan-tu", flip=True,
                  act=[a(0, "ngoi"), a(0.6, nhin=-0.5), a(1.2, mat="cung")])],
         chu=[kem("29/9", tai=0.3)]),
    shot("Phút thứ mười, thủng lưới", "minh-hoa", "trung", boi_canh="san-bong", sfx="thud",
         dien=[dv("mai", 0.5, "gioTay", mat="cung", mieng="cuoi-toe", goc="ba-phan-tu", mau="nhay-mung",
                  act=[a(0, "gioTay"), a(0.5, "gioHaiTay"), a(1.0, "vayTay")])],
         chu=[kem("10'", tai=0.3)]),
    shot("Long bảo: bình tĩnh", "minh-hoa", "can",
         dien=[dv("long", 0.3, "motTayHong", mat="cung", mieng="smirk", goc="ba-phan-tu", noi=True,
                  act=[a(0, "motTayHong"), a(0.4, "chi"), a(0.8, "motTayHong", mat="nho")]),
               dv("nam", 0.74, "ngoi", mat="cham", mieng="thang", flip=True,
                  act=[a(0, "ngoi"), a(0.4, nhin=-0.5), a(0.8, mat="gach")])]),
    shot("mình chuyên gỡ phút chín mươi cộng ba", "chu",
         dien=[dv("long", 0.2, "chiLen", co=0.9, mat="cung", noi=True,
                  act=[a(0, "chiLen"), a(0.6, "motTayHong"), a(1.2, "chiLen")])],
         chu=[the("CHUYÊN GỠ\nPHÚT 90+3.", vao="tung-tu", vi_tri="phai")]),
    shot("Đúng phút chín mươi cộng ba có bàn thật", "dac-ta", "sat", sfx="drumroll",
         prop=[p("man-hinh", 0.5, 0.95, 1.3, chu="90+3'")], zoom={"tu": 1, "den": 1.1}),
    td("các bạn ạ", [a(0, "chi", mat="oval"), a(0.3, "haiTayXoe"), a(0.6, "nhunVai", mieng="smirk")]),
    shot("Thái ghi", "chu", sfx="vine-boom",
         dien=[dv("mai", 0.2, "gioHaiTay", co=0.9, mat="cung", mieng="cuoi-toe",
                  act=[a(0, "gioHaiTay"), a(0.3, "gioTay"), a(0.6, "gioHaiTay")])],
         chu=[the("THÁI GHI.", vao="phong", mau=DO, vi_tri="phai")]),
    shot("Thua hai không", "phan-ung", "can",
         dien=[dv("long", 0.5, "dung", mat="soc-lon", mieng="hoang", goc="ba-phan-tu",
                  act=[a(0, mat="soc"), a(0.3, mat="soc-lon"), a(0.6, "omDau")])],
         chu=[kem("0 – 2", vi_tri="trai", tai=0.2)]),
    shot("Tháng tám họ tặng mình một bàn bù giờ", "minh-hoa", "trung",
         dien=[dv("mai", 0.3, "chi", mat="cung", mieng="cuoi", cam="la-thu", goc="ba-phan-tu",
                  act=[a(0, "chi"), a(0.8, cam="", dang="vayTay"), a(1.4, mat="cung")]),
               dv("nam", 0.7, "dung", mat="soc", mieng="o", flip=True, goc="ba-phan-tu",
                  act=[a(0, mat="nho"), a(0.8, cam="la-thu", dang="epNguc", mat="cung"), a(1.4, mieng="cuoi-toe")])],
         chu=[kem("THÁNG 8", tai=0.2)]),
    shot("tháng chín họ đòi", "minh-hoa", "trung",
         dien=[dv("mai", 0.3, "khoanhTay", mat="khe", mieng="smirk", goc="ba-phan-tu",
                  act=[a(0, "khoanhTay"), a(0.4, "chi", cam="la-thu"), a(0.8, "tayHong")]),
               dv("nam", 0.7, "epNguc", mat="soc", mieng="hoang", flip=True, cam="la-thu",
                  act=[a(0, "epNguc"), a(0.4, cam="", dang="nhunVai"), a(0.8, mat="xoan")])],
         chu=[kem("THÁNG 9", tai=0.2)]),
    shot("Kèm lãi", "chu", sfx="cash-register", chu=[the("KÈM LÃI.", vao="phong", mau=DO)]),
    shot("Xong Long tắt tivi đi về", "minh-hoa", "trung", boi_canh="phong-khach",
         dien=[dv("long", 0.55, "quayLung", mat="khe", mieng="thang", goc="sau", mau="ra-di",
                  mau_tham_so={"tai": 0.5, "huong": "phai"}, act=[a(0, "quayLung"), a(0.3, goc="sau"), a(0.5, mat="khe")]),
               dv("nam", 0.4, "ngoi", mat="soc", mieng="o", goc="ba-phan-tu",
                  act=[a(0, "ngoi"), a(0.5, nhin=0.6), a(1.0, mat="soc-lon")])]),
    shot("Tivi nhà tôi", "tieu-canh", "nho", sfx="deflate",
         prop=[p("tivi", 0.7, 0.66, 0.6)],
         dien=[dv("nam", 0.42, "ngoi", mat="cham", mieng="thang",
                  act=[a(0, "ngoi"), a(0.4, mat="nham"), a(0.8, mat="cham", nhin=0.5)])],
         chu=[tay("tivi nhà tôi...", tai=0.3)]),
]})

# ───────────────────────── malaysia ─────────────────────────
C.append({"id": "malaysia", "nhac": "14-heavy-heart", "shots": [
    shot("Xong tranh hạng ba với Malaysia", "minh-hoa", "trung", boi_canh="san-bong", sfx="whistle-up",
         dien=[dv("tho", 0.32, "tayHong", mat="khe", mieng="thang", goc="ba-phan-tu",
                  act=[a(0, "tayHong"), a(0.6, mat="khe"), a(1.2, "khoanhTay")]),
               dv("gau", 0.68, "khoanhTay", mat="khe", mieng="smirk", goc="ba-phan-tu", flip=True,
                  act=[a(0, "khoanhTay"), a(0.6, "motTayHong"), a(1.2, mat="cung")])],
         chu=[kem("TRANH HẠNG 3", tai=0.3)]),
    td("Nhắc anh em nhớ nhá", [a(0, "chi", mat="oval"), a(0.4, "chiLen"), a(0.8, "motTayHong", mieng="smirk")]),
    shot("năm ngoái họ thắng mình bốn không", "minh-hoa", "trung",
         dien=[dv("gau", 0.4, "gioHaiTay", mat="cung", mieng="cuoi-toe", mau="nhay-mung",
                  act=[a(0, "gioHaiTay"), a(0.5, "vayTay"), a(1.0, "gioTay")]),
               dv("tho", 0.74, "cuiNguoi", mat="nham", mieng="meu", flip=True,
                  act=[a(0, "cuiNguoi"), a(0.5, mat="chan"), a(1.0, "gaiDau")])],
         chu=[kem("2025: 4 – 0", tai=0.3)]),
    shot("rồi bị xử thua", "minh-hoa", "trung", sfx="error-buzz",
         prop=[p("bang-hieu", 0.76, 1.0, 0.9, chu="XỬ THUA 0–3")],
         dien=[dv("gau", 0.4, "dung", mat="soc", mieng="o", mau="giat-minh",
                  act=[a(0, "gioHaiTay", mat="cung"), a(0.3, "dung", mat="soc"), a(0.6, mat="soc-lon")])]),
    shot("vì bảy bộ hồ sơ nhập tịch làm giả", "dac-ta", "trung", sfx="pop",
         prop=[p("tu-ho-so", 0.16, 1.0, 0.9),
               p("to-giay", 0.36, 0.72, 0.7, chu="GIẢ", tai=0.3), p("to-giay", 0.52, 0.72, 0.7, chu="GIẢ", tai=0.5),
               p("to-giay", 0.68, 0.72, 0.7, chu="GIẢ", tai=0.7), p("to-giay", 0.84, 0.72, 0.7, chu="GIẢ", tai=0.9)],
         chu=[kem("× 7 HỒ SƠ", tai=0.2)]),
    shot("Lần này họ thắng một không", "minh-hoa", "trung", boi_canh="san-bong", sfx="whistle-down",
         dien=[dv("gau", 0.36, "gioHaiTay", mat="cung", mieng="cuoi-toe", goc="ba-phan-tu",
                  act=[a(0, "gioHaiTay"), a(0.5, "vayTay"), a(1.0, "gioTay")]),
               dv("tho", 0.66, "cuiNguoi", mat="nham", mieng="meu", flip=True,
                  act=[a(0, "cuiNguoi"), a(0.5, "gaiDau"), a(1.0, "nhunVai", mat="chan")])],
         chu=[kem("1 – 0", tai=0.3)]),
    shot("Ít bàn hơn", "phan-ung", "can",
         dien=[dv("nam", 0.5, "khoanhTay", mat="chan", mieng="smirk", mau="gat-gu",
                  act=[a(0, "khoanhTay"), a(0.3, mat="gach"), a(0.6, mat="chan")])]),
    shot("Nhưng giấy tờ thật", "dac-ta", "sat", sfx="correct-ding",
         prop=[p("to-giay", 0.5, 0.95, 1.5, chu="THẬT")]),
    shot("Họ được thưởng gần bảy tỷ", "minh-hoa", "trung", sfx="cash-register",
         prop=[p("tien-giay", 0.72, 1.0, 1.2), p("tien-giay", 0.84, 1.0, 1.0)],
         dien=[dv("gau", 0.4, "gioHaiTay", mat="cung", mieng="cuoi-toe", mau="nhay-mung",
                  act=[a(0, "gioHaiTay"), a(0.5, "chi"), a(1.0, "gioHaiTay")])],
         chu=[kem("~ 7 TỶ", tai=0.3)]),
    shot("Thủ tướng họ gửi lời chúc mừng", "minh-hoa", "can",
         dien=[dv("gau", 0.5, "soCam", mat="cung", mieng="cuoi", cam="la-thu", goc="ba-phan-tu",
                  act=[a(0, "soCam"), a(0.5, mat="cung", ma=True), a(1.0, "gioTay")])],
         chu=[tay("chúc mừng!", tai=0.4)]),
    td("Mình được thưởng gì?", [a(0, "nhunVai", mat="oval"), a(0.4, "haiTayXoe"), a(0.8, "nhunVai", mieng="meu")]),
    shot("Một đêm cãi nhau trên mạng", "minh-hoa", "can", sfx="sad-trombone",
         dien=[dv("nam", 0.3, "soCam", mat="khe", may="tuc", mieng="gat", cam="dien-thoai", goc="ba-phan-tu",
                  act=[a(0, "soCam"), a(0.5, "goMay"), a(1.0, mat="nham"), a(1.5, "soCam", mat="khe")]),
               dv("long", 0.72, "soCam", mat="khe", may="tuc", mieng="gat", cam="dien-thoai", flip=True,
                  act=[a(0, "soCam"), a(0.6, "goMay"), a(1.2, mat="nham"), a(1.8, mat="khe")])],
         chu=[tay("!!! ?! !!!", vi_tri="tren", tai=0.4)]),
]})

# ───────────────────────── chúng ta ─────────────────────────
C.append({"id": "chung-ta", "nhac": "26-style-funk", "shots": [
    shot("Sáng hôm sau Long đăng", "minh-hoa", "can",
         dien=[dv("long", 0.5, "soCam", mat="khe", may="tuc", mieng="gat", cam="dien-thoai", goc="ba-phan-tu",
                  act=[a(0, "soCam"), a(0.4, "goMay"), a(0.8, "soCam", mat="khe")])],
         chu=[kem("SÁNG HÔM SAU", vi_tri="trai", tai=0.2)]),
    shot("các anh ấy đá như đi dạo", "chu", boi_canh="man-hinh-dien-thoai", sfx="pop",
         chu=[{"noi_dung": "CÁC ANH ẤY\nĐÁ NHƯ ĐI DẠO", "kieu": "tay", "vi_tri": "giua", "tai": 0.1}]),
    shot("Các anh ấy", "phan-ung", "can", sfx="record-scratch",
         dien=[dv("nam", 0.5, "khoanhTay", mat="khe", mieng="smirk",
                  act=[a(0, "khoanhTay"), a(0.3, mat="gach"), a(0.6, mat="khe", nhin=-0.4)])],
         chu=[tay("các anh ấy?", tai=0.2)]),
    shot("Tháng tám còn là chúng ta cơ mà", "minh-hoa", "trung", boi_canh="quan-nhau",
         prop=[p("ghe-nha-hang", 0.42, 1.0, 1.0)],
         dien=[dv("long", 0.42, "gioHaiTay", mat="cung", mieng="cuoi-toe", y=0.86, cam="co-to",
                  act=[a(0, "gioHaiTay"), a(0.5, "gioTay"), a(1.0, "gioHaiTay")])],
         chu=[kem("THÁNG 8: CHÚNG TA", tai=0.3)]),
    td("Ơ nhưng mà các bạn ơi", [a(0, "haiTayXoe", mat="oval"), a(0.4, "chi", mat="cung"), a(0.8, "chiLen")]),
    shot("mình vẫn có vé Asian Cup", "dac-ta", "sat", sfx="ding",
         prop=[p("to-giay", 0.5, 0.95, 1.4, chu="VÉ ASIAN CUP 2027")]),
    shot("nhất bảng, mười tám điểm tuyệt đối", "minh-hoa", "trung", sfx="airhorn",
         prop=[p("bang-hieu", 0.22, 1.0, 0.9, chu="BẢNG F: NHẤT")],
         dien=[dv("nam", 0.6, "gioHaiTay", mat="cung", mieng="cuoi-toe", flip=True, mau="nhay-mung", cam="co-to",
                  act=[a(0, "gioHaiTay"), a(0.5, "gioTay"), a(1.0, "gioHaiTay")])],
         chu=[kem("18 ĐIỂM", tai=0.5)]),
    shot("Ba điểm trong đó do phòng hồ sơ ghi bàn", "minh-hoa", "trung", sfx="boing",
         prop=[p("tu-ho-so", 0.24, 1.0, 1.0), p("bong-da", 0.42, 0.62, 0.8, tai=0.9)],
         dien=[dv("nam", 0.7, "dung", mat="soc", mieng="o", flip=True,
                  act=[a(0, mat="nho"), a(0.9, mat="soc", mieng="o"), a(1.5, "chi", mat="soc-lon")])],
         chu=[nhan("+3 ĐIỂM", tai=1.0)]),
    shot("Long lại đổi về chúng ta", "minh-hoa", "can",
         dien=[dv("long", 0.3, "vayTay", mat="cung", mieng="cuoi-toe", cam="co-to", goc="ba-phan-tu",
                  act=[a(0, "vayTay"), a(0.4, "gioTay"), a(0.8, "vayTay")]),
               dv("nam", 0.74, "khoanhTay", mat="khe", mieng="smirk", flip=True,
                  act=[a(0, "khoanhTay"), a(0.4, mat="gach"), a(0.8, mat="khe", nhin=-0.5)])],
         chu=[kem("CHÚNG TA", tai=0.3)]),
    td("Còn bạn, đi bão mấy lần?", [a(0, "chi", mat="oval"), a(0.5, "haiTayXoe", mat="cung"), a(1.0, "chi", mieng="smirk")]),
    shot("Kể dưới bình luận", "chu", sfx="pop",
         prop=[p("mui-ten", 0.5, 0.82, 0.8)],
         chu=[the("KỂ DƯỚI\nBÌNH LUẬN.", vao="tung-tu")]),
]})

# ───────────────────────── vòng 2: sửa theo kiem-tra-v2 ─────────────────────────
# (a) thẻ chữ ≤ 15% → đổi bớt sang cảnh có người + ô chèn; (b) ≥ 35% shot hai người;
# (c) ≥ 15% shot có zoom mượt. Vá theo `say` để bản nháp phía trên vẫn đọc được.
def chen_chu(text, x=0.26, y=0.3, tai=0.2, dai=1.2, nen="#ffd400", xoay=-3):
    return {"chu": text, "nen": nen, "x": x, "y": y, "tai": tai, "dai": dai, "xoay": xoay, "co": 0.3}

def Z(den=1.07, tu=1.0):
    return {"tu": tu, "den": den}

PATCH = {
    # mở bài
    "Ba giờ sáng": lambda s: {**s, "dien": s["dien"] + [dv("cho", 0.7, "ngoi", mat="cham", mieng="thang", goc="nghieng", flip=True,
        act=[a(0, "ngoi"), a(0.5, mat="nham"), a(0.9, nhin=-0.4, mat="cham")])]},
    "tôi ngồi vỉa hè, mặt vẽ cờ": lambda s: {**s, "zoom": Z(1.06), "dien": s["dien"] + [dv("cho", 0.7, "ngoi", mat="cham", mieng="thang",
        goc="nghieng", flip=True, act=[a(0, "ngoi"), a(0.6, mat="nham"), a(1.2, nhin=-0.5)])]},
    "cổ động viên ruột": lambda s: {**s, "dien": [dict(s["dien"][0], x=0.38), dv("long", 0.68, "gioHaiTay", mat="cung", mieng="cuoi-toe",
        flip=True, cam="co-to", act=[a(0, "gioHaiTay"), a(0.4, "gioTay"), a(0.8, "gioHaiTay")])]},
    "xem bóng thì dốt": lambda s: {**s, "dien": s["dien"] + [dv("long", 0.86, "chi", mat="khe", mieng="gat", flip=True,
        act=[a(0, "chi"), a(0.4, "tayHong", mat="khe"), a(0.8, "chi")])]},
    "đi bão thì chăm": lambda s: {**s, "dien": s["dien"] + [
        dv("trang", 0.15, "chay2", co=0.9, mat="cung", mieng="cuoi-toe", cam="co-to", mau="chay-den", mau_tham_so={"den": 0.55},
           act=[a(0, "chay2"), a(0.4, mat="cung"), a(0.8, "gioTay")])]},
    "Hôm nay kể các bạn chuyện bốn mươi ngày": lambda s: {**{k: v for k, v in s.items() if k != "chu"},
        "chen": [chen_chu("40 NGÀY", tai=0.6)]},
    # đêm chung kết
    "Đêm hai sáu tháng tám nhá": lambda s: shot("Đêm hai sáu tháng tám nhá", "minh-hoa", "rong", boi_canh="quan-nhau", sfx="whoosh-short",
        zoom=Z(1.06), dien=[dv("long", 0.4, "di1", mat="cung", mieng="cuoi", mau="vao-di", mau_tham_so={"huong": "trai", "tai": 0},
                                act=[a(0.9, "dung", mat="cung"), a(1.2, "chi")]),
                             dv("nam", 0.56, "di1", mat="nho", mieng="cuoi-nhe", cam="ken", mau="vao-di", mau_tham_so={"huong": "trai", "tai": 0.15},
                                act=[a(1.0, "dung", mat="cung"), a(1.3, "gioTay")])],
        chen=[chen_chu("ĐÊM 26/8", x=0.8, y=0.24, tai=0.3)]),
    "Long úp mặt khóc": lambda s: {**s, "dien": [dict(s["dien"][0], x=0.38), dv("nam", 0.74, "ngoi", mat="soc", mieng="o", flip=True,
        act=[a(0, "ngoi"), a(0.35, "epNguc", mat="soc"), a(0.7, mat="xoan")])]},
    "hết rồi mày ơi": lambda s: shot("hết rồi mày ơi", "minh-hoa", "can",
        dien=[dv("long", 0.34, "omDau", mat="xoan", mieng="hoang", noi=True, goc="ba-phan-tu",
                 act=[a(0, "omDau"), a(0.4, "cuiNguoi", mat="nham"), a(0.8, "omDau", mat="xoan")]),
              dv("nam", 0.76, "ngoi", mat="chan", mieng="meu", flip=True, act=[a(0, "ngoi"), a(0.4, nhin=-0.6), a(0.8, mat="xoan")])],
        chu=[kem("Hết rồi mày ơi.", vi_tri="tren", tai=0.15)]),
    "Tôi khóc theo": lambda s: {**s, "dien": [dict(s["dien"][0], x=0.62, flip=True), dv("long", 0.26, "ngoiGuc", mat="nham", mieng="meu",
        act=[a(0, "ngoiGuc"), a(0.3, mat="xoan"), a(0.6, mat="nham")])]},
    "tổng hai trận mình vẫn dẫn": lambda s: shot("tổng hai trận mình vẫn dẫn", "minh-hoa", "can", sfx="correct-ding",
        dien=[dv("long", 0.34, "ngoiGuc", mat="nham", mieng="meu", act=[a(0, "ngoiGuc"), a(0.5, mat="xoan"), a(1.0, "omDau")]),
              dv("nam", 0.74, "ngoiGuc", mat="xoan", mieng="meu", flip=True, act=[a(0, "ngoiGuc"), a(0.5, mat="nham"), a(1.0, "omDau")])],
        chen=[chen_chu("TỔNG 3 – 2", x=0.5, y=0.22, tai=0.3, dai=1.3, xoay=2)]),
    "cầu thủ Thái đánh đầu vào lưới nhà": lambda s: {**s, "zoom": Z(1.08)},
    "Long trèo lên ghế hét": lambda s: {**s, "zoom": Z(1.08)},
    # đi bão
    "Xong nhá, cả phố đổ ra đường": lambda s: {**s, "zoom": Z(1.06)},
    "Tôi vẽ cờ lên má": lambda s: {**s, "dien": [dict(s["dien"][0], x=0.36), dv("long", 0.74, "chi", mat="cung", mieng="cuoi-toe", flip=True,
        ma=True, act=[a(0, "chi"), a(0.35, "motTayHong"), a(0.7, "chi", mat="cung")])]},
    "Ngã tư có cặp đang chụp ảnh cưới": lambda s: {**s, "zoom": Z(1.07)},
    "Ba giờ sáng Long đăng Facebook": lambda s: {**s, "dien": [dict(s["dien"][0], x=0.36), dv("nam", 0.76, "dung", mat="nham", mieng="o",
        flip=True, mau="ngu-gat", act=[a(0, "dung"), a(0.6, mat="nham"), a(1.2, mat="chan")])]},
    # hai giải
    "Đúng một tháng sau": lambda s: shot("Đúng một tháng sau", "tieu-canh", "nho", sfx="whoosh-short",
        prop=[p("ghe-sofa", 0.5, 0.66, 0.7)],
        dien=[dv("nam", 0.5, "ngoi", mat="chan", mieng="thang", act=[a(0, "ngoi"), a(0.4, mat="nham"), a(0.8, mat="chan")])],
        chen=[chen_chu("1 THÁNG SAU", x=0.5, y=0.25, tai=0.1, xoay=0)]),
    "tối nay đá ASEAN Cup đấy": lambda s: shot("tối nay đá ASEAN Cup đấy", "minh-hoa", "can",
        dien=[dv("long", 0.4, "camDT", mat="cung", mieng="cuoi-toe", cam="dien-thoai", noi=True, goc="ba-phan-tu",
                 act=[a(0, "camDT"), a(0.5, "chi"), a(1.0, "camDT", mat="cung")])],
        chu=[kem("Tối nay đá ASEAN Cup.", vi_tri="tren", tai=0.15)]),
    "Cùng tên luôn": lambda s: shot("Cùng tên luôn", "phan-ung", "can", sfx="ding",
        dien=[dv("nam", 0.5, "gaiDau", mat="gach", mieng="meu", act=[a(0, "gaiDau"), a(0.3, nhin=-0.5), a(0.6, nhin=0.5)])],
        chen=[chen_chu("CÙNG TÊN", x=0.2, y=0.3, tai=0.1, dai=1.0)]),
    "Kiểu đi học có hai bài kiểm tra trùng tên ấy các bạn": lambda s: {**s,
        "chen": [{"prop": "to-giay", "x": 0.25, "y": 0.42, "co": 0.3, "tai": 0.6, "dai": 1.5, "xoay": -3}]},
    "Bài đầu mình được mười": lambda s: {**s, "zoom": Z(1.06), "dien": [dict(s["dien"][0], x=0.4),
        dv("long", 0.7, "ngoi", mat="khe", mieng="gat", flip=True, act=[a(0, "ngoi"), a(0.4, nhin=-0.6, mat="khe"), a(0.8, "khoanhTay")])]},
    # phút bù giờ
    "Hai chín tháng chín, gặp lại Thái": lambda s: {**s, "zoom": Z(1.06)},
    "Phút thứ mười, thủng lưới": lambda s: {**s, "zoom": Z(1.07), "dien": [dict(s["dien"][0], x=0.36),
        dv("tho", 0.74, "cuiNguoi", mat="nham", mieng="meu", flip=True, act=[a(0, "cuiNguoi"), a(0.5, "gaiDau"), a(1.0, mat="chan")])]},
    "mình chuyên gỡ phút chín mươi cộng ba": lambda s: shot("mình chuyên gỡ phút chín mươi cộng ba", "minh-hoa", "can",
        dien=[dv("long", 0.34, "chiLen", mat="cung", mieng="smirk", noi=True, goc="ba-phan-tu",
                 act=[a(0, "chiLen"), a(0.6, "motTayHong"), a(1.2, "chiLen", mat="cung")]),
              dv("nam", 0.76, "ngoi", mat="gach", mieng="thang", flip=True, act=[a(0, "ngoi"), a(0.6, nhin=-0.5), a(1.2, mat="cham")])],
        chen=[chen_chu("CHUYÊN GỠ 90+3", x=0.5, y=0.2, tai=0.5, dai=1.4, xoay=2)]),
    "Thua hai không": lambda s: {**s, "dien": [dict(s["dien"][0], x=0.36), dv("nam", 0.74, "omDau", mat="soc", mieng="hoang", flip=True,
        act=[a(0, "omDau"), a(0.3, mat="soc-lon"), a(0.6, "cuiNguoi")])]},
    "Tháng tám họ tặng mình một bàn bù giờ": lambda s: {**s, "zoom": Z(1.06)},
    # malaysia
    "Xong tranh hạng ba với Malaysia": lambda s: {**s, "zoom": Z(1.06)},
    "rồi bị xử thua": lambda s: {**s, "dien": s["dien"] + [dv("tho", 0.16, "khoanhTay", mat="khe", mieng="smirk", goc="ba-phan-tu",
        act=[a(0, "khoanhTay"), a(0.3, mat="gach"), a(0.6, "motTayHong")])]},
    "Ít bàn hơn": lambda s: {**s, "dien": [dict(s["dien"][0], x=0.36), dv("long", 0.74, "gaiDau", mat="cham", mieng="meu", flip=True,
        act=[a(0, "gaiDau"), a(0.3, mat="gach"), a(0.6, "nhunVai")])]},
    "Họ được thưởng gần bảy tỷ": lambda s: {**s, "zoom": Z(1.07), "dien": s["dien"] + [dv("tho", 0.16, "cuiNguoi", mat="nham", mieng="meu",
        act=[a(0, "cuiNguoi"), a(0.5, mat="chan"), a(1.0, "gaiDau")])]},
    "Thủ tướng họ gửi lời chúc mừng": lambda s: {**s, "dien": [dict(s["dien"][0], x=0.36), dv("trang", 0.74, "vayTay", co=0.85, mat="cung",
        mieng="cuoi-toe", flip=True, act=[a(0, "vayTay"), a(0.5, "gioTay"), a(1.0, "vayTay")])]},
    "Mình được thưởng gì?": lambda s: {**s, "chen": [chen_chu("THƯỞNG: ?", x=0.26, y=0.3, tai=0.3, dai=1.0)]},
    "Một đêm cãi nhau trên mạng": lambda s: {**s, "zoom": Z(1.08)},
    # chúng ta
    "Sáng hôm sau Long đăng": lambda s: {**s, "dien": [dict(s["dien"][0], x=0.36), dv("nam", 0.76, "soCam", mat="nho", mieng="thang",
        flip=True, cam="dien-thoai", act=[a(0, "soCam"), a(0.4, mat="gach"), a(0.8, mat="khe")])]},
    "Tháng tám còn là chúng ta cơ mà": lambda s: {**s, "zoom": Z(1.0, tu=1.1), "dien": s["dien"] + [dv("nam", 0.74, "gioTay", mat="cung",
        mieng="cuoi-toe", flip=True, mau="nhay-mung", act=[a(0, "gioTay"), a(0.5, "gioHaiTay"), a(1.0, "gioTay")])]},
    "nhất bảng, mười tám điểm tuyệt đối": lambda s: {**s, "zoom": Z(1.07), "dien": s["dien"] + [dv("long", 0.84, "gioHaiTay", mat="cung",
        mieng="cuoi-toe", flip=True, cam="co-to", act=[a(0, "gioHaiTay"), a(0.5, "vayTay"), a(1.0, "gioHaiTay")])]},
    "Ba điểm trong đó do phòng hồ sơ ghi bàn": lambda s: {**s, "zoom": Z(1.07), "dien": s["dien"] + [dv("long", 0.88, "dung", mat="soc",
        mieng="o", flip=True, act=[a(0, mat="nho"), a(0.9, mat="soc-lon"), a(1.5, "omDau")])]},
}

for ch in C:
    out = []
    for s in ch["shots"]:
        f = PATCH.get(s.get("say"))
        out.append(f(s) if f else s)
    ch["shots"] = out

# ── vòng 3: sửa theo still soát (cờ vô hình, ngồi lơ lửng, Long mất đầu, quà vô hình) ──
DO_CAM["co-to"] = {"moTa": "cờ đỏ sao vàng cầm tay, cán dài", "dai": 1.7, "nam": "doc",
    "hinh": [{"loai": "gach", "x1": 0, "y1": -0.15, "x2": 0, "y2": 1.65},
             {"loai": "hop", "x": 0, "y": 0.95, "w": 1.1, "h": 0.7, "bo": 0.01},
             {"loai": "to", "d": "M 0 0.95 L 1.1 0.95 L 1.1 1.65 L 0 1.65 Z", "mau": "#f81000"},
             {"loai": "to", "d": "M 0.55 1.07 L 0.6 1.23 L 0.76 1.23 L 0.63 1.32 L 0.68 1.48 L 0.55 1.38 L 0.42 1.48 L 0.47 1.32 L 0.34 1.23 L 0.5 1.23 Z", "mau": "#f7e7a9"},
             {"loai": "net", "d": "M 0 0.95 L 1.1 0.95 L 1.1 1.65 L 0 1.65 Z"}]}

CHAN_Y = {"nho": 0.66, "rong": 0.84, "trung": 1.0}
PHONG_KHACH = [p("ghe-sofa", 0.5, 1.0, 1.0), p("tivi", 0.86, 1.0, 1.0), p("dong-ho", 0.5, 0.24, 0.8)]
for ch in C:
    for s in ch["shots"]:
        if s.get("boi_canh") == "phong-khach":
            s.pop("boi_canh"); s["prop"] = PHONG_KHACH + s.get("prop", [])
            continue
        co = s.get("co", "trung")
        if co not in CHAN_Y or s.get("boi_canh") == "lop-hoc" or s.get("say") in ("Đúng một tháng sau",):
            continue
        for d in s.get("dien", []):
            dang0 = (d.get("act") or [{}])[0].get("dang", d.get("dang"))
            if dang0 in ("ngoi", "ngoiGuc", "ngoiGoBan", "chongCam"):
                ten = "ghe-sofa" if s.get("say") == "Tivi nhà tôi" else "ghe-nha-hang"
                s.setdefault("prop", []).append(p(ten, d["x"], CHAN_Y[co], 1.0))
        if s.get("say") in ("Long trèo lên ghế hét", "Tháng tám còn là chúng ta cơ mà"):
            for d in s["dien"]:
                if d["kieu"] == "long": d["co"] = 0.82
        if s.get("say") == "Tháng tám họ tặng mình một bàn bù giờ":
            s["chen"] = [{"prop": "bong-da", "x": 0.5, "y": 0.4, "co": 0.1, "tai": 0.6, "dai": 1.4}]
        if s.get("say") == "tháng chín họ đòi":
            s["chen"] = [{"prop": "bong-da", "x": 0.4, "y": 0.4, "co": 0.1, "tai": 0.4, "dai": 1.2},
                         {"prop": "bong-da", "x": 0.48, "y": 0.42, "co": 0.1, "tai": 0.7, "dai": 0.9}]

# ── vòng 4: sửa theo still soát lần 2 ──
for ch in C:
    for s in ch["shots"]:
        say = s.get("say")
        for d in s.get("dien", []):  # người ngồi cầm cờ → cờ chĩa xuống đất: bỏ cờ
            if d.get("cam") == "co-to" and (d.get("act") or [{}])[0].get("dang", d.get("dang")) in ("ngoi", "ngoiGuc"):
                d.pop("cam")
        if say == "mời phụ huynh":  # chữ phóng tràn mép khi kèm nhân vật → bỏ nhân vật, chữ giữa
            s.pop("dien", None); s["chu"][0].pop("vi_tri", None)
        if say == "cô dâu cầm cờ thay hoa":
            s.update({"loai": "minh-hoa", "co": "rong", "zoom": Z(1.06),
                      "dien": [dv("ha", 0.42, "gioTay", mat="cung", mieng="cuoi-toe", cam="co-to", goc="ba-phan-tu",
                                  act=[a(0, "gioTay"), a(0.4, mat="cung"), a(0.8, "gioHaiTay", mieng="cuoi-toe")]),
                               dv("nam-lon", 0.66, "khoacVai", mat="cung", mieng="cuoi", flip=True, goc="ba-phan-tu",
                                  act=[a(0, "khoacVai"), a(0.5, "vayTay"), a(1.0, "khoacVai")])],
                      "chu": [nhan("THAY HOA", tai=0.3)]})
        if say == "Tháng tám còn là chúng ta cơ mà":
            s.pop("chu", None); s["chen"] = [chen_chu("THÁNG 8: CHÚNG TA", x=0.22, y=0.2, tai=0.3, dai=1.5, xoay=2)]
        if say == "Hai chín tháng chín, gặp lại Thái":
            s.pop("chu", None); s["chen"] = [chen_chu("29/9", x=0.18, y=0.24, tai=0.3, dai=1.4)]
        if s.get("prop"):
            for q in s["prop"]:
                if q["ten"] == "dong-ho" and q["x"] == 0.5 and q["y"] == 0.24:
                    q.update({"x": 0.86, "y": 0.2})

# ── vòng 5: cham-diem 18/20 — rớt "shot < 1 s" (17%) và "nền khác nhau" (1) ──
DEM = {"tren": "#1c2340", "duoi": "#46578f"}
SAN = {"tren": "#bfe0f5", "duoi": "#cfe8b8"}
NEN = {
    "Ba giờ sáng": DEM, "tôi ngồi vỉa hè": DEM, "Ba giờ sáng Long đăng Facebook": DEM,
    "cả phố đổ ra đường": DEM, "Ngã tư có cặp đang chụp ảnh cưới": DEM, "cô dâu cầm cờ thay hoa": DEM,
    "cầu thủ Thái đánh đầu": SAN, "Phút thứ mười": SAN, "Xong tranh hạng ba với Malaysia": SAN, "Lần này họ thắng một không": SAN,
    "Chúng ta vô địch": {"mau": "#ffd400", "hoa_tiet": "toa"}, "VỀ NGỦ ĐI CON": {"mau": "#f6c9d4", "hoa_tiet": "cham"},
    "Toang": {"mau": "#f2843c", "hoa_tiet": "cheo"}, "Thái ghi": {"mau": "#bfe0f5", "hoa_tiet": "toa"},
    "Kèm lãi": {"mau": "#ffd400", "hoa_tiet": "cheo"}, "mời phụ huynh": {"mau": "#f6c9d4", "hoa_tiet": "song"},
    "vừa hạng tư": {"mau": "#bfe0f5", "hoa_tiet": "cheo"}, "Kể dưới bình luận": {"mau": "#ffd400", "hoa_tiet": "cham"},
    "Một đêm cãi nhau trên mạng": "#f2e8d5",
}
# tách shot dài: lời gốc → (lời phần đầu, shot ngắn chen sau)
SPLIT = {
    "tôi ngồi vỉa hè, mặt vẽ cờ": ("tôi ngồi vỉa hè", shot("mặt vẽ cờ", "dac-ta", "sat", sfx="pop",
        dien=[dv("nam", 0.5, "dung", mat="chan", mieng="meu", ma=True, act=[a(0, mat="chan"), a(0.3, mat="nham"), a(0.6, mat="chan")])])),
    "Phút chín mươi, thua một hai": ("Phút chín mươi", shot("thua một hai", "phan-ung", "can", sfx="error-buzz",
        dien=[dv("nam", 0.5, "epNguc", mat="soc-lon", mieng="hoang", moHoi=True, act=[a(0, "epNguc"), a(0.3, mat="soc"), a(0.6, mat="soc-lon")])])),
    "cầu thủ Thái đánh đầu vào lưới nhà": ("cầu thủ Thái đánh đầu", shot("vào lưới nhà", "dac-ta", "trung", sfx="boom",
        prop=[p("khung-thanh", 0.5, 1.0, 1.0), p("bong-da", 0.48, 0.78, 0.9)])),
    "Xong nhá, cả phố đổ ra đường": ("Xong nhá", None),  # phần sau tách thành shot đám đông riêng bên dưới
    "Ông chủ quán vẽ lên con chó": ("Ông chủ quán vẽ lên", shot("con chó", "phan-ung", "can", sfx="rimshot",
        dien=[dv("cho", 0.5, "dung", mat="cham", mieng="thang", goc="ba-phan-tu", act=[a(0, mat="cham"), a(0.3, mat="gach"), a(0.6, mat="chan")])])),
    "Ngã tư có cặp đang chụp ảnh cưới": ("Ngã tư có cặp đang", shot("chụp ảnh cưới", "dac-ta", "can", sfx="pop-high",
        dien=[dv("trang", 0.5, "cam", co=0.9, mat="nham", mieng="thang", goc="nghieng", act=[a(0, "cam"), a(0.3, mat="nho"), a(0.6, mat="nham")])],
        prop=[p("may-anh", 0.62, 0.62, 1.0)])),
    "Ba giờ sáng Long đăng Facebook": ("Ba giờ sáng Long đăng", shot("Facebook", "dac-ta", "sat", sfx="ding",
        prop=[p("dien-thoai", 0.5, 0.95, 0.9)])),
    "Ơ, hoá ra năm nay có hai giải ASEAN Cup thật": ("Ơ, hoá ra", shot("năm nay có hai giải ASEAN Cup thật", "minh-hoa", "trung", sfx="pop-high",
        prop=[p("cup-vo-dich", 0.2, 1.0, 1.0), p("cup-vo-dich", 0.8, 1.0, 1.0)],
        dien=[dv("nam", 0.5, "omDau", mat="soc-lon", mieng="hoang", act=[a(0, "omDau"), a(0.6, nhin=-0.6), a(1.0, nhin=0.6), a(1.4, mat="soc")])],
        chen=[chen_chu("× 2", x=0.5, y=0.2, tai=0.3, dai=1.2, xoay=0)])),
    "Kiểu đi học có hai bài kiểm tra trùng tên ấy các bạn": ("Kiểu đi học có hai bài kiểm tra", shot("trùng tên ấy các bạn", "dac-ta", "trung",
        prop=[p("to-giay", 0.36, 0.9, 1.2, chu="KIỂM TRA"), p("to-giay", 0.64, 0.9, 1.2, chu="KIỂM TRA")])),
    "Phút thứ mười, thủng lưới": ("Phút thứ mười", shot("thủng lưới", "dac-ta", "trung", sfx="thud",
        prop=[p("khung-thanh", 0.5, 1.0, 1.0), p("bong-da", 0.56, 0.8, 0.9)])),
    "Đúng phút chín mươi cộng ba có bàn thật": ("Đúng phút chín mươi cộng ba", shot("có bàn thật", "phan-ung", "can", sfx="airhorn",
        dien=[dv("long", 0.5, "gioHaiTay", mat="cung", mieng="cuoi-toe", act=[a(0, "gioHaiTay"), a(0.3, "gioTay"), a(0.6, "gioHaiTay")])])),
    "vì bảy bộ hồ sơ nhập tịch làm giả": ("vì bảy bộ hồ sơ nhập tịch", shot("làm giả", "dac-ta", "sat", sfx="error-buzz",
        prop=[p("to-giay", 0.5, 0.86, 0.9, chu="GIẢ")])),
    "Ba điểm trong đó do phòng hồ sơ ghi bàn": ("Ba điểm trong đó do phòng hồ sơ", shot("ghi bàn", "dac-ta", "sat", sfx="boing",
        prop=[p("bong-da", 0.5, 0.9, 1.6)])),
}
DOI_TEN = {}  # lời cũ → lời mới (để nhịp trắng khai theo lời cũ vẫn tìm được mốc)
for ch in C:
    out = []
    for s in ch["shots"]:
        say = s.get("say")
        if say in SPLIT:
            dau, sau = SPLIT[say]
            s = {**s, "say": dau}; DOI_TEN[say] = dau
            out.append(s)
            if say == "Xong nhá, cả phố đổ ra đường":
                out[-1] = td("Xong nhá", [a(0, "gioTay", mat="cung"), a(0.25, "haiTayXoe"), a(0.5, "gioTay")], sfx="whoosh-short")
                out.append({**s, "say": "cả phố đổ ra đường"}); DOI_TEN[say] = "cả phố đổ ra đường"
            else:
                out.append(sau)
            continue
        out.append(s)
    ch["shots"] = out
    for s in ch["shots"]:
        k = s.get("say")
        if k in NEN: s["nen"] = NEN[k]

# shot đặc tả đồ vật không có người mà có chữ bị tính là thẻ chữ → chuyển chữ kèm sang ô chèn
for ch in C:
    for s in ch["shots"]:
        if s.get("loai") == "dac-ta" and not s.get("dien") and s.get("chu") and s["say"] != "vì bảy bộ hồ sơ nhập tịch làm giả":
            c0 = s.pop("chu")[0]
            s["chen"] = [chen_chu(c0["noi_dung"].upper(), x=0.5, y=0.16, tai=c0.get("tai", 0.15), dai=1.0, xoay=-2)]

# chương chung-ta: lời "Các anh ấy" lặp lại ngay sau "các anh ấy đá…" → neo khác để không trùng mốc
ct = next(c for c in C if c["id"] == "chung-ta")
for s in ct["shots"]:
    if s.get("say") == "các anh ấy đá như đi dạo": s["say"] = "các anh ấy đá như"
    elif s.get("say") == "Các anh ấy": s["say"] = "đi dạo"

board = {"du_an": "bong-da-40-ngay", "nguoi_ke": "nam",
         "mac_dinh": {"loai": "minh-hoa", "co": "trung", "nen": "trang"},
         "nhan_vat_tu_ve": NHAN_VAT, "do_cam_tu_ve": DO_CAM, "chuong": C}

# Nhịp trắng: (chương, chỉ số shot sẽ đứng SAU nhịp trắng, độ dài). Chèn theo mốc thật ở vòng 2.
TRONG = []
moc_path = os.path.join(os.path.dirname(__file__), "moc.json")
if os.path.exists(moc_path):
    moc = json.load(open(moc_path, encoding="utf-8"))  # {"<chuong>": {"<say>": mốc giây}} từ kiem-tra-v2 --moc
    for cid, truoc_say, dai in json.load(open(os.path.join(os.path.dirname(__file__), "trong.json"), encoding="utf-8")):
        ch = next(c for c in C if c["id"] == cid)
        truoc_say = DOI_TEN.get(truoc_say, truoc_say)
        i = next(k for k, s in enumerate(ch["shots"]) if s.get("say") == truoc_say)
        t = moc[cid].get(truoc_say)
        if t is None:  # shot đã đổi lời ở vòng 5 → tra theo lời cũ
            t = moc[cid][next(k for k, v in DOI_TEN.items() if v == truoc_say)]
        ch["shots"].insert(i, {"tai": round(t - dai, 2), "loai": "trong", "dai": dai, "ghi_chu": f"nhịp trắng trước \"{truoc_say}\""})

out = os.path.join(os.path.dirname(__file__), "board.json")
json.dump(board, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(out, sum(len(c["shots"]) for c in C), "shot")
