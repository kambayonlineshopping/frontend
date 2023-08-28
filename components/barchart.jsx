import ReactECharts from "echarts-for-react";
import { useEffect, useState } from "react";

export default function BarChart({ data }) {
  const [option, setOption] = useState({});

  const formatCurrency = (value) => {
    const suffixes = ["", "K", "M", "B", "T"]; // Add more suffixes as needed for larger values
    const tier = (Math.log10(Math.abs(value)) / 3) | 0;
    if (tier === 0) return value; // No need to format
    const suffix = suffixes[tier];
    const scale = Math.pow(10, tier * 3);
    const scaledValue = value / scale;
    return scaledValue.toFixed(1) + suffix;
  };

  useEffect(() => {
    const colors = ["#0E5AA6"];
    const barOptions = {
      color: colors,
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      toolbox: {
        feature: {
          dataView: { show: false, readOnly: false },
          restore: { show: false },
          saveAsImage: { show: false },
        },
      },

      xAxis: [
        {
          type: "category",
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          data: data?.map(({ label }) => label),
        },
      ],
      yAxis: [
        {
          type: "value",
          alignTicks: true,
          axisLine: {
            show: false,
          },
          axisLabel: {
            formatter: (value) => {
              // Implement the custom formatter function here
              return formatCurrency(value);
            },
          },
        },
      ],
      series: [
        {
          name: "Earnings",
          type: "bar",
          itemStyle: {
            emphasis: {
              barBorderRadius: [50, 50],
            },
            normal: {
              barBorderRadius: [50, 50, 50, 50],
            },
          },
          barWidth: "20%",

          data: data?.map(({ value }) => value),
        },
      ],
    };
    setOption(barOptions);
  }, []);
  return <ReactECharts option={option} />;
}
