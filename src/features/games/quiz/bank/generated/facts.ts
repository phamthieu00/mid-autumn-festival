import type { LocalizedText } from '@/i18n'
import type { QuizDifficulty } from '../../types'
import { lt } from './templates'

export type Relation = 'symbol' | 'country' | 'composer' | 'festivalFood' | 'place' | 'role'

export interface Fact {
  id: string
  relation: Relation
  subject: LocalizedText
  attribute: LocalizedText
  explanation: LocalizedText
  difficulty: QuizDifficulty
}

const f = (
  id: string,
  relation: Relation,
  subject: [string, string],
  attribute: [string, string],
  explanation: [string, string],
  difficulty: QuizDifficulty = 2,
): Fact => ({
  id,
  relation,
  subject: lt(...subject),
  attribute: lt(...attribute),
  explanation: lt(...explanation),
  difficulty,
})

export const FACTS: Fact[] = [
  // symbol
  f(
    'cuoi-banyan',
    'symbol',
    ['Chú Cuội', 'Cuội'],
    ['cây đa', 'the banyan tree'],
    [
      'Chú Cuội ngồi dưới gốc cây đa trên cung trăng.',
      'Cuội sits beneath the banyan tree on the moon.',
    ],
    1,
  ),
  f(
    'hangnga-palace',
    'symbol',
    ['Hằng Nga', 'Hằng Nga'],
    ['cung Quảng Hàn', 'the Moon Palace'],
    ['Hằng Nga sống trong cung Quảng Hàn trên mặt trăng.', 'Hằng Nga lives in the Moon Palace.'],
  ),
  f(
    'rabbit-pestle',
    'symbol',
    ['Thỏ Ngọc', 'the Jade Rabbit'],
    ['chày giã thuốc', 'the pestle'],
    [
      'Thỏ Ngọc cầm chày giã thuốc trường sinh.',
      'The Jade Rabbit pounds the elixir with a pestle.',
    ],
    1,
  ),
  f(
    'houyi-bow',
    'symbol',
    ['Hậu Nghệ', 'Hậu Nghệ'],
    ['cây cung', 'the bow'],
    [
      'Hậu Nghệ là cung thủ bắn rơi chín mặt trời.',
      'Hậu Nghệ is the archer who shot down nine suns.',
    ],
  ),
  f(
    'ongdia-fan',
    'symbol',
    ['Ông Địa', 'Ông Địa'],
    ['chiếc quạt', 'the fan'],
    ['Ông Địa phe phẩy quạt dẫn lân đi khắp phố.', 'Ông Địa waves his fan while leading the lion.'],
    1,
  ),
  f(
    'wugang-osmanthus',
    'symbol',
    ['Ngô Cương', 'Wu Gang'],
    ['cây quế', 'the osmanthus tree'],
    [
      'Ngô Cương bị phạt đốn cây quế mãi không đổ trên trăng.',
      'Wu Gang endlessly fells the regrowing osmanthus on the moon.',
    ],
    3,
  ),
  f(
    'tiensi-hat',
    'symbol',
    ['Ông tiến sĩ giấy', 'the paper scholar doll'],
    ['mũ cánh chuồn', 'the winged scholar hat'],
    [
      'Tiến sĩ giấy đội mũ cánh chuồn, tượng trưng cho việc học hành đỗ đạt.',
      'The paper scholar wears a winged hat, a wish for academic success.',
    ],
  ),
  // country
  f(
    'chuseok-korea',
    'country',
    ['Chuseok', 'Chuseok'],
    ['Hàn Quốc', 'Korea'],
    [
      'Chuseok là lễ tạ ơn mùa thu của Hàn Quốc, diễn ra rằm tháng Tám.',
      "Chuseok is Korea's autumn harvest festival on the 15th of the 8th lunar month.",
    ],
    1,
  ),
  f(
    'tsukimi-japan',
    'country',
    ['Tsukimi', 'Tsukimi'],
    ['Nhật Bản', 'Japan'],
    [
      'Tsukimi (Otsukimi) là lễ ngắm trăng của Nhật Bản.',
      'Tsukimi (Otsukimi) is the Japanese moon-viewing festival.',
    ],
    1,
  ),
  f(
    'zhongqiu-china',
    'country',
    ['Trung Thu tiết (Zhongqiu)', 'Zhongqiu Festival'],
    ['Trung Quốc', 'China'],
    ['Trung Thu tiết là Tết Trung Thu của Trung Quốc.', "Zhongqiu is China's Mid-Autumn Festival."],
    1,
  ),
  f(
    'tettrungthu-vn',
    'country',
    ['Tết Trung Thu', 'Tết Trung Thu'],
    ['Việt Nam', 'Vietnam'],
    [
      'Tết Trung Thu ở Việt Nam còn gọi là Tết Trông Trăng, Tết Thiếu Nhi.',
      "Vietnam's Mid-Autumn is also called the Moon-gazing or Children's Festival.",
    ],
    1,
  ),
  f(
    'lightup-singapore',
    'country',
    ['Lễ hội Đèn lồng Chinatown', 'Chinatown Mid-Autumn Light-Up'],
    ['Singapore', 'Singapore'],
    [
      'Khu Chinatown ở Singapore thắp đèn lồng rực rỡ mỗi mùa Trung Thu.',
      "Singapore's Chinatown lights up with lanterns every Mid-Autumn.",
    ],
  ),
  f(
    'firedragon-hk',
    'country',
    ['Múa rồng lửa Tai Hang', 'Tai Hang Fire Dragon Dance'],
    ['Hồng Kông', 'Hong Kong'],
    [
      'Múa rồng lửa Tai Hang là di sản Trung Thu nổi tiếng của Hồng Kông.',
      "The Tai Hang Fire Dragon Dance is Hong Kong's famous Mid-Autumn heritage.",
    ],
    3,
  ),
  // composer
  f(
    'den-ong-sao-phamtuyen',
    'composer',
    ['Chiếc đèn ông sao', 'Chiếc đèn ông sao'],
    ['Phạm Tuyên', 'Phạm Tuyên'],
    [
      'Nhạc sĩ Phạm Tuyên sáng tác "Chiếc đèn ông sao" năm 1956.',
      'Phạm Tuyên wrote "Chiếc đèn ông sao" in 1956.',
    ],
    1,
  ),
  f(
    'thang-cuoi-lethuong',
    'composer',
    ['Thằng Cuội', 'Thằng Cuội'],
    ['Lê Thương', 'Lê Thương'],
    [
      '"Thằng Cuội" ("Bóng trăng trắng ngà, có cây đa to...") là của nhạc sĩ Lê Thương.',
      '"Thằng Cuội" is by composer Lê Thương.',
    ],
  ),
  f(
    'vang-trang-co-tich',
    'composer',
    ['Vầng trăng cổ tích', 'Vầng trăng cổ tích'],
    ['Phạm Đăng Khương', 'Phạm Đăng Khương'],
    [
      '"Vầng trăng cổ tích" do Phạm Đăng Khương phổ nhạc từ thơ Đỗ Trung Quân.',
      '"Vầng trăng cổ tích" was set to music by Phạm Đăng Khương from a poem by Đỗ Trung Quân.',
    ],
    3,
  ),
  f(
    'dem-trung-thu-phungnhuthach',
    'composer',
    ['Đêm Trung Thu', 'Đêm Trung Thu'],
    ['Phùng Như Thạch', 'Phùng Như Thạch'],
    [
      '"Đêm Trung Thu" ("Thùng thình thùng thình trống rộn ràng ngoài đình") là của Phùng Như Thạch.',
      '"Đêm Trung Thu" ("Thùng thình...") is by Phùng Như Thạch.',
    ],
    3,
  ),
  f(
    'ruoc-den-thang-tam',
    'composer',
    ['Rước đèn tháng Tám', 'Rước đèn tháng Tám'],
    ['Đức Quỳnh', 'Đức Quỳnh'],
    [
      '"Rước đèn tháng Tám" ("Tết Trung Thu rước đèn đi chơi") thường được ghi là của Đức Quỳnh (Vân Thanh).',
      '"Rước đèn tháng Tám" is usually credited to Đức Quỳnh (pen name Vân Thanh).',
    ],
    3,
  ),
  // festivalFood
  f(
    'chuseok-songpyeon',
    'festivalFood',
    ['Chuseok', 'Chuseok'],
    ['songpyeon', 'songpyeon'],
    [
      'Songpyeon là bánh gạo hình bán nguyệt ăn dịp Chuseok.',
      'Songpyeon are half-moon rice cakes eaten at Chuseok.',
    ],
  ),
  f(
    'tsukimi-dango',
    'festivalFood',
    ['Tsukimi', 'Tsukimi'],
    ['bánh dango', 'dango'],
    [
      'Người Nhật bày dango thành chồng khi ngắm trăng.',
      'The Japanese stack dango as an offering during Tsukimi.',
    ],
  ),
  f(
    'trungthu-banhnuong',
    'festivalFood',
    ['Tết Trung Thu Việt Nam', "Vietnam's Mid-Autumn"],
    ['bánh nướng, bánh dẻo', 'baked and snow-skin mooncakes'],
    [
      'Bánh nướng và bánh dẻo là cặp đôi không thể thiếu của Trung Thu Việt.',
      'Baked and snow-skin mooncakes are the essential Vietnamese pair.',
    ],
    1,
  ),
  f(
    'hanthuc-banhtroi',
    'festivalFood',
    ['Tết Hàn Thực', 'Cold Food Festival'],
    ['bánh trôi, bánh chay', 'bánh trôi and bánh chay'],
    [
      'Mùng 3/3 âm lịch người Việt làm bánh trôi, bánh chay.',
      'On the 3rd of the 3rd lunar month Vietnamese make bánh trôi and bánh chay.',
    ],
  ),
  f(
    'doanngo-comruou',
    'festivalFood',
    ['Tết Đoan Ngọ', 'Double Fifth Festival'],
    ['cơm rượu nếp', 'fermented sticky rice'],
    [
      'Sáng mùng 5/5, người Việt ăn cơm rượu nếp để "diệt sâu bọ".',
      'On the 5th of the 5th month Vietnamese eat fermented sticky rice.',
    ],
  ),
  f(
    'nguyendan-banhchung',
    'festivalFood',
    ['Tết Nguyên Đán', 'Lunar New Year'],
    ['bánh chưng', 'bánh chưng'],
    [
      'Bánh chưng là món bánh truyền thống của Tết Nguyên Đán.',
      'Bánh chưng is the traditional Lunar New Year cake.',
    ],
    1,
  ),
  // place
  f(
    'luongnhuhoc-hcm',
    'place',
    ['Phố lồng đèn Lương Nhữ Học', 'Lương Nhữ Học lantern street'],
    ['TP. Hồ Chí Minh', 'Ho Chi Minh City'],
    [
      'Phố lồng đèn Lương Nhữ Học nằm ở Quận 5, TP. Hồ Chí Minh.',
      'Lương Nhữ Học lantern street is in District 5, Ho Chi Minh City.',
    ],
    1,
  ),
  f(
    'hangma-hanoi',
    'place',
    ['Phố Hàng Mã', 'Hàng Mã street'],
    ['Hà Nội', 'Hanoi'],
    [
      'Hàng Mã trong phố cổ Hà Nội bán đồ chơi Trung Thu mỗi mùa.',
      "Hàng Mã in Hanoi's Old Quarter sells Mid-Autumn toys every season.",
    ],
    1,
  ),
  f(
    'baodap-namdinh',
    'place',
    ['Làng đèn ông sao Báo Đáp', 'Báo Đáp lantern village'],
    ['Nam Định', 'Nam Định'],
    [
      'Làng Báo Đáp (Nam Định) nổi tiếng làm đèn ông sao.',
      'Báo Đáp village in Nam Định is famous for star lanterns.',
    ],
    3,
  ),
  f(
    'thanhtuyen-tuyenquang',
    'place',
    ['Lễ hội Thành Tuyên', 'Thành Tuyên Festival'],
    ['Tuyên Quang', 'Tuyên Quang'],
    [
      'Lễ hội Thành Tuyên với các mô hình đèn khổng lồ diễn ra ở Tuyên Quang.',
      'The Thành Tuyên Festival with giant lantern floats is held in Tuyên Quang.',
    ],
  ),
  f(
    'taihang-hk',
    'place',
    ['Múa rồng lửa Tai Hang', 'Tai Hang Fire Dragon Dance'],
    ['Hồng Kông', 'Hong Kong'],
    [
      'Rồng lửa Tai Hang diễn ra ở khu Tai Hang, Hồng Kông.',
      'The fire dragon dances through Tai Hang, Hong Kong.',
    ],
    3,
  ),
  f(
    'hoian-lantern',
    'place',
    ['Đêm phố cổ thả hoa đăng', 'Old-town lantern night'],
    ['Hội An', 'Hội An'],
    [
      'Hội An tắt đèn điện, thả hoa đăng vào ngày 14 âm lịch hàng tháng.',
      'Hội An turns off its lights and floats lanterns on the 14th of every lunar month.',
    ],
  ),
  f(
    'phanthiet-parade',
    'place',
    ['Lễ hội rước đèn Trung Thu lớn nhất Việt Nam', "Vietnam's largest lantern parade"],
    ['Phan Thiết', 'Phan Thiết'],
    [
      'Lễ hội rước đèn Trung Thu Phan Thiết (Bình Thuận) được ghi nhận lớn nhất Việt Nam.',
      "Phan Thiết's Mid-Autumn lantern parade is recorded as Vietnam's largest.",
    ],
    3,
  ),
  // role
  f(
    'ongdia-lead',
    'role',
    ['Ông Địa', 'Ông Địa'],
    ['dẫn lân đi múa', 'leading the lion dance'],
    ['Ông Địa cầm quạt dẫn đường và trêu lân.', 'Ông Địa leads and teases the lion with his fan.'],
    1,
  ),
  f(
    'rabbit-pound',
    'role',
    ['Thỏ Ngọc', 'the Jade Rabbit'],
    ['giã thuốc trường sinh', 'pounding the elixir of life'],
    [
      'Thỏ Ngọc ngày ngày giã thuốc bên Hằng Nga.',
      'The Jade Rabbit pounds medicine beside Hằng Nga.',
    ],
    1,
  ),
  f(
    'houyi-shoot',
    'role',
    ['Hậu Nghệ', 'Hậu Nghệ'],
    ['bắn rơi chín mặt trời', 'shooting down nine suns'],
    [
      'Hậu Nghệ cứu nhân gian khỏi hạn hán bằng cách bắn rơi chín mặt trời.',
      'Hậu Nghệ saved the world from drought by shooting down nine suns.',
    ],
  ),
  f(
    'cuoi-sit',
    'role',
    ['Chú Cuội', 'Cuội'],
    ['ngồi dưới gốc đa nhìn về trần gian', 'sitting under the banyan gazing at earth'],
    [
      'Chú Cuội ngồi gốc đa trên trăng mà nhớ nhà.',
      'Cuội sits under the moon banyan, homesick for earth.',
    ],
    1,
  ),
  f(
    'wugang-chop',
    'role',
    ['Ngô Cương', 'Wu Gang'],
    ['đốn cây quế mãi không đổ', 'endlessly felling the osmanthus'],
    [
      'Ngô Cương bị phạt đốn cây quế tự lành trên cung trăng.',
      'Wu Gang is condemned to fell a self-healing osmanthus on the moon.',
    ],
    3,
  ),
  f(
    'hangnga-drink',
    'role',
    ['Hằng Nga', 'Hằng Nga'],
    ['uống thuốc trường sinh bay lên trăng', 'drinking the elixir and rising to the moon'],
    [
      'Hằng Nga nuốt thuốc trường sinh rồi bay lên cung trăng.',
      'Hằng Nga swallowed the elixir and floated to the moon.',
    ],
    1,
  ),
]
