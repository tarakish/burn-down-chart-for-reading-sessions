const ACHIEVEMENT_DATA = [146, 137, 119, 97, 82, 71, 59]; // 実績を入力していく
const DAYS = ['0', '11/21', '11/28', '12/5', '12/19', '12/26', '2024/1/9', '1/16', '1/23', '1/30', '2/6', '2/13']; // 休みは除く

const velocity = (data) => (data[0] - data[data.length - 1]) / (data.length - 1);
const velocityRounded = (data) => Math.round(velocity(data) * 10) / 10; // 割り切れないと見にくいので小数第2位で四捨五入して利用
const trendLineData = DAYS.map((_, index) => {
  const stepValue = velocityRounded(ACHIEVEMENT_DATA) * index;
  return Math.round((ACHIEVEMENT_DATA[0] - stepValue) * 10) / 10;
});

const myPlugin = {
  id: 'customText',
  afterDatasetsDraw: function(chart, args, options) {
    const ctx = chart.ctx;
    chart.data.datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      if (!meta.hidden) {
        meta.data.forEach((element, index) => {
          if (dataset.customTextEnabled !== true) {
            return;
          }

          const currentData = dataset.data[index];
          let differenceFromPrevious = 0;

          if (index > 0) {
            const previousData = dataset.data[index - 1];
            differenceFromPrevious = previousData - currentData;
          }

          const point = `${differenceFromPrevious}pt`;
          ctx.fillStyle = '#ff6347';
          ctx.font = Chart.helpers.fontString(14, 'normal', 'Helvetica Neue');

          const textWidth = ctx.measureText(point).width;
          const textPosition = element.tooltipPosition();
          ctx.fillText(point, textPosition.x + 10, textPosition.y);
        });
      }
    });
  }
};

Chart.register(myPlugin);

// pngが透過されてしまうので背景を白にする
const setCanvasBackground = (ctx, color) => {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
};

window.onload = function () {
  const velocityHTML = `<strong>Velocity: ${velocityRounded(ACHIEVEMENT_DATA)}</strong>`
  document.querySelector("#velocity").innerHTML = velocityHTML;
  let context = document.querySelector("#clean_agile_burn_down").getContext('2d');
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
          customTextEnabled: true,
        },
        {
          label: 'Trend Line',
          data: trendLineData,
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
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const dataIndex = context.dataIndex;
              const firstData = context.dataset.data[0];
              const currentData = context.dataset.data[dataIndex];
              let differenceFromFirst = 0;
              let differenceFromPrevious = 0;

              if (dataIndex > 0) {
                const previousData = context.dataset.data[dataIndex - 1];
                differenceFromPrevious = previousData - currentData;
              }
              differenceFromFirst = firstData - currentData;

              return [
                `累計: ${differenceFromFirst}pt`,
                `残り: ${currentData}pt`
              ];
            }
          }
        }
      },
      responsive: false,
    }
  });

  const canvas = document.querySelector("#clean_agile_burn_down");
  const downloadBtn = document.querySelector("#download-btn");
  downloadBtn.addEventListener('click', function () {
    setCanvasBackground(context, 'white');
    const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const link = document.createElement('a');
    link.download = 'clean_agile_burn_down.png';
    link.href = image;
    link.click();
  });
};
