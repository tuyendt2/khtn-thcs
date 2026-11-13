# KHTN 8–9: ứng dụng học Lí, Hóa, Sinh trên điện thoại

Ứng dụng web cài được lên điện thoại (PWA) để học Khoa học tự nhiên lớp 8–9 (chương trình GDPT 2018), từ kiến thức cơ bản đến nâng cao để thi học sinh giỏi và thi vào lớp 10 chuyên.

- **Hai level:** *Cơ bản* (theo SGK, có giải thích "vì sao") và *Nâng cao* (HSG, thi chuyên). Chọn level ở đầu mỗi trang; kiến thức, bài tập và thẻ ghi nhớ đều được lọc theo level.
- **Kiến thức** từng mục, có chứng minh và giải thích.
- **Thẻ ghi nhớ** ôn theo lịch ngắt quãng (1, 3, 7, 14, 30 ngày), ôn theo chủ đề, theo môn hoặc gộp tất cả.
- **Bài tập** có ý tưởng chính, 2 gợi ý, lời giải đầy đủ, đồng hồ, tự đánh giá và hẹn làm lại.
- **Hình vẽ** (sơ đồ mạch điện, ...) vẽ bằng code, đổi màu theo giao diện sáng/tối.
- Dùng được khi không có mạng; tiến độ lưu trên máy, không cần tài khoản.

**Nội dung:** Vật lí 7 chủ đề, Hóa học 7 chủ đề, Sinh học 6 chủ đề (tổng 20 chủ đề, 252 bài tập, hơn 300 thẻ ghi nhớ, 74 hình vẽ).

**Dùng thử:** https://tuyendt2.github.io/khtn-thcs/

## Cấu trúc

```
content/<mon>/<NN-chu-de>/
  bai-hoc.md       bài học: I. Kiến thức cơ bản, II. Kiến thức nâng cao,
                   III. Bài tập (nhãn "Cơ bản"/"Nâng cao"), IV. Lời giải  (chép từ ../khtn8-9)
  hinh/*.svg       hình vẽ (chép từ ../khtn8-9)
  goi-y.md         ý tưởng chính, gợi ý từng tầng, độ khó (số sao) của từng bài
  the-ghi-nho.md   thẻ ghi nhớ; nhóm có "(nâng cao)" trong tên thuộc level Nâng cao
scripts/figures.mjs  vẽ hình (mạch điện, ...) và ghi SVG vào ../khtn8-9
scripts/sync.mjs     chép bài học và hình từ ../khtn8-9 vào content/
scripts/pdf.mjs      xuất toàn bộ tài liệu ../khtn8-9 ra một file PDF
build.mjs            tạo dist/: Markdown thành HTML, công thức giữ dạng TeX (KaTeX + mhchem vẽ trên máy)
```

## Lệnh

```sh
npm install
npm run figures   # vẽ lại hình vào ../khtn8-9
npm run sync      # chép bài học, hình từ ../khtn8-9
npm run build     # tạo dist/ (báo lỗi nếu công thức sai, thiếu gợi ý, thiếu hình)
npm run serve     # xem thử ở http://localhost:8090
npm run pdf       # xuất ../khtn8-9/khtn8-9.pdf
npm run deploy    # build rồi đẩy dist/ lên nhánh gh-pages
```
