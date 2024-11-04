export function toVietnamese(status: string) {
    switch (status) {
        case 'new':
        return 'Chờ xác nhận';
        case 'cooking':
        return 'Đã xác nhận';
        case 'finished':
        return 'Hoàn thành';
        default:
        return "YOU FORGOT TO TRANSLATE THIS";
    }
}