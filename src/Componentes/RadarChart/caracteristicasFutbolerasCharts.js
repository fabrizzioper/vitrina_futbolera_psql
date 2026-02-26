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
import { useTheme } from '../../Context/ThemeContext';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

const CaracteristicasFutbolerasCharts = ({min, max, steps, labels, valores}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Colores según tema: día = texto/líneas oscuros, noche = claros
  const tickColor = isLight ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.5)";
  const pointLabelColor = isLight ? "rgba(0, 0, 0, 0.9)" : "rgba(255, 255, 255, 1)";
  const gridColor = isLight ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.2)";

  const options = {
    maintainAspectRatio: false,
    scales: {
      r: {
        min: min,
        max: max,
        ticks: {
          stepSize: steps,
          color: tickColor,
          backdropColor: "transparent",
        },
        pointLabels: {
          color: pointLabelColor,
        },
        angleLines: {
          color: gridColor,
        },
        grid: {
          color: gridColor,
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
