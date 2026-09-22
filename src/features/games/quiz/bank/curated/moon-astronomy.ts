import { q } from './define'

export const moonAstronomy = [
  q(
    'moon-astronomy',
    'vong',
    1,
    [
      'Ngày rằm (15 âm lịch) trong Hán-Việt gọi là ngày gì?',
      'What is the Sino-Vietnamese name for the full-moon day?',
    ],
    [
      ['Sóc', 'Sóc'],
      ['Vọng', 'Vọng'],
      ['Hối', 'Hối'],
      ['Huyền', 'Huyền'],
    ],
    1,
    [
      'Vọng là ngày trăng tròn; Sóc là mùng 1 trăng non.',
      'Vọng is the full moon; Sóc is the new moon on the 1st.',
    ],
    '🔭',
  ),
  q(
    'moon-astronomy',
    'cycle',
    2,
    [
      'Một chu kỳ pha trăng (từ trăng non đến trăng non) dài khoảng bao lâu?',
      'How long is one lunar phase cycle?',
    ],
    [
      ['24 giờ', '24 hours'],
      ['15 ngày', '15 days'],
      ['Khoảng 29,5 ngày', 'About 29.5 days'],
      ['365 ngày', '365 days'],
    ],
    2,
    [
      'Tháng giao hội dài 29,53 ngày, nên tháng âm lịch có 29 hoặc 30 ngày.',
      'The synodic month is 29.53 days, so lunar months have 29 or 30 days.',
    ],
  ),
  q(
    'moon-astronomy',
    'distance',
    2,
    [
      'Khoảng cách trung bình từ Trái Đất đến Mặt Trăng là bao nhiêu?',
      'What is the average Earth–Moon distance?',
    ],
    [
      ['38.400 km', '38,400 km'],
      ['Khoảng 384.000 km', 'About 384,000 km'],
      ['3,84 triệu km', '3.84 million km'],
      ['150 triệu km', '150 million km'],
    ],
    1,
    [
      'Ánh sáng đi từ Mặt Trăng tới Trái Đất mất khoảng 1,3 giây.',
      'Moonlight takes about 1.3 seconds to reach Earth.',
    ],
  ),
  q(
    'moon-astronomy',
    'lunar-eclipse',
    2,
    [
      'Nguyệt thực chỉ có thể xảy ra vào pha trăng nào?',
      'A lunar eclipse can only occur at which phase?',
    ],
    [
      ['Trăng non', 'New moon'],
      ['Trăng tròn', 'Full moon'],
      ['Thượng huyền', 'First quarter'],
      ['Hạ huyền', 'Last quarter'],
    ],
    1,
    [
      'Trái Đất nằm giữa Mặt Trời và Mặt Trăng khi trăng tròn.',
      'Earth sits between the Sun and the Moon at full moon.',
    ],
  ),
  q(
    'moon-astronomy',
    'solar-eclipse',
    2,
    ['Nhật thực xảy ra vào pha trăng nào?', 'At which lunar phase does a solar eclipse occur?'],
    [
      ['Trăng non', 'New moon'],
      ['Trăng tròn', 'Full moon'],
      ['Trăng khuyết', 'Crescent'],
      ['Bất kỳ', 'Any phase'],
    ],
    0,
    [
      'Mặt Trăng che Mặt Trời khi nằm giữa hai thiên thể, tức trăng non.',
      'The Moon blocks the Sun only when it lies between them, at new moon.',
    ],
  ),
  q(
    'moon-astronomy',
    'harvest-moon',
    3,
    [
      '"Harvest Moon" là trăng tròn gần ngày gì nhất?',
      'The Harvest Moon is the full moon nearest which event?',
    ],
    [
      ['Hạ chí', 'Summer solstice'],
      ['Thu phân', 'Autumnal equinox'],
      ['Đông chí', 'Winter solstice'],
      ['Xuân phân', 'Spring equinox'],
    ],
    1,
    [
      'Harvest Moon thường rơi vào tháng 9 hoặc đầu tháng 10, gần Trung Thu.',
      'It usually falls in September or early October, close to Mid-Autumn.',
    ],
  ),
  q(
    'moon-astronomy',
    'moonlight',
    1,
    ['Ánh sáng của Mặt Trăng thực chất là gì?', 'What is moonlight actually?'],
    [
      ['Ánh sáng Mặt Trăng tự phát', 'Light the Moon produces'],
      ['Ánh sáng Mặt Trời phản chiếu', 'Reflected sunlight'],
      ['Ánh sáng từ Trái Đất', 'Light from Earth'],
      ['Ánh sáng các ngôi sao', 'Starlight'],
    ],
    1,
    [
      'Mặt Trăng không tự phát sáng mà phản chiếu ánh sáng Mặt Trời.',
      'The Moon does not shine on its own; it reflects sunlight.',
    ],
  ),
  q(
    'moon-astronomy',
    'same-face',
    2,
    [
      'Vì sao ta luôn thấy cùng một mặt của Mặt Trăng?',
      'Why do we always see the same face of the Moon?',
    ],
    [
      ['Mặt Trăng không quay', 'The Moon does not rotate'],
      [
        'Mặt Trăng quay quanh trục đúng bằng thời gian quay quanh Trái Đất',
        'It rotates once per orbit (synchronous rotation)',
      ],
      ['Vì Trái Đất che', 'Earth blocks the rest'],
      ['Vì ánh sáng yếu', 'The light is too weak'],
    ],
    1,
    [
      'Hiện tượng khóa thủy triều làm chu kỳ quay bằng chu kỳ quỹ đạo.',
      'Tidal locking makes its rotation period equal its orbital period.',
    ],
  ),
  q(
    'moon-astronomy',
    'first-landing',
    1,
    [
      'Con người lần đầu đặt chân lên Mặt Trăng vào năm nào?',
      'In which year did humans first land on the Moon?',
    ],
    [
      ['1957', '1957'],
      ['1969', '1969'],
      ['1981', '1981'],
      ['2001', '2001'],
    ],
    1,
    ['Apollo 11 hạ cánh ngày 20/7/1969.', 'Apollo 11 landed on 20 July 1969.'],
  ),
  q(
    'moon-astronomy',
    'first-person',
    1,
    [
      'Người đầu tiên bước đi trên Mặt Trăng là ai?',
      'Who was the first person to walk on the Moon?',
    ],
    [
      ['Yuri Gagarin', 'Yuri Gagarin'],
      ['Neil Armstrong', 'Neil Armstrong'],
      ['Buzz Aldrin', 'Buzz Aldrin'],
      ['John Glenn', 'John Glenn'],
    ],
    1,
    [
      'Neil Armstrong bước xuống trước, tiếp đến là Buzz Aldrin.',
      'Neil Armstrong stepped out first, followed by Buzz Aldrin.',
    ],
  ),
  q(
    'moon-astronomy',
    'gravity',
    2,
    [
      'Trọng lực trên Mặt Trăng bằng khoảng bao nhiêu so với Trái Đất?',
      "How strong is the Moon's gravity compared with Earth's?",
    ],
    [
      ['Bằng nhau', 'The same'],
      ['Khoảng 1/6', 'About one sixth'],
      ['Gấp đôi', 'Twice'],
      ['Khoảng 1/100', 'About one hundredth'],
    ],
    1,
    [
      'Trên Mặt Trăng, bạn nặng chỉ khoảng 1/6 so với trên Trái Đất.',
      'On the Moon you would weigh about a sixth of your Earth weight.',
    ],
  ),
  q(
    'moon-astronomy',
    'diameter',
    3,
    [
      'Đường kính Mặt Trăng khoảng bao nhiêu so với Trái Đất?',
      "How big is the Moon's diameter compared with Earth's?",
    ],
    [
      ['Khoảng 1/4', 'About a quarter'],
      ['Bằng nhau', 'The same'],
      ['Khoảng 1/2', 'About half'],
      ['Khoảng 1/50', 'About a fiftieth'],
    ],
    0,
    [
      'Mặt Trăng rộng ~3.474 km, Trái Đất ~12.742 km.',
      'The Moon is ~3,474 km across; Earth ~12,742 km.',
    ],
  ),
  q(
    'moon-astronomy',
    'blue-moon',
    3,
    ['"Blue Moon" theo cách hiểu phổ biến là gì?', 'What is a "Blue Moon" in the popular sense?'],
    [
      ['Trăng có màu xanh', 'A moon that looks blue'],
      [
        'Trăng tròn thứ hai trong cùng một tháng dương lịch',
        'The second full moon in one calendar month',
      ],
      ['Trăng non đầu năm', 'The first new moon of the year'],
      ['Nguyệt thực', 'A lunar eclipse'],
    ],
    1,
    [
      'Vì chu kỳ trăng 29,5 ngày, đôi khi một tháng có hai lần trăng tròn.',
      'With a 29.5-day cycle, a month occasionally has two full moons.',
    ],
  ),
  q(
    'moon-astronomy',
    'supermoon',
    2,
    ['"Siêu trăng" là hiện tượng gì?', 'What is a "supermoon"?'],
    [
      [
        'Trăng tròn khi Mặt Trăng ở gần Trái Đất nhất',
        "A full moon at the Moon's closest approach to Earth",
      ],
      ['Hai mặt trăng', 'Two moons'],
      ['Trăng màu đỏ', 'A red moon'],
      ['Trăng không lặn', 'A moon that never sets'],
    ],
    0,
    [
      'Siêu trăng trông to và sáng hơn khoảng 14% so với lúc xa nhất.',
      'A supermoon looks about 14% larger and brighter than at apogee.',
    ],
  ),
  q(
    'moon-astronomy',
    'blood-moon',
    2,
    [
      'Vì sao trăng có màu đỏ ("trăng máu") khi nguyệt thực toàn phần?',
      'Why does the Moon turn red during a total lunar eclipse?',
    ],
    [
      ['Do bụi trên Mặt Trăng', 'Dust on the Moon'],
      [
        'Ánh sáng Mặt Trời bị khí quyển Trái Đất khúc xạ, chỉ ánh đỏ tới được',
        "Earth's atmosphere bends sunlight so only red light reaches it",
      ],
      ['Do núi lửa Mặt Trăng', 'Lunar volcanoes'],
      ['Do mây', 'Clouds'],
    ],
    1,
    [
      'Giống lý do hoàng hôn đỏ: khí quyển tán xạ ánh xanh.',
      'Same reason sunsets are red: the atmosphere scatters blue light away.',
    ],
  ),
  q(
    'moon-astronomy',
    'tides',
    1,
    [
      'Hiện tượng nào trên Trái Đất chủ yếu do lực hút của Mặt Trăng gây ra?',
      "Which Earth phenomenon is mainly caused by the Moon's gravity?",
    ],
    [
      ['Động đất', 'Earthquakes'],
      ['Thủy triều', 'Tides'],
      ['Bão', 'Storms'],
      ['Cầu vồng', 'Rainbows'],
    ],
    1,
    [
      'Thủy triều lên xuống theo vị trí Mặt Trăng; rằm và mùng 1 triều cường mạnh nhất.',
      'Tides follow the Moon; spring tides are strongest at full and new moon.',
    ],
  ),
  q(
    'moon-astronomy',
    'atmosphere',
    2,
    [
      'Mặt Trăng có bầu khí quyển như Trái Đất không?',
      "Does the Moon have an atmosphere like Earth's?",
    ],
    [
      ['Có, dày như Trái Đất', "Yes, as thick as Earth's"],
      ['Gần như không có', 'Almost none'],
      ['Có, toàn oxy', 'Yes, all oxygen'],
      ['Có, toàn nước', 'Yes, all water'],
    ],
    1,
    [
      'Khí quyển Mặt Trăng cực mỏng, nên trời trên đó luôn đen.',
      "The Moon's exosphere is so thin that its sky is always black.",
    ],
  ),
  q(
    'moon-astronomy',
    'craters',
    1,
    [
      'Những vệt tối lớn trên mặt trăng mà ta thấy bằng mắt thường là gì?',
      'What are the large dark patches on the Moon we see with the naked eye?',
    ],
    [
      ['Biển nước', 'Oceans of water'],
      ['Các "biển" đá bazan (mare)', 'Basalt plains called "maria"'],
      ['Rừng', 'Forests'],
      ['Băng', 'Ice'],
    ],
    1,
    [
      'Người xưa gọi là "biển" nhưng thật ra là đồng bằng đá núi lửa tối màu.',
      'Ancient astronomers called them seas, but they are dark volcanic plains.',
    ],
  ),
  q(
    'moon-astronomy',
    'chang-e-probe',
    2,
    [
      'Chương trình thăm dò Mặt Trăng của Trung Quốc mang tên nữ thần nào?',
      "China's lunar exploration programme is named after which goddess?",
    ],
    [
      ['Nữ Oa', 'Nüwa'],
      ["Thường Nga (Chang'e)", "Chang'e"],
      ['Ma Tổ', 'Mazu'],
      ['Tây Vương Mẫu', 'Queen Mother of the West'],
    ],
    1,
    [
      "Chang'e 4 là tàu đầu tiên hạ cánh mặt khuất của Mặt Trăng (2019).",
      "Chang'e 4 was the first craft to land on the far side of the Moon (2019).",
    ],
  ),
  q(
    'moon-astronomy',
    'moonrise-full',
    2,
    [
      'Vào đêm trăng tròn, trăng mọc vào khoảng thời gian nào?',
      'On a full-moon night, when does the Moon rise?',
    ],
    [
      ['Giữa trưa', 'Around noon'],
      ['Khoảng lúc Mặt Trời lặn', 'Around sunset'],
      ['Nửa đêm', 'Around midnight'],
      ['Sáng sớm', 'Around dawn'],
    ],
    1,
    [
      'Trăng tròn đối diện Mặt Trời nên mọc khi Mặt Trời lặn và lặn khi Mặt Trời mọc.',
      'A full moon is opposite the Sun, so it rises at sunset and sets at sunrise.',
    ],
  ),
]
