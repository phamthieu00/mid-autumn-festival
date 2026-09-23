import type { LocalizedText } from '../../../i18n'
import { lt } from './templates'

export interface SetItem {
  vi: string
  en: string
  note: LocalizedText
}
export interface SetList {
  id: string
  /** noun phrase that fits "... KHÔNG phải là {label}" / "... is NOT {label}" */
  label: LocalizedText
  members: SetItem[]
  outsiders: SetItem[]
}

const it = (vi: string, en: string, noteVi: string, noteEn: string): SetItem => ({
  vi,
  en,
  note: lt(noteVi, noteEn),
})

export const SET_LISTS: SetList[] = [
  {
    id: 'fillings',
    label: lt('nhân bánh Trung Thu truyền thống', 'a traditional mooncake filling'),
    members: [
      it('thập cẩm', 'mixed nuts', 'nhân cổ điển nhất', 'the most classic filling'),
      it('đậu xanh', 'mung bean', 'nhân ngọt bùi quen thuộc', 'a familiar sweet filling'),
      it('trứng muối', 'salted egg yolk', 'tượng trưng mặt trăng', 'symbolises the moon'),
      it('hạt sen', 'lotus seed', 'nhân thanh mát', 'a light, fragrant filling'),
      it('khoai môn', 'taro', 'nhân tím tự nhiên', 'a natural purple filling'),
      it('đậu đỏ', 'red bean', 'nhân phổ biến khắp châu Á', 'popular across Asia'),
      it('trà xanh', 'green tea', 'nhân hiện đại được ưa chuộng', 'a well-loved modern filling'),
    ],
    outsiders: [
      it('mắm tôm', 'shrimp paste', 'gia vị của bún đậu', 'a condiment for bún đậu'),
      it('nước mắm', 'fish sauce', 'gia vị chấm', 'a dipping sauce'),
      it('tương ớt', 'chili sauce', 'gia vị cay', 'a hot condiment'),
      it('dưa muối', 'pickled greens', 'món ăn kèm cơm', 'a side dish for rice'),
      it('cà pháo', 'pickled eggplant', 'món dân dã ăn với canh', 'a rustic side dish'),
    ],
  },
  {
    id: 'lanterns',
    label: lt('loại đèn Trung Thu truyền thống', 'a traditional Mid-Autumn lantern'),
    members: [
      it('đèn ông sao', 'star lantern', 'năm cánh bọc giấy bóng kính', 'five cellophane points'),
      it(
        'đèn kéo quân',
        'revolving shadow lantern',
        'quay nhờ hơi nóng nến',
        'spins on candle heat',
      ),
      it('đèn cù', 'wheel lantern', 'lăn quay trên đường', 'rolls along the ground'),
      it('đèn cá chép', 'carp lantern', 'hình cá vượt vũ môn', 'shaped like a carp'),
      it('đèn con thỏ', 'rabbit lantern', 'gợi nhớ Thỏ Ngọc', 'recalls the Jade Rabbit'),
      it('đèn lồng giấy', 'paper lantern', 'lồng đèn tròn cổ điển', 'the classic round lantern'),
      it(
        'đèn con bướm',
        'butterfly lantern',
        'đèn giấy hình bướm',
        'a butterfly-shaped paper lantern',
      ),
    ],
    outsiders: [
      it('đèn pha ô tô', 'car headlight', 'thiết bị xe hơi', 'a car part'),
      it('đèn neon', 'neon sign', 'bảng hiệu điện', 'an electric sign'),
      it('đèn pin', 'flashlight', 'đèn cầm tay chạy pin', 'a battery torch'),
      it('đèn giao thông', 'traffic light', 'đèn điều khiển xe cộ', 'controls traffic'),
      it('đèn bàn', 'desk lamp', 'đèn học trên bàn', 'a study lamp'),
    ],
  },
  {
    id: 'characters',
    label: lt('nhân vật trong truyền thuyết Trung Thu', 'a character from Mid-Autumn legends'),
    members: [
      it('Chú Cuội', 'Cuội', 'ngồi gốc đa trên trăng', 'sits under the moon banyan'),
      it('Hằng Nga', 'Hằng Nga', 'nàng tiên trên cung trăng', 'the fairy on the moon'),
      it('Thỏ Ngọc', 'Jade Rabbit', 'giã thuốc trên cung trăng', 'pounds medicine on the moon'),
      it('Hậu Nghệ', 'Hậu Nghệ', 'bắn rơi chín mặt trời', 'shot down nine suns'),
      it('Ngô Cương', 'Wu Gang', 'đốn cây quế trên trăng', 'fells the moon osmanthus'),
      it(
        'Tây Vương Mẫu',
        'Queen Mother of the West',
        'ban thuốc trường sinh',
        'granted the elixir',
      ),
      it('Đường Minh Hoàng', 'Emperor Xuanzong', 'du ngoạn cung trăng', 'toured the Moon Palace'),
    ],
    outsiders: [
      it('Thánh Gióng', 'Thánh Gióng', 'anh hùng đánh giặc Ân', 'hero who fought the Ân invaders'),
      it('Sơn Tinh', 'Sơn Tinh', 'thần núi Tản Viên', 'the mountain god'),
      it('Thạch Sanh', 'Thạch Sanh', 'chàng trai chém chằn tinh', 'the youth who slew the monster'),
      it('Mai An Tiêm', 'Mai An Tiêm', 'người trồng dưa hấu', 'who grew the first watermelons'),
      it(
        'Lang Liêu',
        'Lang Liêu',
        'người làm bánh chưng bánh giầy',
        'who made bánh chưng and bánh giầy',
      ),
    ],
  },
  {
    id: 'lunar-festivals',
    label: lt('ngày lễ tính theo âm lịch', 'a festival dated by the lunar calendar'),
    members: [
      it('Tết Nguyên Đán', 'Lunar New Year', 'mùng 1 tháng Giêng', '1st day of the 1st month'),
      it('Tết Nguyên Tiêu', 'Lantern Festival', 'rằm tháng Giêng', '15th of the 1st month'),
      it('Tết Hàn Thực', 'Cold Food Festival', 'mùng 3 tháng 3', '3rd day of the 3rd month'),
      it('Tết Đoan Ngọ', 'Double Fifth', 'mùng 5 tháng 5', '5th day of the 5th month'),
      it('Lễ Vu Lan', 'Ghost Festival', 'rằm tháng 7', '15th of the 7th month'),
      it('Tết Trung Thu', 'Mid-Autumn Festival', 'rằm tháng 8', '15th of the 8th month'),
      it('Tết Ông Táo', 'Kitchen God Day', '23 tháng Chạp', '23rd of the 12th month'),
    ],
    outsiders: [
      it('Tết Dương lịch', "New Year's Day", 'ngày 1/1 dương lịch', '1 January'),
      it('Quốc khánh 2/9', 'National Day', 'ngày 2/9 dương lịch', '2 September'),
      it('Giáng sinh', 'Christmas', 'ngày 25/12 dương lịch', '25 December'),
      it('Quốc tế Thiếu nhi 1/6', "International Children's Day", 'ngày 1/6 dương lịch', '1 June'),
      it('Ngày Nhà giáo 20/11', "Teachers' Day", 'ngày 20/11 dương lịch', '20 November'),
    ],
  },
  {
    id: 'toys',
    label: lt('đồ chơi Trung Thu truyền thống', 'a traditional Mid-Autumn toy'),
    members: [
      it('đèn ông sao', 'star lantern', 'đèn năm cánh', 'the five-pointed lantern'),
      it(
        'mặt nạ giấy bồi',
        'papier-mâché mask',
        'mặt nạ ông Địa, chú Tễu',
        'masks of Ông Địa and others',
      ),
      it('tò he', 'rice-dough figurine', 'nặn từ bột gạo màu', 'moulded from coloured rice dough'),
      it('trống bỏi', 'rattle drum', 'trống nhỏ xoay là kêu', 'a small twist-rattle drum'),
      it(
        'tiến sĩ giấy',
        'paper scholar doll',
        'ông quan giấy khuyến học',
        'a paper doll wishing for study',
      ),
      it('đầu sư tử giấy', 'paper lion head', 'đầu lân nhỏ cho trẻ', 'a child-sized lion head'),
      it(
        'đèn kéo quân',
        'revolving shadow lantern',
        'đèn có hình quay',
        'a lantern with turning figures',
      ),
    ],
    outsiders: [
      it('máy chơi game', 'game console', 'thiết bị điện tử', 'an electronic device'),
      it('ván trượt', 'skateboard', 'đồ thể thao hiện đại', 'modern sports gear'),
      it('máy bay điều khiển', 'RC plane', 'đồ chơi điện tử', 'an electronic toy'),
      it('bộ Lego', 'Lego set', 'đồ chơi lắp ráp phương Tây', 'a Western building toy'),
      it('gấu bông', 'teddy bear', 'thú nhồi bông', 'a stuffed toy'),
    ],
  },
  {
    id: 'activities',
    label: lt('hoạt động trong đêm Trung Thu', 'a Mid-Autumn night activity'),
    members: [
      it('rước đèn', 'lantern parade', 'trẻ em đi quanh xóm', 'children parade the streets'),
      it('phá cỗ', 'sharing the feast', 'cùng ăn mâm cỗ', 'eating the offering tray together'),
      it('múa lân', 'lion dance', 'múa theo tiếng trống', 'dancing to drums'),
      it('trông trăng', 'moon-gazing', 'ngắm trăng rằm', 'watching the full moon'),
      it('hát trống quân', 'trống quân singing', 'hát đối đáp', 'call-and-response singing'),
      it('bày cỗ', 'laying out the feast', 'bày bánh trái', 'arranging cakes and fruit'),
      it(
        'tặng bánh trung thu',
        'gifting mooncakes',
        'biếu bánh cho người thân',
        'giving cakes to loved ones',
      ),
    ],
    outsiders: [
      it(
        'gói bánh chưng',
        'wrapping bánh chưng',
        'phong tục Tết Nguyên Đán',
        'a Lunar New Year custom',
      ),
      it('lì xì', 'giving lucky money', 'phong tục Tết Nguyên Đán', 'a Lunar New Year custom'),
      it('xông đất', 'first-footing', 'phong tục Tết Nguyên Đán', 'a Lunar New Year custom'),
      it('thả cá chép', 'releasing carp', 'phong tục Tết Ông Táo', 'a Kitchen God Day custom'),
      it('tảo mộ', 'tomb sweeping', 'phong tục Tết Thanh Minh', 'a Thanh Minh custom'),
    ],
  },
  {
    id: 'moon-things',
    label: lt('thứ có trên cung trăng theo truyền thuyết', 'something found on the moon in legend'),
    members: [
      it('cây đa', 'banyan tree', 'nơi Chú Cuội ngồi', 'where Cuội sits'),
      it('cây quế', 'osmanthus tree', 'Ngô Cương đốn mãi không đổ', 'Wu Gang can never fell it'),
      it('Thỏ Ngọc', 'Jade Rabbit', 'giã thuốc trường sinh', 'pounds the elixir'),
      it('cung Quảng Hàn', 'Moon Palace', 'nơi Hằng Nga ở', "Hằng Nga's palace"),
      it('chày giã thuốc', 'pestle', 'dụng cụ của Thỏ Ngọc', "the Jade Rabbit's tool"),
      it('Chú Cuội', 'Cuội', 'chàng tiều phu bị kéo lên trăng', 'the woodcutter carried up'),
      it('Hằng Nga', 'Hằng Nga', 'nàng tiên cung trăng', 'the moon fairy'),
    ],
    outsiders: [
      it(
        'Thánh Gióng',
        'Thánh Gióng',
        'bay về trời từ núi Sóc',
        'rose to heaven from Sóc mountain',
      ),
      it('Lạc Long Quân', 'Lạc Long Quân', 'ở Thủy phủ', 'lives in the Water Palace'),
      it('cây tre trăm đốt', 'hundred-knot bamboo', 'truyện cổ tích khác', 'from another folktale'),
      it('Ngưu Lang', 'Ngưu Lang', 'ở bên sông Ngân', 'lives by the Milky Way'),
      it('cá chép hóa rồng', 'carp turning dragon', 'truyện vượt vũ môn', 'from the carp legend'),
    ],
  },
  {
    id: 'tray-fruits',
    label: lt(
      'quả thường bày trên mâm cỗ Trung Thu',
      'a fruit commonly placed on the Mid-Autumn tray',
    ),
    members: [
      it('bưởi', 'pomelo', 'thường tỉa thành chó bưởi', 'often carved into a pomelo dog'),
      it('hồng', 'persimmon', 'trái mùa thu', 'an autumn fruit'),
      it('na', 'custard apple', 'trái mùa thu', 'an autumn fruit'),
      it('chuối', 'banana', 'nải chuối bày cỗ', 'a bunch on the tray'),
      it('lựu', 'pomegranate', 'tượng trưng con đàn cháu đống', 'symbolises many descendants'),
      it('thị', 'gold apple (thị)', 'quả thơm mùa thu', 'a fragrant autumn fruit'),
      it('táo ta', 'jujube', 'quả nhỏ mùa thu', 'a small autumn fruit'),
    ],
    outsiders: [
      it('dâu tây', 'strawberry', 'trái ôn đới trồng ở Đà Lạt', 'a temperate berry'),
      it('kiwi', 'kiwi', 'trái nhập khẩu', 'an imported fruit'),
      it('việt quất', 'blueberry', 'trái nhập khẩu', 'an imported berry'),
      it('cherry', 'cherry', 'trái ôn đới nhập khẩu', 'an imported temperate fruit'),
      it('sầu riêng', 'durian', 'trái mùa hè miền Nam', 'a summer fruit'),
    ],
  },
  {
    id: 'asia-festivals',
    label: lt('lễ ngắm trăng rằm tháng Tám ở châu Á', 'an East Asian mid-autumn moon festival'),
    members: [
      it('Chuseok', 'Chuseok', 'lễ tạ ơn mùa thu Hàn Quốc', "Korea's harvest festival"),
      it('Tsukimi', 'Tsukimi', 'lễ ngắm trăng Nhật Bản', "Japan's moon-viewing"),
      it('Trung Thu tiết', 'Zhongqiu Festival', 'Trung Thu Trung Quốc', "China's Mid-Autumn"),
      it('Tết Trung Thu', 'Tết Trung Thu', 'Trung Thu Việt Nam', "Vietnam's Mid-Autumn"),
      it(
        'Lễ hội Đèn lồng Chinatown',
        'Chinatown Mid-Autumn Light-Up',
        'Singapore',
        "Singapore's celebration",
      ),
    ],
    outsiders: [
      it('Songkran', 'Songkran', 'Tết té nước Thái Lan tháng 4', "Thailand's April water festival"),
      it('Diwali', 'Diwali', 'lễ hội ánh sáng Ấn Độ', "India's festival of lights"),
      it('Obon', 'Obon', 'lễ vong linh Nhật Bản mùa hè', "Japan's summer ancestor festival"),
      it('Seollal', 'Seollal', 'Tết âm lịch Hàn Quốc', "Korea's Lunar New Year"),
      it('Hanami', 'Hanami', 'ngắm hoa anh đào mùa xuân', 'spring cherry-blossom viewing'),
    ],
  },
  {
    id: 'lion-dance-kit',
    label: lt(
      'thứ xuất hiện trong màn múa lân Trung Thu',
      'something seen in a Mid-Autumn lion dance',
    ),
    members: [
      it('đầu lân', 'lion head', 'phần rực rỡ nhất', 'the most colourful part'),
      it('trống', 'drum', 'giữ nhịp cho lân', 'keeps the beat'),
      it('chập chõa', 'cymbals', 'nhạc cụ gõ đi kèm trống', 'clashing percussion'),
      it('ông Địa', 'Ông Địa', 'bụng phệ cầm quạt trêu lân', 'big-bellied fan waver'),
      it('quạt mo', 'palm-leaf fan', 'đạo cụ của ông Địa', "Ông Địa's prop"),
      it('thanh la', 'gong', 'nhạc cụ đồng', 'a brass percussion instrument'),
    ],
    outsiders: [
      it('đàn piano', 'piano', 'nhạc cụ phương Tây', 'a Western instrument'),
      it('kèn saxophone', 'saxophone', 'nhạc cụ jazz', 'a jazz instrument'),
      it('máy hát karaoke', 'karaoke machine', 'thiết bị giải trí', 'an entertainment device'),
      it('đàn violin', 'violin', 'nhạc cụ dây phương Tây', 'a Western string instrument'),
      it('bóng đá', 'football', 'dụng cụ thể thao', 'sports equipment'),
    ],
  },
]
