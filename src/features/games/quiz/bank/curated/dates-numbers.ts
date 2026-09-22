import { q } from './define'

export const datesNumbers = [
  q(
    'dates-numbers',
    'lunar-date',
    1,
    [
      'Tết Trung Thu diễn ra vào ngày nào theo âm lịch?',
      'On which lunar date is the Mid-Autumn Festival held?',
    ],
    [
      ['15 tháng 7', '15th of the 7th month'],
      ['15 tháng 8', '15th of the 8th month'],
      ['1 tháng 8', '1st of the 8th month'],
      ['15 tháng 9', '15th of the 9th month'],
    ],
    1,
    [
      'Trung Thu là rằm tháng Tám, khi trăng tròn và sáng nhất trong năm.',
      'Mid-Autumn falls on the full moon of the 8th lunar month, the brightest of the year.',
    ],
    '📅',
  ),
  q(
    'dates-numbers',
    'ram-meaning',
    1,
    ['"Rằm" chỉ ngày nào trong tháng âm lịch?', '"Rằm" refers to which lunar day?'],
    [
      ['Mùng 1', 'The 1st'],
      ['Ngày 15', 'The 15th'],
      ['Ngày 30', 'The 30th'],
      ['Ngày 10', 'The 10th'],
    ],
    1,
    [
      'Rằm là ngày trăng tròn giữa tháng âm lịch.',
      'Rằm is the full-moon day in the middle of the lunar month.',
    ],
  ),
  q(
    'dates-numbers',
    'month-length',
    2,
    ['Một tháng âm lịch có bao nhiêu ngày?', 'How many days does a lunar month have?'],
    [
      ['Luôn 30', 'Always 30'],
      ['29 hoặc 30', '29 or 30'],
      ['Luôn 28', 'Always 28'],
      ['31', '31'],
    ],
    1,
    [
      'Tháng thiếu 29 ngày, tháng đủ 30 ngày.',
      'A "short" month has 29 days and a "full" month 30.',
    ],
  ),
  q(
    'dates-numbers',
    'leap-year',
    2,
    ['Năm nhuận âm lịch có bao nhiêu tháng?', 'How many months has a lunar leap year?'],
    [
      ['12', '12'],
      ['13', '13'],
      ['14', '14'],
      ['11', '11'],
    ],
    1,
    [
      'Cứ khoảng 3 năm lại thêm một tháng nhuận để khớp với mùa.',
      'About every three years a leap month is added to keep pace with the seasons.',
    ],
  ),
  q(
    'dates-numbers',
    'middle-autumn',
    2,
    ['Tên "Trung Thu" nghĩa là gì?', 'What does the name "Trung Thu" mean?'],
    [
      ['Đầu mùa thu', 'Early autumn'],
      ['Giữa mùa thu', 'Mid-autumn'],
      ['Cuối mùa thu', 'Late autumn'],
      ['Mùa thu vàng', 'Golden autumn'],
    ],
    1,
    [
      'Mùa thu âm lịch gồm tháng 7, 8, 9; tháng 8 là giữa thu.',
      'Lunar autumn spans months 7–9, so month 8 is mid-autumn.',
    ],
  ),
  q(
    'dates-numbers',
    'soc',
    2,
    [
      'Ngày mùng 1 âm lịch (trăng non) gọi là ngày gì?',
      'What is the 1st lunar day (new moon) called?',
    ],
    [
      ['Sóc', 'Sóc'],
      ['Vọng', 'Vọng'],
      ['Hối', 'Hối'],
      ['Rằm', 'Rằm'],
    ],
    0,
    [
      'Sóc là ngày trăng non đầu tháng; Vọng là rằm.',
      'Sóc is the new-moon day; Vọng the full moon.',
    ],
  ),
  q(
    'dates-numbers',
    'gregorian-range',
    1,
    [
      'Theo dương lịch, Tết Trung Thu thường rơi vào khoảng nào?',
      'In the Gregorian calendar, when does Mid-Autumn usually fall?',
    ],
    [
      ['Tháng 1 hoặc 2', 'January or February'],
      ['Tháng 9 hoặc đầu tháng 10', 'September or early October'],
      ['Tháng 6 hoặc 7', 'June or July'],
      ['Tháng 12', 'December'],
    ],
    1,
    ['Ví dụ 2026: 25/9; 2028: 3/10.', 'For example 2026: 25 Sep; 2028: 3 Oct.'],
  ),
  q(
    'dates-numbers',
    'year-2026',
    1,
    [
      'Tết Trung Thu năm 2026 rơi vào ngày dương lịch nào?',
      'When is Mid-Autumn 2026 in the Gregorian calendar?',
    ],
    [
      ['15/8/2026', '15 Aug 2026'],
      ['25/9/2026', '25 Sep 2026'],
      ['6/10/2026', '6 Oct 2026'],
      ['1/9/2026', '1 Sep 2026'],
    ],
    1,
    [
      'Rằm tháng Tám năm Bính Ngọ 2026 nhằm thứ Sáu 25/9/2026.',
      'The 8th-month full moon of 2026 falls on Friday 25 September.',
    ],
  ),
  q(
    'dates-numbers',
    'year-name-2026',
    3,
    ['Năm 2026 là năm con gì theo âm lịch?', 'Which zodiac animal is 2026 in the lunar calendar?'],
    [
      ['Tỵ (rắn)', 'Snake'],
      ['Ngọ (ngựa)', 'Horse'],
      ['Mùi (dê)', 'Goat'],
      ['Thìn (rồng)', 'Dragon'],
    ],
    1,
    ['2026 là năm Bính Ngọ.', '2026 is the year of the Fire Horse (Bính Ngọ).'],
  ),
  q(
    'dates-numbers',
    'shift-days',
    2,
    [
      'Mỗi năm, ngày Trung Thu dương lịch dịch chuyển khoảng bao nhiêu ngày?',
      'By roughly how many days does the Gregorian date of Mid-Autumn shift each year?',
    ],
    [
      ['Không đổi', 'It does not'],
      [
        'Khoảng 11 ngày sớm hơn, hoặc 19 ngày muộn hơn nếu có tháng nhuận',
        'About 11 days earlier, or ~19 days later after a leap month',
      ],
      ['Đúng 1 tháng', 'Exactly a month'],
      ['1 ngày', 'One day'],
    ],
    1,
    [
      'Năm âm lịch ngắn hơn năm dương ~11 ngày, tháng nhuận kéo lại.',
      'The lunar year is ~11 days shorter; a leap month pushes dates back.',
    ],
  ),
  q(
    'dates-numbers',
    'autumn-months',
    2,
    ['Theo âm lịch, mùa thu gồm những tháng nào?', 'Which lunar months make up autumn?'],
    [
      ['Tháng 4, 5, 6', 'Months 4–6'],
      ['Tháng 7, 8, 9', 'Months 7–9'],
      ['Tháng 10, 11, 12', 'Months 10–12'],
      ['Tháng 1, 2, 3', 'Months 1–3'],
    ],
    1,
    [
      'Tháng 7 mạnh thu, tháng 8 trung thu, tháng 9 quý thu.',
      'Month 7 is early autumn, 8 mid-autumn, 9 late autumn.',
    ],
  ),
  q(
    'dates-numbers',
    'children-count',
    1,
    [
      'Ngày Quốc tế Thiếu nhi 1/6 và Tết Trung Thu: ngày nào theo âm lịch?',
      "Of International Children's Day (1 June) and Mid-Autumn, which follows the lunar calendar?",
    ],
    [
      ['Cả hai', 'Both'],
      ['Chỉ Trung Thu', 'Only Mid-Autumn'],
      ['Chỉ 1/6', 'Only 1 June'],
      ['Không ngày nào', 'Neither'],
    ],
    1,
    [
      '1/6 theo dương lịch; Trung Thu theo âm lịch nên đổi ngày mỗi năm.',
      '1 June is fixed; Mid-Autumn follows the lunar calendar and moves each year.',
    ],
  ),
  q(
    'dates-numbers',
    'half-month',
    1,
    [
      'Từ mùng 1 đến rằm cách nhau khoảng bao nhiêu ngày?',
      'How many days from the 1st lunar day to the full moon?',
    ],
    [
      ['Khoảng 7', 'About 7'],
      ['Khoảng 14–15', 'About 14–15'],
      ['Khoảng 30', 'About 30'],
      ['Khoảng 3', 'About 3'],
    ],
    1,
    [
      'Trăng đi từ non đến tròn trong nửa chu kỳ, ~14,8 ngày.',
      'The Moon goes from new to full in half a cycle, ~14.8 days.',
    ],
  ),
  q(
    'dates-numbers',
    'countdown-tradition',
    2,
    [
      'Người Việt thường bắt đầu chuẩn bị Trung Thu từ khi nào?',
      'When do Vietnamese usually start preparing for Mid-Autumn?',
    ],
    [
      ['Đúng đêm rằm', 'On the night itself'],
      [
        'Từ đầu tháng 8 âm lịch, phố phường bày bánh và đèn',
        'From the start of the 8th lunar month, when streets fill with cakes and lanterns',
      ],
      ['Từ Tết Nguyên Đán', 'From Lunar New Year'],
      ['Sau rằm', 'After the full moon'],
    ],
    1,
    [
      'Bánh và đèn bán rộ từ đầu tháng 8 âm, có nơi từ tháng 7.',
      'Cakes and lanterns go on sale from early month 8, sometimes month 7.',
    ],
  ),
  q(
    'dates-numbers',
    'tet-order',
    2,
    [
      'Xếp theo thứ tự trong năm âm lịch, Trung Thu đứng sau lễ nào sau đây?',
      'In the lunar year, Mid-Autumn comes right after which of these?',
    ],
    [
      ['Tết Nguyên Đán', 'Lunar New Year'],
      ['Lễ Vu Lan (rằm tháng 7)', 'Vu Lan (7th-month full moon)'],
      ['Tết Ông Táo', 'Kitchen God Day'],
      ['Tết Trùng Cửu', 'Double Ninth'],
    ],
    1,
    [
      'Rằm tháng 7 Vu Lan rồi đến rằm tháng 8 Trung Thu.',
      'The 7th-month full moon (Vu Lan) is followed by the 8th-month full moon.',
    ],
  ),
]
