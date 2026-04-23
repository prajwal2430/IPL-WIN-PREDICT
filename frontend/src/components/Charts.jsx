import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BTooltip, 
  ResponsiveContainer as BRC, Cell as BCell, LabelList
} from 'recharts';

const COLORS_WIN = ['#6366f1', '#ef4444'];

export function WinProbChart({ battingTeam, bowlingTeam, batProb, bowlProb }) {
  const data = [
    { name: battingTeam, value: batProb },
    { name: bowlingTeam, value: bowlProb },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={3}
          dataKey="value"
          animationBegin={0}
          animationDuration={900}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS_WIN[i]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => `${v}%`}
          contentStyle={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            color: 'var(--text-primary)',
          }}
        />
        <Legend
          iconType="circle"
          formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

const MODEL_COLORS = [
  '#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#3b82f6','#ec4899','#14b8a6','#f97316',
];

export function ModelComparisonChart({ allProbs }) {
  const data = Object.entries(allProbs).map(([k, v]) => ({
    model: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    prob: v,
  })).sort((a, b) => b.prob - a.prob);

  return (
    <BRC width="100%" height={280}>
      <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="model" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
          angle={-35} textAnchor="end" interval={0}
        />
        <YAxis
          domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          tickFormatter={v => `${v}%`}
        />
        <BTooltip
          formatter={v => [`${v}%`, 'Win Prob (Batting)']}
          contentStyle={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '10px', color: 'var(--text-primary)',
          }}
        />
        <Bar dataKey="prob" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <BCell key={i} fill={MODEL_COLORS[i % MODEL_COLORS.length]} />
          ))}
          <LabelList dataKey="prob" position="top" formatter={v => `${v}%`}
            style={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
        </Bar>
      </BarChart>
    </BRC>
  );
}

