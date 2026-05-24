interface SparklineProps {
  data: number[];
  className?: string;
  color?: string;
}

export function Sparkline({ data, className = '', color = 'currentColor' }: SparklineProps) {
  if (data.length === 0) return null;

  // 1 ponto vira linha plana (evita divisão por zero → NaN nos pontos do SVG)
  const series = data.length === 1 ? [data[0], data[0]] : data;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const width = 100;
  const height = 30;

  const points = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      style={{ color }}
    >
      <polygon points={areaPoints} fill="currentColor" opacity="0.1" />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
