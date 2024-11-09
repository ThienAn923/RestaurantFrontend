export function formatCurrency(value: number) {
    if (typeof value !== 'number') {
        return value;
    }
    return `${value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} vnđ`;
}