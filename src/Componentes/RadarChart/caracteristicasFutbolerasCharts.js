import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

const CaracteristicasFutbolerasCharts = ({min, max, steps, labels, valores}) => {
  const options = {
    maintainAspectRatio: false, 
    scales: {
      r: {
        min: min,
        max: max,
        ticks: {
          stepSize: steps,
          color: "rgba(255, 255, 255, 0.5)",
          backdropColor: "transparent",
        },
        pointLabels: {
          color: "rgba(255, 255, 255, 1)",
        },
        angleLines: {
          color: "rgba(255, 255, 255, 0.2)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.2)",
          circular: true,
        },
      },
    },
  };
  
  const data = {
    labels: labels,
    datasets: [
      {
        data: valores,
        backgroundColor: "rgba(254, 153, 1, 0.2)",
        borderColor: "rgba(254, 153, 1, 1)",
        pointBackgroundColor: "rgba(254, 153, 1, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <Radar data={data} options={options} />
  );
}

export default CaracteristicasFutbolerasCharts;
