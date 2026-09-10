# Bảng phân cảnh V2 — cách viết

File: `src/projects/<du-an>/board.json`, kiểu `Board` trong `kieu-board.ts`.

## Nguyên tắc rút từ tham chiếu (đo được)

| Điều | Số |
|---|---|
| Shot trung vị | 1.4 s — 31% shot dưới 1 s, dài nhất 8 s |
| Nói trực diện | chỉ ~16% thời gian; mỗi đoạn ≤ 7 s rồi phải rời sang minh hoạ |
| Chữ trên màn | ~14% shot, tối thiểu 1 chữ / 15 s |
| Nhịp trắng | 0.5–1.2 s giữa hai ý, tổng 5–10% thời lượng |
| Nền | trắng trơn; prop chỉ khi câu nhắc tới vật đó |
| Chuyển động | KHÔNG tween — đổi tư thế tức thời (`act[].tai`), giữ 0.4–1.5 s rồi đổi |
| Đầu | không gật, không nhún khi nói; chỉ miệng đổi |
| Nhân vật phụ | `kieu: "trang"` đầu trắng không mặt; cho `mat`/`mieng` khi họ có vai. Trùng tên với người trong chuyện ("chị Trang") thì thêm `ten: "chị Trang (HR)"` — chỉ là ghi chú cho người đọc board, không ảnh hưởng render |
| Chữ `the` | xuống dòng bằng `"\n"`; kèm nhân vật (`vi_tri` trai/phai) ≤ 14 ký tự/dòng, `vao: phong` ≤ 12, `giua` ≤ 20. `vi_tri: duoi` đè phụ đề tự động → chỉ dùng ở shot không có lời |
| Chiều cao | `thay`/`me`/`trang` cao ≈ 2.95 DAU (khung người lớn) → ở cỡ `can` đặt `co` 0.85–0.9, ở `sat` 0.8, kẻo mất đỉnh đầu |

## Một chương mẫu

```json
{
  "id": "cho-ngoi",
  "shots": [
    {"say": "Năm lớp mười", "loai": "truc-dien", "dien": [{"kieu": "nam", "x": 0.72}]},
    {"say": "cô chủ nhiệm đổi chỗ ngồi cả lớp", "loai": "minh-hoa", "co": "rong",
     "prop": [{"ten": "day-ban-lop", "x": 0.5, "y": 0.86}],
     "dien": [
       {"kieu": "thay", "ten": "cô chủ nhiệm", "x": 0.2, "dang": "dung", "act": [{"tai": 0, "dang": "dung"}, {"tai": 0.7, "dang": "chi", "mat": "khe"}]},
       {"kieu": "trang", "x": 0.55, "co": 0.8}, {"kieu": "trang", "x": 0.7, "co": 0.8}, {"kieu": "trang", "x": 0.85, "co": 0.8}
     ]},
    {"say": "không theo ý ai", "loai": "phan-ung", "dien": [{"kieu": "nam", "x": 0.5, "mat": "soc", "mieng": "meu"}],
     "chu": [{"noi_dung": "?!", "kieu": "tay", "vi_tri": "canh-dau"}]},
    {"say": "Bạn ấy tên Hà", "loai": "chu", "chu": [{"noi_dung": "HÀ.", "kieu": "the", "vao": "phong"}], "sfx": "ding"},
    {"tai": 14.2, "loai": "trong", "dai": 0.6, "ghi_chu": "chèn ngay trước shot kế (mốc 14.8 từ --moc) — không append cuối chương"},
    {"say": "Hoá ra không", "loai": "tieu-canh", "dien": [{"kieu": "nam", "x": 0.5, "dang": "nhunVai", "mat": "nho"}]}
  ]
}
```

## Quy tắc máy kiểm (pipeline/kiem-tra-v2.mjs)

- mọi `say` có nguyên văn trong lời bình chương; mọi `kieu`, `dang`, `mat`, `mieng`, `prop.ten`, `sfx` có trong thư viện
- shot ≥ 0.25 s; không hai shot cùng mốc
- chương có ≥ 1 shot mỗi 2.5 s trung bình; đoạn trực diện liên tục ≤ 7 s
- shot `truc-dien` phải có đúng một diễn viên `noi`
- shot `insert` phải có `anh` tồn tại trong `public/`
- không kiểm: `ten` (ghi chú), độ dài chữ, vị trí chữ có đè phụ đề — soát bằng still (`pipeline/xem-shot.mjs`)
