const ACHIEVEMENT_DATA = [146, 137, 119, 97, 82]; // 実績を入力していく
const DAYS = ['0', '11/21', '11/28', '12/5', '12/19', '12/26', '2024/1/9', '1/16', '1/23', '1/30', '2/6', '2/13']; // 休みは除く

const velocity = (data) => (data[0] - data[data.length - 1]) / (data.length - 1);
const velocityRounded = (data) => Math.round(velocity(data) * 10) / 10; // 割り切れないと見にくいので小数第2位で四捨五入して利用
const TrendLineData = DAYS.map((_, index) => {
  const stepValue = velocityRounded(ACHIEVEMENT_DATA) * index;
  return Math.round((ACHIEVEMENT_DATA[0] - stepValue) * 10) / 10;
});

window.onload = function () {
  const velocityHTML = `<strong>Velocity: ${velocityRounded(ACHIEVEMENT_DATA)}</strong>`
  document.querySelector("#velocity").innerHTML = velocityHTML;
  let context = document.querySelector("#clean_agile_burn_down").getContext('2d')
  new Chart(context, {
    type: 'line',
    data: {
      labels: DAYS,
      datasets: [
        {
          label: 'Read Points',
          data: ACHIEVEMENT_DATA,
          borderColor: '#ff6347',
          backgroundColor: '#ff6347',
        },
        {
          label: 'Trend Line',
          data: TrendLineData,
          borderColor: '#00FFFF',
          backgroundColor: '#00FFFF',
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          min: 0,
          title: {
            display: true,
            text: 'Number of Pages',
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const initial = context.dataset.data[0];
              const value = context.parsed.y;
              const difference = initial - value;
              return `${context.dataset.label}: ${difference}pt (残り: ${value}pt)`;
            }
          }
        }
      },
      responsive: false,
    }
  })
}
