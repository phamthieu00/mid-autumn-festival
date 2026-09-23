import type { LocalizedText } from '../../../i18n'
import { lt } from './templates'

export interface LunarFestival {
  id: string
  name: LocalizedText
  month: number
  day: number
  alias: LocalizedText
  note: LocalizedText
}

const lf = (
  id: string,
  name: [string, string],
  month: number,
  day: number,
  alias: [string, string],
  note: [string, string],
): LunarFestival => ({ id, name: lt(...name), month, day, alias: lt(...alias), note: lt(...note) })

/** Sorted by lunar date. */
export const LUNAR_FESTIVALS: LunarFestival[] = [
  lf(
    'nguyen-dan',
    ['Tết Nguyên Đán', 'Lunar New Year'],
    1,
    1,
    ['Tết Cả', 'the Great Tết'],
    [
      'Ngày đầu năm âm lịch, lễ lớn nhất của người Việt.',
      'The first day of the lunar year, the biggest Vietnamese festival.',
    ],
  ),
  lf(
    'nguyen-tieu',
    ['Tết Nguyên Tiêu', 'Lantern Festival'],
    1,
    15,
    ['Rằm tháng Giêng', 'the first full moon'],
    [
      'Rằm đầu tiên của năm, người Việt đi lễ chùa cầu an.',
      'The first full moon of the year, when people visit pagodas.',
    ],
  ),
  lf(
    'han-thuc',
    ['Tết Hàn Thực', 'Cold Food Festival'],
    3,
    3,
    ['Tết bánh trôi bánh chay', 'the bánh trôi day'],
    [
      'Ngày làm bánh trôi, bánh chay dâng tổ tiên.',
      'The day families make bánh trôi and bánh chay for their ancestors.',
    ],
  ),
  lf(
    'doan-ngo',
    ['Tết Đoan Ngọ', 'Double Fifth Festival'],
    5,
    5,
    ['Tết diệt sâu bọ', 'the bug-killing festival'],
    [
      'Sáng mùng 5/5 ăn cơm rượu, trái cây để "diệt sâu bọ".',
      'On the morning of the 5th of the 5th month people eat fermented rice and fruit.',
    ],
  ),
  lf(
    'vu-lan',
    ['Lễ Vu Lan', 'Ghost Festival'],
    7,
    15,
    ['Rằm tháng Bảy', 'the seventh-month full moon'],
    [
      'Ngày báo hiếu cha mẹ và xá tội vong nhân.',
      'A day of filial piety and offerings to wandering souls.',
    ],
  ),
  lf(
    'trung-thu',
    ['Tết Trung Thu', 'Mid-Autumn Festival'],
    8,
    15,
    ['Tết Trông Trăng', 'the Moon-gazing Festival'],
    [
      'Đêm trăng tròn nhất năm, trẻ em rước đèn, phá cỗ.',
      'The brightest full moon, when children parade lanterns and share the feast.',
    ],
  ),
  lf(
    'trung-cuu',
    ['Tết Trùng Cửu', 'Double Ninth Festival'],
    9,
    9,
    ['Tết Trùng Dương', 'the Chongyang Festival'],
    [
      'Ngày 9/9, xưa có tục lên cao uống rượu hoa cúc.',
      'On the 9th of the 9th month people once climbed hills and drank chrysanthemum wine.',
    ],
  ),
  lf(
    'ong-tao',
    ['Tết Ông Táo', 'Kitchen God Day'],
    12,
    23,
    ['Ông Công Ông Táo chầu trời', 'the Kitchen Gods ascend'],
    [
      'Ngày 23 tháng Chạp, thả cá chép tiễn Táo quân về trời.',
      'On the 23rd of the 12th month carp are released to carry the Kitchen Gods to heaven.',
    ],
  ),
]
