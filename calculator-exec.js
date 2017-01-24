$(function() {
    calculator.init();
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(() => calculator.run());

    window.addEventListener('resize', () => calculator.drawCharts());
});
