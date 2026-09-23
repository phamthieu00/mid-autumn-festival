export type GlossaryGroup =
  | 'food'
  | 'lantern'
  | 'character'
  | 'custom'
  | 'astro'
  | 'festival'
  | 'object'
  | 'nature'
  | 'people'

export interface GlossaryEntry {
  id: string
  vi: string
  en: string
  group: GlossaryGroup
}

const g = (id: string, vi: string, en: string, group: GlossaryGroup): GlossaryEntry => ({
  id,
  vi,
  en,
  group,
})

export const GLOSSARY: GlossaryEntry[] = [
  // food
  g('banh-nuong', 'bánh nướng', 'baked mooncake', 'food'),
  g('banh-deo', 'bánh dẻo', 'snow-skin mooncake', 'food'),
  g('nhan-thap-cam', 'nhân thập cẩm', 'mixed-nut filling', 'food'),
  g('dau-xanh', 'đậu xanh', 'mung bean', 'food'),
  g('trung-muoi', 'trứng muối', 'salted egg yolk', 'food'),
  g('hat-sen', 'hạt sen', 'lotus seed', 'food'),
  g('khoai-mon', 'khoai môn', 'taro', 'food'),
  g('la-chanh', 'lá chanh', 'lime leaf', 'food'),
  g('mut-bi', 'mứt bí', 'candied winter melon', 'food'),
  g('lap-xuong', 'lạp xưởng', 'Chinese sausage', 'food'),
  g('hat-dua', 'hạt dưa', 'watermelon seed', 'food'),
  g('buoi', 'bưởi', 'pomelo', 'food'),
  g('hong', 'quả hồng', 'persimmon', 'food'),
  g('com', 'cốm', 'young green rice', 'food'),
  g('chuoi', 'chuối', 'banana', 'food'),
  g('na', 'quả na', 'custard apple', 'food'),
  g('luu', 'quả lựu', 'pomegranate', 'food'),
  g('tra', 'trà', 'tea', 'food'),
  g('mam-co', 'mâm cỗ', 'offering tray', 'food'),
  g('cho-buoi', 'chó bưởi', 'pomelo dog', 'food'),
  // lantern
  g('den-ong-sao', 'đèn ông sao', 'star lantern', 'lantern'),
  g('den-keo-quan', 'đèn kéo quân', 'revolving shadow lantern', 'lantern'),
  g('den-long', 'đèn lồng', 'lantern', 'lantern'),
  g('den-ca-chep', 'đèn cá chép', 'carp lantern', 'lantern'),
  g('den-cu', 'đèn cù', 'wheel lantern', 'lantern'),
  g('giay-bong-kinh', 'giấy bóng kính', 'cellophane', 'lantern'),
  g('nen', 'nến', 'candle', 'lantern'),
  g('khung-tre', 'khung tre', 'bamboo frame', 'lantern'),
  g('den-hoa-dang', 'đèn hoa đăng', 'floating flower lantern', 'lantern'),
  g('den-troi', 'đèn trời', 'sky lantern', 'lantern'),
  // character
  g('chu-cuoi', 'Chú Cuội', 'Cuội the woodcutter', 'character'),
  g('hang-nga', 'Hằng Nga', 'the Moon Lady', 'character'),
  g('tho-ngoc', 'Thỏ Ngọc', 'Jade Rabbit', 'character'),
  g('hau-nghe', 'Hậu Nghệ', 'Hậu Nghệ the archer', 'character'),
  g('ong-dia', 'Ông Địa', 'Earth God', 'character'),
  g('tien-si-giay', 'tiến sĩ giấy', 'paper scholar doll', 'character'),
  g('chi-hang', 'chị Hằng', 'Sister Moon', 'character'),
  g('ngo-cuong', 'Ngô Cương', 'Wu Gang', 'character'),
  // custom
  g('ruoc-den', 'rước đèn', 'lantern parade', 'custom'),
  g('pha-co', 'phá cỗ', 'sharing the feast', 'custom'),
  g('mua-lan', 'múa lân', 'lion dance', 'custom'),
  g('trong-trang', 'trông trăng', 'moon-gazing', 'custom'),
  g('hat-trong-quan', 'hát trống quân', 'trống quân singing', 'custom'),
  g('bay-co', 'bày cỗ', 'laying out the feast', 'custom'),
  g('tang-banh', 'tặng bánh', 'gifting mooncakes', 'custom'),
  g('doan-vien', 'đoàn viên', 'family reunion', 'custom'),
  g('tho-den', 'thả đèn', 'releasing lanterns', 'custom'),
  g('doi-lan', 'đội lân', 'lion dance troupe', 'custom'),
  // astro
  g('trang-tron', 'trăng tròn', 'full moon', 'astro'),
  g('trang-non', 'trăng non', 'new moon', 'astro'),
  g('trang-khuyet', 'trăng khuyết', 'crescent moon', 'astro'),
  g('nguyet-thuc', 'nguyệt thực', 'lunar eclipse', 'astro'),
  g('nhat-thuc', 'nhật thực', 'solar eclipse', 'astro'),
  g('am-lich', 'âm lịch', 'lunar calendar', 'astro'),
  g('duong-lich', 'dương lịch', 'solar calendar', 'astro'),
  g('cung-trang', 'cung trăng', 'Moon Palace', 'astro'),
  g('sieu-trang', 'siêu trăng', 'supermoon', 'astro'),
  g('thuy-trieu', 'thủy triều', 'tide', 'astro'),
  g('ram', 'rằm', 'full-moon day', 'astro'),
  g('mung-mot', 'mùng một', 'first lunar day', 'astro'),
  // festival
  g('tet-trung-thu', 'Tết Trung Thu', 'Mid-Autumn Festival', 'festival'),
  g('tet-nguyen-dan', 'Tết Nguyên Đán', 'Lunar New Year', 'festival'),
  g('tet-doan-ngo', 'Tết Đoan Ngọ', 'Double Fifth Festival', 'festival'),
  g('tet-han-thuc', 'Tết Hàn Thực', 'Cold Food Festival', 'festival'),
  g('le-vu-lan', 'lễ Vu Lan', 'Ghost Festival', 'festival'),
  g('tet-nguyen-tieu', 'Tết Nguyên Tiêu', 'Lantern Festival', 'festival'),
  g('tet-thieu-nhi', 'Tết Thiếu Nhi', "Children's Festival", 'festival'),
  g('tet-trong-trang', 'Tết Trông Trăng', 'Moon-gazing Festival', 'festival'),
  // object
  g('mat-na-giay-boi', 'mặt nạ giấy bồi', 'papier-mâché mask', 'object'),
  g('to-he', 'tò he', 'rice-dough figurine', 'object'),
  g('trong-boi', 'trống bỏi', 'rattle drum', 'object'),
  g('dau-lan', 'đầu lân', 'lion head', 'object'),
  g('trong', 'trống', 'drum', 'object'),
  g('chieng', 'chiêng', 'gong', 'object'),
  g('quat', 'quạt', 'fan', 'object'),
  g('chay', 'chày', 'pestle', 'object'),
  g('coi', 'cối', 'mortar', 'object'),
  g('hop-banh', 'hộp bánh', 'mooncake box', 'object'),
  // nature
  g('cay-da', 'cây đa', 'banyan tree', 'nature'),
  g('cay-que', 'cây quế', 'osmanthus tree', 'nature'),
  g('mua-thu', 'mùa thu', 'autumn', 'nature'),
  g('bau-troi-dem', 'bầu trời đêm', 'night sky', 'nature'),
  g('ngoi-sao', 'ngôi sao', 'star', 'nature'),
  g('anh-trang', 'ánh trăng', 'moonlight', 'nature'),
  g('may', 'mây', 'cloud', 'nature'),
  g('gio-thu', 'gió thu', 'autumn breeze', 'nature'),
  g('la-vang', 'lá vàng', 'golden leaf', 'nature'),
  g('con-trau', 'con trâu', 'water buffalo', 'nature'),
  // people
  g('tieu-phu', 'tiều phu', 'woodcutter', 'people'),
  g('tre-em', 'trẻ em', 'children', 'people'),
  g('gia-dinh', 'gia đình', 'family', 'people'),
  g('ong-ba', 'ông bà', 'grandparents', 'people'),
  g('nghe-nhan', 'nghệ nhân', 'artisan', 'people'),
  g('nhac-si', 'nhạc sĩ', 'composer', 'people'),
  g('cung-thu', 'cung thủ', 'archer', 'people'),
  g('nang-tien', 'nàng tiên', 'fairy', 'people'),
  g('ban-be', 'bạn bè', 'friends', 'people'),
  g('hang-xom', 'hàng xóm', 'neighbours', 'people'),
  g('thay-co', 'thầy cô', 'teachers', 'people'),
  // extra objects & nature
  g('khuon-banh', 'khuôn bánh', 'cake mould', 'object'),
  g('lo-nuong', 'lò nướng', 'oven', 'object'),
  g('ao-dai', 'áo dài', 'áo dài dress', 'object'),
  g('bong-trang', 'bóng trăng', 'moon shadow', 'nature'),
  g('dem-ram', 'đêm rằm', 'full-moon night', 'nature'),
  g('suong-thu', 'sương thu', 'autumn mist', 'nature'),
  g('hoa-que', 'hoa quế', 'osmanthus blossom', 'nature'),
  g('den-duong', 'đèn đường', 'street light', 'lantern'),
  g('day-treo-den', 'dây treo đèn', 'lantern string', 'lantern'),
]
