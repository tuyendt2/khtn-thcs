# Thẻ ghi nhớ: Điện học

<!-- Nhóm có chữ "(nâng cao)" trong tên thuộc level Nâng cao, còn lại là Cơ bản. -->

## Khái niệm cơ bản

### Chiều quy ước của dòng điện? So với chiều chuyển động của electron?
Từ cực dương qua mạch ngoài tới cực âm; **ngược** chiều chuyển động của electron.

### Ampe kế và vôn kế mắc thế nào? Vì sao?
- Ampe kế mắc **nối tiếp**, để toàn bộ dòng điện cần đo đi qua nó.
- Vôn kế mắc **song song**, để đo hiệu điện thế giữa hai đầu đoạn mạch.

### Phát biểu định luật Ohm.
$I = \frac UR$: cường độ dòng điện tỉ lệ thuận với hiệu điện thế và tỉ lệ nghịch với điện trở.

### "Điện trở tỉ lệ thuận với hiệu điện thế" đúng hay sai?
**Sai.** $R = \frac UI$ chỉ để tính $R$; điện trở phụ thuộc vật liệu, chiều dài, tiết diện của dây.

### Công thức điện trở dây dẫn? Vì sao tỉ lệ với $l$, nghịch với $S$?
$R = \rho\frac lS$. Dây dài gấp đôi như hai đoạn nối tiếp; dây to gấp đôi như hai dây song song.

### $1\text{ mm}^2$ bằng bao nhiêu $\text{m}^2$? Tiết diện dây tròn đường kính $d$?
$1\text{ mm}^2 = 10^{-6}\text{ m}^2$; $\ S = \frac{\pi d^2}{4}$.

## Đoạn mạch

### Đoạn mạch nối tiếp: bốn hệ thức?
$$I = I_1 = I_2, \quad U = U_1 + U_2, \quad R_{\text{tđ}} = R_1 + R_2, \quad \frac{U_1}{U_2} = \frac{R_1}{R_2}.$$

### Đoạn mạch song song: bốn hệ thức?
$$U = U_1 = U_2, \quad I = I_1 + I_2, \quad \frac1{R_{\text{tđ}}} = \frac{1}{R_1} + \frac1{R_2}, \quad \frac{I_1}{I_2} = \frac{R_2}{R_1}.$$

### $n$ điện trở giống nhau $R$ mắc song song?
$R_{\text{tđ}} = \frac Rn$, nhỏ hơn mỗi điện trở thành phần.

## Công, công suất

### Ba công thức công suất điện?
$P = UI = I^2R = \frac{U^2}{R}$.

### $1$ kWh bằng bao nhiêu jun?
$1\text{ kWh} = 3{,}6\cdot10^6$ J (một "số điện").

### Từ số ghi 220 V – 100 W tính được gì?
$R = \frac{U_{đm}^2}{P_{đm}} = 484\ \Omega$; $\ I_{đm} = \frac{P_{đm}}{U_{đm}} \approx 0{,}45$ A.

### Định luật Joule–Lenz?
$Q = I^2Rt$: nhiệt lượng tỏa ra trên dây dẫn khi có dòng điện chạy qua.

### Hai đèn mắc nối tiếp / song song: đèn nào sáng hơn?
- Nối tiếp (cùng $I$, $P = I^2R$): đèn có $R$ **lớn** hơn sáng hơn.
- Song song (cùng $U$, $P = \frac{U^2}{R}$): đèn có $R$ **nhỏ** hơn sáng hơn.

## Phân tích mạch (nâng cao)

### Ampe kế lý tưởng và vôn kế lý tưởng được xử lý thế nào khi tính?
- Ampe kế lý tưởng ($R = 0$): **chập** hai đầu (cùng điện thế), nhưng nhớ nó vẫn đo dòng qua nó.
- Vôn kế lý tưởng ($R = \infty$): **bỏ** ra khi tính dòng.

### Định luật nút?
Tại một nút, tổng dòng điện đi vào bằng tổng dòng điện đi ra.

### Các bước phương pháp điện thế nút?
1. Chọn một nút có điện thế 0.
2. Dòng qua $R$ nối $X$, $Y$ là $\frac{V_X - V_Y}{R}$.
3. Viết định luật nút cho các nút chưa biết điện thế, giải hệ.

### Điều kiện mạch cầu cân bằng và hệ quả?
$\frac{R_1}{R_2} = \frac{R_3}{R_4}$; khi đó $V_C = V_D$, dòng qua $R_5$ bằng 0, bỏ $R_5$ được.

### Vôn kế có điện trở không đủ lớn làm số chỉ thế nào?
Số chỉ **nhỏ hơn** giá trị thật, vì vôn kế mắc song song làm giảm điện trở đoạn được đo.

## Cực trị và kỹ thuật (nâng cao)

### Nguồn $U$ nối tiếp $r$, mạch ngoài $R$: công suất trên $R$ lớn nhất khi nào?
Khi $R = r$; $P_{\max} = \frac{U^2}{4r}$ (chứng minh bằng AM-GM).

### Hai giá trị $R_1$, $R_2$ cho cùng công suất mạch ngoài thì liên hệ thế nào?
$R_1R_2 = r^2$ (định lý Viète).

### Mạch vô hạn giải thế nào?
Bỏ mắt đầu, phần còn lại vẫn có điện trở $x$; lập phương trình theo $x$. Thang $R$–$R$: $x = \frac{1 + \sqrt5}{2}R$.

### Hai dây đun cùng lượng nước sau $t_1$, $t_2$: mắc nối tiếp, song song thì sau bao lâu?
Nối tiếp: $t = t_1 + t_2$. Song song: $\frac1t = \frac{1}{t_1} + \frac1{t_2}$.
