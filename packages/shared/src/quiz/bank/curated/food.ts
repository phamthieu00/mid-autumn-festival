import { q } from './define'

export const food = [
  q(
    'food',
    'two-cakes',
    1,
    [
      'Hai loại bánh Trung Thu truyền thống của Việt Nam là gì?',
      'What are the two traditional Vietnamese mooncakes?',
    ],
    [
      ['Bánh chưng và bánh tét', 'Bánh chưng and bánh tét'],
      ['Bánh nướng và bánh dẻo', 'Baked cake and snow-skin cake'],
      ['Bánh trôi và bánh chay', 'Bánh trôi and bánh chay'],
      ['Bánh đúc và bánh bèo', 'Bánh đúc and bánh bèo'],
    ],
    1,
    [
      'Bánh nướng vỏ vàng giòn và bánh dẻo trắng mềm là cặp đôi không thể thiếu.',
      'Golden baked cakes and soft white snow-skin cakes are the essential pair.',
    ],
    '🥮',
  ),
  q(
    'food',
    'banh-deo-color',
    1,
    ['Bánh dẻo truyền thống có màu gì?', 'What colour is a traditional bánh dẻo?'],
    [
      ['Vàng nâu', 'Golden brown'],
      ['Trắng', 'White'],
      ['Xanh lá', 'Green'],
      ['Đỏ', 'Red'],
    ],
    1,
    [
      'Bánh dẻo vỏ trắng làm từ bột nếp rang, không cần nướng.',
      'Bánh dẻo has a white skin of roasted glutinous rice flour and is not baked.',
    ],
  ),
  q(
    'food',
    'banh-deo-flour',
    2,
    ['Vỏ bánh dẻo làm từ bột gì?', 'What flour is bánh dẻo skin made of?'],
    [
      ['Bột mì', 'Wheat flour'],
      ['Bột nếp rang', 'Roasted glutinous rice flour'],
      ['Bột năng', 'Tapioca starch'],
      ['Bột gạo tẻ', 'Plain rice flour'],
    ],
    1,
    [
      'Bột nếp rang chín trộn nước đường và nước hoa bưởi thành vỏ dẻo.',
      'Roasted glutinous flour mixed with syrup and pomelo-flower water makes the chewy skin.',
    ],
  ),
  q(
    'food',
    'egg-yolk-symbol',
    2,
    [
      'Lòng đỏ trứng muối trong bánh Trung Thu tượng trưng cho điều gì?',
      'What does the salted egg yolk in a mooncake symbolise?',
    ],
    [
      ['Mặt trời', 'The sun'],
      ['Mặt trăng tròn', 'The full moon'],
      ['Đồng tiền vàng', 'A gold coin'],
      ['Quả hồng', 'A persimmon'],
    ],
    1,
    [
      'Cắt bánh ra, lòng đỏ tròn vàng như vầng trăng giữa bánh.',
      'Cut the cake and the round golden yolk sits like a moon at its heart.',
    ],
  ),
  q(
    'food',
    'lime-leaf',
    2,
    [
      'Nguyên liệu tạo hương đặc trưng trong nhân thập cẩm truyền thống miền Bắc?',
      'Which ingredient gives northern mixed filling its signature aroma?',
    ],
    [
      ['Quế', 'Cinnamon'],
      ['Lá chanh thái chỉ', 'Shredded lime leaves'],
      ['Hồi', 'Star anise'],
      ['Gừng', 'Ginger'],
    ],
    1,
    [
      'Lá chanh thái chỉ là hương vị không thể thiếu của nhân thập cẩm Hà Nội.',
      'Finely shredded lime leaf is the hallmark of Hanoi-style mixed filling.',
    ],
  ),
  q(
    'food',
    'com-lang-vong',
    2,
    [
      'Đặc sản Hà Nội mùa thu làm từ lúa nếp non, hay xuất hiện trên mâm cỗ?',
      'Which Hanoi autumn specialty made from young sticky rice appears on the tray?',
    ],
    [
      ['Xôi gấc', 'Red sticky rice'],
      ['Cốm', 'Cốm (young green rice)'],
      ['Chè lam', 'Chè lam'],
      ['Bánh đúc', 'Bánh đúc'],
    ],
    1,
    [
      'Cốm làng Vòng gói lá sen là hương vị mùa thu Hà Nội.',
      'Cốm from Vòng village wrapped in lotus leaf is the taste of Hanoi autumn.',
    ],
  ),
  q(
    'food',
    'thap-cam-ingredients',
    2,
    [
      'Nhân thập cẩm truyền thống thường có những gì?',
      'What does traditional mixed-nut filling contain?',
    ],
    [
      [
        'Mứt bí, lạp xưởng, hạt dưa, mỡ đường, lá chanh',
        'Candied melon, Chinese sausage, seeds, sugared lard, lime leaf',
      ],
      ['Thịt bò, hành tây', 'Beef and onion'],
      ['Sô-cô-la, hạnh nhân', 'Chocolate and almonds'],
      ['Khoai tây, cà rốt', 'Potato and carrot'],
    ],
    0,
    [
      '"Thập cẩm" nghĩa là mười thứ trộn lại: mứt, hạt, lạp xưởng, mỡ đường...',
      '"Thập cẩm" means ten things mixed: candied fruit, seeds, sausage, sugared lard...',
    ],
  ),
  q(
    'food',
    'mo-duong',
    3,
    ['"Mỡ đường" trong nhân thập cẩm là gì?', 'What is "mỡ đường" in mixed-nut filling?'],
    [
      ['Mỡ heo thái hạt lựu ướp đường', 'Diced pork fat cured in sugar'],
      ['Bơ thực vật', 'Margarine'],
      ['Dầu mè', 'Sesame oil'],
      ['Đường thắng', 'Caramel'],
    ],
    0,
    [
      'Mỡ heo ướp đường trong veo, giòn ngọt, đặc trưng bánh nướng xưa.',
      'Sugar-cured pork fat turns translucent and crisp, a hallmark of old-style cakes.',
    ],
  ),
  q(
    'food',
    'banh-nuong-crust',
    2,
    [
      'Vỏ bánh nướng có màu vàng bóng nhờ công đoạn nào?',
      'What gives the baked mooncake its glossy golden crust?',
    ],
    [
      ['Rắc đường', 'Sprinkling sugar'],
      ['Phết trứng rồi nướng', 'Brushing with egg wash before baking'],
      ['Chiên ngập dầu', 'Deep-frying'],
      ['Hấp', 'Steaming'],
    ],
    1,
    [
      'Bánh được phết hỗn hợp trứng và nướng hai, ba lần.',
      'The cake is brushed with egg and baked two or three times.',
    ],
  ),
  q(
    'food',
    'sugar-syrup',
    3,
    [
      'Nước đường làm vỏ bánh nướng thường được nấu trước bao lâu để ngon nhất?',
      'How far ahead is the syrup for baked cake skin ideally made?',
    ],
    [
      ['Ngay trước khi làm', 'Just before baking'],
      ['Vài tuần đến vài tháng', 'Weeks to months in advance'],
      ['Một giờ', 'An hour'],
      ['Không cần nước đường', 'No syrup is needed'],
    ],
    1,
    [
      'Nước đường "để càng lâu càng ngon", giúp vỏ mềm, lên màu đẹp.',
      'Aged syrup makes a softer, better-coloured crust.',
    ],
  ),
  q(
    'food',
    'mold',
    1,
    ['Hoa văn trên mặt bánh Trung Thu được tạo bằng gì?', 'How is the pattern on a mooncake made?'],
    [
      ['Vẽ bằng tay', 'Hand-painted'],
      ['Ép khuôn', 'Pressed with a mould'],
      ['Khắc bằng dao', 'Carved with a knife'],
      ['In laser', 'Laser-printed'],
    ],
    1,
    [
      'Bánh được ép vào khuôn gỗ hoặc nhựa có hoa văn hoa sen, chữ Phúc, Lộc...',
      'Cakes are pressed into wooden or plastic moulds with lotus or lucky-character patterns.',
    ],
  ),
  q(
    'food',
    'pomelo-flower',
    3,
    [
      'Hương liệu tự nhiên nào thường được cho vào bánh dẻo?',
      'Which natural flavouring is often added to bánh dẻo?',
    ],
    [
      ['Nước hoa bưởi', 'Pomelo-flower water'],
      ['Vani', 'Vanilla'],
      ['Tinh dầu cam', 'Orange oil'],
      ['Nước hoa hồng', 'Rose water'],
    ],
    0,
    [
      'Nước hoa bưởi cho vỏ bánh dẻo mùi thơm thanh nhẹ.',
      'Pomelo-flower water gives the skin a light, fresh scent.',
    ],
  ),
  q(
    'food',
    'snow-skin',
    2,
    [
      'Bánh Trung Thu "da tuyết" (snow-skin) hiện đại khác bánh dẻo truyền thống ở điểm gì?',
      'How does modern "snow-skin" mooncake differ from traditional bánh dẻo?',
    ],
    [
      ['Phải nướng', 'It is baked'],
      ['Ăn lạnh, vỏ mềm mịn, ít ngọt hơn', 'Served chilled, softer skin, less sweet'],
      ['Làm từ bột mì', 'Made from wheat'],
      ['Không có nhân', 'Has no filling'],
    ],
    1,
    [
      'Snow-skin bảo quản lạnh, mềm như mochi, ít đường hơn.',
      'Snow-skin is kept chilled, is mochi-soft and uses less sugar.',
    ],
  ),
  q(
    'food',
    'lava',
    2,
    [
      'Bánh Trung Thu "nhân chảy" (lava) nổi tiếng với nhân gì?',
      'What filling made "lava" mooncakes famous?',
    ],
    [
      ['Trứng muối tan chảy', 'Molten salted-egg custard'],
      ['Thịt kho', 'Braised pork'],
      ['Đậu xanh khô', 'Dry mung bean'],
      ['Mứt dâu', 'Strawberry jam'],
    ],
    0,
    [
      'Nhân custard trứng muối chảy ra khi cắt là xu hướng từ Hồng Kông.',
      'Molten salted-egg custard that oozes when cut is a trend from Hong Kong.',
    ],
  ),
  q(
    'food',
    'shape',
    1,
    ['Bánh Trung Thu truyền thống thường có hình gì?', 'What shape are traditional mooncakes?'],
    [
      ['Tam giác', 'Triangular'],
      ['Tròn hoặc vuông', 'Round or square'],
      ['Hình sao', 'Star-shaped'],
      ['Hình trái tim', 'Heart-shaped'],
    ],
    1,
    [
      'Hình tròn tượng trưng trăng rằm và sự đoàn viên; hình vuông tượng trưng đất.',
      'Round for the full moon and reunion; square for the earth.',
    ],
  ),
  q(
    'food',
    'piglet',
    2,
    [
      'Loại bánh nướng hình con vật thường mua cho trẻ em dịp Trung Thu?',
      'Which animal-shaped baked cake is bought for children at Mid-Autumn?',
    ],
    [
      ['Bánh cá', 'Fish cake'],
      ['Bánh heo con (đàn lợn)', 'Piglet cakes'],
      ['Bánh gà', 'Chicken cake'],
      ['Bánh rồng', 'Dragon cake'],
    ],
    1,
    [
      'Bánh nướng hình đàn heo con trong rọ là món trẻ con thích.',
      "Baked piglets in a little basket are a children's favourite.",
    ],
  ),
  q(
    'food',
    'sharing',
    1,
    [
      'Vì sao bánh Trung Thu thường được cắt thành nhiều miếng nhỏ?',
      'Why are mooncakes cut into many small pieces?',
    ],
    [
      ['Vì bánh rất cứng', 'They are very hard'],
      [
        'Để cả nhà cùng chia sẻ, tượng trưng đoàn viên',
        'So the whole family shares them, symbolising reunion',
      ],
      ['Vì quy định', 'It is a rule'],
      ['Để bánh nguội nhanh', 'To cool them faster'],
    ],
    1,
    [
      'Chiếc bánh tròn được chia đều cho mọi người trong nhà.',
      'The round cake is divided equally among everyone in the family.',
    ],
  ),
  q(
    'food',
    'pomelo-fruit',
    1,
    [
      'Quả nào gần như luôn có mặt trên mâm cỗ Trung Thu miền Bắc?',
      'Which fruit is almost always on a northern Mid-Autumn tray?',
    ],
    [
      ['Sầu riêng', 'Durian'],
      ['Bưởi', 'Pomelo'],
      ['Dâu tây', 'Strawberry'],
      ['Xoài', 'Mango'],
    ],
    1,
    [
      'Bưởi tròn, thơm, tượng trưng sự viên mãn.',
      'The round, fragrant pomelo stands for fullness.',
    ],
  ),
  q(
    'food',
    'persimmon',
    2,
    [
      'Quả hồng chín mọng trên mâm cỗ Trung Thu tượng trưng điều gì?',
      'What does the ripe persimmon on the tray symbolise?',
    ],
    [
      ['Hy vọng, sung túc', 'Hope and abundance'],
      ['Nỗi buồn', 'Sorrow'],
      ['Mùa đông', 'Winter'],
      ['Chiến tranh', 'War'],
    ],
    0,
    ['Hồng đỏ rực mang ý nghĩa may mắn, no đủ.', 'The bright red persimmon means luck and plenty.'],
  ),
  q(
    'food',
    'na',
    1,
    [
      'Loại quả có nhiều "mắt", vị ngọt, chín đúng mùa Trung Thu là gì?',
      'Which sweet "eyed" fruit ripens right at Mid-Autumn?',
    ],
    [
      ['Quả na', 'Custard apple'],
      ['Quả vải', 'Lychee'],
      ['Quả mít', 'Jackfruit'],
      ['Quả me', 'Tamarind'],
    ],
    0,
    [
      'Na (mãng cầu ta) chín rộ tháng 8–9, hay bày trên mâm cỗ.',
      'Custard apples ripen in August–September and often grace the tray.',
    ],
  ),
  q(
    'food',
    'tea-type',
    2,
    [
      'Loại trà thường được dùng kèm bánh Trung Thu ở Việt Nam?',
      'Which tea is commonly served with mooncakes in Vietnam?',
    ],
    [
      ['Trà sữa', 'Milk tea'],
      ['Trà xanh hoặc trà sen', 'Green or lotus tea'],
      ['Trà đá chanh', 'Iced lemon tea'],
      ['Trà gừng mật ong', 'Ginger honey tea'],
    ],
    1,
    [
      'Vị chát nhẹ của trà làm dịu độ ngọt đậm của bánh.',
      "The tea's light astringency balances the rich cake.",
    ],
  ),
  q(
    'food',
    'filling-mung',
    1,
    ['Nhân đậu xanh của bánh Trung Thu có màu gì?', 'What colour is mung-bean mooncake filling?'],
    [
      ['Vàng', 'Yellow'],
      ['Đen', 'Black'],
      ['Đỏ', 'Red'],
      ['Xanh dương', 'Blue'],
    ],
    0,
    [
      'Đậu xanh cà vỏ sên với đường thành nhân vàng mịn.',
      'Hulled mung beans cooked with sugar make a smooth yellow paste.',
    ],
  ),
  q(
    'food',
    'khoai-mon-color',
    1,
    ['Nhân khoai môn tạo màu gì tự nhiên cho bánh?', 'What natural colour does taro filling give?'],
    [
      ['Tím nhạt', 'Pale purple'],
      ['Xanh lá', 'Green'],
      ['Cam', 'Orange'],
      ['Nâu đen', 'Dark brown'],
    ],
    0,
    [
      'Khoai môn cho màu tím tự nhiên, vị bùi.',
      'Taro gives a natural purple hue and a nutty taste.',
    ],
  ),
  q(
    'food',
    'hat-sen',
    2,
    [
      'Nhân hạt sen thường được kết hợp với nguyên liệu nào tạo vị mặn ngọt?',
      'Lotus-seed filling is often paired with which ingredient for a sweet-salty taste?',
    ],
    [
      ['Trứng muối', 'Salted egg yolk'],
      ['Mắm tôm', 'Shrimp paste'],
      ['Tiêu', 'Pepper'],
      ['Ớt', 'Chili'],
    ],
    0,
    [
      'Hạt sen trứng muối là nhân được ưa chuộng hàng đầu.',
      'Lotus seed with salted egg is one of the best-loved fillings.',
    ],
  ),
  q(
    'food',
    'weight',
    3,
    [
      'Một chiếc bánh Trung Thu truyền thống cỡ thường nặng khoảng bao nhiêu?',
      'How much does a standard traditional mooncake weigh?',
    ],
    [
      ['50 g', '50 g'],
      ['150–250 g', '150–250 g'],
      ['500 g', '500 g'],
      ['1 kg', '1 kg'],
    ],
    1,
    [
      'Bánh phổ biến 150–250 g; bánh 1 kg là loại đặc biệt để biếu.',
      'Common cakes weigh 150–250 g; 1 kg cakes are special gifts.',
    ],
  ),
  q(
    'food',
    'vegetarian',
    2,
    [
      'Bánh Trung Thu chay thường thay lạp xưởng, mỡ đường bằng gì?',
      'What replaces sausage and lard in vegetarian mooncakes?',
    ],
    [
      ['Thịt bò', 'Beef'],
      ['Hạt, mứt, đậu và nấm', 'Nuts, candied fruit, beans and mushrooms'],
      ['Cá', 'Fish'],
      ['Trứng gà', 'Chicken egg'],
    ],
    1,
    [
      'Bánh chay dùng hạt điều, hạt dưa, mứt bí, đậu xanh, nấm hương.',
      'Vegetarian cakes use cashews, melon seeds, candied melon, mung bean and mushrooms.',
    ],
  ),
  q(
    'food',
    'storage',
    2,
    [
      'Bánh nướng truyền thống ngon nhất sau khi nướng bao lâu?',
      'When is a traditional baked mooncake at its best?',
    ],
    [
      ['Ngay khi ra lò', 'Straight from the oven'],
      ['Sau 1–3 ngày khi vỏ đã "xuống dầu"', 'After 1–3 days when the crust has softened'],
      ['Sau 1 tháng', 'After a month'],
      ['Sau khi đông lạnh', 'After freezing'],
    ],
    1,
    [
      'Vỏ bánh cần vài ngày để mềm, bóng và thấm dầu từ nhân.',
      'The crust needs a few days to soften, glisten and absorb oil from the filling.',
    ],
  ),
  q(
    'food',
    'cho-buoi-material',
    2,
    [
      'Con "chó bưởi" trên mâm cỗ được dựng từ gì?',
      'What is the "pomelo dog" on the tray built from?',
    ],
    [
      [
        'Tép bưởi cắm lên thân bằng quả hoặc bột',
        'Pomelo segments pinned to a fruit or dough body',
      ],
      ['Bánh dẻo nặn', 'Sculpted bánh dẻo'],
      ['Giấy bồi', 'Papier-mâché'],
      ['Xôi', 'Sticky rice'],
    ],
    0,
    [
      'Thân chó thường là quả đu đủ hoặc quả bưởi nhỏ, mắt là hạt nhãn.',
      'The body is often a papaya or small pomelo, with longan seeds for eyes.',
    ],
  ),
  q(
    'food',
    'gift-box',
    1,
    [
      'Bánh Trung Thu làm quà biếu thường được đóng gói thế nào?',
      'How are gift mooncakes usually packaged?',
    ],
    [
      ['Gói lá chuối', 'Wrapped in banana leaf'],
      ['Hộp sang trọng nhiều chiếc', 'Elegant multi-piece boxes'],
      ['Túi ni-lông', 'Plastic bags'],
      ['Không đóng gói', 'Unpackaged'],
    ],
    1,
    [
      'Hộp bánh đẹp là món quà phổ biến cho gia đình, đối tác.',
      'Beautiful boxes are a common gift for families and business partners.',
    ],
  ),
  q(
    'food',
    'salted-egg-count',
    2,
    ['Bánh "hai trứng", "bốn trứng" nghĩa là gì?', 'What do "two-yolk" or "four-yolk" cakes mean?'],
    [
      ['Số lòng đỏ trứng muối trong nhân', 'The number of salted yolks inside'],
      ['Số lần nướng', 'Times baked'],
      ['Số lớp vỏ', 'Layers of crust'],
      ['Số người ăn', 'Number of eaters'],
    ],
    0,
    [
      'Bánh càng nhiều trứng muối càng to và đắt.',
      'The more yolks, the bigger and pricier the cake.',
    ],
  ),
]
