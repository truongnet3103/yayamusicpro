/**
 * App-wide locale settings for Vietnam
 */

export const APP_LOCALE = {
  country: 'Vietnam',
  countryCode: 'VN',
  timezone: 'Asia/Ho_Chi_Minh',
  currency: 'VND',
  currencySymbol: '₫',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h' as '12h' | '24h',
  language: 'vi',
  phoneCode: '+84',
};

export const VIETNAM_TIMEZONES = [
  { value: 'Asia/Ho_Chi_Minh', label: 'Hồ Chí Minh (ICT)' },
];

export const VIETNAM_CITIES = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Biên Hòa',
  'Nha Trang',
  'Huế',
  'Buôn Ma Thuột',
  'Quy Nhơn',
  'Vũng Tàu',
  'Nam Định',
  'Thái Nguyên',
  'Vinh',
  'Đà Lạt',
  'Hạ Long',
  'Mỹ Tho',
  'Bắc Ninh',
  'Rạch Giá',
  'Long Xuyên',
];

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

export function formatDate(date: Date | string, format: string = APP_LOCALE.dateFormat): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

export function formatTime(date: Date | string, format: '12h' | '24h' = APP_LOCALE.timeFormat): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === '24h') {
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  } else {
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
}
